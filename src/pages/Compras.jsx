import React, {useEffect, useMemo, useState} from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, IconButton, Snackbar, Alert, TextField, InputAdornment, Modal, Typography,
    Button, Chip, Card, CardContent, Tooltip,TableSortLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import UndoIcon from '@mui/icons-material/Undo';
import axios from 'axios';
import Sidenav from '../NSidenav';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {useNavigate} from "react-router-dom";


const ComprasList = () => {
    const [compras, setCompras] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    //Navegação
    const navigate = useNavigate();

    // Filtros (opcionais)
    const [searchTerm, setSearchTerm] = useState('');
    const [inicio, setInicio] = useState('2025-10-01'); // range amplo
    const [fim, setFim] = useState(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    });

    // UI
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openModal, setOpenModal] = useState(false);
    const [compraSelecionada, setCompraSelecionada] = useState(null);

    const apiBase = 'http://localhost:8080';

    // Ordenação
    const [order, setOrder] = useState('asc');           // 'asc' para primeiros itens primeiro (mais antigos)
    const [orderBy, setOrderBy] = useState('dataCompra'); // coluna a ordenar (data)

// Comparadores
    function descendingComparator(a, b, orderBy) {
        const getVal = (row) => {
            if (orderBy === 'dataCompra') return new Date(row?.dataCompra || 0).getTime();
            if (orderBy === 'id') return Number(row?.id ?? 0);
            return row?.[orderBy];
        };

        const aVal = getVal(a);
        const bVal = getVal(b);

        if (bVal < aVal) return -1;
        if (bVal > aVal) return 1;
        return 0;
    }


    function getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort(array, comparator) {
        const stabilized = (array || []).map((el, index) => [el, index]);
        stabilized.sort((a, b) => {
            const ord = comparator(a[0], b[0]);
            if (ord !== 0) return ord;
            return a[1] - b[1];
        });
        return stabilized.map((el) => el[0]);
    }

    const handleRequestSort = (property) => () => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };


    const formatarData = (data) => {
        if (!data) return 'N/A';

        // Se a data vier no formato ISO (string)
        if (typeof data === 'string') {
            // Extrai apenas a parte da data (YYYY-MM-DD)
            const parteData = data.split('T')[0];
            const [ano, mes, dia] = parteData.split('-');
            return `${dia}/${mes}/${ano}`;
        }

        // Se for um objeto Date
        const d = new Date(data);
        if (isNaN(d.getTime())) return 'N/A';

        // Usa getDate, getMonth e getFullYear para evitar problemas de fuso
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();

        return `${dia}/${mes}/${ano}`;
    };

    const formatarMoeda = (valor) => {
        if (valor == null) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(valor);
    };

    // 1) Primeiro load: lista tudo (range amplo)
    const carregarTodas = async () => {
        try {
            const url = `${apiBase}/compras/periodo?inicio=${inicio}&fim=${fim}`;
            const { data } = await axios.get(url);

            // CORREÇÃO: Verifica se a data é um array antes de atualizar o estado
            setCompras(Array.isArray(data) ? data : []);

            setSnackbarSeverity('success');
        } catch (e) {
            console.error('Erro ao carregar compras:', e);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar compras');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        carregarTodas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2) Filtro apenas no cliente
    const comprasFiltradas = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        // filtro de texto (nota/fornecedor)
        const porTexto = (c) => {
            if (!term) return true;
            const nota = (c.numeroNota || '').toLowerCase();
            const fornecedor = (c.fornecedor?.nomeFantasia || '').toLowerCase();
            return nota.includes(term) || fornecedor.includes(term);
        };

        return (compras || []).filter(porTexto);
    }, [compras, searchTerm]);

    const handleAplicarFiltroPeriodo = async () => {
        // Se quiser aplicar período no servidor, recarrega com range informado
        await carregarTodas();
        setPage(0);
    };

    const handleChangePage = (e, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };
    const handleCloseSnackbar = () => setOpenSnackbar(false);
    const handleVerDetalhes = (compra) => {
        setCompraSelecionada(compra);
        setOpenModal(true);
    };
    const handleCloseModal = () => {
        setOpenModal(false);
        setCompraSelecionada(null);
    };

    const modalStyle = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: 800, maxHeight: '90vh', bgcolor: 'background.paper',
        border: '2px solid #000', borderRadius: 8, boxShadow: 24, p: 3, overflow: 'auto',
        // Esconde a barra de scroll mas mantém a funcionalidade
        '&::-webkit-scrollbar': {
            display: 'none'
        },
        msOverflowStyle: 'none',  // IE e Edge
        scrollbarWidth: 'none'     // Firefox
    };

    const comparatorMemo = useMemo(
        () => getComparator(order, orderBy),
        [order, orderBy]
    );

