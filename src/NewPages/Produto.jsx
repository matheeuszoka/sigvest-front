import React, { useState, useEffect } from 'react';
import {
    Box, Paper, TextField, Typography, Button, Snackbar, Alert,
    Autocomplete, IconButton, Card, CardContent, Divider, Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidenav from "../NSidenav";
import axios from "axios";

const ProdutoForm = ({ onProdutoAdded }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(!!id);

    // Estados do formulário de produto (PAI)
    const [nomeProduto, setNomeProduto] = useState('');
    const [marcaSelecionada, setMarcaSelecionada] = useState(null);

    // Estados para derivações (FILHOS - variações)
    const [derivacoes, setDerivacoes] = useState([{
        codigoSKU: '',
        codigoVenda: '',
        precoCusto: '0',
        precoVenda: '0',
        margemVenda: '0',
        estoque: '0',
        tipoRoupa: { tipoRoupa: '' },
        tipoCor: { nomeCor: '' },
        tamanho: { nomeTamanho: '' }
    }]);

    // Estados para Autocompletes
    const [buscaMarca, setBuscaMarca] = useState('');
    const [marcasLike, setMarcasLike] = useState([]);
    const [tiposRoupa, setTiposRoupa] = useState([]);
    const [cores, setCores] = useState([]);
    const [tamanhos, setTamanhos] = useState([]);

    // Estados para busca nos Autocompletes de derivações
    const [buscaTipoRoupa, setBuscaTipoRoupa] = useState({});
    const [buscaCor, setBuscaCor] = useState({});
    const [buscaTamanho, setBuscaTamanho] = useState({});

    // Estados de controle
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // FUNÇÕES CORRIGIDAS COM CACHE PARA EVITAR DUPLICAÇÃO

    // Função para criar marca se não existir
    const criarMarcaSeNaoExiste = async (nomeMarca, cacheEntidades) => {
        const chaveCache = `marca_${nomeMarca.toLowerCase()}`;

        // Verifica se já criou nesta operação
        if (cacheEntidades[chaveCache]) {
            return cacheEntidades[chaveCache];
        }

        try {
            // Primeiro verifica se existe no banco
            const response = await axios.get(`http://localhost:8080/marca/likemarca/${nomeMarca}`);
            const marcaExistente = response.data.find(m => m.marca.toLowerCase() === nomeMarca.toLowerCase());

            if (marcaExistente) {
                cacheEntidades[chaveCache] = marcaExistente;
                return marcaExistente;
            }

            // Se não existe, cria uma nova
            const novaMarca = await axios.post('http://localhost:8080/marca', {
                marca: nomeMarca.trim()
            });

            cacheEntidades[chaveCache] = novaMarca.data;
            return novaMarca.data;
        } catch (error) {
            console.error('Erro ao criar/buscar marca:', error);
            throw error;
        }
    };

    // Função para criar tipo de roupa se não existir
    const criarTipoRoupaSeNaoExiste = async (nomeTipo, cacheEntidades) => {
        const chaveCache = `tipo_${nomeTipo.toLowerCase()}`;

        // Verifica se já criou nesta operação
        if (cacheEntidades[chaveCache]) {
            return cacheEntidades[chaveCache];
        }

        try {
            // Verifica nas listas atualizadas (incluindo itens já criados nesta operação)
            const tiposAtualizados = [...tiposRoupa, ...Object.values(cacheEntidades).filter(item => item.tipoRoupa)];
            const tipoExistente = tiposAtualizados.find(t => t.tipoRoupa && t.tipoRoupa.toLowerCase() === nomeTipo.toLowerCase());

            if (tipoExistente) {
                cacheEntidades[chaveCache] = tipoExistente;
                return tipoExistente;
            }

            // Se não existe, cria um novo
            const novoTipo = await axios.post('http://localhost:8080/tiporoupa', {
                tipoRoupa: nomeTipo.trim()
            });

            // Atualiza cache e lista local
            cacheEntidades[chaveCache] = novoTipo.data;
            setTiposRoupa(prev => [...prev, novoTipo.data]);
            return novoTipo.data;
        } catch (error) {
            console.error('Erro ao criar/buscar tipo de roupa:', error);
            throw error;
        }
    };

    // Função para criar cor se não existir
    const criarCorSeNaoExiste = async (nomeCor, cacheEntidades) => {
        const chaveCache = `cor_${nomeCor.toLowerCase()}`;

        // Verifica se já criou nesta operação
        if (cacheEntidades[chaveCache]) {
            return cacheEntidades[chaveCache];
        }

        try {
            // Verifica nas listas atualizadas
            const coresAtualizadas = [...cores, ...Object.values(cacheEntidades).filter(item => item.nomeCor)];
            const corExistente = coresAtualizadas.find(c => c.nomeCor && c.nomeCor.toLowerCase() === nomeCor.toLowerCase());

            if (corExistente) {
                cacheEntidades[chaveCache] = corExistente;
                return corExistente;
            }

            // Se não existe, cria uma nova
            const novaCor = await axios.post('http://localhost:8080/tipocor', {
                nomeCor: nomeCor.trim()
            });

            // Atualiza cache e lista local
            cacheEntidades[chaveCache] = novaCor.data;
            setCores(prev => [...prev, novaCor.data]);
            return novaCor.data;
        } catch (error) {
            console.error('Erro ao criar/buscar cor:', error);
            throw error;
        }
    };

    // Função para criar tamanho se não existir
    const criarTamanhoSeNaoExiste = async (nomeTamanho, cacheEntidades) => {
        const chaveCache = `tamanho_${nomeTamanho.toLowerCase()}`;

        // Verifica se já criou nesta operação
        if (cacheEntidades[chaveCache]) {
            return cacheEntidades[chaveCache];
        }

        try {
            // Verifica nas listas atualizadas
            const tamanhosAtualizados = [...tamanhos, ...Object.values(cacheEntidades).filter(item => item.nomeTamanho)];
            const tamanhoExistente = tamanhosAtualizados.find(t => t.nomeTamanho && t.nomeTamanho.toLowerCase() === nomeTamanho.toLowerCase());

            if (tamanhoExistente) {
                cacheEntidades[chaveCache] = tamanhoExistente;
                return tamanhoExistente;
            }

            // Se não existe, cria um novo
            const novoTamanho = await axios.post('http://localhost:8080/tamanho', {
                nomeTamanho: nomeTamanho.trim()
            });

            // Atualiza cache e lista local
            cacheEntidades[chaveCache] = novoTamanho.data;
            setTamanhos(prev => [...prev, novoTamanho.data]);
            return novoTamanho.data;
        } catch (error) {
            console.error('Erro ao criar/buscar tamanho:', error);
            throw error;
        }
    };

    // Carregar opções para selects
    useEffect(() => {
        const carregarOpcoes = async () => {
            try {
                const [roupaRes, corRes, tamanhoRes] = await Promise.all([
                    axios.get('http://localhost:8080/tiporoupa'),
                    axios.get('http://localhost:8080/tipocor'),
                    axios.get('http://localhost:8080/tamanho')
                ]);
                setTiposRoupa(roupaRes.data);
                setCores(corRes.data);
                setTamanhos(tamanhoRes.data);
            } catch (error) {
                console.error('Erro ao carregar opções:', error);
                setError('Erro ao carregar opções do formulário');
            }
        };
        carregarOpcoes();
    }, []);

    // Carregar dados do produto para edição
    useEffect(() => {
        if (isEditing && id) {
            const carregarProduto = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:8080/produto/${id}`);
                    const produto = response.data;

                    setNomeProduto(produto.nomeProduto);
                    setMarcaSelecionada(produto.marca);

                    if (produto.derivacoes && produto.derivacoes.length > 0) {
                        setDerivacoes(produto.derivacoes.map(d => ({
                            codigoSKU: d.codigoSKU || '',
                            codigoVenda: d.codigoVenda || '',
                            precoCusto: d.precoCusto?.toString() || '',
                            precoVenda: d.precoVenda?.toString() || '',
                            margemVenda: d.margemVenda?.toString() || '',
                            estoque: d.estoque?.toString() || '',
                            tipoRoupa: d.tipoRoupa || { tipoRoupa: '' },
                            tipoCor: d.tipoCor || { nomeCor: '' },
                            tamanho: d.tamanho || { nomeTamanho: '' }
                        })));
                    }
                } catch (error) {
                    console.error('Erro ao carregar produto:', error);
                    setError('Erro ao carregar dados do produto');
                    setSnackbarMessage('Erro ao carregar produto');
                    setSnackbarSeverity('error');
                    setOpenSnackbar(true);
                } finally {
                    setLoading(false);
                }
            };
            carregarProduto();
        }
    }, [isEditing, id]);

    // Buscar marcas para o Autocomplete
    useEffect(() => {
        const delay = setTimeout(() => {
            if (buscaMarca && buscaMarca.length >= 2) {
                axios.get(`http://localhost:8080/marca/likemarca/${buscaMarca}`)
                    .then((response) => setMarcasLike(response.data))
                    .catch((error) => console.error("Erro ao buscar marcas:", error));
            } else {
                setMarcasLike([]);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [buscaMarca]);

    // Funções para filtrar opções dos Autocompletes
    const filtrarTiposRoupa = (index) => {
        const busca = buscaTipoRoupa[index] || '';
        if (!busca) return tiposRoupa;
        return tiposRoupa.filter(tipo =>
            tipo.tipoRoupa.toLowerCase().includes(busca.toLowerCase())
        );
    };

    const filtrarCores = (index) => {
        const busca = buscaCor[index] || '';
        if (!busca) return cores;
        return cores.filter(cor =>
            cor.nomeCor.toLowerCase().includes(busca.toLowerCase())
        );
    };

    const filtrarTamanhos = (index) => {
        const busca = buscaTamanho[index] || '';
        if (!busca) return tamanhos;
        return tamanhos.filter(tamanho =>
            tamanho.nomeTamanho.toLowerCase().includes(busca.toLowerCase())
        );
    };

    // Função para calcular preço de venda baseado no custo e margem
    const calcularPrecoVenda = (custo, margem) => {
        if (!custo || !margem) return '';
        const custoNum = parseFloat(custo);
        const margemNum = parseFloat(margem);
        if (custoNum <= 0 || margemNum < 0) return '';
        const precoCalculado = custoNum + margemNum;
        return precoCalculado.toFixed(2);
    };

    // Adicionar nova derivação
    const adicionarDerivacao = () => {
        setDerivacoes([
            ...derivacoes,
            {
                codigoSKU: '',
                codigoVenda: '',
                precoCusto: '0',
                precoVenda: '0',
                margemVenda: '0',
                estoque: '0',
                tipoRoupa: { tipoRoupa: '' },
                tipoCor: { nomeCor: '' },
                tamanho: { nomeTamanho: '' }
            }
        ]);
    };


    // Remover derivação
    const removerDerivacao = (index) => {
        if (derivacoes.length > 1) {
            const novasDerivacoes = derivacoes.filter((_, i) => i !== index);
            setDerivacoes(novasDerivacoes);
        }
    };

    // Duplicar derivação
    const duplicarDerivacao = (index) => {
        const derivacaoOriginal = { ...derivacoes[index] };
        derivacaoOriginal.codigoSKU = '';
        derivacaoOriginal.codigoVenda = '';
        setDerivacoes([...derivacoes, derivacaoOriginal]);
    };

    // Atualizar derivação específica
    const atualizarDerivacao = (index, campo, valor) => {
        const novasDerivacoes = [...derivacoes];

        if (campo.includes('.')) {
            const [objeto, propriedade] = campo.split('.');
            novasDerivacoes[index][objeto][propriedade] = valor;
        } else {
            novasDerivacoes[index][campo] = valor;
        }

        // Recalcular preço de venda se mudou custo ou margem
        if (campo === 'precoCusto' || campo === 'margemVenda') {
            const custo = campo === 'precoCusto' ? valor : novasDerivacoes[index].precoCusto;
            const margem = campo === 'margemVenda' ? valor : novasDerivacoes[index].margemVenda;
            novasDerivacoes[index].precoVenda = calcularPrecoVenda(custo, margem);
        }

        setDerivacoes(novasDerivacoes);
    };

    // Validar formulário
    const validarFormulario = () => {
        if (!nomeProduto.trim()) {
            setError('Nome do produto é obrigatório');
            return false;
        }

        if (!marcaSelecionada && !buscaMarca.trim()) {
            setError('Marca é obrigatória');
            return false;
        }

        for (let i = 0; i < derivacoes.length; i++) {
            const derivacao = derivacoes[i];

            if (!derivacao.tipoRoupa.tipoRoupa && !buscaTipoRoupa[i]) {
                setError(`Tipo de roupa é obrigatório na variação ${i + 1}`);
                return false;
            }

            if (!derivacao.tipoCor.nomeCor && !buscaCor[i]) {
                setError(`Cor é obrigatória na variação ${i + 1}`);
                return false;
            }

            if (!derivacao.tamanho.nomeTamanho && !buscaTamanho[i]) {
                setError(`Tamanho é obrigatório na variação ${i + 1}`);
                return false;
            }


        }

        setError('');
        return true;
    };

    // Submeter formulário - VERSÃO CORRIGIDA COM CACHE
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            // CACHE para evitar criar entidades duplicadas na mesma operação
            const cacheEntidades = {};

            // 1. Primeiro, garantir que a marca existe
            let marcaFinal = marcaSelecionada;
            if (!marcaFinal && buscaMarca.trim()) {
                marcaFinal = await criarMarcaSeNaoExiste(buscaMarca.trim(), cacheEntidades);
            }

            // 2. Processar todas as derivações e garantir que os tipos existem
            const derivacoesProcessadas = [];

            for (let i = 0; i < derivacoes.length; i++) {
                const derivacao = derivacoes[i];

                // Garantir que o tipo de roupa existe
                let tipoRoupaFinal = null;
                if (derivacao.tipoRoupa.tipoRoupa) {
                    tipoRoupaFinal = derivacao.tipoRoupa;
                } else if (buscaTipoRoupa[i]) {
                    tipoRoupaFinal = await criarTipoRoupaSeNaoExiste(buscaTipoRoupa[i], cacheEntidades);
                }

                // Garantir que a cor existe
                let corFinal = null;
                if (derivacao.tipoCor.nomeCor) {
                    corFinal = derivacao.tipoCor;
                } else if (buscaCor[i]) {
                    corFinal = await criarCorSeNaoExiste(buscaCor[i], cacheEntidades);
                }

                // Garantir que o tamanho existe
                let tamanhoFinal = null;
                if (derivacao.tamanho.nomeTamanho) {
                    tamanhoFinal = derivacao.tamanho;
                } else if (buscaTamanho[i]) {
                    tamanhoFinal = await criarTamanhoSeNaoExiste(buscaTamanho[i], cacheEntidades);
                }

                // Montar derivação processada
                derivacoesProcessadas.push({
                    codigoSKU: derivacao.codigoSKU.trim() || undefined,
                    codigoVenda: derivacao.codigoVenda.trim(),
                    precoCusto: parseFloat(derivacao.precoCusto),
                    precoVenda: parseFloat(derivacao.precoVenda),
                    margemVenda: parseFloat(derivacao.margemVenda || 0),
                    estoque: parseInt(derivacao.estoque),
                    tipoRoupa: {
                        tipoRoupa: tipoRoupaFinal.tipoRoupa
                    },
                    tipoCor: {
                        nomeCor: corFinal.nomeCor
                    },
                    tamanho: {
                        nomeTamanho: tamanhoFinal.nomeTamanho
                    }
                });
            }

            // 3. Montar dados do produto
            const produtoData = {
                nomeProduto: nomeProduto.trim(),
                marca: {
                    marca: marcaFinal.marca
                },
                derivacoes: derivacoesProcessadas
            };

            console.log('Dados sendo enviados:', JSON.stringify(produtoData, null, 2));

            // 4. Salvar produto
            if (isEditing) {
                await axios.put(`http://localhost:8080/produto/${id}`, produtoData);
                setSnackbarMessage('Produto atualizado com sucesso');
            } else {
                await axios.post("http://localhost:8080/produto", produtoData);
                setSnackbarMessage('Produto cadastrado com sucesso');
            }

            setSnackbarSeverity('success');
            setOpenSnackbar(true);

            if (onProdutoAdded) {
                onProdutoAdded();
            }

            setTimeout(() => {
                navigate('/estoque');
            }, 2000);

        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            setSnackbarSeverity('error');
            setSnackbarMessage(
                error.response?.data?.message ||
                (isEditing ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto')
            );
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Renderizar formulário de derivação
    const renderDerivacao = (derivacao, index) => (
        <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Variação {index + 1}
                        {derivacao.codigoSKU && (
                            <Chip
                                label={`SKU: ${derivacao.codigoSKU}`}
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Typography>
                    <Box>
                        <IconButton onClick={() => duplicarDerivacao(index)} size="small" title="Duplicar">
                            <CopyIcon />
                        </IconButton>
                        {derivacoes.length > 1 && (
                            <IconButton onClick={() => removerDerivacao(index)} size="small" color="error" title="Remover">
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Primeira linha: Tipo, Cor, Tamanho */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Autocomplete
                        fullWidth
                        value={tiposRoupa.find(tipo => tipo.tipoRoupa === derivacao.tipoRoupa.tipoRoupa) || null}
                        onChange={(event, newValue) => {
                            atualizarDerivacao(index, 'tipoRoupa.tipoRoupa', newValue ? newValue.tipoRoupa : '');
                        }}
                        inputValue={buscaTipoRoupa[index] || ''}
                        onInputChange={(event, newInputValue) => {
                            setBuscaTipoRoupa(prev => ({
                                ...prev,
                                [index]: newInputValue
                            }));
                        }}
                        options={filtrarTiposRoupa(index)}
                        getOptionLabel={(option) => option?.tipoRoupa || ""}
                        isOptionEqualToValue={(option, value) => option?.idTipoRoupa === value?.idTipoRoupa}
                        noOptionsText="Digite para criar novo tipo"
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tipo de Roupa"
                                required
                                variant="outlined"
                                margin="normal"
                                helperText="Digite para buscar ou criar novo"
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        value={cores.find(cor => cor.nomeCor === derivacao.tipoCor.nomeCor) || null}
                        onChange={(event, newValue) => {
                            atualizarDerivacao(index, 'tipoCor.nomeCor', newValue ? newValue.nomeCor : '');
                        }}
                        inputValue={buscaCor[index] || ''}
                        onInputChange={(event, newInputValue) => {
                            setBuscaCor(prev => ({
                                ...prev,
                                [index]: newInputValue
                            }));
                        }}
                        options={filtrarCores(index)}
                        getOptionLabel={(option) => option?.nomeCor || ""}
                        isOptionEqualToValue={(option, value) => option?.idTipoCor === value?.idTipoCor}
                        noOptionsText="Digite para criar nova cor"
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Cor"
                                required
                                variant="outlined"
                                margin="normal"
                                helperText="Digite para buscar ou criar nova"
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        value={tamanhos.find(tamanho => tamanho.nomeTamanho === derivacao.tamanho.nomeTamanho) || null}
                        onChange={(event, newValue) => {
                            atualizarDerivacao(index, 'tamanho.nomeTamanho', newValue ? newValue.nomeTamanho : '');
                        }}
                        inputValue={buscaTamanho[index] || ''}
                        onInputChange={(event, newInputValue) => {
                            setBuscaTamanho(prev => ({
                                ...prev,
                                [index]: newInputValue
                            }));
                        }}
                        options={filtrarTamanhos(index)}
                        getOptionLabel={(option) => option?.nomeTamanho || ""}
                        isOptionEqualToValue={(option, value) => option?.idTamanho === value?.idTamanho}
                        noOptionsText="Digite para criar novo tamanho"
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tamanho"
                                required
                                variant="outlined"
                                margin="normal"
                                helperText="Digite para buscar ou criar novo"
                            />
                        )}
                    />
                </Box>

                {/* Segunda linha: SKU e Código de Venda */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="SKU"
                        value={derivacao.codigoSKU}
                        onChange={(e) => atualizarDerivacao(index, 'codigoSKU', e.target.value)}
                        helperText="Deixe vazio para gerar automaticamente"
                        variant="outlined"
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Código de Venda"
                        value={derivacao.codigoVenda}
                        onChange={(e) => atualizarDerivacao(index, 'codigoVenda', e.target.value)}
                        variant="outlined"
                        margin="normal"
                    />
                </Box>

                {/* Terceira linha: Preços e Estoque */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Custo R$"
                        type="number"
                        value={derivacao.precoCusto}
                        InputProps={{ readOnly: true }}
                        required
                        variant="outlined"
                        margin="normal"
                        sx={{ width: '25%' }}
                    />
                    <TextField
                        label="Margem %"
                        type="number"
                        value={derivacao.margemVenda}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        margin="normal"
                        sx={{ width: '25%' }}
                    />
                    <TextField
                        label="Venda R$"
                        type="number"
                        value={derivacao.precoVenda}
                        InputProps={{ readOnly: true }}
                        required
                        variant="outlined"
                        margin="normal"
                        sx={{ width: '25%' }}
                    />
                    <TextField
                        label="Estoque"
                        type="number"
                        value={derivacao.estoque}
                        InputProps={{ readOnly: true }}
                        required
                        variant="outlined"
                        margin="normal"
                        sx={{ width: '25%' }}
                    />

                </Box>
            </CardContent>
        </Card>
    );

    const renderFormConteudo = () => (
        <Paper sx={{ p: 3, mb: 2 }}>
            <form onSubmit={handleSubmit}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Seção do Produto */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Nome do Produto"
                        value={nomeProduto}
                        onChange={(e) => setNomeProduto(e.target.value)}
                        required
                        helperText="Ex: Camiseta Básica, Polo Premium"
                        variant="outlined"
                        margin="normal"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Autocomplete
                        value={marcaSelecionada}
                        onChange={(event, newValue) => setMarcaSelecionada(newValue)}
                        inputValue={buscaMarca}
                        onInputChange={(event, newInputValue) => {
                            setBuscaMarca(newInputValue);
                            if (!newInputValue) setMarcaSelecionada(null);
                        }}
                        options={marcasLike}
                        noOptionsText="Digite para criar nova marca"
                        getOptionLabel={(option) => option?.marca || ""}
                        isOptionEqualToValue={(option, value) => option?.idMarca === value?.idMarca}
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Marca"
                                required
                                helperText="Digite para buscar ou criar nova marca"
                                variant="outlined"
                                margin="normal"
                            />
                        )}
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Seção de Variações */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Variações ({derivacoes.length})
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={adicionarDerivacao}
                        variant="contained"
                        sx={{ bgcolor: "#AEB8D6", color: '#142442' }}
                    >
                        Adicionar Variação
                    </Button>
                </Box>

                {/* Lista de Derivações */}
                <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {derivacoes.map((derivacao, index) => renderDerivacao(derivacao, index))}
                </Box>

                {/* Botões de Ação */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/estoque')}
                        disabled={loading}
                        sx={{ bgcolor: "#AEB8D6", color: '#142442', border: "none" }}
                    >
                        Voltar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ bgcolor: "#AEB8D6", color: '#142442' }}
                    >
                        {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
                    </Button>
                </Box>
            </form>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidenav />
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {isEditing ? 'Editar Produto' : 'Cadastrar Produto'}
                </Typography>
                {renderFormConteudo()}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setOpenSnackbar(false)}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default ProdutoForm;
