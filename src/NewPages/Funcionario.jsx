import React, {useState, useEffect} from 'react';
import {Box, Paper, TextField, Typography, Button, Stepper, Step, StepLabel, Snackbar, Alert} from '@mui/material';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import Sidenav from "../NSidenav";
import axios from "axios";
import { MenuItem } from '@mui/material';
import validator from "cpf-cnpj-validator";
import { cpf, cnpj } from 'cpf-cnpj-validator';


const steps = ['Informações Pessoais', 'Endereço', 'Confirmação'];

const FuncionarioForm = ({onUserAdded}) => {
    const navigate = useNavigate();
    const { id } = useParams(); // Para pegar o ID da URL
    const location = useLocation(); // Para pegar dados passados via state
    const [step, setStep] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpfcnpj, setCpfcnpj] = useState('');
    const [rg, setRg] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [tipo, setTipo] = useState('');
    const [atrib, setAtrib] = useState('FUNCIONARIO');
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
    const [loadingCep, setLoadingCep] = useState(false);
    const [loading, setLoading] = useState(false);

    // Verificar se está editando quando o componente monta
    useEffect(() => {
        if (id) {
            setIsEditing(true);
            fetchPessoaById(id);
        } else if (location.state?.pessoa) {
            setIsEditing(true);
            preencherFormulario(location.state.pessoa);
        }
    }, [id, location.state]);

    // Buscar pessoa por ID
    const fetchPessoaById = async (idPessoa) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/pessoa/${idPessoa}`);
            preencherFormulario(response.data);
        } catch (error) {
            console.error('Erro ao buscar funcionario:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar dados do funcionario');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Preencher formulário com dados da pessoa
    const preencherFormulario = (pessoa) => {
        setNomeCompleto(pessoa.nomeCompleto || '');

        // Formatação da data para o input date
        let dataFormatada = '';
        if (pessoa.dataNascimento) {
            // Se a data vier no formato ISO (YYYY-MM-DD), usar diretamente
            if (pessoa.dataNascimento.includes('-')) {
                dataFormatada = pessoa.dataNascimento.split('T')[0]; // Remove a parte do horário se existir
            } else {
                // Se vier em outro formato, tentar converter
                const data = new Date(pessoa.dataNascimento);
                if (!isNaN(data.getTime())) {
                    dataFormatada = data.toISOString().split('T')[0];
                }
            }
        }
        setDataNascimento(dataFormatada);

        setCpfcnpj(formatCpfCnpj(pessoa.cpfcnpj || ''));
        setRg(formatRg(pessoa.rg || ''));
        setTelefone(formatTelefone(pessoa.telefone || ''));
        setEmail(pessoa.email || '');
        setTipo(pessoa.tipo || '');
        setAtrib(pessoa.atrib || 'FUNCIONARIO');

        if (pessoa.endereco) {
            setEndereco({
                logradouro: pessoa.endereco.logradouro || '',
                numero: pessoa.endereco.numero || '',
                complemento: pessoa.endereco.complemento || '',
                bairro: pessoa.endereco.bairro || '',
                cep: formatCep(pessoa.endereco.cep || ''),
                cidade: {
                    nomeCidade: pessoa.endereco.cidade?.nomeCidade || '',
                    estado: {
                        nomeEstado: pessoa.endereco.cidade?.estado?.nomeEstado || '',
                        uf: pessoa.endereco.cidade?.estado?.uf || ''
                    }
                }
            });
        }
    };

    // Função para passar para a próxima etapa
    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step === 0) {
            navigate('/funcionarios');
        } else {
            setStep(step - 1);
        }
    };

    const [cpfcnpjError, setCpfcnpjError] = useState('');

// Função para formatar CPF/CNPJ
    const formatCpfCnpj = (value) => {
        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length <= 11) {
            return cpf.format(cleanValue);
        } else {
            return cnpj.format(cleanValue);
        }
    };

// Função para validar CPF/CNPJ
    const validarCpfCnpj = (value) => {
        if (!value) return false;

        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length === 11) {
            return cpf.isValid(value);
        } else if (cleanValue.length === 14) {
            return cnpj.isValid(value);
        }

        return false;
    };

// Handler modificado para CPF/CNPJ
    const handleCpfCnpjChange = (e) => {
        const formattedValue = formatCpfCnpj(e.target.value);
        handleInputChange({
            target: {
                name: 'cpfcnpj',
                value: formattedValue
            }
        });

        // Limpar erro ao digitar
        if (cpfcnpjError) setCpfcnpjError('');
    };

// Validação ao sair do campo
    const handleCpfCnpjBlur = (e) => {
        const value = e.target.value;

        if (value && !validarCpfCnpj(value)) {
            setCpfcnpjError('CPF ou CNPJ inválido');
        } else {
            setCpfcnpjError('');
        }
    };


    // Função para formatar telefone
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

    // Função para formatar CEP
    const formatCep = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/(\d{5})(\d)/, '$1-$2');
    };

    // Função para formatar RG
    const formatRg = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1})/, '$1-$2');
    };

    // Função para buscar endereço pelo CEP
    const buscarEnderecoPorCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            return;
        }

        setLoadingCep(true);

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
                        nomeEstado: getEstadoNome(data.uf) || prev.cidade.estado.nomeEstado,
                        uf: data.uf || prev.cidade.estado.uf
                    }
                }
            }));

            setSnackbarSeverity('success');
            setSnackbarMessage('Endereço encontrado e preenchido automaticamente!');
            setOpenSnackbar(true);

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao buscar CEP. Verifique sua conexão.');
            setOpenSnackbar(true);
        } finally {
            setLoadingCep(false);
        }
    };

    // Função auxiliar para converter UF em nome do estado
    const getEstadoNome = (uf) => {
        const estados = {
            'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
            'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
            'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
            'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
            'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
        };
        return estados[uf] || '';
    };

    // Função para atualizar os dados dos campos
    const handleInputChange = (e) => {
        const {name, value} = e.target;

        if (name === 'nomeCompleto') setNomeCompleto(value);
        if (name === 'dataNascimento') setDataNascimento(value);
        if (name === 'cpfcnpj') {
            const formatted = formatCpfCnpj(value);
            setCpfcnpj(formatted);
        }
        if (name === 'rg') {
            const formatted = formatRg(value);
            setRg(formatted);
        }
        if (name === 'telefone') {
            const formatted = formatTelefone(value);
            setTelefone(formatted);
        }
        if (name === 'email') setEmail(value);
        if (name === 'tipo') setTipo(value);
        if (name === 'atrib') setAtrib(value);

        // Para campos do endereço básicos
        if (['logradouro', 'numero', 'complemento', 'bairro'].includes(name)) {
            setEndereco(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Para CEP com formatação e busca automática
        if (name === 'cep') {
            const formatted = formatCep(value);
            setEndereco(prev => ({
                ...prev,
                cep: formatted
            }));

            const cepLimpo = value.replace(/\D/g, '');
            if (cepLimpo.length === 8) {
                buscarEnderecoPorCep(cepLimpo);
            }
        }

        // Para cidade
        if (name === 'nomeCidade') {
            setEndereco(prev => ({
                ...prev,
                cidade: {
                    ...prev.cidade,
                    nomeCidade: value
                }
            }));
        }

        // Para campos do estado
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

    // Função para enviar os dados para a API
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
                            uf: endereco.cidade.estado.uf
                        }
                    }
                }
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/pessoa/${id}`, pessoaData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Funcionario atualizado com sucesso');
            } else {
                // Criar nova pessoa
                await axios.post("http://localhost:8080/pessoa", pessoaData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Funcionario cadastrado com sucesso');
            }

            setOpenSnackbar(true);

            if (onUserAdded) {
                onUserAdded();
            }

            setTimeout(() => {
                navigate('/funcionarios');
            }, 1000);

        } catch (error) {
            console.error("Erro ao salvar funcionario:", error);
            setSnackbarSeverity('error');
            setSnackbarMessage(isEditing ? 'Erro ao atualizar funcionario' : 'Erro ao cadastrar funcionario');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Renderiza a etapa atual do formulário
    const renderStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return (
                    <Box>
                        <TextField
                            label="Nome Completo"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            name="nomeCompleto"
                            value={nomeCompleto}
                            onChange={handleInputChange}
                            required={true}
                        />
                        <TextField
                            label="Data de Nascimento"
                            type="date"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            name="dataNascimento"
                            value={dataNascimento}
                            onChange={handleInputChange}
                            required={true}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

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
                                    maxLength: 18 // Fixo para CNPJ com máscara
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
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <TextField
                            label="Logradouro"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            name="logradouro"
                            value={endereco.logradouro}
                            onChange={handleInputChange}
                        />
                        <Box sx={{display: 'flex', gap: 2}}>
                            <TextField
                                label="Número"
                                variant="outlined"
                                margin="normal"
                                name="numero"
                                value={endereco.numero}
                                onChange={handleInputChange}
                                sx={{width: '30%'}}
                            />
                            <TextField
                                label="Complemento"
                                variant="outlined"
                                margin="normal"
                                name="complemento"
                                value={endereco.complemento}
                                onChange={handleInputChange}
                                sx={{width: '70%'}}
                            />
                        </Box>
                        <Box sx={{display: 'flex', gap: 2}}>
                            <TextField
                                label="Bairro"
                                variant="outlined"
                                margin="normal"
                                name="bairro"
                                value={endereco.bairro}
                                onChange={handleInputChange}
                                sx={{width: '60%'}}
                            />
                            <TextField
                                label="CEP"
                                variant="outlined"
                                margin="normal"
                                name="cep"
                                value={endereco.cep}
                                onChange={handleInputChange}
                                sx={{width: '40%'}}
                                placeholder="00000-000"
                                inputProps={{
                                    maxLength: 9
                                }}
                                helperText={loadingCep ? "Buscando endereço..." : "Preenchimento automático"}
                                disabled={loadingCep}
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
                            helperText="Nome da cidade"
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
                                helperText="Nome completo do estado"
                            />
                            <TextField
                                label="UF"
                                variant="outlined"
                                margin="normal"
                                name="uf"
                                value={endereco.cidade.estado.uf}
                                onChange={handleInputChange}
                                sx={{width: '30%'}}
                                helperText="Ex: SP, RJ"
                                inputProps={{maxLength: 2}}
                            />
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" sx={{mb: 2}}>
                            {isEditing ? 'Confirmar Alterações' : 'Confirmar Cadastro'}
                        </Typography>
                        <Typography variant="h6">Informações Pessoais</Typography>
                        <Typography variant="body1"><strong>Nome Completo:</strong> {nomeCompleto}</Typography>
                        <Typography variant="body1"><strong>Data de Nascimento:</strong> {dataNascimento}</Typography>
                        <Typography variant="body1"><strong>CPF/CNPJ:</strong> {cpfcnpj}</Typography>
                        <Typography variant="body1"><strong>RG:</strong> {rg}</Typography>
                        <Typography variant="body1"><strong>Telefone:</strong> {telefone}</Typography>
                        <Typography variant="body1"><strong>Email:</strong> {email}</Typography>
                        <Typography variant="body1"><strong>Tipo:</strong> {tipo}</Typography>
                        <Typography variant="body1"><strong>Atribuição:</strong> {atrib}</Typography>

                        <Typography variant="h6" sx={{mt: 2, mb: 1}}>Endereço:</Typography>
                        <Typography variant="body1"><strong>Logradouro:</strong> {endereco.logradouro}</Typography>
                        <Typography variant="body1"><strong>Número:</strong> {endereco.numero}</Typography>
                        <Typography variant="body1"><strong>Complemento:</strong> {endereco.complemento}</Typography>
                        <Typography variant="body1"><strong>Bairro:</strong> {endereco.bairro}</Typography>
                        <Typography variant="body1"><strong>CEP:</strong> {endereco.cep}</Typography>
                        <Typography variant="body1"><strong>Cidade:</strong> {endereco.cidade.nomeCidade}</Typography>
                        <Typography variant="body1"><strong>Estado:</strong> {endereco.cidade.estado.nomeEstado} - {endereco.cidade.estado.uf}</Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex'}}>
                <Sidenav/>
                <Box component="main" sx={{flexGrow: 1, p: 3}}>
                    <Typography variant="h4">Carregando...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{display: 'flex'}}>
                <Sidenav/>
                <Box component="main" sx={{flexGrow: 1, p: 3}}>
                    <Typography variant="h4">
                        {isEditing ? 'Editar Funcionario' : 'Cadastrar Funcionario'}
                    </Typography>

                    <Paper sx={{padding: 3, marginTop: 3}}>
                        <Stepper activeStep={step} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <Box sx={{marginTop: 3}}>
                            {renderStepContent(step)}

                            <Box sx={{display: 'flex', justifyContent: 'space-between', marginTop: 2}}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={prevStep}
                                    disabled={loading}
                                    sx={{bgcolor:"#AEB8D6", color: '#142442', border:"none"}}

                                >
                                    {step === 0 ? 'Voltar' : 'Anterior'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={step === steps.length - 1 ? handleSubmit : nextStep}
                                    disabled={loading}
                                    sx={{bgcolor:"#AEB8D6", color: '#142442'}}
                                >
                                    {loading
                                        ? 'Salvando...'
                                        : step === steps.length - 1
                                            ? (isEditing ? 'Atualizar' : 'Finalizar')
                                            : 'Próximo'
                                    }
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Snackbar para mostrar as mensagens de sucesso ou erro */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default FuncionarioForm;