// Ordena antes de paginar
    const comprasOrdenadas = useMemo(
        () => stableSort(comprasFiltradas, comparatorMemo),
        [comprasFiltradas, comparatorMemo]
    );

    const pagina = comprasOrdenadas.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    return (
        <>
            <Box sx={{display: 'flex'}}>
                <Sidenav/>
                <Box sx={{flexGrow: 1, p: 3}}>
                    <Typography variant="h4" gutterBottom>Lista de Compras</Typography>

                    {/* Filtros opcionais */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                            <Button startIcon={<AddBoxIcon/>} variant="contained" color="primary"
                                    onClick={() => navigate('/compras/novo')} sx={{
                                bgcolor: '#142442',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#AEB8D6',
                                    color: '#142442'
                                }
                            }}>
                                Novo
                            </Button>
                            <TextField label="Início" type="date" size="small" value={inicio}
                                       onChange={(e) => setInicio(e.target.value)} InputLabelProps={{shrink: true}}/>
                            <TextField label="Fim" type="date" size="small" value={fim}
                                       onChange={(e) => setFim(e.target.value)} InputLabelProps={{shrink: true}}/>
                            <Button startIcon={<DateRangeIcon/>} variant="contained"
                                    onClick={handleAplicarFiltroPeriodo} sx={{bgcolor: '#142442'}}>
                                Buscar
                            </Button>

                        </Box>

                        <TextField
                            placeholder="Filtrar por nº nota ou fornecedor..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)
                            }}
                            sx={{minWidth: 320}}
                        />
                    </Box>

                    {/* Tabela */}
                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell><strong>Nº Nota</strong></TableCell>
                                        <TableCell sortDirection={orderBy === 'dataCompra' ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === 'dataCompra'}
                                                direction={orderBy === 'dataCompra' ? order : 'asc'}
                                                onClick={handleRequestSort('dataCompra')}
                                            >
                                                Data
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell><strong>Fornecedor</strong></TableCell>
                                        <TableCell><strong>Itens</strong></TableCell>
                                        <TableCell><strong>Total</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell> {/* NOVO */}
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagina.map((c) => (
                                        <TableRow key={c.idCompra} hover>
                                            <TableCell>{c.idCompra}</TableCell>
                                            <TableCell>{c.numeroNota}</TableCell>
                                            <TableCell>{formatarData(c.dataCompra)}</TableCell>
                                            <TableCell>{c.fornecedor?.nomeFantasia || '—'}</TableCell>
                                            {/* CORRIGIDO: de itensCompras para itemCompras */}
                                            <TableCell>{c.itens?.length ?? 0}</TableCell>
                                            <TableCell>
                                                <Chip icon={<AttachMoneyIcon/>} label={formatarMoeda(c.totalCompra)}
                                                      color="success" variant="outlined" size="small"/>
                                            </TableCell>
                                            <TableCell>
                                                {c.status === 'ESTORNADA_TOTAL' && (
                                                    <Chip label="Cancelada" color="error" size="small" variant="filled"/>
                                                )}
                                                {c.status === 'ESTORNADA_PARCIAL' && (
                                                    <Chip label="Est. Parcial" color="warning" size="small" variant="filled"/>
                                                )}
                                                {c.status === 'ATIVA' && (
                                                    <Chip label="Ativa" color="success" size="small" variant="outlined"/>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Ver detalhes">
                                                    <IconButton onClick={() => handleVerDetalhes(c)} color="info"
                                                                size="small">
                                                        <VisibilityIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={comprasFiltradas.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Linhas por página:"
                            labelDisplayedRows={({
                                                     from,
                                                     to,
                                                     count
                                                 }) => `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                        />
                    </Paper>

                    {/* Modal */}

                    <Modal open={openModal} onClose={handleCloseModal}>
                        <Box sx={modalStyle}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>

                                {/* NOVO: Container para Título e Status */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#142442' }}>
                                        Detalhes da Compra
                                    </Typography>

                                    {/* Exibição do Status no Modal */}
                                    {compraSelecionada?.status === 'ESTORNADA_TOTAL' && (
                                        <Chip label="CANCELADA" color="error" size="medium" sx={{ fontWeight: 600 }}/>
                                    )}
                                    {compraSelecionada?.status === 'ESTORNADA_PARCIAL' && (
                                        <Chip label="ESTORNO PARCIAL" color="warning" size="medium" sx={{ fontWeight: 600 }}/>
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        startIcon={<UndoIcon />}
                                        variant="contained"
                                        size="small"
                                        // DESABILITA o botão se o status for ESTORNADA_TOTAL
                                        disabled={compraSelecionada?.status === 'ESTORNADA_TOTAL'}
                                        onClick={() => {
                                            if (compraSelecionada) {
                                                navigate(`/compras/estorno/${compraSelecionada.idCompra}`);
                                                handleCloseModal();
                                            }
                                        }}
                                        sx={{
                                            bgcolor: '#d32f2f',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#b71c1c'
                                            }
                                        }}
                                    >
                                        Estornar
                                    </Button>
                                    <IconButton onClick={handleCloseModal}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Box>
                            </Box>

                            {compraSelecionada && (() => {
                                // Calcula totais
                                const totalProdutos = (compraSelecionada.itens || []).reduce((acc, it) =>
                                    acc + (parseFloat(it.valorLiquido) || 0), 0
                                );
                                const valorFrete = parseFloat(compraSelecionada.valorFrete) || 0;
                                const totalGeral = parseFloat(compraSelecionada.totalCompra) || 0;

                                return (
                                    <>
                                        <Card sx={{mb: 2}}>
                                            <CardContent>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#142442' }}>
                                                            Nº Nota: {compraSelecionada.numeroNota}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Data: {formatarData(compraSelecionada.dataCompra)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Fornecedor: {compraSelecionada.fornecedor?.nomeFantasia || '—'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Frete incluso: {compraSelecionada.freteIncluso ? 'Sim' : 'Não'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Valor frete: {formatarMoeda(valorFrete)}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{
                                                    mt: 3,
                                                    pt: 2,
                                                    borderTop: '2px solid #e0e0e0',
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr 1fr',
                                                    gap: 2
                                                }}>
                                                    <Box sx={{ textAlign: 'center', bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Total Produtos
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: '#142442', fontWeight: 600 }}>
                                                            {formatarMoeda(totalProdutos)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'center', bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Frete
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>
                                                            {formatarMoeda(valorFrete)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'center', bgcolor: '#142442', p: 1.5, borderRadius: 1 }}>
                                                        <Typography variant="caption" sx={{ color: 'white' }}>
                                                            Total Geral
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                                                            {formatarMoeda(totalGeral)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 2, color: '#142442' }}>
                                                    Itens da Compra ({compraSelecionada.itens?.length ?? 0})
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                            <TableCell><strong>Produto</strong></TableCell>
                                                            <TableCell><strong>Marca</strong></TableCell>
                                                            <TableCell><strong>SKU</strong></TableCell>
                                                            <TableCell align="right"><strong>Qtd</strong></TableCell>
                                                            <TableCell align="right"><strong>Bruto</strong></TableCell>
                                                            <TableCell align="right"><strong>Margem (%)</strong></TableCell>
                                                            <TableCell align="right"><strong>Líquido</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {(compraSelecionada.itens || []).map((it, idx) => (
                                                            <TableRow key={idx} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                        {it.derivacao?.nomeProduto || `Item ${idx + 1}`}
                                                                    </Typography>
                                                                    {it.derivacao && (
                                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                                            {[
                                                                                it.derivacao.tipoRoupa?.tipoRoupa,
                                                                                it.derivacao.tipoCor?.nomeCor,
                                                                                it.derivacao.tamanho?.nomeTamanho
                                                                            ].filter(Boolean).join(' • ')}
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={it.derivacao?.marcaProduto || 'Sem marca'}
                                                                        variant="outlined"
                                                                        sx={{ fontSize: '0.75rem' }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                                        {it.derivacao?.codigoSKU || '—'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2">
                                                                        {it.quantidade}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {formatarMoeda(it.valorBruto)}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Chip
                                                                        label={`${it.margem}%`}
                                                                        size="small"
                                                                        color="success"
                                                                        sx={{ minWidth: 50 }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {formatarMoeda(it.valorLiquido)}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                            <TableCell colSpan={6} align="right">
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    Subtotal (Produtos):
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#142442' }}>
                                                                    {formatarMoeda(totalProdutos)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </>
                                );
                            })()}
                        </Box>
                    </Modal>

                    <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}
                              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}>
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width: '100%'}}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </>
    );
};

export default ComprasList;