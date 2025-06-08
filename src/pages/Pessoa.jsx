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
import Sidenav from "../NSidenav";
import axios from "axios";
import Typography from "@mui/material/Typography";
import AddBoxIcon from '@mui/icons-material/AddBox';
import {useNavigate} from "react-router-dom";

const PessoaList = () => {
    const [pessoas, setPessoas] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    const fetchPessoas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/pessoa");
            setPessoas(response.data);
        } catch (error) {
            console.error('Erro ao carregar pessoas:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar a lista de pessoas');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchPessoas();
    }, []);

    const handleEditar = (pessoa) => {
        // Redireciona para a página de edição passando o ID como parâmetro
        navigate(`/pessoa/editar/${pessoa.idPessoa}`);

    };

    const handleExcluir = async (idPessoa) => {
        if (window.confirm('Tem certeza que deseja excluir esta pessoa?')) {
            try {
                await axios.delete(`http://localhost:8080/pessoa/${idPessoa}`);
                await fetchPessoas();
                setSnackbarSeverity('success');
                setSnackbarMessage('Pessoa excluída com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir pessoa:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir pessoa');
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
                    <h1>Lista de Pessoas Cadastradas</h1>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <IconButton
                            onClick={() => navigate("/pessoa/novo")}
                            color="primary"
                            sx={{
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
                            <AddBoxIcon/>
                            <Typography variant="button">Novo</Typography>
                        </IconButton>
                    </Box>

                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer sx={{maxHeight: 440}}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Nome</TableCell>
                                        <TableCell>CPF/CNPJ</TableCell>
                                        <TableCell>Telefone</TableCell>
                                        <TableCell>Endereço</TableCell>
                                        <TableCell>Nº</TableCell>
                                        <TableCell>Cidade</TableCell>
                                        <TableCell>Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pessoas
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((pessoa) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={pessoa.idPessoa}>
                                                <TableCell>{pessoa.idPessoa}</TableCell>
                                                <TableCell>{pessoa.nomeCompleto}</TableCell>
                                                <TableCell>{pessoa.cpfcnpj}</TableCell>
                                                <TableCell>{pessoa.telefone}</TableCell>
                                                <TableCell>{pessoa.endereco?.logradouro || '-'}</TableCell>
                                                <TableCell>{pessoa.endereco?.numero || '-'}</TableCell>
                                                <TableCell>{pessoa.endereco?.cidade?.nomeCidade || '-'}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleEditar(pessoa)}
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
                                                        onClick={() => handleExcluir(pessoa.idPessoa)}
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
                            count={pessoas.length}
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

export default PessoaList;