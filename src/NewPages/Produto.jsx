import React, {useState, useEffect} from 'react';
import {Box, Paper, TextField, Typography, Button, Snackbar, Alert, Autocomplete, MenuItem} from '@mui/material';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import Sidenav from "../NSidenav";
import axios from "axios";

const ProdutoForm = ({onProdutoAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário de produto
    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [precoCusto, setPrecoCusto] = useState('');
    const [precoVenda, setPrecoVenda] = useState('');
    const [estoque, setEstoque] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [tipoRoupa, setTipoRoupa] = useState('');

    // Estados para o Autocomplete de Produtos
    const [buscaProduto, setBuscaProduto] = useState('');
    const [produtosLike, setProdutosLike] = useState([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    // Estados para o Autocomplete de Marcas
    const [buscaMarca, setBuscaMarca] = useState('');
    const [marcasLike, setMarcasLike] = useState([]);
    const [marcaSelecionada, setMarcaSelecionada] = useState(null);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Verificar se está editando quando o componente monta
    useEffect(() => {
        const fetchProdutoById = async (idProduto) => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/produto/${idProduto}`);
                preencherFormulario(response.data);
            } catch (error) {
                console.error('Erro ao buscar produto:', error);
                setError('Erro ao carregar dados do produto');
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao carregar dados do produto');
                setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            setIsEditing(true);
            fetchProdutoById(id);
        } else if (location.state?.produto) {
            setIsEditing(true);
            preencherFormulario(location.state.produto);
        }
    }, [id, location.state]);

    // Buscar produtos para o Autocomplete
    useEffect(() => {
        const delay = setTimeout(() => {
            if (buscaProduto && buscaProduto.length >= 2) {
                axios.get(`http://localhost:8080/produto/likeproduto/${buscaProduto}`)
                    .then((response) => setProdutosLike(response.data))
                    .catch((error) => console.error("Erro ao buscar produtos:", error));
            } else {
                setProdutosLike([]);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [buscaProduto]);

    // Buscar marcas para o Autocomplete
    useEffect(() => {
        const delay = setTimeout(() => {
            if (buscaMarca && buscaMarca.length >= 2) {
                axios.get(`http://localhost:8080/marca/likemarca/${buscaMarca}`)
                    .then((response) => setMarcasLike(response.data))
                    .catch((error) => console.error("Erro ao buscar marcas:", error));
            } else {
                setMarcasLike([]);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [buscaMarca]);

    const preencherFormulario = (produtoData) => {
        setNome(produtoData.nome || '');
        setCodigo(produtoData.codigo || '');
        setPrecoCusto(produtoData.precoCusto || '');
        setPrecoVenda(produtoData.precoVenda || '');
        setEstoque(produtoData.estoque || '');
        setTamanho(produtoData.tamanho || '');
        setTipoRoupa(produtoData.tipoRoupa || '');
        setProdutoSelecionado(produtoData);
        setBuscaProduto(produtoData.nome || '');

        // Se o produto tem marca associada
        if (produtoData.marca) {
            setMarcaSelecionada(produtoData.marca);
            setBuscaMarca(produtoData.marca.marca || produtoData.marca.nome || '');
        }
    };

    const validarFormulario = () => {
        if (!nome.trim()) {
            setError('Nome é obrigatório');
            return false;
        }
        if (!codigo.trim()) {
            setError('Código é obrigatório');
            return false;
        }
        if (!precoCusto || parseFloat(precoCusto) <= 0) {
            setError('Preço de custo é obrigatório e deve ser maior que zero');
            return false;
        }
        if (!precoVenda || parseFloat(precoVenda) <= 0) {
            setError('Preço de venda é obrigatório e deve ser maior que zero');
            return false;
        }
        if (!estoque || parseInt(estoque) < 0) {
            setError('Estoque é obrigatório e deve ser maior ou igual a zero');
            return false;
        }
        if (!tamanho.trim()) {
            setError('Tamanho é obrigatório');
            return false;
        }
        if (!tipoRoupa.trim()) {
            setError('Tipo de roupa é obrigatório');
            return false;
        }
        if (nome.trim().length < 2) {
            setError('Nome deve ter pelo menos 2 caracteres');
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

        const produtoData = {
            nome: nome.trim(),
            codigo: codigo.trim(),
            precoCusto: parseFloat(precoCusto),
            precoVenda: parseFloat(precoVenda),
            estoque: parseInt(estoque),
            tamanho: tamanho.trim(),
            tipoRoupa: tipoRoupa.trim(),
            // CORREÇÃO: usar idMarca em vez de id
            marca: marcaSelecionada ? { idMarca: marcaSelecionada.idMarca } : null
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:8080/produto/${id}`, produtoData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Produto atualizado com sucesso');
            } else {
                await axios.post("http://localhost:8080/produto", produtoData);
                setSnackbarSeverity('success');
                setSnackbarMessage('Produto cadastrado com sucesso');
            }

            setOpenSnackbar(true);

            if (onProdutoAdded) {
                onProdutoAdded();
            }

            setTimeout(() => {
                navigate('/estoque');
            }, 500);

        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            setSnackbarSeverity('error');
            setSnackbarMessage(isEditing ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/estoque');
    };

    // Renderizar conteúdo do formulário
    const renderFormContent = () => (
        <Paper sx={{p: 3, mb: 2}}>
            <form onSubmit={handleSubmit}>
                <Box sx={{mb: 3}}>

                </Box>

                {/* Nome */}
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        error={!!error && !nome.trim()}
                        helperText={error && !nome.trim() ? 'Nome é obrigatório' : ''}
                    />
                </Box>

                {/* Código */}
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label="Código"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        required
                        error={!!error && !codigo.trim()}
                        helperText={error && !codigo.trim() ? 'Código é obrigatório' : 'Código único do produto'}
                    />
                </Box>

                {/* Preços */}
                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                    <TextField
                        fullWidth
                        label="Preço de Custo"
                        type="number"
                        value={precoCusto}
                        onChange={(e) => setPrecoCusto(e.target.value)}
                        required
                        inputProps={{ step: "0.01", min: "0" }}
                        error={!!error && (!precoCusto || parseFloat(precoCusto) <= 0)}
                        helperText="R$ 0,00"
                    />
                    <TextField
                        fullWidth
                        label="Preço de Venda"
                        type="number"
                        value={precoVenda}
                        onChange={(e) => setPrecoVenda(e.target.value)}
                        required
                        inputProps={{ step: "0.01", min: "0" }}
                        error={!!error && (!precoVenda || parseFloat(precoVenda) <= 0)}
                        helperText="R$ 0,00"
                    />
                </Box>

                {/* Estoque e Tamanho */}
                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                    <TextField
                        fullWidth
                        label="Estoque"
                        type="number"
                        value={estoque}
                        onChange={(e) => setEstoque(e.target.value)}
                        required
                        inputProps={{ min: "0" }}
                        error={!!error && (!estoque || parseInt(estoque) < 0)}
                        helperText="Quantidade em estoque"
                    />
                    <TextField
                        fullWidth
                        label="Tamanho"
                        value={tamanho}
                        onChange={(e) => setTamanho(e.target.value)}
                        required
                        error={!!error && !tamanho.trim()}
                        helperText="P, M, G, GG, etc."
                    />
                </Box>

                {/* Tipo de Roupa */}
                <Box sx={{mb: 2}}>
                    <TextField
                        select
                        fullWidth
                        label="Tipo de Roupa"
                        value={tipoRoupa}
                        onChange={(e) => setTipoRoupa(e.target.value)}
                        required
                        error={!!error && !tipoRoupa.trim()}
                    >
                        <MenuItem value="TIPO_CAMISETA">Camiseta</MenuItem>
                        <MenuItem value="TIPO_CALCA">Calça</MenuItem>
                        <MenuItem value="TIPO_VESTIDO">Vestido</MenuItem>
                        <MenuItem value="TIPO_MOLETOM">Blusa</MenuItem>
                        <MenuItem value="SAIA">Saia</MenuItem>
                        <MenuItem value="SHORTS">Shorts</MenuItem>
                        <MenuItem value="JAQUETA">Jaqueta</MenuItem>
                        <MenuItem value="OUTROS">Outros</MenuItem>
                    </TextField>
                </Box>

                {/* Autocomplete para marca */}
                <Box sx={{mb: 2}}>
                    <Autocomplete
                        value={marcaSelecionada}
                        onChange={(event, newValue) => {
                            setMarcaSelecionada(newValue);
                        }}
                        inputValue={buscaMarca}
                        onInputChange={(event, newInputValue) => {
                            setBuscaMarca(newInputValue);
                            if (!newInputValue) {
                                setMarcaSelecionada(null);
                            }
                        }}
                        options={marcasLike}
                        noOptionsText="Nenhuma marca encontrada"
                        getOptionLabel={(option) => option?.marca || option?.nome || ""}
                        // CORREÇÃO: usar idMarca para comparação
                        isOptionEqualToValue={(option, value) => option?.idMarca === value?.idMarca}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Marca"
                                placeholder="Digite pelo menos 2 caracteres"
                                helperText="Selecione a marca do produto"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                        renderOption={(props, option) => (
                            // CORREÇÃO: usar idMarca como key
                            <li {...props} key={option?.idMarca}>
                                <Box>
                                    <Typography variant="body1">{option?.marca || option?.nome}</Typography>
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
                        {isEditing ? 'Editar Produto' : 'Cadastrar Produto'}
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

export default ProdutoForm;