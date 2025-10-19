import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from "@mui/icons-material/AddBox";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import EmailIcon from '@mui/icons-material/Email';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidenav from "../NSidenav";
import { cnpj } from "cpf-cnpj-validator";

const FornecedorList = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Estados do Modal
    const [openModal, setOpenModal] = useState(false);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para filtrar fornecedores baseado no termo de pesquisa
    const filteredFornecedores = fornecedores.filter((fornecedor) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            fornecedor.razaoSocial?.toLowerCase().includes(searchLower) ||
            fornecedor.cnpjFornecedor?.toLowerCase().includes(searchLower) ||
            fornecedor.inscricaoEstadual?.toLowerCase().includes(searchLower) ||
            fornecedor.telefone?.toLowerCase().includes(searchLower) ||
            fornecedor.endereco?.logradouro?.toLowerCase().includes(searchLower) ||
            fornecedor.endereco?.cidade?.nomeCidade?.toLowerCase().includes(searchLower)
        );
    });

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

    const handleEditar = (fornecedor) => {
        navigate(`/fornecedor/editar/${fornecedor.idFornecedor}`);
    };

    const handleExcluir = async (idFornecedor) => {
        if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
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

    const handleVerDetalhes = (fornecedor) => {
        setFornecedorSelecionado(fornecedor);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFornecedorSelecionado(null);
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

    // Função para formatar CNPJ
    const formatarCnpj = (cnpjValue) => {
        if (!cnpjValue) return 'N/A';
        const cleanValue = cnpjValue.replace(/\D/g, '');
        if (cleanValue.length === 14) {
            return cnpj.format(cleanValue);
        }
        return cnpjValue;
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

    // Função para obter nome da cidade de forma segura
    const obterNomeCidade = (endereco) => {
        if (!endereco) return 'Não informado';

        // Se cidade é uma string
        if (typeof endereco.cidade === 'string') {
            return endereco.cidade;
        }

        // Se cidade é um objeto com nomeCidade
        if (endereco.cidade && endereco.cidade.nomeCidade) {
            return endereco.cidade.nomeCidade;
        }

        return 'Não informado';
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
                        Lista de Fornecedores
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
                                onClick={() => navigate('/fornecedor/novo')}
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
                                Novo Fornecedor
                            </Button>
                        </Box>

                        {/* Campo de Pesquisa */}
                        <TextField
                            placeholder="Buscar por razão social, CNPJ, I.E, telefone..."
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
                                minWidth: 400,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />
                    </Box>

                    {/* Tabela de Fornecedores */}
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>ID</strong></TableCell>
                                        <TableCell><strong>Razão Social</strong></TableCell>
                                        <TableCell><strong>CNPJ</strong></TableCell>
                                        <TableCell><strong>Inscrição Estadual</strong></TableCell>
                                        <TableCell><strong>Telefone</strong></TableCell>
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredFornecedores
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((fornecedor) => (
                                            <TableRow key={fornecedor.idFornecedor} hover>
                                                <TableCell>{fornecedor.idFornecedor}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CorporateFareIcon fontSize="small" color="action" />
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {fornecedor.razaoSocial}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatarCnpj(fornecedor.cnpjFornecedor)}
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={fornecedor.inscricaoEstadual || 'Não informado'}
                                                        variant="filled"
                                                        size="small"
                                                        color="secondary"
                                                        icon={<ReceiptIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatarTelefone(fornecedor.telefone)}
                                                        variant="outlined"
                                                        size="small"
                                                        icon={<PhoneIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Ver Detalhes">
                                                            <IconButton
                                                                onClick={() => handleVerDetalhes(fornecedor)}
                                                                color="info"
                                                                size="small"
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar Fornecedor">
                                                            <IconButton
                                                                onClick={() => handleEditar(fornecedor)}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Excluir Fornecedor">
                                                            <IconButton
                                                                onClick={() => handleExcluir(fornecedor.idFornecedor)}
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
                            count={filteredFornecedores.length}
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

                    {/* Modal de Detalhes do Fornecedor */}
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-fornecedor-titulo"
                        aria-describedby="modal-fornecedor-descricao"
                    >
                        <Box sx={modalStyle}>
                            {/* Cabeçalho do Modal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography id="modal-fornecedor-titulo" variant="h5" component="h2">
                                    Detalhes do Fornecedor
                                </Typography>
                                <IconButton onClick={handleCloseModal}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {fornecedorSelecionado && (
                                <>
                                    {/* Informações da Empresa */}
                                    <Card sx={{ mb: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <BusinessIcon /> Informações da Empresa
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <CorporateFareIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Razão Social
                                                            </Typography>
                                                            <Typography variant="h6">
                                                                {fornecedorSelecionado.razaoSocial}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <BadgeIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CNPJ
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {formatarCnpj(fornecedorSelecionado.cnpjFornecedor)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <ReceiptIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Inscrição Estadual
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {fornecedorSelecionado.inscricaoEstadual || 'Não informado'}
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
                                                                {formatarTelefone(fornecedorSelecionado.telefone)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {fornecedorSelecionado.email && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <EmailIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    E-mail
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {fornecedorSelecionado.email}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Card>

                                    {/* Informações de Endereço */}
                                    {fornecedorSelecionado.endereco && (
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
                                                                    {fornecedorSelecionado.endereco.logradouro || 'Não informado'}
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
                                                                {fornecedorSelecionado.endereco.numero || 'S/N'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    {fornecedorSelecionado.endereco.bairro && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Bairro
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {fornecedorSelecionado.endereco.bairro}
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
                                                                    {obterNomeCidade(fornecedorSelecionado.endereco)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    {fornecedorSelecionado.endereco.cep && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CEP
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {fornecedorSelecionado.endereco.cep}
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    {fornecedorSelecionado.endereco.cidade &&
                                                        fornecedorSelecionado.endereco.cidade.estado && (
                                                            <Grid item xs={12} sm={6}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Estado
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {typeof fornecedorSelecionado.endereco.cidade.estado === 'string'
                                                                        ? fornecedorSelecionado.endereco.cidade.estado
                                                                        : fornecedorSelecionado.endereco.cidade.estado.nomeEstado || 'Não informado'
                                                                    }
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
                                                handleEditar(fornecedorSelecionado);
                                            }}
                                            variant="contained"
                                            sx={{ bgcolor: '#142442' }}
                                        >
                                            Editar Fornecedor
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

export default FornecedorList;
