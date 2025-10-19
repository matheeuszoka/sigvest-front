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
    Card,
    CardContent,
    Tooltip,
    Grid,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';


import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidenav from "../../../NSidenav";

const PessoaList = () => {
    const [marcas, setMarcas] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');


    const navigate = useNavigate();

    // Função para filtrar clientes baseado no termo de pesquisa
    const filteredMarcas = marcas.filter((marca) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            marca.marca?.toLowerCase().includes(searchLower)
        );
    });

    const fetchPessoas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/marca");
            setMarcas(response.data);
        } catch (error) {
            console.error('Erro ao carregar marcas:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar a lista de marcas');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchPessoas();
    }, []);

    const handleEditar = (marca) => {
        navigate(`/produto/marca/editar/${marca.idMarca}`);
    };

    const handleExcluir = async (idMarca) => {
        if (window.confirm('Tem certeza que deseja excluir esta Marca?')) {
            try {
                await axios.delete(`http://localhost:8080/marca/${idMarca}`);
                await fetchPessoas();
                setSnackbarSeverity('success');
                setSnackbarMessage('Marca excluída com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir cliente');
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
            <Box sx={{ display: 'flex' }}>
                <Sidenav />
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Lista de Marcas
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
                                onClick={() => navigate("/produto/marca/novo")}
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
                                NOVA MARCA
                            </Button>
                        </Box>

                        {/* Campo de Pesquisa */}
                        <TextField
                            placeholder="Buscar por marca."
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
                                minWidth: 350,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />
                    </Box>

                    {/* Tabela de Clientes */}
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>ID</strong></TableCell>
                                        <TableCell><strong>Nome da Marca</strong></TableCell>
                                        <TableCell><strong>Descrição</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredMarcas
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((marca) => (
                                            <TableRow key={marca.idMarca} hover>
                                                <TableCell>{marca.idMarca}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <BrandingWatermarkIcon fontSize="small" color="action" />
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {marca.marca}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {marca.desMarca || "Não informado"}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={marca.status || "Não informado"}
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Editar Cliente">
                                                            <IconButton
                                                                onClick={() => handleEditar(marca)}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Excluir Cliente">
                                                            <IconButton
                                                                onClick={() => handleExcluir(marca.idMarca)}
                                                                color="error"
                                                                size="small"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredMarcas.length}
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

                    {/* Modal de Detalhes do Cliente */}


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

export default PessoaList;
