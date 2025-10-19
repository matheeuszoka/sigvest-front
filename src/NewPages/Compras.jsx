import React, {useState, useEffect, useMemo} from 'react';

import {
    Box, TextField, Typography, Button, Snackbar, Alert,
    MenuItem, Chip, Divider, CircularProgress, IconButton, Table,
    TableBody, TableCell, TableHead, TableRow, Autocomplete, Grid, Tooltip // <-- Tooltip importado
} from "@mui/material";

import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import Sidenav from "../NSidenav";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';

// FUNÇÃO AUXILIAR CORRIGIDA PARA O PROBLEMA DE FUSO HORÁRIO
const dateToNoonUTCISO = (dateString) => {
    if (!dateString) return null;
    return dateString + 'T12:00:00.000Z';
};

const ComprasForm = ({onCompraAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário - Dados da Compra
    const [numeroNota, setNumeroNota] = useState('');
    const [dataCompra, setDataCompra] = useState(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    });
    const [fornecedor, setFornecedor] = useState(null);
    const [fornecedores, setFornecedores] = useState([]);

    // Estados - Financeiro
    const [planoPagamento, setPlanoPagamento] = useState(null);
    const [planosPagamento, setPlanosPagamento] = useState([]);
    const [numParcelas, setNumParcelas] = useState('1');
    const [dataVencimento, setDataVencimento] = useState(() => {
        const hoje = new Date();
        hoje.setDate(hoje.getDate() + 30);
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    });

    // Estados - Frete
    const [freteIncluso, setFreteIncluso] = useState('false');
    const [valorFrete, setValorFrete] = useState('0');
    const [totalCompra, setTotalCompra] = useState('0');

    // Itens da compra
    const [itens, setItens] = useState([{
        produto: null,
        derivacao: null,
        derivacoesDisponiveis: [],
        quantidade: '',
        valorBruto: '',
        margemVenda: '0',
        valorLiquido: '0'
    }]);
    const [produtos, setProdutos] = useState([]);

    // Estados de controle
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const apiBase = 'http://localhost:8080';

    useEffect(() => {
        fetchFornecedores();
        fetchProdutos();
        fetchPlanosPagamento();
        if (id) {
            setIsEditing(true);
            fetchCompraById(id);
        }
    }, [id]);

    useEffect(() => {
        calcularTotais();
    }, [itens, valorFrete, freteIncluso]);

    // Busca fornecedores usando o endpoint /likenome/{razaoSocial}
    const fetchFornecedores = async (razaoSocial = "") => {
        try {
            let url = `${apiBase}/fornecedor`;
            if (razaoSocial) {
                url = `${apiBase}/fornecedor/likenome/${encodeURIComponent(razaoSocial)}`;
            }
            const {data} = await axios.get(url);
            setFornecedores(data);
        } catch (e) {
            console.error("Erro ao buscar fornecedores", e);
        }
    };

    const fetchProdutos = async () => {
        try {
            const {data} = await axios.get(`${apiBase}/produto/buscar/produtos-marcas`);
            const produtosFormatados = (data || []).map(item => {
                const [idProduto, nomeProduto] = item.split(',');
                return {
                    idProduto: parseInt(idProduto, 10),
                    nomeProduto: nomeProduto.trim()
                };
            });
            setProdutos(produtosFormatados);
        } catch (e) {
            console.error('Erro ao buscar produtos:', e);
        }
    };

    const fetchPlanosPagamento = async () => {
        try {
            const {data} = await axios.get(`${apiBase}/plano-pagamento`);
            setPlanosPagamento(data || []);
        } catch (e) {
            console.error('Erro ao buscar planos de pagamento:', e);
        }
    };

    const fetchCompraById = async (idCompra) => {
        setLoading(true);
        try {
            const {data} = await axios.get(`${apiBase}/api/compras/${idCompra}`);
            preencherFormulario(data);
        } catch (error) {
            console.error('Erro ao buscar compra:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar compra');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const preencherFormulario = (compraData) => {
        setNumeroNota(compraData.numeroNota || '');
        setDataCompra(compraData.dataCompra ? new Date(compraData.dataCompra).toISOString().slice(0, 10) : '');
        setFornecedor(compraData.fornecedor || null);
        setFreteIncluso(compraData.freteIncluso?.toString() || 'false');
        setValorFrete(compraData.valorFrete?.toString() || '0');
        setTotalCompra(compraData.totalCompra?.toString() || '0');

        if (compraData.movimentarFinanceiro) {
            setPlanoPagamento(compraData.movimentarFinanceiro.planoPagamento || null);
            setNumParcelas(compraData.movimentarFinanceiro.numParcelas?.toString() || '1');
            setDataVencimento(compraData.movimentarFinanceiro.dataVencimento ?
                new Date(compraData.movimentarFinanceiro.dataVencimento).toISOString().slice(0, 10) : '');
        }

        if (compraData.itens && compraData.itens.length > 0) {
            setItens(compraData.itens.map(it => ({
                produto: it.produto,
                derivacao: it.derivacao,
                derivacoesDisponiveis: it.produto?.derivacoes || [],
                quantidade: it.quantidade?.toString() || '',
                valorBruto: it.valorBruto?.toString() || '',
                margemVenda: it.margem?.toString() || '0',
                valorLiquido: it.valorLiquido?.toString() || '0'
            })));
        }
    };

    const calcularValorLiquido = (quantidade, valorBruto, margemVenda) => {
        const qtd = parseFloat(quantidade) || 0;
        const bruto = parseFloat(valorBruto) || 0;
        const margemPercent = parseFloat(margemVenda) || 0;
        const subtotal = qtd * bruto;
        const acrescimo = subtotal * (margemPercent / 100);
        const valorTotal = subtotal + acrescimo;
        return valorTotal.toFixed(2);
    };

    const calcularTotais = () => {
        const totalItens = itens.reduce((acc, item) => {
            const liquido = parseFloat(item.valorLiquido) || 0;
            return acc + liquido;
        }, 0);
        const frete = freteIncluso === 'true' ? (parseFloat(valorFrete) || 0) : 0;
        const total = totalItens + frete;
        setTotalCompra(total.toFixed(2));
    };

    const handleProdutoChange = async (index, produto) => {
        const novosItens = [...itens];
        novosItens[index].produto = produto;
        novosItens[index].derivacao = null;
        novosItens[index].derivacoesDisponiveis = [];

        if (produto && produto.idProduto) {
            try {
                const {data} = await axios.get(`${apiBase}/produto/derivacao/produto/${produto.idProduto}`);
                novosItens[index].derivacoesDisponiveis = data || [];
                console.log(`✅ Derivações carregadas para produto ${produto.idProduto}:`, data);
                setItens(novosItens);
            } catch (e) {
                console.error('❌ Erro ao buscar derivações:', e);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao buscar derivações do produto');
                setOpenSnackbar(true);
                setItens(novosItens);
            }
        } else {
            setItens(novosItens);
        }
    };

    const valorParcela = useMemo(() => {
        const numPar = parseInt(numParcelas);
        const total = parseFloat(totalCompra);
        if (numPar > 0 && total > 0) {
            return (total / numPar).toFixed(2);
        }
        return '0.00';
    }, [numParcelas, totalCompra]);
    const handleSkuChange = async (index, skuValue) => {
        if (!skuValue || skuValue.trim() === '') return;

        try {
            const {data} = await axios.get(`${apiBase}/produto/sku/${encodeURIComponent(skuValue)}`);
            if (data) {
                const novosItens = [...itens];
                novosItens[index].produto = data;

                if (data.idProduto) {
                    const derivacoesResponse = await axios.get(`${apiBase}/produto/derivacao/produto/${data.idProduto}`);
                    novosItens[index].derivacoesDisponiveis = derivacoesResponse.data || [];
                    const derivacaoEncontrada = derivacoesResponse.data.find(d => d.codigoSKU === skuValue);
                    if (derivacaoEncontrada) {
                        novosItens[index].derivacao = derivacaoEncontrada;
                    }
                }
                setItens(novosItens);
            }
        } catch (e) {
            console.error('Erro ao buscar produto por SKU:', e);
            setSnackbarSeverity('error');
            setSnackbarMessage('SKU não encontrado');
            setOpenSnackbar(true);
        }
    };

    const handleItemChange = (index, field, value) => {
        const novosItens = [...itens];
        novosItens[index][field] = value;

        if (field === 'quantidade' || field === 'valorBruto' || field === 'margemVenda') {
            novosItens[index].valorLiquido = calcularValorLiquido(
                novosItens[index].quantidade,
                novosItens[index].valorBruto,
                novosItens[index].margemVenda
            );
        }
        setItens(novosItens);
    };

    const adicionarItem = () => {
        setItens([...itens, {
            produto: null,
            derivacao: null,
            derivacoesDisponiveis: [],
            quantidade: '',
            valorBruto: '',
            margemVenda: '0',
            valorLiquido: '0'
        }]);
    };

    const removerItem = (index) => {
        if (itens.length > 1) {
            setItens(itens.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!numeroNota.trim()) {
            newErrors.numeroNota = 'Número da nota é obrigatório';
        }
        if (!fornecedor) {
            newErrors.fornecsedor = 'Fornecedor é obrigatório';
        }
        if (!dataCompra) {
            newErrors.dataCompra = 'Data da compra é obrigatória';
        }
        if (!planoPagamento) {
            newErrors.planoPagamento = 'Plano de pagamento é obrigatório';
        }
        if (!numParcelas || parseInt(numParcelas) < 1) {
            newErrors.numParcelas = 'Número de parcelas inválido';
        }
        if (!dataVencimento) {
            newErrors.dataVencimento = 'Data de vencimento é obrigatória';
        }

        itens.forEach((item, idx) => {
            if (!item.produto) {
                newErrors[`produto_${idx}`] = 'Produto é obrigatório';
            }
            if (!item.derivacao) {
                newErrors[`derivacao_${idx}`] = 'Derivação/SKU é obrigatória';
            }
            if (!item.quantidade || parseFloat(item.quantidade) <= 0) {
                newErrors[`quantidade_${idx}`] = 'Quantidade inválida';
            }
            if (!item.valorBruto || parseFloat(item.valorBruto) <= 0) {
                newErrors[`valorBruto_${idx}`] = 'Valor bruto inválido';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Por favor, corrija os erros no formulário');
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);
        try {
            const compraData = {
                numeroNota: numeroNota.trim(),
                dataCompra: dateToNoonUTCISO(dataCompra),
                fornecedor: { idFornecedor: fornecedor.idFornecedor },
                freteIncluso: freteIncluso === 'true',
                valorFrete: parseFloat(valorFrete) || 0,
                totalCompra: parseFloat(totalCompra),
                itens: itens.map(item => ({
                    derivacao: { idDerivacao: item.derivacao.idDerivacao },
                    quantidade: parseFloat(item.quantidade),
                    valorBruto: parseFloat(item.valorBruto),
                    margem: parseFloat(item.margemVenda) || 0,
                    valorLiquido: parseFloat(item.valorLiquido)
                })),
                movimentarFinanceiro: {
                    planoPagamento: { idTipo: planoPagamento.idTipo },
                    numParcelas: parseInt(numParcelas),
                    dataVencimento: dateToNoonUTCISO(dataVencimento),
                    tipoFinanceiro: 'DESPESA',
                    status: 'PENDENTE'
                }
            };


            if (isEditing) {
                await axios.put(`${apiBase}/compras/${id}`, compraData);
                setSnackbarMessage('Compra atualizada com sucesso!');
            } else {
                await axios.post(`${apiBase}/compras`, compraData);
                setSnackbarMessage('Compra cadastrada com sucesso!');
            }

            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            if (onCompraAdded) onCompraAdded();
            setTimeout(() => navigate('/compras'), 2000);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            setSnackbarSeverity('error');
            let erroMsg = 'Erro ao salvar compra';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    erroMsg = error.response.data;
                } else if (error.response.data.error) {
                    erroMsg = error.response.data.error;
                } else if (error.response.data.message) {
                    erroMsg = error.response.data.message;
                } else {
                    erroMsg = JSON.stringify(error.response.data);
                }
            }
            setSnackbarMessage(erroMsg);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5'}}>
            <Sidenav/>
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                {/* Cabeçalho Principal */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    bgcolor: 'white',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {isEditing ? <EditIcon sx={{fontSize: 40, color: '#142442'}}/> :
                            <ShoppingCartIcon sx={{fontSize: 40, color: '#142442'}}/>}
                        <Box>
                            <Typography variant="h4" sx={{color: '#142442', fontWeight: 700, mb: 0.5}}>
                                Nova Compra
                            </Typography>
                            <Typography variant="body2" sx={{color: '#6c757d'}}>
                                Cadastre uma nova compra no sistema
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    {/* Dados da Nota */}
                    <Box sx={{bgcolor: 'white', p: 3, borderRadius: 3, boxShadow: 2, mb: 3}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                            <ReceiptIcon sx={{color: '#142442', fontSize: 28}}/>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#142442'}}>
                                Dados da Nota
                            </Typography>
                        </Box>
                        <Divider sx={{mb: 3}}/>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, mb: 3}}>
                            {/* 1. Fornecedor (primeiro bloco) - Usa toda a largura disponível */}
                            <Box sx={{flex: '1 1 100%'}}>
                                <Autocomplete
                                    value={fornecedor}
                                    onChange={(event, newValue) => setFornecedor(newValue)}
                                    options={fornecedores}
                                    getOptionLabel={(option) => option.razaoSocial || ''}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Fornecedor"
                                            required
                                            error={!!errors.fornecedor}
                                            helperText={errors.fornecedor}
                                            onChange={(e) => {
                                                const searchValue = e.target.value;
                                                fetchFornecedores(searchValue);
                                            }}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Box>

                            {/* 2. Número da Nota e Data da Compra (segundo bloco - lado a lado, quebram em telas pequenas) */}
                            <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
                                {/* Número da Nota */}
                                <Box sx={{flex: '1 1 300px', minWidth: 250}}>
                                    <TextField
                                        label="Número da Nota"
                                        name="numeroNota"
                                        value={numeroNota}
                                        onChange={(e) => setNumeroNota(e.target.value)}
                                        required
                                        error={!!errors.numeroNota}
                                        helperText={errors.numeroNota}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <ReceiptIcon sx={{mr: 1, color: '#6c757d'}}/>
                                            ),
                                        }}
                                    />
                                </Box>
                                {/* Data da Compra */}
                                <Box sx={{flex: '0 1 200px', minWidth: 200}}>
                                    <TextField
                                        label="Data da Compra"
                                        type="date"
                                        name="dataCompra"
                                        value={dataCompra}
                                        onChange={(e) => setDataCompra(e.target.value)}
                                        required
                                        error={!!errors.dataCompra}
                                        helperText={errors.dataCompra}
                                        InputLabelProps={{shrink: true}}
                                        fullWidth
                                    />
                                </Box>
                            </Box>

                            {/* 3. Frete Incluso e Valor do Frete (terceiro bloco - lado a lado, quebram em telas pequenas) */}
                            <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
                                {/* Frete Incluso */}
                                <Box sx={{flex: '1 1 250px'}}>
                                    <TextField
                                        select
                                        label="Frete Incluso"
                                        name="freteIncluso"
                                        value={freteIncluso}
                                        onChange={(e) => setFreteIncluso(e.target.value)}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <LocalShippingIcon sx={{mr: 1, color: '#6c757d'}}/>
                                            ),
                                        }}
                                    >
                                        <MenuItem value="true">Sim</MenuItem>
                                        <MenuItem value="false">Não</MenuItem>
                                    </TextField>
                                </Box>
                                {/* Valor do Frete */}
                                <Box sx={{flex: '1 1 250px'}}>
                                    <TextField
                                        label="Valor do Frete"
                                        type="number"
                                        name="valorFrete"
                                        value={valorFrete}
                                        onChange={(e) => setValorFrete(e.target.value)}
                                        disabled={freteIncluso === 'false'}
                                        inputProps={{min: 0, step: 0.01}}
                                        fullWidth
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    {/* Itens da Compra */}
                    <Box sx={{bgcolor: 'white', p: 3, borderRadius: 3, boxShadow: 2, mb: 3}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                                <ShoppingCartIcon sx={{color: '#142442', fontSize: 32}}/>
                                <Box>
                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#142442', lineHeight: 1.2}}>
                                        Itens da Compra
                                    </Typography>
                                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                        {itens.length} {itens.length === 1 ? 'item adicionado' : 'itens adicionados'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                startIcon={<AddCircleIcon/>}
                                onClick={adicionarItem}
                                variant="contained"
                                sx={{
                                    bgcolor: '#142442',
                                    color: 'white',
                                    px: 3,
                                    py: 1,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        bgcolor: '#1a3055',
                                        boxShadow: 2
                                    }
                                }}
                            >
                                Adicionar Item
                            </Button>
                        </Box>

                        <Divider sx={{mb: 3}}/>

                        <Table>
                            <TableHead>
                                <TableRow sx={{bgcolor: '#f8f9fa'}}>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2}}>Produto</TableCell>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2}}>Derivação/SKU</TableCell>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2, width: 100}}>Qtd</TableCell>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2, width: 130}}>Preço Bruto</TableCell>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2, width: 120}}>Margem (%)</TableCell>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2, width: 130}}>Total</TableCell>
                                    <TableCell sx={{fontWeight: 600, color: '#142442', py: 2, width: 60, textAlign: 'center'}}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itens.map((item, idx) => (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            '&:nth-of-type(odd)': {bgcolor: '#fafbfc'},
                                            '&:hover': {bgcolor: '#f0f2f5'},
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell sx={{py: 2}}>
                                            <Autocomplete
                                                value={item.produto}
                                                onChange={(event, newValue) => handleProdutoChange(idx, newValue)}
                                                options={produtos}
                                                getOptionLabel={(option) => option.nomeProduto || ''}
                                                isOptionEqualToValue={(option, value) => option.idProduto === value.idProduto}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Selecione o produto"
                                                        error={!!errors[`produto_${idx}`]}
                                                        helperText={errors[`produto_${idx}`]}
                                                        size="small"
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell sx={{py: 2}}>
                                            <Autocomplete
                                                value={item.derivacao}
                                                onChange={(event, newValue) => {
                                                    handleItemChange(idx, 'derivacao', newValue);
                                                    if (newValue) {
                                                        handleItemChange(idx, 'valorBruto', newValue.precoCusto ?? '');
                                                        handleItemChange(idx, 'margemVenda', newValue.margemVenda ?? '');
                                                    }
                                                }}
                                                options={item.derivacoesDisponiveis || []}
                                                getOptionLabel={(option) => {
                                                    if (!option) return '';
                                                    const partes = [];
                                                    if (option.tipoRoupa?.tipoRoupa) partes.push(option.tipoRoupa.tipoRoupa);
                                                    if (option.tipoCor?.nomeCor) partes.push(option.tipoCor.nomeCor);
                                                    if (option.tamanho?.nomeTamanho) partes.push(option.tamanho.nomeTamanho);
                                                    return partes.join(' - ');
                                                }}
                                                renderOption={(props, option) => {
                                                    const {key, ...otherProps} = props;
                                                    return (
                                                        <Box
                                                            component="li"
                                                            key={key}
                                                            {...otherProps}
                                                            sx={{
                                                                flexDirection: 'column',
                                                                alignItems: 'flex-start',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                py: 1.5,
                                                                '&:hover': {bgcolor: '#f8f9fa'}
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{fontWeight: 600, mb: 0.5, color: '#142442'}}>
                                                                {option.codigoSKU}
                                                            </Typography>
                                                            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>

                                                                <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                                                    Tipo: {option.tipoRoupa?.tipoRoupa || '-'}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                                                    Cor: {option.tipoCor?.nomeCor || '-'}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                                                    Tamanho: {option.tamanho?.nomeTamanho || '-'}
                                                                </Typography>
                                                            </Box>

                                                        </Box>
                                                    );
                                                }}
                                                filterOptions={(options, state) => {
                                                    const inputValue = state.inputValue.toLowerCase();
                                                    if (!inputValue) return options;
                                                    return options.filter(option => {
                                                        const searchText = `${option.codigoSKU || ''} ${option.tipoRoupa?.tipoRoupa || ''} ${option.tipoCor?.nomeCor || ''} ${option.tamanho?.nomeTamanho || ''}`.toLowerCase();
                                                        return searchText.includes(inputValue);
                                                    });
                                                }}
                                                isOptionEqualToValue={(opt, val) => opt?.idDerivacao === val?.idDerivacao}
                                                disabled={!item.produto}
                                                noOptionsText={item.produto ? "Nenhuma derivação encontrada" : "Selecione um produto primeiro"}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Selecione o SKU"
                                                        error={!!errors[`derivacao_${idx}`]}
                                                        helperText={errors[`derivacao_${idx}`] ||
                                                            (item.derivacoesDisponiveis?.length > 0 ?
                                                                `${item.derivacoesDisponiveis.length} opções` : '')}
                                                        size="small"
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell sx={{py: 2}}>
                                            <TextField
                                                type="number"
                                                value={item.quantidade}
                                                onChange={(e) => handleItemChange(idx, 'quantidade', e.target.value)}
                                                error={!!errors[`quantidade_${idx}`]}
                                                helperText={errors[`quantidade_${idx}`]}
                                                inputProps={{min: 0, step: 1}}
                                                size="small"
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell sx={{py: 2}}>
                                            <TextField
                                                type="number"
                                                value={item.valorBruto}
                                                onChange={(e) => handleItemChange(idx, 'valorBruto', e.target.value)}
                                                error={!!errors[`valorBruto_${idx}`]}
                                                helperText={errors[`valorBruto_${idx}`]}
                                                inputProps={{min: 0, step: 0.01}}
                                                size="small"
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: <Typography variant="body2" sx={{mr: 0.5, color: 'text.secondary'}}>R$</Typography>
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{py: 2}}>
                                            <TextField
                                                type="number"
                                                value={item.margemVenda}
                                                onChange={(e) => handleItemChange(idx, 'margemVenda', e.target.value)}
                                                inputProps={{min: 0, step: 0.01}}
                                                size="small"
                                                fullWidth
                                                InputProps={{
                                                    endAdornment: <Typography variant="body2" sx={{ml: 0.5, color: 'text.secondary'}}>%</Typography>
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{py: 2}}>
                                            <Typography variant="body1" sx={{fontWeight: 700, color: '#142442', fontSize: '1rem'}}>
                                                R$ {parseFloat(item.valorLiquido || 0).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{py: 2, textAlign: 'center'}}>
                                            {/* Correção do uso do Tooltip */}
                                            <Tooltip title={itens.length === 1 ? "Não é possível remover o único item" : "Remover item"}>
                                                <IconButton
                                                    onClick={() => removerItem(idx)}
                                                    size="small"
                                                    color="error"
                                                    disabled={itens.length === 1}
                                                    sx={{
                                                        '&:hover': {bgcolor: 'error.lighter'}
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Footer com Resumo Total */}
                        <Box sx={{
                            mt: 3,
                            pt: 2,
                            borderTop: '2px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: '#f8f9fa',
                            p: 2,
                            borderRadius: 2
                        }}>
                            <Box sx={{display: 'flex', gap: 4}}>
                                <Box>
                                    <Typography variant="caption" sx={{color: 'text.secondary', display: 'block'}}>
                                        Total de Itens
                                    </Typography>
                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#142442'}}>
                                        {itens.reduce((sum, item) => sum + (parseFloat(item.quantidade) || 0), 0)}
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem/>
                                <Box>
                                    <Typography variant="caption" sx={{color: 'text.secondary', display: 'block'}}>
                                        Subtotal
                                    </Typography>
                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#142442'}}>
                                        R$ {itens.reduce((sum, item) => sum + (parseFloat(item.valorLiquido) || 0), 0).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{textAlign: 'right'}}>
                                <Typography variant="caption" sx={{color: 'text.secondary', display: 'block'}}>
                                    Total da Compra
                                </Typography>
                                <Typography variant="h5" sx={{fontWeight: 700, color: '#142442'}}>
                                    R$ {parseFloat(totalCompra || 0).toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Informações Financeiras */}
                    <Box sx={{bgcolor: 'white', p: 3, borderRadius: 3, boxShadow: 2, mb: 3}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                            <PaymentIcon sx={{color: '#142442', fontSize: 28}}/>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#142442'}}>
                                Informações Financeiras
                            </Typography>
                        </Box>
                        <Divider sx={{mb: 3}}/>

                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
                                <Autocomplete
                                    value={planoPagamento}
                                    onChange={(event, newValue) => setPlanoPagamento(newValue)}
                                    options={planosPagamento}
                                    getOptionLabel={(option) => option.tipo || ''}
                                    noOptionsText="Digite para buscar Plano Pagamento"

                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Plano de Pagamento"
                                            required
                                            error={!!errors.planoPagamento}
                                            helperText={errors.planoPagamento}
                                        />
                                    )}
                                />
                            </Box>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Número de Parcelas"
                                    type="number"
                                    value={numParcelas}
                                    onChange={(e) => setNumParcelas(e.target.value)}
                                    required
                                    error={!!errors.numParcelas}
                                    helperText={errors.numParcelas}
                                    inputProps={{min: 1, step: 1}}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Data de Vencimento"
                                    type="date"
                                    value={dataVencimento}
                                    onChange={(e) => setDataVencimento(e.target.value)}
                                    required
                                    error={!!errors.dataVencimento}
                                    helperText={errors.dataVencimento}
                                    InputLabelProps={{shrink: true}}
                                    fullWidth
                                />
                            </Grid>
                            {/* Resumo de Pagamento com destaque (OtimizaÃ§Ã£o Visual) */}
                            <Box sx={{display: 'flex', gap: 4}}>

                                <Box sx={{textAlign: 'right'}}>
                                    <Typography variant="h6" sx={{fontWeight: 700, color: '#1b5e20'}}>
                                        {numParcelas}x de R$ {valorParcela}
                                    </Typography>
                                </Box>
                            </Box>

                        </Box>
                    </Box>

                    <Box sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        boxShadow: 1
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: 'wrap'
                        }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                variant="outlined"
                                onClick={() => navigate('/funcionarios')}
                                disabled={loading}
                                size="large"
                                sx={{
                                    color: '#142442',
                                    borderColor: '#142442',
                                    borderWidth: 2,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: '#142442',
                                        color: 'white',
                                        borderColor: '#142442'
                                    }
                                }}
                            >
                                Cancelar
                            </Button>

                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                {loading && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            Salvando...
                                        </Typography>
                                    </Box>
                                )}

                                <Button
                                    type="submit"
                                    startIcon={loading ? null : <SaveIcon />}
                                    variant="contained"
                                    disabled={loading}
                                    size="large"
                                    sx={{
                                        bgcolor: '#142442',
                                        color: 'white',
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 600,
                                        boxShadow: 3,
                                        '&:hover': {
                                            bgcolor: '#0f1c35',
                                            boxShadow: 4
                                        },
                                        '&:disabled': {
                                            bgcolor: '#ccc'
                                        }
                                    }}
                                >
                                    {isEditing ? 'Salvar' : 'Salvar'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </form> {/* Fechamento da tag <form> */}
            </Box>


            {/* Snackbar */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={snackbarSeverity}
                    sx={{width: '100%', boxShadow: 4}}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    ); // <-- Fechamento do 'return'
};

export default ComprasForm;