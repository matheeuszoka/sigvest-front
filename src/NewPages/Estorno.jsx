import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Typography, Button, Snackbar, Alert,
    Chip, Divider, CircularProgress, Table,
    TableBody, TableCell, TableHead, TableRow, Checkbox, Radio,
    RadioGroup, FormControlLabel, FormControl,Dialog,
    DialogTitle, DialogContent, DialogActions, Grid
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidenav from "../NSidenav";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteIcon from '@mui/icons-material/Note';

const EstornoCompras = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Estados da compra
    const [compra, setCompra] = useState(null);
    const [numeroNota, setNumeroNota] = useState('');
    const [dataCompra, setDataCompra] = useState('');
    const [fornecedor, setFornecedor] = useState(null);
    const [totalCompra, setTotalCompra] = useState('0');
    const [valorFrete, setValorFrete] = useState('0');
    const [freteIncluso, setFreteIncluso] = useState(false);

    // Estados dos itens
    const [itens, setItens] = useState([]);
    const [itensSelecionados, setItensSelecionados] = useState([]);

    // Estados de estorno
    const [tipoEstorno, setTipoEstorno] = useState('parcial');
    const [motivoEstorno, setMotivoEstorno] = useState('');
    const [quantidadesEstorno, setQuantidadesEstorno] = useState({});

    // Estados de controle
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const apiBase = 'http://localhost:8080';

    useEffect(() => {
        if (id) {
            fetchCompraById(id);
        }
    }, [id]);

    useEffect(() => {
        if (tipoEstorno === 'total' && itens.length > 0) {
            setItensSelecionados(itens.map((_, idx) => idx));
            const novasQuantidades = {};
            itens.forEach((item, idx) => {
                novasQuantidades[idx] = item.quantidade;
            });
            setQuantidadesEstorno(novasQuantidades);
        } else if (tipoEstorno === 'parcial') {
            setItensSelecionados([]);
            setQuantidadesEstorno({});
        }
    }, [tipoEstorno, itens]);

    const fetchCompraById = async (idCompra) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${apiBase}/compras/${idCompra}`);

            // NOVO: Atualizar os estados de cabeçalho da compra
            setCompra(data);
            setNumeroNota(data.numeroNota || '');
            setDataCompra(data.dataCompra || '');
            setFornecedor(data.fornecedor || null);
            setTotalCompra(data.totalCompra?.toFixed(2) || '0.00'); // Garante que seja string formatada
            setValorFrete(data.valorFrete?.toFixed(2) || '0.00'); // Adicionado valorFrete
            setFreteIncluso(data.freteIncluso || false); // Adicionado freteIncluso

            if (data.itens && data.itens.length > 0) {
                setItens(data.itens.map(it => ({
                    // CORRIGIDO: Usar 'it.idICompras' (ID do ItemCompras em ItemCompras.java)
                    idItemCompra: it.idICompras,
                    produto: it.produto,
                    derivacao: it.derivacao,
                    quantidade: parseFloat(it.quantidade) || 0,
                    valorBruto: parseFloat(it.valorBruto) || 0,
                    margem: parseFloat(it.margem) || 0,
                    valorLiquido: parseFloat(it.valorLiquido) || 0
                })));
            }
        } catch (error) {
            console.error('Erro ao buscar compra:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar dados da compra');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSelecionarItem = (index) => {
        if (tipoEstorno === 'total') return;
        setItensSelecionados(prev => {
            if (prev.includes(index)) {
                const novasQuantidades = { ...quantidadesEstorno };
                delete novasQuantidades[index];
                setQuantidadesEstorno(novasQuantidades);
                return prev.filter(i => i !== index);
            } else {
                const novasQuantidades = { ...quantidadesEstorno };
                novasQuantidades[index] = itens[index].quantidade;
                setQuantidadesEstorno(novasQuantidades);
                return [...prev, index];
            }
        });
    };

    const handleQuantidadeEstornoChange = (index, valor) => {
        const valorNumerico = parseFloat(valor) || 0;
        const quantidadeMaxima = itens[index].quantidade;

        if (valorNumerico > quantidadeMaxima) {
            setSnackbarSeverity('warning');
            setSnackbarMessage(`Quantidade máxima para estorno: ${quantidadeMaxima}`);
            setOpenSnackbar(true);
            return;
        }

        setQuantidadesEstorno(prev => ({
            ...prev,
            [index]: valorNumerico
        }));
    };

    const calcularTotalEstorno = () => {
        return itensSelecionados.reduce((total, idx) => {
            const item = itens[idx];
            const qtdEstorno = quantidadesEstorno[idx] || 0;
            // Estorno de COMPRA deve usar o valor de compra (valorBruto)
            const valorItem = qtdEstorno * item.valorBruto;
            return total + valorItem;
        }, 0);
    };

    const validateForm = () => {
        if (itensSelecionados.length === 0) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Selecione pelo menos um item para estornar');
            setOpenSnackbar(true);
            return false;
        }

        if (!motivoEstorno.trim()) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Informe o motivo do estorno');
            setOpenSnackbar(true);
            return false;
        }

        for (const idx of itensSelecionados) {
            const qtdEstorno = quantidadesEstorno[idx] || 0;
            if (qtdEstorno <= 0) {
                setSnackbarSeverity('error');
                setSnackbarMessage(`Quantidade de estorno inválida para o item ${idx + 1}`);
                setOpenSnackbar(true);
                return false;
            }
            if (qtdEstorno > itens[idx].quantidade) {
                setSnackbarSeverity('error');
                setSnackbarMessage(`Quantidade de estorno excede a quantidade original para o item ${idx + 1}`);
                setOpenSnackbar(true);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setOpenConfirmDialog(false);
            return;
        }
        setLoading(true);

        try {
            const itensEstorno = itensSelecionados.map(idx => ({
                idItemCompra: itens[idx].idItemCompra,
                quantidadeEstorno: quantidadesEstorno[idx]
            }));

            const valorTotalCalculado = calcularTotalEstorno();

            const estornoData = {
                idCompra: parseInt(id),
                tipoEstorno: tipoEstorno,
                motivoEstorno: motivoEstorno.trim(),
                itensEstorno: itensEstorno,
                valorTotalEstorno: valorTotalCalculado
            };

            // CHAMADA PARA O ENDPOINT POST /compras/estorno
            await axios.post(`${apiBase}/compras/estorno`, estornoData);
            setSnackbarSeverity('success');
            setSnackbarMessage('Estorno realizado com sucesso!');
            setOpenSnackbar(true);
            setTimeout(() => navigate('/compras'), 2000);
        } catch (error) {
            console.error('Erro ao realizar estorno:', error);
            setSnackbarSeverity('error');
            let erroMsg = 'Erro ao realizar estorno';

            // Lógica de extração da mensagem de erro do Backend
            if (error.response?.data) {
                // Tenta extrair a mensagem do corpo da resposta (se for um objeto com 'message' ou 'error')
                if (typeof error.response.data === 'string') {
                    // Se o body for string (ex: "Bad Request" ou a mensagem da exceção)
                    erroMsg = error.response.data;
                } else if (error.response.data.message) {
                    erroMsg = error.response.data.message;
                } else if (error.response.data.error) {
                    erroMsg = error.response.data.error;
                } else {
                    // Fallback para exibir o status HTTP se a mensagem for inacessível
                    erroMsg = `Erro ${error.response.status}: Falha na operação.`;
                }
            } else if (error.message) {
                // Erro de rede ou CORS
                erroMsg = error.message;
            }

            setSnackbarMessage(erroMsg);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
            setOpenConfirmDialog(false);
        }
    };

    if (loading && !compra) {
        return (
            <Box sx={{ width: '100%', height: '100vh', display: 'flex' }}>
                <Sidenav />
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={60} sx={{ color: '#142442' }} />
                </Box>
            </Box>
        );
    }

    // Função auxiliar para formatar a data de exibição
    const displayDataCompra = dataCompra
        ? new Date(dataCompra + 'T12:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        : '-';

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Sidenav />
            <Box sx={{ flexGrow: 1, p: 3 }}>

                {/* Cabeçalho Principal (Estilo PessoaNovo) */}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <UndoIcon sx={{ mr: 2, color: '#142442', fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" sx={{ color: '#142442', fontWeight: 700, mb: 0.5 }}>
                                Estorno de Compra
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Realize o estorno total ou parcial da nota fiscal de compra
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {tipoEstorno && (
                            <Chip
                                icon={tipoEstorno === 'total' ? <WarningIcon /> : <InfoIcon />}
                                label={tipoEstorno === 'total' ? 'Estorno Total' : 'Estorno Parcial'}
                                color={tipoEstorno === 'total' ? 'error' : 'warning'}
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                        {numeroNota && (
                            <Chip
                                icon={<ReceiptIcon />}
                                label={`NF: ${numeroNota}`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Informações da Compra (Estilo PessoaNovo) */}
                <Box sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    mb: 3,
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <ReceiptIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                        <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                            Detalhes da Compra
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Uso de Grid para replicar o layout de campos lado a lado (4 colunas em md) */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Número da Nota
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, color: '#142442' }}>
                                {numeroNota}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Data da Compra
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, color: '#142442' }}>
                                {displayDataCompra}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Fornecedor
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, color: '#142442' }}>
                                {fornecedor?.razaoSocial || fornecedor?.nomeCompleto || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Valor Total da NF
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, color: '#142442', fontSize: '1.5rem' }}>
                                R$ {parseFloat(totalCompra).toFixed(2)}
                            </Typography>
                        </Grid>
                        {freteIncluso && (
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Valor do Frete
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, color: '#142442' }}>
                                    R$ {parseFloat(valorFrete).toFixed(2)}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Tipo de Estorno (Estilo PessoaNovo) */}
                <Box sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    mb: 3,
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <UndoIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                        <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                            Opções de Estorno
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <FormControl component="fieldset">
                        <RadioGroup
                            row
                            value={tipoEstorno}
                            onChange={(e) => setTipoEstorno(e.target.value)}
                        >
                            <FormControlLabel
                                value="parcial"
                                control={<Radio sx={{ color: '#142442', '&.Mui-checked': { color: '#142442' } }} />}
                                label="Estorno Parcial (Selecionar itens e quantidades)"
                            />
                            <FormControlLabel
                                value="total"
                                control={<Radio sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }} />}
                                label="Estorno Total (Cancela a nota inteira)"
                            />
                        </RadioGroup>
                    </FormControl>
                    {tipoEstorno === 'total' && (
                        <Alert severity="error" icon={<WarningIcon />} sx={{ mt: 2, borderRadius: 2 }}>
                            Atenção: O estorno **TOTAL** cancelará toda a nota fiscal, e a quantidade original de **TODOS** os itens será devolvida ao estoque.
                        </Alert>
                    )}
                    {tipoEstorno === 'parcial' && (
                        <Alert severity="warning" icon={<InfoIcon />} sx={{ mt: 2, borderRadius: 2 }}>
                            Selecione os itens e ajuste as quantidades que deseja estornar.
                        </Alert>
                    )}
                </Box>

                {/* Itens para Estorno (Estilo PessoaNovo) */}
                <Box sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    mb: 3,
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AssignmentIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                        <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                            Seleção de Itens ({itensSelecionados.length} / {itens.length} selecionados)
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f1f1f1' }}>
                                    <TableCell padding="checkbox">
                                        {tipoEstorno === 'parcial' && (
                                            <Checkbox
                                                checked={itens.length > 0 && itensSelecionados.length === itens.length}
                                                indeterminate={itensSelecionados.length > 0 && itensSelecionados.length < itens.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setItensSelecionados(itens.map((_, idx) => idx));
                                                        const novasQtd = {};
                                                        itens.forEach((item, idx) => {
                                                            novasQtd[idx] = item.quantidade;
                                                        });
                                                        setQuantidadesEstorno(novasQtd);
                                                    } else {
                                                        setItensSelecionados([]);
                                                        setQuantidadesEstorno({});
                                                    }
                                                }}
                                                sx={{ color: '#142442', '&.Mui-checked': { color: '#142442' } }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#142442' }}>Produto</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#142442' }}>Derivação/SKU</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#142442' }}>Qtd Original</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#142442' }}>Qtd Estorno</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#142442' }}>Valor Unit. (Compra)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#142442' }}>Total Estorno</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itens.map((item, idx) => {
                                    const selecionado = itensSelecionados.includes(idx);
                                    const qtdEstorno = quantidadesEstorno[idx] || 0;
                                    // Valor total do estorno baseado no valorBruto (custo/compra)
                                    const totalItem = qtdEstorno * item.valorBruto;

                                    return (
                                        <TableRow
                                            key={idx}
                                            sx={{
                                                bgcolor: selecionado ? '#e3f2fd' : 'transparent',
                                                '&:hover': { bgcolor: selecionado ? '#bbdefb' : '#f5f5f5' }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selecionado}
                                                    onChange={() => handleSelecionarItem(idx)}
                                                    disabled={tipoEstorno === 'total'}
                                                    sx={{ color: '#142442', '&.Mui-checked': { color: '#142442' } }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {item.derivacao?.nomeProduto || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.primary">
                                                    SKU: {item.derivacao?.codigoSKU || '-'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.derivacao?.tipoRoupa?.tipoRoupa || ''} {' '}
                                                    {item.derivacao?.tipoCor?.nomeCor || ''} {' '}
                                                    {item.derivacao?.tamanho?.nomeTamanho || ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">{item.quantidade}</TableCell>
                                            <TableCell align="center">
                                                {/* Campo de quantidade com estética PessoaNovo (borderRadius: 2) */}
                                                <TextField
                                                    type="number"
                                                    value={qtdEstorno}
                                                    onChange={(e) => handleQuantidadeEstornoChange(idx, e.target.value)}
                                                    disabled={!selecionado || tipoEstorno === 'total'}
                                                    inputProps={{
                                                        min: 0,
                                                        max: item.quantidade,
                                                        step: 1
                                                    }}
                                                    size="small"
                                                    sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    R$ {item.valorBruto.toFixed(2)}
                                                </Typography>
                                                {item.margem > 0 && (
                                                    <Chip
                                                        label={`Margem: +${item.margem}%`}
                                                        size="small"
                                                        color="info"
                                                        sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                                                R$ {totalItem.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>

                {/* Motivo do Estorno e Resumo (Estilo PessoaNovo) */}
                <Box sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    mb: 3,
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <NoteIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                        <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                            Motivo do Estorno e Resumo
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Campo de texto fullWidth com estética PessoaNovo (borderRadius: 2) */}
                    <TextField
                        label="Descreva o motivo do estorno"
                        value={motivoEstorno}
                        onChange={(e) => setMotivoEstorno(e.target.value)}
                        multiline
                        rows={4}
                        required
                        fullWidth
                        placeholder="Descreva o motivo do estorno..."
                        helperText="Campo obrigatório para registro da operação"
                        sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    {/* Resumo do Estorno (Uso de Grid para replicar o layout de campos lado a lado) */}
                    <Grid container spacing={3} sx={{ bgcolor: '#fafafa', p: 3, borderRadius: 2, border: '1px dashed #e0e0e0' }}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                Itens Selecionados
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#142442', mt: 1 }}>
                                {itensSelecionados.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                Tipo de Estorno
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#142442', mt: 1 }}>
                                {tipoEstorno === 'total' ? 'Total' : 'Parcial'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                Valor Total do Estorno
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f', mt: 1 }}>
                                R$ {calcularTotalEstorno().toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Botões de Ação (Estilo PessoaNovo) */}
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
                            onClick={() => navigate('/compras')}
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
                                    <CircularProgress size={20} sx={{ mr: 1, color: '#d32f2f' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Processando estorno...
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                startIcon={loading ? null : <SaveIcon />}
                                variant="contained"
                                onClick={() => setOpenConfirmDialog(true)}
                                disabled={loading || itensSelecionados.length === 0 || !motivoEstorno.trim()}
                                size="large"
                                sx={{
                                    bgcolor: '#d32f2f',
                                    color: 'white',
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    boxShadow: 3,
                                    '&:hover': {
                                        bgcolor: '#b71c1c',
                                        boxShadow: 4
                                    },
                                    '&:disabled': {
                                        bgcolor: '#ccc'
                                    }
                                }}
                            >
                                Salvar
                            </Button>
                        </Box>
                    </Box>
                </Box>


                {/* Dialog de Confirmação (Estilo PessoaNovo) */}
                <Dialog
                    open={openConfirmDialog}
                    onClose={() => setOpenConfirmDialog(false)}
                    aria-labelledby="modal-confirmar-estorno"
                    aria-describedby="modal-descricao-estorno"
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 700 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon />
                            Confirmar Estorno de Compra
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                            Você está prestes a realizar um **{tipoEstorno === 'total' ? 'ESTORNO TOTAL' : 'ESTORNO PARCIAL'}** da nota fiscal **{numeroNota}**.
                        </Alert>
                        <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                • **Itens a serem estornados:** {itensSelecionados.length}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                • **Valor Total do Estorno (Custo):** <strong style={{ color: '#d32f2f' }}>R$ {calcularTotalEstorno().toFixed(2)}</strong>
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                • **Motivo:** *{motivoEstorno}*
                            </Typography>
                        </Box>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Esta ação não poderá ser desfeita. Os itens estornados serão devolvidos ao estoque e as movimentações financeiras de custo serão ajustadas.
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenConfirmDialog(false)}
                            disabled={loading}
                            variant="outlined"
                            sx={{
                                color: '#142442',
                                borderColor: '#142442',
                                borderWidth: 2,
                                '&:hover': { bgcolor: '#142442', color: 'white', borderColor: '#142442' }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UndoIcon />}
                            sx={{
                                bgcolor: '#d32f2f',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': { bgcolor: '#b71c1c' }
                            }}
                        >
                            Confirmar Estorno
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar (Estilo PessoaNovo) */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={6000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpenSnackbar(false)}
                        severity={snackbarSeverity}
                        sx={{
                            width: '100%',
                            boxShadow: 4,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                fontSize: '1.5rem'
                            }
                        }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default EstornoCompras;