import React, {useState, useEffect} from 'react';
import {Box, Paper, TextField, Typography, Button, Snackbar, Alert, MenuItem} from "@mui/material";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import axios from "axios";
import Sidenav from "../NSidenav";
import {cpf, cnpj} from 'cpf-cnpj-validator';

const PessoaForm = ({onPessoaAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [Editando, setEditando] = useState(false);

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

    const fetchPessoaById = async (idPessoa) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/pessoa/${idPessoa}`);
            preencherFormulario(response.data);
        } catch (error) {
            console.error('Erro ao buscar pessoa:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar dados da pessoa');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

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

    const formatCpfCnpj = (value) => {
        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length <= 11) {
            return cpf.format(cleanValue);
        } else {
            return cnpj.format(cleanValue);
        }
    };

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

    const handleCpfCnpjChange = (e) => {
        const valorFormatado = formatCpfCnpj(e.target.value);
        setCpfCnpj(valorFormatado); // Correção: simplifiquei removendo handleInputChange desnecessário
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
            .replace(/(\d{3})(\d{1})/, '$1-$2'); // Correção: era (\d{2})(\d{1})
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
                        nomeEstado: data.estado || prev.cidade.estado.nomeEstado, // Correção: era prev.estado.nomeEstado
                        uf: data.uf || prev.cidade.estado.uf // Correção: era prev.estado.uf
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

        if (name === 'nomeCompleto') setNomeCompleto(value);
        if (name === 'dataNascimento') setDataNascimento(value);
        if (name === 'cpfcnpj') {
            const formatado = formatCpfCnpj(value);
            setCpfCnpj(formatado);
        }
        if (name === 'rg') {
            const formatado = formatRg(value);
            setRg(formatado);
        }
        if (name === 'telefone') {
            const formatado = formatTelefone(value);
            setTelefone(formatado);
        }
        if (name === 'email') setEmail(value);
        if (name === 'tipo') setTipo(value);
        if (name === 'atrib') setAtrib(value);

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
                setSnackbarMessage("Cliente adicionado com sucesso!");
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
                        label='Nome Completo'
                        name='nomeCompleto'
                        value={nomeCompleto}
                        onChange={handleInputChange}
                        required
                        error={!!error && !nomeCompleto.trim()}
                        helperText={error && !nomeCompleto.trim() ? 'Nome é obrigatório' : ''}
                    />
                </Box>
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label='Data de Nascimento'
                        name='dataNascimento'
                        type='date'
                        value={dataNascimento}
                        onChange={handleInputChange}
                        required
                        error={!!error && !dataNascimento.trim()}
                        helperText={error && !dataNascimento.trim() ? 'Data de nascimento é obrigatória' : ''}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
                <Box sx={{display: 'flex', gap: 2}}>
                    <TextField
                        label="CPF/CNPJ"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="cpfcnpj"
                        value={cpfcnpj}
                        onChange={handleCpfCnpjChange}
                        onBlur={handleCpfCnpjBlur}
                        required
                        error={!!cpfcnpjError}
                        helperText={cpfcnpjError}
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        inputProps={{
                            maxLength: 18
                        }}
                    />
                    <TextField
                        label="RG"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="rg"
                        required={true}
                        value={rg}
                        onChange={handleInputChange}
                        placeholder="99.999.999-9"
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
                <Box sx={{display: 'flex', gap: 2}}>
                    <TextField
                        select
                        label="Tipo de Pessoa"
                        variant="outlined"
                        required
                        fullWidth
                        margin="normal"
                        name="tipo"
                        value={tipo}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="PESSOA_FISICA">Pessoa Física</MenuItem>
                        <MenuItem value="PESSOA_JURIDICA">Pessoa Jurídica</MenuItem>
                    </TextField>
                    <TextField
                        label="Atribuição"
                        variant="outlined"
                        required
                        fullWidth
                        margin="normal"
                        name="atrib"
                        value={atrib}
                        onChange={handleInputChange}
                        InputProps={{
                            readOnly: true,
                        }}
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
                        onClick={() => navigate('/pessoa')}
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
                            : Editando ? 'Atualizar' : 'Salvar'
                        }
                    </Button>
                </Box>
            </form>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidenav />
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {Editando ? 'Editar Pessoa' : 'Cadastrar Pessoa'}
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

export default PessoaForm;