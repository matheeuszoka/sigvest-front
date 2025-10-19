import React, {useState, useEffect} from "react";
import {Box, Paper, TextField, Typography, Button, Snackbar, Alert} from "@mui/material";
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import Sidenav from '../NSidenav';
import axios from "axios";
import {cnpj} from "cpf-cnpj-validator";
import {validateIE} from 'validations-br';

const FornecedorForm = ({onFornecedorAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);


    // campos
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [inscricaoEstadual, setInscricaoEstadual] = useState('');
    const [cnpjFornecedor, setCnpjFornecedor] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
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
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [carregandoCep, setCarregandoCep] = useState(false);
    const [error, setError] = useState('');
    const [cnpjError, setCnpjError] = useState('');

    useEffect(() => {
        const fetchFornecedorById = async (idFornecedor) => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/fornecedor/${idFornecedor}`);
                preencherFormulario(response.data);
            } catch (error) {
                console.log("Erro ao buscar fornecedores", error);
                setError('Erro ao carregar dados');
                setSnackbarSeverity('error');
                setSnackbarMessage("Erro ao carregar dados do fornecedor");
                setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            setIsEditing(true);
            fetchFornecedorById(id);
        } else if (location.state?.fornecedor) {
            setIsEditing(true);
            preencherFormulario(location.state.fornecedor);
        }
    }, [id, location.state]);

    const preencherFormulario = (fornecedorData) => {

        setNomeFantasia(fornecedorData.nomeFantasia || '');
        setRazaoSocial(fornecedorData.razaoSocial);
        setCnpjFornecedor(formatCnpj(fornecedorData.cnpjFornecedor || ''));
        setInscricaoEstadual(formatIE(fornecedorData.inscricaoEstadual))
        setTelefone(formatTelefone(fornecedorData.telefone || ''));
        setEmail(fornecedorData.email || '');

        if (fornecedorData.endereco) {
            setEndereco({
                logradouro: fornecedorData.endereco.logradouro || '',
                numero: fornecedorData.endereco.numero || '',
                complemento: fornecedorData.endereco.complemento || '',
                bairro: fornecedorData.endereco.bairro || '',
                cep: formatCep(fornecedorData.endereco.cep || ''),
                cidade: {
                    nomeCidade: fornecedorData.endereco.cidade?.nomeCidade || '',
                    estado: {
                        nomeEstado: fornecedorData.endereco.cidade?.estado?.nomeEstado || '',
                        uf: fornecedorData.endereco.cidade?.estado?.uf || '',
                    }
                }
            });
        }
    };

    const formatCnpj = (value) => {
        const cleanValue = (value || '').replace(/\D/g, '');
        if (cleanValue.length === 14) {
            return cnpj.format(cleanValue);
        }
        return value;
    };

    const validaCnpj = (value) => {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length === 14) {
            return cnpj.isValid(cleanValue);
        }
        return false;
    };

    const handleCnpjChange = (e) => {
        const valorFormatado = formatCnpj(e.target.value);
        setCnpjFornecedor(valorFormatado);
        if (cnpjError) setCnpjError('');
    };
    const handleCnpjBlur = (e) => {
        const value = e.target.value;
        if (value && !validaCnpj(value)) {
            setCnpjError('CNPJ inválido');
        } else {
            setCnpjError('');
        }
    };

    const formatTelefone = (value) => {
        const cleanValue = (value || '').replace(/\D/g, '');
        if (cleanValue.length === 10) {
            return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1)$2-$3');
        } else if (cleanValue.length === 11) {
            return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
        }
        return value;
    };

    const formatCep = (value) => {
        const cleanValue = (value || '').replace(/\D/g, '');
        return cleanValue.replace(/(\d{5})(\d)/, '$1-$2');
    };

    const formatIE = (value) => {
        if (!value) return "";
        const cleanValue = value.replace(/\D/g, '');
        // Exemplo de formatação simples
        if (cleanValue.length <= 12) {
            return cleanValue
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1/$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return cleanValue;
    };

    const validarIE = (value) => {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length === 12) {
            return validateIE(cleanValue);
        }
        return false;
    };

    const buscarEnderecoPorCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            return;
        }
        setCarregandoCep(true);

        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`); // Correção: removi } extra
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
            setSnackbarMessage("CEP encontrado");
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

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        if (name === "nomeFantasia") setNomeFantasia(value);
        if (name === 'razaoSocial') setRazaoSocial(value);
        if (name === 'cnpj') {
            const formatado = formatCnpj(value);
            setCnpjFornecedor(formatado);
        }
        if (name === 'inscricaoEstadual') {
            const formatado = formatIE(value);
            setInscricaoEstadual(formatado);
        }
        if (name === 'telefone') {
            const formatado = formatTelefone(value);
            setTelefone(formatado);
        }
        if (name === 'email') setEmail(value);

        if (['logradouro', 'numero', 'complemento', 'bairro'].includes(name)) {
            setEndereco(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (name === 'cep') {
            const formatado = formatCep(value);
            setEndereco(prev => ({
                ...prev,
                cep: formatado
            }));

            const cepLimpo = value.replace(/\D/g, '');
            if (cepLimpo.length === 8) { // Correção: era !== 8
                buscarEnderecoPorCep(cepLimpo);
            }
        }

        if (name === 'nomeCidade') {
            setEndereco(prev => ({
                ...prev,
                cidade: {
                    ...prev.cidade,
                    nomeCidade: value
                }
            }));
        }

        if (name === 'nomeEstado') {
            setEndereco(prev => ({
                ...prev,
                cidade: {
                    ...prev.cidade,
                    estado: {
                        ...prev.cidade.estado,
                        nomeEstado: value
                    }
                }
            }));
        }

        if (name === 'uf') {
            setEndereco(prev => ({
                ...prev,
                cidade: {
                    ...prev.cidade,
                    estado: {
                        ...prev.cidade.estado,
                        uf: value.toUpperCase()
                    }
                }
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fornecedorData = {
                nomeFantasia,
                razaoSocial,
                inscricaoEstadual,
                cnpjFornecedor: cnpjFornecedor.replace(/\D/g, ''),
                telefone: telefone.replace(/\D/g, ''),
                email,
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

            if (isEditing) {
                await axios.put(`http://localhost:8080/fornecedor/${id}`, fornecedorData);
                setSnackbarSeverity('success');
                setSnackbarMessage("Fornecedor editado com sucesso!");
            } else {
                await axios.post(`http://localhost:8080/fornecedor`, fornecedorData);
                setSnackbarSeverity('success');
                setSnackbarMessage("Fornecedor adicionado com sucesso!");
            }

            setOpenSnackbar(true);

            if (onFornecedorAdded) {
                onFornecedorAdded();
            }

            setTimeout(() => {
                navigate('/fornecedor');
            }, 1000);
        } catch (error) {
            console.log('Erro ao salvar:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage("Erro ao salvar");
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const renderFormConteudo = () => (
        <Paper sx={{p: 3, mb: 2}}>
            <form onSubmit={handleSubmit}>
                <Box sx={{mb: 3}}>
                </Box>
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label='Nome Fantasia'
                        name='nomeFantasia'
                        value={nomeFantasia}
                        onChange={handleInputChange}
                        required
                        error={!!error && !nomeFantasia.trim()}
                        helperText={error && !nomeFantasia.trim() ? 'Nome Fantasia é obrigatório' : ''}
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label='Razão Social'
                        name='razaoSocial'
                        value={razaoSocial}
                        onChange={handleInputChange}
                        required
                        error={!!error && !razaoSocial.trim()}
                        helperText={error && !razaoSocial.trim() ? 'Razão Social é obrigatório' : ''}
                    />
                </Box>

                <Box sx={{display: 'flex', gap: 2}}>
                    <TextField
                        label="CNPJ"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="cnpjFornecedor"
                        value={cnpjFornecedor}
                        onChange={handleCnpjChange}
                        onBlur={handleCnpjBlur}
                        required
                        error={!!cnpjError}
                        helperText={cnpjError}
                        placeholder="00.000.000/0000-00"
                        inputProps={{
                            maxLength: 18
                        }}
                    />
                    <TextField
                        label="Inscrição Estadual"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="inscricaoEstadual"
                        required={true}
                        value={inscricaoEstadual}
                        onChange={handleInputChange}
                        placeholder="999999999-9"
                        inputProps={{
                            maxLength: 12
                        }}
                    />
                </Box>
                <Box sx={{display: 'flex', gap: 2}}>
                    <TextField
                        label="Telefone"
                        type="text"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="telefone"
                        value={telefone}
                        required={true}
                        onChange={handleInputChange}
                        placeholder="(99) 99999-9999"
                        inputProps={{
                            maxLength: 15
                        }}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="email"
                        value={email}
                        onChange={handleInputChange}
                    />
                </Box>
                <br/>
                <Box>
                    <TextField
                        fullWidth
                        label="CEP"
                        variant="outlined"
                        margin="normal"
                        name="cep"
                        value={endereco.cep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        inputProps={{
                            maxLength: 9
                        }}
                        helperText={carregandoCep ? "Buscando endereço..." : "Preenchimento automático"}
                        disabled={carregandoCep}
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <Box sx={{display: 'flex', gap: 2}}>

                        <TextField
                            label="Logradouro"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            name="logradouro"
                            value={endereco.logradouro}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Número"
                            variant="outlined"
                            margin="normal"
                            name="numero"
                            value={endereco.numero}
                            onChange={handleInputChange}
                            sx={{width: '30%'}}
                        />
                    </Box>
                    <Box sx={{display: 'flex', gap: 2}}>

                        <TextField
                            label="Complemento"
                            variant="outlined"
                            margin="normal"
                            name="complemento"
                            value={endereco.complemento}
                            onChange={handleInputChange}
                            sx={{width: '50%'}}
                        />
                        <TextField
                            label="Bairro"
                            variant="outlined"
                            margin="normal"
                            name="bairro"
                            value={endereco.bairro}
                            onChange={handleInputChange}
                            sx={{width: '50%'}}
                        />
                    </Box>
                    <TextField
                        label="Cidade"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="nomeCidade"
                        value={endereco.cidade.nomeCidade}
                        onChange={handleInputChange}
                    />
                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            label="Estado"
                            variant="outlined"
                            margin="normal"
                            name="nomeEstado"
                            value={endereco.cidade.estado.nomeEstado}
                            onChange={handleInputChange}
                            sx={{width: '70%'}}
                        />
                        <TextField
                            label="UF"
                            variant="outlined"
                            margin="normal"
                            name="uf"
                            value={endereco.cidade.estado.uf}
                            onChange={handleInputChange}
                            sx={{width: '30%'}}
                            inputProps={{maxLength: 2}}
                        />
                    </Box>
                </Box>
                {/* Botões */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 3}}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/fornecedor')}
                        disabled={loading}
                        sx={{bgcolor: "#AEB8D6", color: '#142442', border: "none"}}
                    >
                        Voltar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{bgcolor: "#AEB8D6", color: '#142442'}}
                    >
                        {loading
                            ? 'Salvando...'
                            : isEditing ? 'Atualizar' : 'Salvar'
                        }
                    </Button>
                </Box>
            </form>
        </Paper>
    );

    return (
        <Box sx={{display: 'flex'}}>
            <Sidenav/>
            <Box sx={{flexGrow: 1, p: 3}}>
                <Typography variant="h4" gutterBottom>
                    {isEditing ? 'Editar Pessoa' : 'Cadastrar Fornecedor'}
                </Typography>
                {renderFormConteudo()}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setOpenSnackbar(false)}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{width: '100%'}}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default FornecedorForm;