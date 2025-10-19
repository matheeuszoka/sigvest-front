import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    IconButton,
    Snackbar,
    Alert,
    TextField,
    InputAdornment,
    Modal,
    Typography,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Grid,
    Card,
    CardContent,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from '@mui/icons-material/AddBox';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import InventoryIcon from '@mui/icons-material/Inventory';
import StyleIcon from '@mui/icons-material/Style';
import PaletteIcon from '@mui/icons-material/Palette';
import StraightenIcon from '@mui/icons-material/Straighten';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidenav from "../NSidenav";

const EstoqueList = () => {
    const [produtos, setProdutos] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Estados do Modal
    const [openModal, setOpenModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para filtrar os produtos baseado no termo de pesquisa
    const filteredProdutos = produtos.filter((produto) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            produto.nomeProduto?.toLowerCase().includes(searchLower) ||
            produto.marca?.marca?.toLowerCase().includes(searchLower) ||
            produto.derivacoes?.some(derivacao =>
                derivacao.tipoRoupa?.tipoRoupa?.toLowerCase().includes(searchLower) ||
                derivacao.tipoCor?.nomeCor?.toLowerCase().includes(searchLower) ||
                derivacao.tamanho?.nomeTamanho?.toLowerCase().includes(searchLower) ||
                derivacao.codigoSKU?.toLowerCase().includes(searchLower)
            )
        );
    });

    const fetchProdutos = async () => {
        try {
            const response = await axios.get("http://localhost:8080/produto");
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar a lista de produtos');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    const handleEditar = (produto) => {
        navigate(`/produto/editar/${produto.idProduto}`);
    };

    const handleExcluir = async (idProduto) => {
        if (window.confirm('Tem certeza que deseja excluir este produto e todas suas variações?')) {
            try {
                await axios.delete(`http://localhost:8080/produto/${idProduto}`);
                await fetchProdutos();
                setSnackbarSeverity('success');
                setSnackbarMessage('Produto excluído com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir produto:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir produto');
                setOpenSnackbar(true);
            }
        }
    };

    const handleVerDerivacoes = (produto) => {
        setProdutoSelecionado(produto);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setProdutoSelecionado(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // Calcular estatísticas do produto
    const calcularEstatisticas = (derivacoes) => {
        if (!derivacoes || derivacoes.length === 0) return { totalEstoque: 0, totalVariacoes: 0 };

        const totalEstoque = derivacoes.reduce((acc, der) => acc + (der.estoque || 0), 0);
        const totalVariacoes = derivacoes.length;

        return { totalEstoque, totalVariacoes };
    };

    // Estilo do Modal
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        borderRadius: '8px',
        boxShadow: 24,
        p: 4,
        overflow: 'auto'
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <Sidenav />
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Estoque de Produtos
                    </Typography>

                    {/* Barra de Ações */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        gap: 2
                    }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                startIcon={<AddBoxIcon />}
                                onClick={() => navigate("/produto/novo")}
                                variant="contained"
                                sx={{
                                    bgcolor: '#142442',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#AEB8D6',
                                        color: '#142442'
                                    }
                                }}
                            >
                                Novo Produto
                            </Button>
                            <Button
                                startIcon={<BrandingWatermarkIcon />}
                                onClick={() => navigate("/marca")}
                                variant="outlined"
                                sx={{
                                    color: '#142442',
                                    borderColor: '#142442',
                                    '&:hover': {
                                        bgcolor: '#AEB8D6',
                                        borderColor: '#142442'
                                    }
                                }}
                            >
                                Gerenciar Marcas
                            </Button>
                        </Box>

                        {/* Campo de Pesquisa */}
                        <TextField
                            placeholder="Buscar por produto, marca, tipo, cor ou tamanho..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                minWidth: 300,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />
                    </Box>

                    {/* Tabela de Produtos */}
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>ID</strong></TableCell>
                                        <TableCell><strong>Nome do Produto</strong></TableCell>
                                        <TableCell><strong>Marca</strong></TableCell>
                                        <TableCell><strong>Variações</strong></TableCell>
                                        <TableCell><strong>Estoque Total</strong></TableCell>
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredProdutos
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((produto) => {
                                            const stats = calcularEstatisticas(produto.derivacoes);
                                            return (
                                                <TableRow key={produto.idProduto} hover>
                                                    <TableCell>{produto.idProduto}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {produto.nomeProduto}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={produto.marca?.marca || 'Sem marca'}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${stats.totalVariacoes} variação${stats.totalVariacoes !== 1 ? 'ões' : ''}`}
                                                            color="primary"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${stats.totalEstoque} unidades`}
                                                            color={stats.totalEstoque > 0 ? "success" : "error"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Ver Variações">
                                                                <IconButton
                                                                    onClick={() => handleVerDerivacoes(produto)}
                                                                    color="info"
                                                                    size="small"
                                                                >
                                                                    <VisibilityIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Editar Produto">
                                                                <IconButton
                                                                    onClick={() => handleEditar(produto)}
                                                                    color="primary"
                                                                    size="small"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Excluir Produto">
                                                                <IconButton
                                                                    onClick={() => handleExcluir(produto.idProduto)}
                                                                    color="error"
                                                                    size="small"
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredProdutos.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Linhas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
                            }
                        />
                    </Paper>

                    {/* Modal de Derivações */}
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-derivacoes-titulo"
                        aria-describedby="modal-derivacoes-descricao"
                    >
                        <Box sx={modalStyle}>
                            {/* Cabeçalho do Modal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography id="modal-derivacoes-titulo" variant="h5" component="h2">
                                    Variações - {produtoSelecionado?.nomeProduto}
                                </Typography>
                                <IconButton onClick={handleCloseModal}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Informações do Produto */}
                            <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Produto:</Typography>
                                            <Typography variant="h6">{produtoSelecionado?.nomeProduto}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Marca:</Typography>
                                            <Typography variant="h6">{produtoSelecionado?.marca?.marca}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Lista de Derivações */}
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Lista de Variações ({produtoSelecionado?.derivacoes?.length || 0})
                            </Typography>

                            {produtoSelecionado?.derivacoes && produtoSelecionado.derivacoes.length > 0 ? (
                                <Grid container spacing={2}>
                                    {produtoSelecionado.derivacoes.map((derivacao, index) => (
                                        <Grid item xs={12} md={6} key={derivacao.idDerivacao || index}>
                                            <Card sx={{
                                                border: '1px solid #e0e0e0',
                                                '&:hover': { boxShadow: 3 }
                                            }}>
                                                <CardContent>
                                                    {/* SKU */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            SKU:
                                                        </Typography>
                                                        <Chip
                                                            label={derivacao.codigoSKU || 'N/A'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>

                                                    <Divider sx={{ my: 1 }} />

                                                    {/* Características */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <StyleIcon fontSize="small" sx={{ mr: 1, color: '#666' }} />
                                                        <Typography variant="body2">
                                                            <strong>Tipo:</strong> {derivacao.tipoRoupa?.tipoRoupa || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <PaletteIcon fontSize="small" sx={{ mr: 1, color: '#666' }} />
                                                        <Typography variant="body2">
                                                            <strong>Cor:</strong> {derivacao.tipoCor?.nomeCor || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <StraightenIcon fontSize="small" sx={{ mr: 1, color: '#666' }} />
                                                        <Typography variant="body2">
                                                            <strong>Tamanho:</strong> {derivacao.tamanho?.nomeTamanho || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    {/* Preços e Estoque */}
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Preço Custo
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                R$ {derivacao.precoCusto ? Number(derivacao.precoCusto).toFixed(2) : '0,00'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Preço Venda
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                                                R$ {derivacao.precoVenda ? Number(derivacao.precoVenda).toFixed(2) : '0,00'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                                                <InventoryIcon fontSize="small" sx={{ mr: 1 }} />
                                                                <Chip
                                                                    label={`Estoque: ${derivacao.estoque || 0}`}
                                                                    color={derivacao.estoque > 0 ? "success" : "error"}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Nenhuma variação encontrada para este produto.
                                    </Typography>
                                </Paper>
                            )}

                            {/* Botões do Modal */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                                <Button onClick={handleCloseModal} variant="outlined">
                                    Fechar
                                </Button>
                                <Button
                                    onClick={() => {
                                        handleCloseModal();
                                        handleEditar(produtoSelecionado);
                                    }}
                                    variant="contained"
                                    sx={{ bgcolor: '#142442' }}
                                >
                                    Editar Produto
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Snackbar para Mensagens */}
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={4000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </>
    );
};

export default EstoqueList;
