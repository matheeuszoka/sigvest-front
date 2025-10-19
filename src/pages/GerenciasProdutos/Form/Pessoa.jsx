import React, {useState, useEffect} from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Button,
    Snackbar,
    Alert,
    MenuItem,
    CircularProgress, Divider
} from '@mui/material';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import axios from 'axios';
import Sidenav from '../../../NSidenav';
import EditIcon from "@mui/icons-material/Edit";
import BrandingWatermark from "@mui/icons-material/BrandingWatermark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import WorkIcon from "@mui/icons-material/Work";

const MarcaForm = ({onMarcaAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();

    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário
    const [marca, setMarca] = useState('');
    const [desMarca, setDesMarca] = useState('');
    const [status, setStatus] = useState('ATIVO');

    // Estados de controle
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        if (id) {
            setIsEditing(true);
            fetchMarcaById(id);
        } else if (location.state?.marca) {
            setIsEditing(true);
            preencherFormulario(location.state.marca);
        } else {
            setIsEditing(false);
        }
    }, [id, location.state]);

    // Funções de API
    const fetchMarcaById = async (idMarca) => {
        setLoading(true);
        try {
            const {data} = await axios.get(`http://localhost:8080/marca/${idMarca}`);
            preencherFormulario(data);
        } catch (error) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar dados da marca');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Preenchimento do formulário
    const preencherFormulario = (marcaData) => {
        setMarca(marcaData.marca || '');
        setDesMarca(marcaData.desMarca || '');
        setStatus(marcaData.status || 'ATIVO');
    };

    const validarFormulario = () => {
        if (!marca.trim()) {
            setSnackbarSeverity('warning');
            setSnackbarMessage('Informe o nome da marca');
            setOpenSnackbar(true);
            return false;
        }
        return true;
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setLoading(true);
        const payload = {
            marca: marca.trim(),
            desMarca: desMarca.trim(),
            status: status
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:8080/marca/${id}`, payload);
                setSnackbarSeverity('success');
                setSnackbarMessage('Marca atualizada com sucesso');
            } else {
                await axios.post('http://localhost:8080/marca', payload);
                setSnackbarSeverity('success');
                setSnackbarMessage('Marca cadastrada com sucesso');
            }
            setOpenSnackbar(true);

            if (onMarcaAdded) {
                onMarcaAdded();
            }

            setTimeout(() => {
                navigate('/marca');
            }, 800);
        } catch (error) {
            setSnackbarSeverity('error');
            setSnackbarMessage(isEditing ? 'Erro ao atualizar marca' : 'Erro ao cadastrar marca');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh'}}>
            <Sidenav/>
            <Box sx={{flexGrow: 1, p: 3}}>
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
                            <BrandingWatermark sx={{mr: 2, color: '#142442', fontSize: 32}}/>}
                        <Box>
                            <Typography variant="h4" sx={{color: '#142442', fontWeight: 700, mb: 0.5}}>
                                {isEditing ? 'Editar Marca' : 'Nova Marca'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditing ? 'Atualize as informações de marca' : 'Cadastre uma nova marca no sistema'}
                            </Typography>
                        </Box>
                    </Box>
                    </Box>
                <form onSubmit={handleSubmit}>
                    <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 4}}>
                        {/* Informações de Marca */}
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
                                <BrandingWatermark sx={{mr: 2, color: '#142442', fontSize: 28}}/>
                                <Typography variant="h5" sx={{color: '#142442', fontWeight: 600}}>
                                    Informações da Marca
                                </Typography>
                            </Box>
                            <Divider sx={{mb: 4}}/>
                            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>

                                <Box sx={{flex: '1 1 300px', minWidth: 250}}>
                                    <TextField
                                        fullWidth
                                        label="Nome da Marca"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                        required
                                        error={!!error && !marca.trim()}
                                        helperText={error && !marca.trim() ? 'Nome é obrigatório' : ''}
                                    />

                                </Box>
                                <Box sx={{flex: '0 1 200px', minWidth: 200}}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value === 'true')}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value={true}>Ativo</option>
                                        <option value={false}>Inativo</option>
                                    </TextField>
                                </Box>

                                <Box sx={{flex: '1 1 300px', minWidth: 250}}>
                                    <TextField
                                        fullWidth
                                        label="Descrição"
                                        value={desMarca}
                                        onChange={(e) => setDesMarca(e.target.value)}
                                        multiline
                                        rows={3}
                                        helperText="Descrição opcional da marca"
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
                                        Salvar
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </form>

                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={3000}
                        onClose={() => setOpenSnackbar(false)}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    >
                        <Alert
                            onClose={() => setOpenSnackbar(false)}
                            severity={snackbarSeverity}
                            sx={{width: '100%'}}
                        >
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
            );
            };

            export default MarcaForm;
