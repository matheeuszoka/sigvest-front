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
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import Sidenav from "../NSidenav";
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const MarcaList = () => {
    const [marcas, setMarcas] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    const fetchMarcas = async () => {
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
        fetchMarcas();
    }, []);

    const handleEditar = (marca) => {
        navigate(`/marca/editar/${marca.idMarca}`);

    };

    const handleExcluir = async (idMarca) => {
        if (window.confirm('Tem certeza que deseja excluir este marca?')) {
            try {
                await axios.delete(`http://localhost:8080/marca/${idMarca}`);
                await fetchMarcas();
                setSnackbarSeverity('success');
                setSnackbarMessage('Marca excluído com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir marca:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir marca');
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
                        <BrandingWatermarkIcon sx={{color: '#142442', fontSize: '2rem'}}/>
                        <h1>Marca</h1>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 2}}>
                        <IconButton
                            onClick={() => navigate("/estoque")}
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
                            <ArrowBackIcon/>
                            <Typography variant="button">Voltar</Typography>
                        </IconButton>
                        <IconButton
                            onClick={() => navigate("/marca/novo")}
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
                            <Typography variant="button">Nova Marca</Typography>
                        </IconButton>
                    </Box>
                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer sx={{maxHeight: 440}}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Marca</TableCell>
                                        <TableCell>Descrição</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {marcas
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((marca) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={marca.idMarca}>
                                                <TableCell>{marca.idMarca}</TableCell>
                                                <TableCell>{marca.marca}</TableCell>
                                                <TableCell>{marca.desMarca || "Não Informado"}</TableCell>
                                                <TableCell>{marca.status}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleEditar(marca)}
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
                                                        onClick={() => handleExcluir(marca.idMarca)}
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
                            count={marcas.length}
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

export default MarcaList;