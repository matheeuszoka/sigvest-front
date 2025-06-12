import React, {useState, useEffect} from 'react';
import {Box, Paper, TextField, Typography, Button, Snackbar, Alert, Autocomplete} from '@mui/material';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import Sidenav from "../NSidenav";
import axios from "axios";

const MarcaForm = ({onMarcaAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [ativo, setAtivo] = useState(true);

    // Estados para o Autocomplete
    const [marca, setMarca] = useState('');
    const [marcasLike, setMarcasLike] = useState([]);
    const [marcaSelecionada, setMarcaSelecionada] = useState(null);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Verificar se está editando quando o componente monta
    useEffect(() => {
        const fetchMarcaById = async (idMarca) => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/marca/${idMarca}`);
                preencherFormulario(response.data);
            } catch (error) {
                console.error('Erro ao buscar marca:', error);
                setError('Erro ao carregar dados da marca');
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao carregar dados da marca');
                setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            setIsEditing(true);
            fetchMarcaById(id);
        } else if (location.state?.marca) {
            setIsEditing(true);
            preencherFormulario(location.state.marca);
        }
    }, [id, location.state]);

    // Buscar marcas para o Autocomplete
    useEffect(() => {
        const delay = setTimeout(() => {
            if (marca && marca.length >= 2) {
                axios.get(`http://localhost:8080/marca/likemarca/${marca}`)
                    .then((response) => setMarcasLike(response.data))
                    .catch((error) => console.error("Erro ao buscar marcas:", error));
            } else {
                setMarcasLike([]);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [marca]);

    const preencherFormulario = (marcaData) => {
        setNome(marcaData.marca || '');
        setDescricao(marcaData.desMarca || '');
        setAtivo(marcaData.status === "ATIVO");
        setMarcaSelecionada(marcaData);
        setMarca(marcaData.marca || '');
    };

    const validarFormulario = () => {
        if (!nome.trim()) {
            setError('Nome da marca é obrigatório');
            return false;
        }
        if (nome.trim().length < 2) {
            setError('Nome da marca deve ter pelo menos 2 caracteres');
            return false;
        }
        setError('');
        return true;
    };

    // Submeter formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        const marcaData = {
            marca: nome.trim(),
            desMarca: descricao.trim(),
            status: ativo ? "ATIVO" : "INATIVO"
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:8080/marca/${id}`, marcaData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Marca atualizada com sucesso');
            } else {
                await axios.post("http://localhost:8080/marca", marcaData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Marca cadastrada com sucesso');
            }

            setOpenSnackbar(true);

            if (onMarcaAdded) {
                onMarcaAdded();
            }

            setTimeout(() => {
                navigate('/marca');
            }, 1000);

        } catch (error) {
            console.error("Erro ao salvar marca:", error);
            setSnackbarSeverity('error');
            setSnackbarMessage(isEditing ? 'Erro ao atualizar marca' : 'Erro ao cadastrar marca');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/marca');
    };

    // Renderizar conteúdo do formulário
    const renderFormContent = () => (
        <Paper sx={{p: 3, mb: 2}}>
            <Typography variant="h6" gutterBottom>
                {isEditing ? "Editar Marca" : "Cadastro de Marca"}
            </Typography>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                {/* Nome da Marca */}
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label="Nome da Marca"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        error={!!error && !nome.trim()}
                        helperText={error && !nome.trim() ? 'Nome é obrigatório' : ''}
                    />
                </Box>

                {/* Descrição */}
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label="Descrição"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        multiline
                        rows={3}
                        helperText="Descrição opcional da marca"
                    />
                </Box>

                {/* Status com Autocomplete */}
                <Box sx={{mb: 3}}>
                    <Autocomplete
                        value={marcaSelecionada}
                        onChange={(event, newValue) => {
                            setMarcaSelecionada(newValue);
                            if (newValue) {
                                setNome(newValue.marca || '');
                                setDescricao(newValue.desMarca || '');
                                setAtivo(newValue.status === "ATIVO");
                            }
                        }}
                        inputValue={marca}
                        onInputChange={(event, newInputValue) => {
                            setMarca(newInputValue);
                            if (!newInputValue) {
                                setMarcaSelecionada(null);
                            }
                        }}
                        options={marcasLike}
                        noOptionsText="Nenhuma marca encontrada"
                        getOptionLabel={(option) => option?.marca || ""}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar Marca Existente"
                                placeholder="Digite pelo menos 2 caracteres"
                                helperText="Busque uma marca existente para editar"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option?.id}>
                                <Box>
                                    <Typography variant="body1">{option?.marca}</Typography>
                                    {option?.desMarca && (
                                        <Typography variant="body2" color="text.secondary">
                                            {option.desMarca}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        Status: {option?.status || 'N/A'}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                    />
                </Box>

                {/* Status Ativo */}
                <Box sx={{mb: 3}}>
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={ativo}
                        onChange={(e) => setAtivo(e.target.value === 'true')}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        <option value={true}>Ativo</option>
                        <option value={false}>Inativo</option>
                    </TextField>
                </Box>

                {/* Botões */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{
                            bgcolor: "#AEB8D6",
                            color: '#142442',
                            border: "none",
                            minWidth: '120px'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{
                            bgcolor: "#AEB8D6",
                            color: '#142442',
                            minWidth: '120px'
                        }}
                    >
                        {loading
                            ? 'Salvando...'
                            : isEditing ? "Atualizar" : "Cadastrar"
                        }
                    </Button>
                </Box>
            </form>
        </Paper>
    );

    if (loading && isEditing) {
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
                        {isEditing ? 'Editar Marca' : 'Cadastrar Marca'}
                    </Typography>

                    <Box sx={{marginTop: 3}}>
                        {renderFormContent()}
                    </Box>
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

export default MarcaForm;