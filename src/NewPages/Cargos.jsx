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
    Chip,
    Divider,
    CircularProgress
} from "@mui/material";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import axios from "axios";
import Sidenav from "../NSidenav";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';

const CargosForm = ({onCargoAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário
    const [nomeCargo, setNomeCargo] = useState('');
    const [salarioBruto, setSalarioBruto] = useState('');
    const [desconto, setDesconto] = useState('');
    const [salarioLiquido, setSalarioLiquido] = useState('');
    const [status, setStatus] = useState('true');

    // Estados de controle
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            fetchCargoById(id);
        } else if (location.state?.cargo) {
            setIsEditing(true);
            preencherFormulario(location.state.cargo);
        }
    }, [id, location.state]);

    // Calcular salário líquido automaticamente
    // Calcular salário líquido automaticamente
    useEffect(() => {
        const bruto = parseFloat(salarioBruto) || 0;
        const descPercent = parseFloat(desconto) || 0;

        // Calcular desconto em valor: salário bruto * (desconto% / 100)
        const descontoValor = bruto * (descPercent / 100);
        const liquido = bruto - descontoValor;

        setSalarioLiquido(liquido > 0 ? liquido.toString() : '0');
    }, [salarioBruto, desconto]);


    // Função de API
    const fetchCargoById = async (idCargo) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/cargos/${idCargo}`);
            preencherFormulario(response.data);
        } catch (error) {
            console.error('Erro ao buscar cargo:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar cargo');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Preenchimento do formulário
    const preencherFormulario = (cargoData) => {
        setNomeCargo(cargoData.nomeCargo || '');
        setSalarioBruto(cargoData.salarioBruto?.toString() || '');
        setDesconto(cargoData.desconto?.toString() || '');
        setSalarioLiquido(cargoData.salarioLiquido?.toString() || '');
        setStatus(cargoData.status?.toString() || 'true');
    };

    // Formatação de moeda brasileira
    const formatCurrency = (value) => {
        if (!value) return '';
        const numValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
        return numValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleCurrencyChange = (e, setter) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        const numValue = (parseFloat(value) * 100).toString();
        setter(numValue);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        // Limpar erro do campo quando usuário digita
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }

        switch (name) {
            case 'nomeCargo':
                setNomeCargo(value);
                break;
            case 'status':
                setStatus(value);
                break;
            default:
                break;
        }
    };

    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};

        if (!nomeCargo.trim()) {
            newErrors.nomeCargo = 'Nome do cargo é obrigatório';
        }

        if (!salarioBruto || parseFloat(salarioBruto) <= 0) {
            newErrors.salarioBruto = 'Salário bruto deve ser maior que zero';
        }

        if (parseFloat(desconto) < 0) {
            newErrors.desconto = 'Desconto não pode ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Por favor, corrija os erros no formulário');
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);
        try {
            const cargoData = {
                nomeCargo: nomeCargo.trim(),
                salarioBruto: parseFloat(salarioBruto) || 0,
                desconto: parseFloat(desconto) || 0,
                salarioLiquido: parseFloat(salarioLiquido) || 0,
                status: status === 'true'
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/cargos/${id}`, cargoData);
                setSnackbarSeverity('success');
                setSnackbarMessage("Cargo atualizado com sucesso!");
            } else {
                await axios.post(`http://localhost:8080/cargos`, cargoData);
                setSnackbarSeverity('success');
                setSnackbarMessage("Cargo adicionado com sucesso!");
            }

            setOpenSnackbar(true);
            if (onCargoAdded) {
                onCargoAdded();
            }

            setTimeout(() => {
                navigate('/cargos');
            }, 2000);
        } catch (error) {
            console.log('Erro ao salvar:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage(error.response?.data?.message || "Erro ao salvar cargo");
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh'}}>
            <Sidenav/>
            <Box sx={{flexGrow: 1, p: 3}}>
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
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        {isEditing ? <EditIcon sx={{mr: 2, color: '#142442', fontSize: 32}}/> :
                            <PersonAddIcon sx={{mr: 2, color: '#142442', fontSize: 32}}/>}
                        <Box>
                            <Typography variant="h4" sx={{color: '#142442', fontWeight: 700, mb: 0.5}}>
                                {isEditing ? 'Editar Cargo' : 'Novo Cargo'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditing ? 'Atualize as informações do cargo' : 'Cadastre um novo cargo no sistema'}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        icon={<WorkIcon/>}
                        label="CARGOS"
                        color="secondary"
                        size="small"
                        sx={{fontWeight: 500}}
                    />
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 4}}>
                        {/* Informações do Cargo */}
                        <Box sx={{
                            p: 4,
                            borderRadius: 3,
                            boxShadow: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            '&:hover': {boxShadow: 4},
                            transition: 'all 0.3s ease'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                <WorkIcon sx={{mr: 2, color: '#142442', fontSize: 28}}/>
                                <Typography variant="h5" sx={{color: '#142442', fontWeight: 600}}>
                                    Informações do Cargo
                                </Typography>
                            </Box>
                            <Divider sx={{mb: 4}}/>

                            {/* Nome do Cargo e Status */}
                            <Box sx={{display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap'}}>
                                <Box sx={{flex: '1 1 300px', minWidth: 250}}>
                                    <TextField
                                        fullWidth
                                        label="Nome do Cargo"
                                        name="nomeCargo"
                                        value={nomeCargo}
                                        onChange={handleInputChange}
                                        required
                                        error={!!errors.nomeCargo}
                                        helperText={errors.nomeCargo || 'Ex: Desenvolvedor, Analista, Gerente'}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                        InputProps={{
                                            startAdornment: <WorkIcon sx={{mr: 1, color: 'action.active'}}/>
                                        }}
                                    />
                                </Box>
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
                                </Box>
                            </Box>

                            {/* Salários */}
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <AttachMoneyIcon sx={{mr: 1, color: '#142442'}}/>
                                <Typography variant="h6" sx={{color: '#142442', fontWeight: 600}}>
                                    Remuneração
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap'}}>
                                <Box sx={{flex: '1 1 200px'}}>
                                    <TextField
                                        fullWidth
                                        label="Salário Bruto"
                                        type="number"
                                        name="salarioBruto"
                                        value={salarioBruto}
                                        onChange={(e) => setSalarioBruto(e.target.value)}
                                        required
                                        error={!!errors.salarioBruto}
                                        helperText={errors.salarioBruto || `R$ ${salarioBruto ? formatCurrency(salarioBruto) : '0,00'}`}
                                        inputProps={{min: 0, step: 0.01}}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                        InputProps={{
                                            startAdornment: <AttachMoneyIcon sx={{mr: 1, color: 'action.active'}}/>
                                        }}
                                    />
                                </Box>
                                <Box sx={{flex: '1 1 200px'}}>
                                    <TextField
                                        fullWidth
                                        label="Desconto (%)"
                                        type="number"
                                        name="desconto"
                                        value={desconto}
                                        onChange={(e) => setDesconto(e.target.value)}
                                        error={!!errors.desconto}
                                        helperText={errors.desconto || `% ${desconto ? formatCurrency(desconto) : '0,00'}`}
                                        inputProps={{min: 0, step: 0.01}}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                        InputProps={{
                                            startAdornment: <PercentIcon sx={{mr: 1, color: 'action.active'}}/>
                                        }}
                                    />
                                </Box>
                                <Box sx={{flex: '1 1 200px'}}>
                                    <TextField
                                        fullWidth
                                        label="Salário Líquido"
                                        name="salarioLiquido"
                                        value={salarioLiquido}
                                        disabled
                                        helperText={`R$ ${salarioLiquido ? formatCurrency(salarioLiquido) : '0,00'} (calculado automaticamente)`}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                        InputProps={{
                                            startAdornment: <AttachMoneyIcon sx={{mr: 1, color: 'action.active'}}/>
                                        }}
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
                                    startIcon={<ArrowBackIcon/>}
                                    variant="outlined"
                                    onClick={() => navigate('/cargos')}
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

                                <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                                    {loading && (
                                        <Box sx={{display: 'flex', alignItems: 'center', mr: 2}}>
                                            <CircularProgress size={20} sx={{mr: 1}}/>
                                            <Typography variant="body2" color="text.secondary">
                                                Salvando...
                                            </Typography>
                                        </Box>
                                    )}

                                    <Button
                                        type="submit"
                                        startIcon={loading ? null : <SaveIcon/>}
                                        variant="contained"
                                        disabled={loading}
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
                                        {isEditing ? 'Atualizar' : 'Cadastrar'}
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
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
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

export default CargosForm;
