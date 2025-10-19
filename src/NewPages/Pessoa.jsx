import React, {useState, useEffect} from 'react';
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
    CircularProgress
} from "@mui/material";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import axios from "axios";
import Sidenav from "../NSidenav";
import {cpf, cnpj} from 'cpf-cnpj-validator';

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

const PessoaForm = ({onPessoaAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [Editando, setEditando] = useState(false);

    // Estados do formulário
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpfcnpj, setCpfCnpj] = useState('');
    const [rg, setRg] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [tipo, setTipo] = useState('');
    const [atrib, setAtrib] = useState('CLIENTE');
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
    const [cpfcnpjError, setCpfCnpjError] = useState('');

    useEffect(() => {
        if (id) {
            setEditando(true);
            fetchPessoaById(id);
        } else if (location.state?.pessoa) {
            setEditando(true);
            preencherFormulario(location.state.pessoa);
        }
    }, [id, location.state]);

    // Funções de API
    const fetchPessoaById = async (idPessoa) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/pessoa/${idPessoa}`);
            preencherFormulario(response.data);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar dados do cliente');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Funções de formatação
    const formatCpfCnpj = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length <= 11) {
            return cpf.format(cleanValue);
        } else {
            return cnpj.format(cleanValue);
        }
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
            .replace(/(\d{3})(\d{1})/, '$1-$2');
    };

    // Validação
    const validaCpfCnpj = (value) => {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length === 11) {
            return cpf.isValid(cleanValue);
        } else if (cleanValue.length === 14) {
            return cnpj.isValid(cleanValue);
        }
        return false;
    };

    // Preenchimento do formulário
    const preencherFormulario = (pessoaData) => {
        let dataFormatada = '';
        if (pessoaData.dataNascimento) {
            if (pessoaData.dataNascimento.includes('-')) {
                dataFormatada = pessoaData.dataNascimento.split('T')[0];
            } else {
                const data = new Date(pessoaData.dataNascimento);
                if (!isNaN(data.getTime())) {
                    dataFormatada = data.toISOString().split('T')[0];
                }
            }
        }

        setNomeCompleto(pessoaData.nomeCompleto || '');
        setDataNascimento(dataFormatada);
        setCpfCnpj(formatCpfCnpj(pessoaData.cpfcnpj || ''));
        setRg(formatRg(pessoaData.rg || ''));
        setTelefone(formatTelefone(pessoaData.telefone || ''));
        setEmail(pessoaData.email || '');
        setTipo(pessoaData.tipo || '');
        setAtrib(pessoaData.atrib || 'CLIENTE');

        if (pessoaData.endereco) {
            setEndereco({
                logradouro: pessoaData.endereco.logradouro || '',
                numero: pessoaData.endereco.numero || '',
                complemento: pessoaData.endereco.complemento || '',
                bairro: pessoaData.endereco.bairro || '',
                cep: formatCep(pessoaData.endereco.cep || ''),
                cidade: {
                    nomeCidade: pessoaData.endereco.cidade?.nomeCidade || '',
                    estado: {
                        nomeEstado: pessoaData.endereco.cidade?.estado?.nomeEstado || '',
                        uf: pessoaData.endereco.cidade?.estado?.uf || '',
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
                setSnackbarMessage("CEP não encontrado");
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
            setSnackbarMessage("Endereço encontrado automaticamente");
            setOpenSnackbar(true);
        } catch (error) {
            console.log('Erro ao buscar CEP:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage("Erro ao buscar CEP");
            setOpenSnackbar(true);
        } finally {
            setCarregandoCep(false);
        }
    };

    // Handlers de eventos
    const handleCpfCnpjChange = (e) => {
        const valorFormatado = formatCpfCnpj(e.target.value);
        setCpfCnpj(valorFormatado);
        if (cpfcnpjError) setCpfCnpjError('');
    };

    const handleCpfCnpjBlur = (e) => {
        const value = e.target.value;
        if (value && !validaCpfCnpj(value)) {
            setCpfCnpjError('CPF ou CNPJ inválido');
        } else {
            setCpfCnpjError('');
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        switch(name) {
            case 'nomeCompleto':
                setNomeCompleto(value);
                break;
            case 'dataNascimento':
                setDataNascimento(value);
                break;
            case 'cpfcnpj':
                const formatado = formatCpfCnpj(value);
                setCpfCnpj(formatado);
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
            case 'tipo':
                setTipo(value);
                break;
            case 'atrib':
                setAtrib(value);
                break;
            case 'cep':
                const formatadoCep = formatCep(value);
                setEndereco(prev => ({...prev, cep: formatadoCep}));
                const cepLimpo = value.replace(/\D/g, '');
                if (cepLimpo.length === 8) {
                    buscarEnderecoPorCep(cepLimpo);
                }
                break;
            case 'logradouro':
            case 'numero':
            case 'complemento':
            case 'bairro':
                setEndereco(prev => ({...prev, [name]: value}));
                break;
            case 'nomeCidade':
                setEndereco(prev => ({
                    ...prev,
                    cidade: {...prev.cidade, nomeCidade: value}
                }));
                break;
            case 'nomeEstado':
                setEndereco(prev => ({
                    ...prev,
                    cidade: {
                        ...prev.cidade,
                        estado: {...prev.cidade.estado, nomeEstado: value}
                    }
                }));
                break;
            case 'uf':
                setEndereco(prev => ({
                    ...prev,
                    cidade: {
                        ...prev.cidade,
                        estado: {...prev.cidade.estado, uf: value.toUpperCase()}
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
        setLoading(true);
        try {
            const pessoaData = {
                nomeCompleto,
                dataNascimento,
                cpfcnpj: cpfcnpj.replace(/\D/g, ''),
                rg: rg.replace(/\D/g, ''),
                telefone: telefone.replace(/\D/g, ''),
                email,
                tipo,
                atrib,
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
                            uf: endereco.cidade.estado.uf,
                        }
                    }
                }
            };

            if (Editando) {
                await axios.put(`http://localhost:8080/pessoa/${id}`, pessoaData);
                setSnackbarSeverity('success');
                setSnackbarMessage("Cliente atualizado com sucesso!");
            } else {
                await axios.post(`http://localhost:8080/pessoa`, pessoaData);
                setSnackbarSeverity('success');
                setSnackbarMessage("Cliente cadastrado com sucesso!");
            }

            setOpenSnackbar(true);
            if (onPessoaAdded) {
                onPessoaAdded();
            }

            setTimeout(() => {
                navigate('/pessoa');
            }, 2000);
        } catch (error) {
            console.log('Erro ao salvar:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage(error.response?.data?.message || "Erro ao salvar Cliente");
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
                        {Editando ? <EditIcon sx={{ mr: 2, color: '#142442', fontSize: 32 }} /> :
                            <PersonAddIcon sx={{ mr: 2, color: '#142442', fontSize: 32 }} />}
                        <Box>
                            <Typography variant="h4" sx={{ color: '#142442', fontWeight: 700, mb: 0.5 }}>
                                {Editando ? 'Editar Cliente' : 'Novo Cliente'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {Editando ? 'Atualize as informações do Cliente' : 'Cadastre um novo cliente no sistema'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {tipo && (
                            <Chip
                                icon={tipo === 'PESSOA_FISICA' ? <PersonIcon /> : <BusinessIcon />}
                                label={tipo === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                        <Chip
                            label={atrib || 'CLIENTE'}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500 }}
                        />
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{  display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                                        label="CPF/CNPJ"
                                        fullWidth
                                        name="cpfcnpj"
                                        value={cpfcnpj}
                                        onChange={handleCpfCnpjChange}
                                        onBlur={handleCpfCnpjBlur}
                                        required
                                        error={!!cpfcnpjError}
                                        helperText={cpfcnpjError || "Formatação automática"}
                                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                        inputProps={{ maxLength: 18 }}
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
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
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

                            {/* Tipo e Atribuição */}
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        select
                                        label="Tipo de Pessoa"
                                        fullWidth
                                        name="tipo"
                                        value={tipo}
                                        onChange={handleInputChange}
                                        required
                                        helperText="Selecione o tipo de pessoa"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        InputProps={{
                                            startAdornment: tipo === 'PESSOA_FISICA' ?
                                                <PersonIcon sx={{ mr: 1, color: 'action.active' }} /> :
                                                tipo === 'PESSOA_JURIDICA' ?
                                                    <BusinessIcon sx={{ mr: 1, color: 'action.active' }} /> :
                                                    <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    >
                                        <MenuItem value="PESSOA_FISICA">Pessoa Física</MenuItem>
                                        <MenuItem value="PESSOA_JURIDICA">Pessoa Jurídica</MenuItem>
                                    </TextField>
                                </Box>
                                <Box sx={{ flex: '1 1 250px' }}>
                                    <TextField
                                        label="Atribuição"
                                        fullWidth
                                        name="atrib"
                                        value={atrib}
                                        onChange={handleInputChange}
                                        required
                                        helperText="Função da pessoa no sistema"
                                        InputProps={{ readOnly: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: '#f8f9fa'
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
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
                                        helperText={carregandoCep ? "Buscando endereço..." : "Digite para busca automática"}
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
                                    onClick={() => navigate('/pessoa')}
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
                                        disabled={loading || !!cpfcnpjError}
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
                                        {Editando ? 'Salvar' : 'Salvar'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>                </form>

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

export default PessoaForm;