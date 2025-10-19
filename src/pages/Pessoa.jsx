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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidenav from "../NSidenav";

const PessoaList = () => {
    const [pessoas, setPessoas] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Estados do Modal
    const [openModal, setOpenModal] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para filtrar clientes baseado no termo de pesquisa
    const filteredPessoas = pessoas.filter((pessoa) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            pessoa.nomeCompleto?.toLowerCase().includes(searchLower) ||
            pessoa.telefone?.toLowerCase().includes(searchLower) ||
            pessoa.cpfcnpj?.toLowerCase().includes(searchLower) ||
            pessoa.endereco?.logradouro?.toLowerCase().includes(searchLower) ||
            pessoa.endereco?.cidade?.nomeCidade?.toLowerCase().includes(searchLower)
        );
    });

    const fetchPessoas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/pessoa");
            setPessoas(response.data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar a lista de clientes');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchPessoas();
    }, []);

    const handleEditar = (pessoa) => {
        navigate(`/pessoa/editar/${pessoa.idPessoa}`);
    };

    const handleExcluir = async (idPessoa) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await axios.delete(`http://localhost:8080/pessoa/${idPessoa}`);
                await fetchPessoas();
                setSnackbarSeverity('success');
                setSnackbarMessage('Cliente excluído com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir cliente');
                setOpenSnackbar(true);
            }
        }
    };

    const handleVerDetalhes = (pessoa) => {
        setClienteSelecionado(pessoa);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setClienteSelecionado(null);
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

    // Função para formatar CPF/CNPJ
    const formatarCpfCnpj = (cpfcnpj) => {
        if (!cpfcnpj) return 'N/A';
        const numbers = cpfcnpj.replace(/\D/g, '');
        if (numbers.length === 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (numbers.length === 14) {
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return cpfcnpj;
    };

    // Função para formatar telefone
    const formatarTelefone = (telefone) => {
        if (!telefone) return 'N/A';
        const numbers = telefone.replace(/\D/g, '');
        if (numbers.length === 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length === 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    };

    // Estilo do Modal
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
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
                        Lista de Clientes
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
                                onClick={() => navigate("/pessoa/novo")}
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
                                Novo Cliente
                            </Button>
                        </Box>

                        {/* Campo de Pesquisa */}
                        <TextField
                            placeholder="Buscar por nome, telefone, CPF/CNPJ, cidade..."
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
                                        <TableCell><strong>Nome Completo</strong></TableCell>
                                        <TableCell><strong>Telefone</strong></TableCell>
                                        <TableCell><strong>CPF/CNPJ</strong></TableCell>
                                        <TableCell><strong>Endereço</strong></TableCell>
                                        <TableCell><strong>Cidade</strong></TableCell>
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPessoas
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((pessoa) => (
                                            <TableRow key={pessoa.idPessoa} hover>
                                                <TableCell>{pessoa.idPessoa}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AccountCircleIcon fontSize="small" color="action" />
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {pessoa.nomeCompleto}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatarTelefone(pessoa.telefone)}
                                                        variant="outlined"
                                                        size="small"
                                                        icon={<PhoneIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatarCpfCnpj(pessoa.cpfcnpj)}
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {pessoa.endereco?.logradouro ?
                                                            `${pessoa.endereco.logradouro}, ${pessoa.endereco.numero || 'S/N'}`
                                                            : 'Endereço não informado'
                                                        }
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={pessoa.endereco?.cidade?.nomeCidade || 'Não informado'}
                                                        variant="filled"
                                                        size="small"
                                                        color="secondary"
                                                        icon={<LocationCityIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Ver Detalhes">
                                                            <IconButton
                                                                onClick={() => handleVerDetalhes(pessoa)}
                                                                color="info"
                                                                size="small"
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar Cliente">
                                                            <IconButton
                                                                onClick={() => handleEditar(pessoa)}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Excluir Cliente">
                                                            <IconButton
                                                                onClick={() => handleExcluir(pessoa.idPessoa)}
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
                            count={filteredPessoas.length}
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
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-cliente-titulo"
                        aria-describedby="modal-cliente-descricao"
                    >
                        <Box sx={modalStyle}>
                            {/* Cabeçalho do Modal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography id="modal-cliente-titulo" variant="h5" component="h2">
                                    Detalhes do Cliente
                                </Typography>
                                <IconButton onClick={handleCloseModal}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {clienteSelecionado && (
                                <>
                                    {/* Informações Pessoais */}
                                    <Card sx={{ mb: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccountCircleIcon /> Informações Pessoais
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <BadgeIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Nome Completo
                                                            </Typography>
                                                            <Typography variant="h6">
                                                                {clienteSelecionado.nomeCompleto}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <PhoneIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Telefone
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {formatarTelefone(clienteSelecionado.telefone)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <FingerprintIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CPF/CNPJ
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {formatarCpfCnpj(clienteSelecionado.cpfcnpj)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>

                                    {/* Informações de Endereço */}
                                    {clienteSelecionado.endereco && (
                                        <Card sx={{ mb: 3 }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationOnIcon /> Endereço
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={8}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <HomeIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Logradouro
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {clienteSelecionado.endereco.logradouro || 'Não informado'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    <Grid item xs={12} sm={4}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                                Número:
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {clienteSelecionado.endereco.numero || 'S/N'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    {clienteSelecionado.endereco.bairro && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Bairro
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {clienteSelecionado.endereco.bairro}
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <LocationCityIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Cidade
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {clienteSelecionado.endereco.cidade?.nomeCidade || 'Não informado'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    {clienteSelecionado.endereco.cep && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CEP
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {clienteSelecionado.endereco.cep}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Botões do Modal */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                                        <Button onClick={handleCloseModal} variant="outlined">
                                            Fechar
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseModal();
                                                handleEditar(clienteSelecionado);
                                            }}
                                            variant="contained"
                                            sx={{ bgcolor: '#142442' }}
                                        >
                                            Editar Cliente
                                        </Button>
                                    </Box>
                                </>
                            )}
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

export default PessoaList;
