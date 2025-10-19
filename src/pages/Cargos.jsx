import React, {useEffect, useState} from 'react';
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
    List,
    ListItem,
    ListItemText,
    Divider,
    Grid,
    Card,
    CardContent,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxIcon from '@mui/icons-material/AddBox';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import InventoryIcon from '@mui/icons-material/Inventory';
import StyleIcon from '@mui/icons-material/Style';
import PaletteIcon from '@mui/icons-material/Palette';
import StraightenIcon from '@mui/icons-material/Straighten';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Sidenav from "../NSidenav";

const CargoList = () => {
    const [cargos, setCargos] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Estados do Modal
    const [openModal, setOpenModal] = useState(false);
    const [cargoSelecionado, setCargoSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para filtrar os produtos baseado no termo de pesquisa
    const filteredCargos = cargos.filter((cargo) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            cargo.nomeCargo?.toLowerCase().includes(searchLower));
    });

    const fetchCargos = async () => {
        try {
            const response = await axios.get("http://localhost:8080/cargos");
            setCargos(response.data);
        } catch (error) {
            console.error('Erro ao carregar:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Erro ao carregar a lista');
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        fetchCargos();
    }, []);

    const handleEditar = (cargo) => {
        navigate(`/cargos/editar/${cargo.idCargo}`);
    };

    const handleExcluir = async (idCargo) => {
        if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
            try {
                await axios.delete(`http://localhost:8080/cargos/${idCargo}`);
                await fetchCargos();
                setSnackbarSeverity('success');
                setSnackbarMessage('Cargo excluído com sucesso');
                setOpenSnackbar(true);
            } catch (error) {
                console.error('Erro ao excluir:', error);
                setSnackbarSeverity('error');
                setSnackbarMessage('Erro ao excluir');
                setOpenSnackbar(true);
            }
        }
    };

    const handleVerDetalhes = (cargo) => {
        setCargoSelecionado(cargo);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCargoSelecionado(null);
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


    // Estilo do Modal
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '800px',
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
            <Box sx={{display: 'flex'}}>
                <Sidenav/>
                <Box sx={{flexGrow: 1, p: 3}}>
                    <Typography variant="h4" gutterBottom>
                        Lista de Cargos
                    </Typography>

                    {/* Barra de Ações */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        gap: 2
                    }}>
                        <Box sx={{display: 'flex', gap: 2}}>
                            <Button
                                startIcon={<AddBoxIcon/>}
                                onClick={() => navigate("/cargos/novo")}
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
                                Novo Cargo
                            </Button>
                        </Box>

                        {/* Campo de Pesquisa */}
                        <TextField
                            placeholder="Buscar por cargo..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
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

                    {/* Tabela de Produtos */}
                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>ID</strong></TableCell>
                                        <TableCell><strong>Nome do Cargo</strong></TableCell>
                                        <TableCell><strong>Salário Bruto</strong></TableCell>
                                        <TableCell><strong>Desconto</strong></TableCell>
                                        <TableCell><strong>Salário Liquido</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCargos
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((cargo) => {
                                            return (
                                                <TableRow key={cargo.idCargo} hover>
                                                    <TableCell>{cargo.idCargo}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {cargo.nomeCargo}
                                                        </Typography>
                                                    </TableCell>
                                                    {/* Salário Bruto */}
                                                    <TableCell>
                                                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                                                            {cargo.salarioBruto
                                                                ? cargo.salarioBruto.toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                })
                                                                : 'R$ 0,00'
                                                            }
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Desconto */}
                                                    <TableCell>
                                                        <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                                                            {cargo.desconto
                                                                ? `${parseFloat(cargo.desconto).toFixed(1)}%`
                                                                : '0%'
                                                            }
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Salário Líquido */}
                                                    <TableCell>
                                                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                            {cargo.salarioLiquido
                                                                ? cargo.salarioLiquido.toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                })
                                                                : 'R$ 0,00'
                                                            }
                                                        </Typography>
                                                    </TableCell>


                                                    <TableCell>
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight="bold"
                                                            color={cargo.status ? "success.main" : "error.main"}
                                                        >
                                                            {cargo.status ? "Ativo" : "Inativo"}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>

                                                        <Box sx={{display: 'flex', gap: 1}}>

                                                            <Tooltip title="Editar Produto">
                                                                <IconButton
                                                                    onClick={() => handleEditar(cargo)}
                                                                    color="primary"
                                                                    size="small"
                                                                >
                                                                    <EditIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Excluir Produto">
                                                                <IconButton
                                                                    onClick={() => handleExcluir(cargo.idCargo)}
                                                                    color="error"
                                                                    size="small"
                                                                >
                                                                    <DeleteIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredCargos.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Linhas por página:"
                            labelDisplayedRows={({from, to, count}) =>
                                `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
                            }
                        />
                    </Paper>


                    {/* Snackbar para Mensagens */}
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={4000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    >
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width: '100%'}}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </>
    );
};

export default CargoList;
