import React, {useEffect, useState} from 'react';
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
    InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from "axios";
import Typography from "@mui/material/Typography";
import AddBoxIcon from '@mui/icons-material/AddBox';
import {useNavigate} from "react-router-dom";
import Sidenav from "../NSidenav";
import PersonIcon from "@mui/icons-material/Person";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import InventoryIcon from '@mui/icons-material/Inventory';

const EstoqueList = () => {
    const [produtos, setProdutos] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    // Função para filtrar os produtos baseado no termo de pesquisa
    const filteredProdutos = produtos.filter((produto) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            produto.nome.toLowerCase().includes(searchLower) ||
            produto.codigo.toLowerCase().includes(searchLower) ||
            produto.marca.marca.toLowerCase().includes(searchLower) ||
            produto.tamanho.toLowerCase().includes(searchLower)
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

    useEffect(() => {fetchProdutos();}, []);

    const handleEditar = (produto) => {
        // Redireciona para a página de edição passando o ID como parâmetro
        navigate(`/produto/editar/${produto.idProduto}`);
    };

    const handleExcluir = async (idProduto) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await axios.delete(`http://localhost:8080/pessoa/${idProduto}`);
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

    return (
        <>
            <Box sx={{display: 'flex'}}>
                <Sidenav/>
                <Box component="main" sx={{flexGrow: 1, p: 3}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <InventoryIcon sx={{color: '#142442', fontSize: '2rem'}}/>
                        <h1>Estoque</h1>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 2}}>
                        <IconButton
                            onClick={() => navigate("/produto/novo")}
                            color="primary"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                padding: '8px',
                                color: '#142442',
                                bgcolor: 'white',
                                borderRadius: '4px',
                                borderColor: 'black',
                                '&:hover': {
                                    bgcolor: '#AEB8D6',
                                }
                            }}
                        >
                            <AddShoppingCartIcon/>
                            <Typography variant="button">Novo Produto</Typography>
                        </IconButton>
                        <IconButton
                            onClick={() => navigate("/marca")}
                            color="primary"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                padding: '8px',
                                color: '#142442',
                                bgcolor: 'white',
                                borderRadius: '4px',
                                borderColor: 'black',
                                '&:hover': {
                                    bgcolor: '#AEB8D6',
                                }
                            }}
                        >
                            <BrandingWatermarkIcon/>
                            <Typography variant="button">Marca</Typography>
                        </IconButton>
                    </Box>

                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        {/* Campo de Pesquisa */}
                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Pesquisar por nome, código, marca, tipo ou tamanho..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                    }
                                }}
                            />
                        </Box>

                        <TableContainer sx={{maxHeight: 440}}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Nome</TableCell>
                                        <TableCell>Codigo</TableCell>
                                        <TableCell>Preço Custo</TableCell>
                                        <TableCell>Preço Venda</TableCell>
                                        <TableCell>Estoque</TableCell>
                                        <TableCell>Tamanho</TableCell>
                                        <TableCell>Marca</TableCell>
                                        <TableCell>Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredProdutos
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((produto) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={produto.idProduto}>
                                                <TableCell>{produto.idProduto}</TableCell>
                                                <TableCell>{produto.nome}</TableCell>
                                                <TableCell>{produto.codigo}</TableCell>
                                                <TableCell>{produto.precoCusto}</TableCell>
                                                <TableCell>{produto.precoVenda}</TableCell>
                                                <TableCell>{produto.estoque}</TableCell>
                                                <TableCell>{produto.tamanho}</TableCell>
                                                <TableCell>{produto.marca.marca}</TableCell>

                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleEditar(produto)}
                                                        color="primary"
                                                        sx={{
                                                            borderRadius: '50%',
                                                            padding: '8px',
                                                            color: '#1976D2',
                                                            '&:hover': {
                                                                bgcolor: '#E3F2FD',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleExcluir(produto.idProduto)}
                                                        color="error"
                                                        sx={{
                                                            borderRadius: '50%',
                                                            padding: '8px',
                                                            color: '#D32F2F',
                                                            '&:hover': {
                                                                bgcolor: '#FFEBEE',
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={produtos.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Box>
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EstoqueList;