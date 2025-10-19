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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EmailIcon from '@mui/icons-material/Email';

import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidenav from "../NSidenav";

const FuncionarioList = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Estados do Modal
    const [openModal, setOpenModal] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para filtrar funcionários baseado no termo de pesquisa
    const filteredFuncionarios = funcionarios.filter((pessoa) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            pessoa.nomeCompleto?.toLowerCase().includes(searchLower) ||
            pessoa.telefone?.toLowerCase().includes(searchLower) ||
            pessoa.cpfFunc?.toLowerCase().includes(searchLower) ||
            pessoa.rg?.toLowerCase().includes(searchLower) ||
            pessoa.endereco?.logradouro?.toLowerCase().includes(searchLower)
        );
    });

    const fetchPessoas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/funcionario");
            setFuncionarios(response.data);
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar a lista de funcionários');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchPessoas();
    }, []);

    const handleEditar = (funcionario) => {
        navigate(`/funcionarios/editar/${funcionario.idFuncionario}`);
    };

    const handleExcluir = async (idPessoa) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await axios.delete(`http://localhost:8080/funcionario/${idPessoa}`);
                await fetchPessoas();
                setSnackbarSeverity('success');
                setSnackbarMessage('Funcionário excluído com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir funcionário:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir funcionário');
                setOpenSnackbar(true);
            }
        }
    };

    const handleVerDetalhes = (pessoa) => {
        setFuncionarioSelecionado(pessoa);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFuncionarioSelecionado(null);
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
    // Função para formatar data
    const formatarData = (data) => {
        if (!data) return 'N/A';
        const dataObj = new Date(data);
        if (isNaN(dataObj.getTime())) return 'N/A';
        return dataObj.toLocaleDateString('pt-BR');
    };

// Função para formatar salário
    const formatarSalario = (valor) => {
        if (!valor) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };


    // Função para formatar CPF/CNPJ
    const formatarCpf = (cpfFunc) => {
        if (!cpfFunc) return 'N/A';
        const numbers = cpfFunc.replace(/\D/g, '');
        if (numbers.length === 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpfFunc;
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
                        Lista de Funcionários
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
                                onClick={() => navigate("/funcionarios/novo")}
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
                                Novo Funcionário
                            </Button>
                            <Button
                                startIcon={<ManageAccountsIcon/>}
                                onClick={() => navigate("/cargos")}
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
                                Gerenciar Cargos
                            </Button>
                        </Box>

                        {/* Campo de Pesquisa */}
                        <TextField
                            placeholder="Buscar por nome, telefone, CPF..."
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

                    {/* Tabela de Funcionários */}
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>ID</strong></TableCell>
                                        <TableCell><strong>Nome Completo</strong></TableCell>
                                        <TableCell><strong>Telefone</strong></TableCell>
                                        <TableCell><strong>CPF</strong></TableCell>
                                        <TableCell><strong>Endereço</strong></TableCell>
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredFuncionarios
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((funcionario) => (
                                            <TableRow key={funcionario.idFuncionario} hover>
                                                <TableCell>{funcionario.idFuncionario}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <PersonIcon fontSize="small" color="action" />
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {funcionario.nomeCompleto}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatarTelefone(funcionario.telefone)}
                                                        variant="outlined"
                                                        size="small"
                                                        icon={<PhoneIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatarCpf(funcionario.cpfFunc)}
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {funcionario.endereco?.logradouro ?
                                                            `${funcionario.endereco.logradouro}, ${funcionario.endereco.numero || 'S/N'}`
                                                            : 'Endereço não informado'
                                                        }
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Ver Detalhes">
                                                            <IconButton
                                                                onClick={() => handleVerDetalhes(funcionario)}
                                                                color="info"
                                                                size="small"
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar Funcionário">
                                                            <IconButton
                                                                onClick={() => handleEditar(funcionario)}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Excluir Funcionário">
                                                            <IconButton
                                                                onClick={() => handleExcluir(funcionario.idFuncionario)}
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
                            count={filteredFuncionarios.length}
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

                    {/* Modal de Detalhes do Funcionário */}
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-funcionario-titulo"
                        aria-describedby="modal-funcionario-descricao"
                    >
                        <Box sx={modalStyle}>
                            {/* Cabeçalho do Modal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography id="modal-funcionario-titulo" variant="h5" component="h2">
                                    Detalhes do Funcionário
                                </Typography>
                                <IconButton onClick={handleCloseModal}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {funcionarioSelecionado && (
                                <>
                                    {/* Informações Pessoais */}
                                    <Card sx={{ mb: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon /> Informações Pessoais
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
                                                                {funcionarioSelecionado.nomeCompleto}
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
                                                                {formatarTelefone(funcionarioSelecionado.telefone)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <EmailIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                E-mail
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {funcionarioSelecionado.email || 'Não informado'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <FingerprintIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CPF
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {formatarCpf(funcionarioSelecionado.cpfFunc)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {funcionarioSelecionado.rg && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <BadgeIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    RG
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {funcionarioSelecionado.rg}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {funcionarioSelecionado.dataNascimento && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <CalendarTodayIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Data de Nascimento
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {formatarData(funcionarioSelecionado.dataNascimento)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {funcionarioSelecionado.dataAdmimissao && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <DateRangeIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Data de Admissão
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {formatarData(funcionarioSelecionado.dataAdmimissao)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Card>

                                    {/* Informações Profissionais */}
                                    {funcionarioSelecionado.cargo && (
                                        <Card sx={{ mb: 3 }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <WorkIcon /> Informações Profissionais
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <WorkIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Cargo
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {funcionarioSelecionado.cargo.nomeCargo || 'Não informado'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <AttachMoneyIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Salário Bruto
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {formatarSalario(funcionarioSelecionado.cargo.salarioBruto)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <AttachMoneyIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Desconto (%)
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {funcionarioSelecionado.cargo.desconto ?
                                                                        `${funcionarioSelecionado.cargo.desconto}%` :
                                                                        'N/A'
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <AttachMoneyIcon fontSize="small" sx={{ mr: 2, color: '#666' }} />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Salário Líquido
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'green' }}>
                                                                    {formatarSalario(funcionarioSelecionado.cargo.salarioLiquido)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Informações de Endereço */}
                                    {funcionarioSelecionado.endereco && (
                                        <Card sx={{ mb: 3 }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationOnIcon /> Endereço Completo
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
                                                                    {funcionarioSelecionado.endereco.logradouro || 'Não informado'}
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
                                                                {funcionarioSelecionado.endereco.numero || 'S/N'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    {funcionarioSelecionado.endereco.complemento && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Complemento
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {funcionarioSelecionado.endereco.complemento}
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    {funcionarioSelecionado.endereco.bairro && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Bairro
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {funcionarioSelecionado.endereco.bairro}
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    {funcionarioSelecionado.endereco.cep && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                CEP
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {funcionarioSelecionado.endereco.cep}
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    {funcionarioSelecionado.endereco.cidade && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Cidade
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {typeof funcionarioSelecionado.endereco.cidade === 'string'
                                                                    ? funcionarioSelecionado.endereco.cidade
                                                                    : funcionarioSelecionado.endereco.cidade.nomeCidade || 'N/A'
                                                                }
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    {funcionarioSelecionado.endereco.cidade?.estado && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Estado
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {funcionarioSelecionado.endereco.cidade.estado.nomeEstado} - {funcionarioSelecionado.endereco.cidade.estado.uf}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Status do Funcionário */}
                                    <Card sx={{ mb: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                Status
                                            </Typography>
                                            <Chip
                                                label={funcionarioSelecionado.status ? 'Ativo' : 'Inativo'}
                                                color={funcionarioSelecionado.status ? 'success' : 'error'}
                                                variant="filled"
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Botões do Modal */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                                        <Button onClick={handleCloseModal} variant="outlined">
                                            Fechar
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseModal();
                                                handleEditar(funcionarioSelecionado);
                                            }}
                                            variant="contained"
                                            sx={{ bgcolor: '#142442' }}
                                        >
                                            Editar Funcionário
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

export default FuncionarioList;
