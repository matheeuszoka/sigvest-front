import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    Typography,
    Button,
    Snackbar,
    Alert,
    MenuItem,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Autocomplete,
    Switch,
    FormControlLabel
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidenav from '../NSidenav';
import { cpf } from 'cpf-cnpj-validator';

// Ícones
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const FuncionarioForm = ({ onUserAdded }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpfFunc, setCpfFunc] = useState('');
    const [rg, setRg] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [dataAdmissao, setDataAdmissao] = useState('');
    const [status, setStatus] = useState(true);

    // Estados do Autocomplete de Cargo
    const [cargoSelecionado, setCargoSelecionado] = useState(null);
    const [cargosOptions, setCargosOptions] = useState([]);
    const [inputValueCargo, setInputValueCargo] = useState('');
    const [loadingCargos, setLoadingCargos] = useState(false);

    // Estados do Endereço
    const [endereco, setEndereco] = useState({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: {
            nomeCidade: '',
            estado: {
                nomeEstado: '',
                uf: ''
            }
        }
    });

    // Estados de controle
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [carregandoCep, setCarregandoCep] = useState(false);
    const [error, setError] = useState('');
    const [cpfError, setCpfError] = useState('');

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            fetchFuncionarioById(id);
        } else if (location.state?.funcionario) {
            setIsEditing(true);
            preencherFormulario(location.state.funcionario);
        }
    }, [id, location.state]);

    // Buscar cargos com like - chamada para o endpoint /likecargo/{cargo}
    const buscarCargos = async (termoBusca) => {
        if (!termoBusca || termoBusca.trim().length < 2) {
            setCargosOptions([]);
            return;
        }

        setLoadingCargos(true);
        try {
            const response = await axios.get(`http://localhost:8080/cargos/likecargo/${termoBusca.trim()}`);
            setCargosOptions(response.data || []);
        } catch (error) {
            console.error('Erro ao buscar cargos:', error);
            setCargosOptions([]);
        } finally {
            setLoadingCargos(false);
        }
    };

    // useEffect para busca de cargos
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            buscarCargos(inputValueCargo);
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timeoutId);
    }, [inputValueCargo]);

    // Funções de API
    const fetchFuncionarioById = async (idFuncionario) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/funcionario/${idFuncionario}`);
            preencherFormulario(response.data);
        } catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar dados do funcionário');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Funções de formatação
    const formatCpf = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        return cpf.format(cleanValue);
    };

    const formatTelefone = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length <= 10) {
            return cleanValue
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            return cleanValue
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
    };

    const formatCep = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/(\d{5})(\d)/, '$1-$2');
    };

    const formatRg = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1})$/, '$1-$2');
    };

    // Validação
    const validaCpf = (value) => {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        return cpf.isValid(cleanValue);
    };

    // Preenchimento do formulário
    const preencherFormulario = (funcionarioData) => {
        let dataFormatada = '';
        if (funcionarioData.dataNascimento) {
            if (funcionarioData.dataNascimento.includes('-')) {
                dataFormatada = funcionarioData.dataNascimento.split('T')[0];
            } else {
                const data = new Date(funcionarioData.dataNascimento);
                if (!isNaN(data.getTime())) {
                    dataFormatada = data.toISOString().split('T')[0];
                }
            }
        }

        let dataAdmissaoFormatada = '';
        if (funcionarioData.dataAdmimissao) {
            if (funcionarioData.dataAdmimissao.includes('-')) {
                dataAdmissaoFormatada = funcionarioData.dataAdmimissao.split('T')[0];
            } else {
                const data = new Date(funcionarioData.dataAdmimissao);
                if (!isNaN(data.getTime())) {
                    dataAdmissaoFormatada = data.toISOString().split('T')[0];
                }
            }
        }

        setNomeCompleto(funcionarioData.nomeCompleto || '');
        setDataNascimento(dataFormatada);
        setCpfFunc(formatCpf(funcionarioData.cpfFunc || ''));
        setRg(formatRg(funcionarioData.rg || ''));
        setTelefone(formatTelefone(funcionarioData.telefone || ''));
        setEmail(funcionarioData.email || '');
        setDataAdmissao(dataAdmissaoFormatada);
        setStatus(funcionarioData.status?.toString() || 'true');

        // Preencher cargo selecionado
        if (funcionarioData.cargo) {
            setCargoSelecionado(funcionarioData.cargo);
            setInputValueCargo(funcionarioData.cargo.nomeCargo || '');
        }

        // Preencher endereço
        if (funcionarioData.endereco) {
            setEndereco({
                logradouro: funcionarioData.endereco.logradouro || '',
                numero: funcionarioData.endereco.numero || '',
                complemento: funcionarioData.endereco.complemento || '',
                bairro: funcionarioData.endereco.bairro || '',
                cep: formatCep(funcionarioData.endereco.cep || ''),
                cidade: {
                    nomeCidade: funcionarioData.endereco.cidade?.nomeCidade || '',
                    estado: {
                        nomeEstado: funcionarioData.endereco.cidade?.estado?.nomeEstado || '',
                        uf: funcionarioData.endereco.cidade?.estado?.uf || ''
                    }
                }
            });
        }
    };

    // Busca CEP
    const buscarEnderecoPorCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        setCarregandoCep(true);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = response.data;

            if (data.erro) {
                setSnackbarSeverity('error');
                setSnackbarMessage('CEP não encontrado');
                setOpenSnackbar(true);
                return;
            }

            setEndereco(prev => ({
                ...prev,
                logradouro: data.logradouro || prev.logradouro,
                bairro: data.bairro || prev.bairro,
                cidade: {
                    nomeCidade: data.localidade || prev.cidade.nomeCidade,
                    estado: {
                        nomeEstado: data.estado || prev.cidade.estado.nomeEstado,
                        uf: data.uf || prev.cidade.estado.uf
                    }
                }
            }));

            setSnackbarSeverity('success');
            setSnackbarMessage('Endereço encontrado automaticamente');
            setOpenSnackbar(true);
        } catch (error) {
            console.log('Erro ao buscar CEP:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao buscar CEP');
            setOpenSnackbar(true);
        } finally {
            setCarregandoCep(false);
        }
    };

    // Handlers de eventos
    const handleCpfChange = (e) => {
        const valorFormatado = formatCpf(e.target.value);
        setCpfFunc(valorFormatado);
        if (cpfError) {
            setCpfError('');
        }
    };

    const handleCpfBlur = (e) => {
        const value = e.target.value;
        if (value && !validaCpf(value)) {
            setCpfError('CPF inválido');
        } else {
            setCpfError('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'nomeCompleto':
                setNomeCompleto(value);
                break;
            case 'dataNascimento':
                setDataNascimento(value);
                break;
            case 'rg':
                const formatadoRg = formatRg(value);
                setRg(formatadoRg);
                break;
            case 'telefone':
                const formatadoTel = formatTelefone(value);
                setTelefone(formatadoTel);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'cep':
                const formatadoCep = formatCep(value);
                setEndereco(prev => ({ ...prev, cep: formatadoCep }));
                const cepLimpo = value.replace(/\D/g, '');
                if (cepLimpo.length === 8) {
                    buscarEnderecoPorCep(cepLimpo);
                }
                break;
            case 'logradouro':
            case 'numero':
            case 'complemento':
            case 'bairro':
                setEndereco(prev => ({ ...prev, [name]: value }));
                break;
            case 'nomeCidade':
                setEndereco(prev => ({
                    ...prev,
                    cidade: { ...prev.cidade, nomeCidade: value }
                }));
                break;
            case 'nomeEstado':
                setEndereco(prev => ({
                    ...prev,
                    cidade: {
                        ...prev.cidade,
                        estado: { ...prev.cidade.estado, nomeEstado: value }
                    }
                }));
                break;
            case 'uf':
                setEndereco(prev => ({
                    ...prev,
                    cidade: {
                        ...prev.cidade,
                        estado: { ...prev.cidade.estado, uf: value.toUpperCase() }
                    }
                }));
                break;
            default:
                break;
        }
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cargoSelecionado) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Selecione um cargo para o funcionário');
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);
        try {
            const funcionarioData = {
                nomeCompleto,
                dataNascimento,
                cpfFunc: cpfFunc.replace(/\D/g, ''),
                rg: rg.replace(/\D/g, ''),
                telefone: telefone.replace(/\D/g, ''),
                email,
                dataAdmimissao: dataAdmissao, // Note: mantendo o nome como está no backend
                status,
                cargo: {
                    idCargo: cargoSelecionado.idCargo // Enviando apenas o ID do cargo
                },
                endereco: {
                    logradouro: endereco.logradouro,
                    numero: endereco.numero,
                    complemento: endereco.complemento,
                    bairro: endereco.bairro,
                    cep: endereco.cep.replace(/\D/g, ''),
                    cidade: {
                        nomeCidade: endereco.cidade.nomeCidade,
                        estado: {
                            nomeEstado: endereco.cidade.estado.nomeEstado,
                            uf: endereco.cidade.estado.uf
                        }
                    }
                }
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/funcionario/${id}`, funcionarioData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Funcionário atualizado com sucesso!');
            } else {
                await axios.post('http://localhost:8080/funcionario', funcionarioData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Funcionário cadastrado com sucesso!');
            }

            setOpenSnackbar(true);
            if (onUserAdded) {
                onUserAdded();
            }

            setTimeout(() => {
                navigate('/funcionarios');
            }, 2000);
        } catch (error) {
            console.log('Erro ao salvar:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage(error.response?.data?.message || 'Erro ao salvar funcionário');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Sidenav />
            <Box sx={{ flexGrow: 1, p: 3 }}>
                {/* Cabeçalho Principal */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    bgcolor: 'white',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isEditing ? <EditIcon sx={{ mr: 2, color: '#142442', fontSize: 32 }} /> :
                            <PersonAddIcon sx={{ mr: 2, color: '#142442', fontSize: 32 }} />}
                        <Box>
                            <Typography variant="h4" sx={{ color: '#142442', fontWeight: 700, mb: 0.5 }}>
                                {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditing ? 'Atualize as informações do funcionário' : 'Cadastre um novo funcionário no sistema'}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        icon={<WorkIcon />}
                        label="FUNCIONÁRIOS"
                        color="secondary"
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ width: '100%',  display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Informações Pessoais e Contato */}
                        <Box sx={{
                            p: 4,
                            borderRadius: 3,
                            boxShadow: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            '&:hover': { boxShadow: 4 },
                            transition: 'all 0.3s ease'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <PersonIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                                <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                                    Informações Pessoais
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 4 }} />

                            {/* Nome e Data de Nascimento */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
                                    <TextField
                                        fullWidth
                                        label="Nome Completo"
                                        name="nomeCompleto"
                                        value={nomeCompleto}
                                        onChange={handleInputChange}
                                        required
                                        error={!!error && !nomeCompleto.trim()}
                                        helperText={error && !nomeCompleto.trim() ? 'Nome é obrigatório' : 'Nome completo da pessoa'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: '0 1 200px', minWidth: 200 }}>
                                    <TextField
                                        fullWidth
                                        label="Data de Nascimento"
                                        name="dataNascimento"
                                        type="date"
                                        value={dataNascimento}
                                        onChange={handleInputChange}
                                        required
                                        error={!!error && !dataNascimento.trim()}
                                        helperText={error && !dataNascimento.trim() ? 'Data é obrigatória' : 'Data de nascimento'}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* CPF e RG */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="CPF"
                                        fullWidth
                                        name="cpf"
                                        value={cpfFunc}
                                        onChange={handleCpfChange}
                                        onBlur={handleCpfBlur}
                                        required
                                        error={!!cpfError}
                                        helperText={cpfError || "Formatação automática"}
                                        placeholder="000.000.000-00"
                                        inputProps={{ maxLength: 14 }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="RG"
                                        fullWidth
                                        name="rg"
                                        value={rg}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="99.999.999-9"
                                        helperText="Formatação automática"
                                        inputProps={{ maxLength: 12 }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Telefone e Email */}
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="Telefone"
                                        fullWidth
                                        name="telefone"
                                        value={telefone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="(99) 99999-9999"
                                        helperText="Formatação automática"
                                        inputProps={{ maxLength: 15 }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <ContactPhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        name="email"
                                        value={email}
                                        onChange={handleInputChange}
                                        placeholder="exemplo@email.com"
                                        helperText="Email para contato (opcional)"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Informações Profissionais */}
                        <Box sx={{
                            p: 4,
                            borderRadius: 3,
                            boxShadow: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            '&:hover': { boxShadow: 4 },
                            transition: 'all 0.3s ease'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <WorkIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                                <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                                    Informações Profissionais
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 4 }} />

                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                                {/* Autocomplete de Cargo */}
                                <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
                                    <Autocomplete
                                        fullWidth
                                        value={cargoSelecionado}
                                        onChange={(event, newValue) => {
                                            setCargoSelecionado(newValue);
                                        }}
                                        inputValue={inputValueCargo}
                                        onInputChange={(event, newInputValue) => {
                                            setInputValueCargo(newInputValue);
                                        }}
                                        options={cargosOptions}
                                        getOptionLabel={(option) => option?.nomeCargo || ""}
                                        isOptionEqualToValue={(option, value) => option?.idCargo === value?.idCargo}
                                        noOptionsText="Digite para buscar cargos"
                                        loading={loadingCargos}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Cargo"
                                                required
                                                variant="outlined"
                                                helperText="Digite para buscar o cargo do funcionário"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />,
                                                    endAdornment: (
                                                        <>
                                                            {loadingCargos ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Box>
                                                    <Typography variant="body1">
                                                        {option.nomeCargo}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Salário: {option.salarioBruto
                                                        ? option.salarioBruto.toLocaleString('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        })
                                                        : 'Não informado'
                                                    }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    />
                                </Box>

                                {/* Data de Admissão */}
                                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                                    <TextField
                                        fullWidth
                                        label="Data de Admissão"
                                        name="dataAdmissao"
                                        type="date"
                                        value={dataAdmissao}
                                        onChange={(e) => setDataAdmissao(e.target.value)}
                                        required
                                        helperText="Data de entrada na empresa"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                        inputProps={{
                                            max: new Date().toISOString().split('T')[0] // Não permite datas futuras
                                        }}
                                    />
                                </Box>

                                {/* Status Ativo/Inativo */}
                                <Box sx={{flex: '0 1 200px', minWidth: 200}}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Status"
                                        name="status"
                                        value={status}
                                        onChange={handleInputChange}
                                        required
                                        helperText="Status do cargo no sistema"
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                    >
                                        <MenuItem value="true">Ativo</MenuItem>
                                        <MenuItem value="false">Inativo</MenuItem>
                                    </TextField>
                                </Box>                            </Box>
                        </Box>

                        {/* Endereço */}
                        <Box sx={{
                            p: 4,
                            borderRadius: 3,
                            boxShadow: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            '&:hover': { boxShadow: 4 },
                            transition: 'all 0.3s ease'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <LocationOnIcon sx={{ mr: 2, color: '#142442', fontSize: 28 }} />
                                <Typography variant="h5" sx={{ color: '#142442', fontWeight: 600 }}>
                                    Endereço Residencial
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 4 }} />

                            {/* CEP, Logradouro e Número */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '0 1 200px', minWidth: 150 }}>
                                    <TextField
                                        fullWidth
                                        label="CEP"
                                        name="cep"
                                        value={endereco.cep}
                                        onChange={handleInputChange}
                                        placeholder="00000-000"
                                        inputProps={{ maxLength: 9 }}
                                        helperText={carregandoCep ? 'Buscando endereço...' : 'Digite para busca automática'}
                                        disabled={carregandoCep}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                ...(carregandoCep && { bgcolor: '#e3f2fd' })
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: carregandoCep ?
                                                <CircularProgress size={20} sx={{ mr: 1 }} /> :
                                                <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
                                    <TextField
                                        label="Logradouro"
                                        fullWidth
                                        name="logradouro"
                                        value={endereco.logradouro}
                                        onChange={handleInputChange}
                                        placeholder="Rua, Avenida, Estrada..."
                                        helperText="Preenchimento automático via CEP"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                                <Box sx={{ flex: '0 1 120px', minWidth: 80 }}>
                                    <TextField
                                        label="Número"
                                        fullWidth
                                        name="numero"
                                        value={endereco.numero}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>

                            {/* Complemento e Bairro */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="Complemento"
                                        fullWidth
                                        name="complemento"
                                        value={endereco.complemento}
                                        onChange={handleInputChange}
                                        placeholder="Apartamento, Bloco, Casa..."
                                        helperText="Opcional"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="Bairro"
                                        fullWidth
                                        name="bairro"
                                        value={endereco.bairro}
                                        onChange={handleInputChange}
                                        placeholder="Nome do bairro"
                                        helperText="Preenchimento automático via CEP"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>

                            {/* Cidade, Estado e UF */}
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
                                    <TextField
                                        label="Cidade"
                                        fullWidth
                                        name="nomeCidade"
                                        value={endereco.cidade.nomeCidade}
                                        onChange={handleInputChange}
                                        placeholder="Nome da cidade"
                                        helperText="Preenchimento automático via CEP"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                                <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
                                    <TextField
                                        label="Estado"
                                        fullWidth
                                        name="nomeEstado"
                                        value={endereco.cidade.estado.nomeEstado}
                                        onChange={handleInputChange}
                                        placeholder="Nome do estado"
                                        helperText="Preenchimento automático via CEP"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                                <Box sx={{ flex: '0 1 100px', minWidth: 80 }}>
                                    <TextField
                                        label="UF"
                                        fullWidth
                                        name="uf"
                                        value={endereco.cidade.estado.uf}
                                        onChange={handleInputChange}
                                        placeholder="SP"
                                        inputProps={{ maxLength: 2 }}
                                        helperText="2 letras"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Botões de Ação */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            boxShadow: 1
                        }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}>
                                <Button
                                    startIcon={<ArrowBackIcon />}
                                    variant="outlined"
                                    onClick={() => navigate('/funcionarios')}
                                    disabled={loading}
                                    size="large"
                                    sx={{
                                        color: '#142442',
                                        borderColor: '#142442',
                                        borderWidth: 2,
                                        px: 3,
                                        py: 1.5,
                                        fontWeight: 600,
                                        '&:hover': {
                                            bgcolor: '#142442',
                                            color: 'white',
                                            borderColor: '#142442'
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>

                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    {loading && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Salvando...
                                            </Typography>
                                        </Box>
                                    )}

                                    <Button
                                        type="submit"
                                        startIcon={loading ? null : <SaveIcon />}
                                        variant="contained"
                                        disabled={loading || !!cpfError}
                                        size="large"
                                        sx={{
                                            bgcolor: '#142442',
                                            color: 'white',
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 600,
                                            boxShadow: 3,
                                            '&:hover': {
                                                bgcolor: '#0f1c35',
                                                boxShadow: 4
                                            },
                                            '&:disabled': {
                                                bgcolor: '#ccc'
                                            }
                                        }}
                                    >
                                        {isEditing ? 'Salvar' : 'Salvar'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </form>

                {/* Snackbar para Mensagens */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={2000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setOpenSnackbar(false)}
                        severity={snackbarSeverity}
                        sx={{
                            width: '100%',
                            boxShadow: 4,
                            '& .MuiAlert-icon': {
                                fontSize: '1.5rem'
                            }
                        }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default FuncionarioForm;
