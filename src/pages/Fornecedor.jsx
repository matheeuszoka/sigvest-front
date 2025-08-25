import React, {useEffect, useState} from "react";

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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import axios from "axios";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import Sidenav from "../NSidenav";
import BusinessIcon from "@mui/icons-material/Business";

const FornecedorList = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    const fetchFornecedores = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/fornecedor`);
            setFornecedores(response.data);
        } catch (error) {
            console.log('Erro ao carregar Fornecedores', error);
            setSnackbarSeverity('error');
            setSnackbarMessage("Erro ao carregar Fornecedores");
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchFornecedores();
    }, []);

    const handleEditar = (fornecedore) => {
        navigate(`/fornecedores/editar/${fornecedores.idFornecedor}`);
    };

    const handleExcluir = async (idFornecedor) => {
        if (window.confim('Tem certeza que deseja excluir este fornecedor?')) {
            try {
                await axios.delete(`http://localhost:8080/fornecedor/${idFornecedor}`);
                await fetchFornecedores();
                setSnackbarSeverity('success');
                setSnackbarMessage('Fornecedor excluído com sucesso!');
                setOpenSnackbar(true);
            } catch (error) {
                console.log('Erro ao excluir Fornecedores', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir Fornecedores');
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
        setOpenSnackbar(true);
    }

    return (
        <>
            <Box sx={{display: 'flex'}}>
                <Sidenav/>
                <Box component='main' sx={{flexGrow: 1, p: 3}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 3, gap: 2}}>
                        <BusinessIcon sx={{color: '#142442', fontSize: '2rem'}}/>
                        <h1>Lista de Fornecedores</h1>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>

                        <IconButton onClick={() => navigate('/fornecedor/novo')}
                                    color='primary'
                                    sx={{
                                        padding: '8px',
                                        color: '#142442',
                                        bgcolor: 'white',
                                        borderRadius: '4px',
                                        borderColor: 'black',
                                        '&:hover': {
                                            bgcolor: '#AEB8D6',
                                        }
                                    }}>
                            <AddBoxIcon/>
                            <Typography variant='button'>Novo</Typography>
                        </IconButton>
                    </Box>
                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer sx={{maxHeight: 440}}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Razão Social</TableCell>
                                        <TableCell>CNPJ</TableCell>
                                        <TableCell>I.E</TableCell>
                                        <TableCell>Número</TableCell>
                                        <TableCell>Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fornecedores
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((fornecedor) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={fornecedor.idFornecedor}>
                                                <TableCell>{fornecedor.idFornecedor}</TableCell>
                                                <TableCell>{fornecedor.razaoSocial}</TableCell>
                                                <TableCell>{fornecedor.cpfcnpj}</TableCell>
                                                <TableCell>{fornecedor.inscricaoEstadual}</TableCell>
                                                <TableCell>{fornecedor.telefone}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleEditar(fornecedor)}
                                                                color="primary"
                                                                sx={{
                                                                    borderRadius: '50%',
                                                                    padding: '8px',
                                                                    color: '#1976D2',
                                                                    '&:hover': {
                                                                        bgcolor: '#E3F2FD',
                                                                    }
                                                                }}>
                                                        <EditIcon/>
                                                    </IconButton>
                                                    <IconButton onClick={() => handleExcluir(fornecedor.idFornecedor)}
                                                                color="error"
                                                                sx={{
                                                                    borderRadius: '50%',
                                                                    padding: '8px',
                                                                    color: '#D32F2F',
                                                                    '&:hover': {
                                                                        bgcolor: '#FFEBEE',
                                                                    }
                                                                }}><DeleteIcon/></IconButton>
                                                </TableCell>
                                            </TableRow>

                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination rowsPerPageOptions={[10, 25, 100]} component="div" count={fornecedores.length}
                                         onPageChange={handleChangePage} page={page} rowsPerPage={rowsPerPage}
                                         onRowsPerPageChange={handleChangeRowsPerPage}/>
                    </Paper>
                </Box>
            </Box>
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width:'100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );


};
export default FornecedorList;