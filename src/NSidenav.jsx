import * as React from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {useNavigate} from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {useState, useEffect} from "react"


import logo from "./logo.png";

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));


const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        backgroundColor: '#AEB8D6',


        variants: [
            {
                props: ({open}) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({open}) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

export default function MiniDrawer() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

    const navigate = useNavigate();
    const [openFinanceiro, setOpenFinanceiro] = useState(false);
    const [openProdutos, setOpenProdutos] = useState(false);
    const [openGerencias, setOpenGerencias] = useState(false);

    const closeAllSubmenus = () => {
        setOpenFinanceiro(false);
        setOpenProdutos(false);
        setOpenGerencias(false);
    };

    useEffect(() => {
        if (!open) closeAllSubmenus();
    }, [open]);
    // Substitua a função lockScroll por esta:

    const lockScroll = (lock) => {
        if (lock) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };


// E simplificar o useEffect assim:
    React.useEffect(() => {
        const algumAberto = openFinanceiro || openProdutos || openGerencias;
        lockScroll(algumAberto);
    }, [openFinanceiro, openProdutos, openGerencias]);

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#AEB8D6',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    },
                }}
            >
                <DrawerHeader
                    sx={{
                        position: openFinanceiro || openProdutos || openGerencias ? 'sticky' : 'relative',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: '#AEB8D6',
                    }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'center', flexGrow: 1}}>
                        <img src={logo} alt="Logo" style={{height: '100px', width: 'auto'}}/>
                    </Box>
                    <IconButton onClick={() => setOpen(!open)}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </DrawerHeader>
                <Divider/>
                <List>
                    <ListItem key="home" disablePadding>
                        <ListItemButton
                            onClick={() => navigate("/")}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 36, 66, 0.1)',
                                }
                            }}
                        >
                            <ListItemIcon>
                                <HomeIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Início"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="home" disablePadding>
                        <ListItemButton
                            onClick={() => navigate("/pessoa")}
                            sx={{
                                '&:hover': {}
                            }}
                        >
                            <ListItemIcon>
                                <PersonIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Clientes"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem> <ListItem key="home" disablePadding>
                    <ListItemButton
                        onClick={() => alert("Em Breve!")}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(20, 36, 66, 0.1)',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <ShoppingCartIcon sx={{color: '#142442'}}/>
                        </ListItemIcon>
                        <ListItemText
                            primary="Vendas"
                            sx={{
                                '& .MuiListItemText-primary': {
                                    color: '#142442'
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>

                </List>
                <Divider/>
                <List>
                    <ListItem key="home" disablePadding>
                        <ListItemButton
                            onClick={() => navigate("/funcionarios")}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 36, 66, 0.1)',
                                }
                            }}
                        >
                            <ListItemIcon>
                                <GroupIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Funcionarios"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                    {/* Item pai: Financeiro (toggle do submenu) */}
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => { if (open) setOpenFinanceiro(prev => !prev); }}
                            aria-controls="submenu-financeiro"
                            aria-expanded={openFinanceiro ? 'true' : 'false'}
                            sx={{
                                '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' }
                            }}
                        >
                            <ListItemIcon>
                                <AttachMoneyIcon sx={{ color: '#142442' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Financeiro"
                                sx={{ '& .MuiListItemText-primary': { color: '#142442' } }}
                            />
                            {openFinanceiro ? <ExpandLess sx={{ color: '#142442' }} /> : <ExpandMore sx={{ color: '#142442' }} />}
                        </ListItemButton>
                    </ListItem>

                    {/* Submenu: Receber / Pagar */}
                    <Collapse in={open && openFinanceiro} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding id="submenu-financeiro">
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        pl: 4,
                                        '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' }
                                    }}
                                    onClick={() => navigate('/financeiro/receber')}
                                >
                                    <ListItemText primary="Contas a receber" />
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        pl: 4,
                                        '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' }
                                    }}
                                    onClick={() => navigate('/financeiro/pagar')}
                                >
                                    <ListItemText primary="Contas a pagar" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Collapse>
                    <ListItem key="home" disablePadding>
                        <ListItemButton
                            onClick={() => navigate('/fornecedor')}

                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 36, 66, 0.1)',
                                }
                            }}
                        >
                            <ListItemIcon>
                                <BusinessIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Fornecedor"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>

                    <ListItem key="home" disablePadding>
                        <ListItemButton
                            onClick={() => navigate('/compras')}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 36, 66, 0.1)',
                                }
                            }}
                        >
                            <ListItemIcon>
                                <StoreIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Compras"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                    {/* Item pai: Produtos */}
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => { if (open) setOpenProdutos(prev => !prev); }}
                            aria-controls="submenu-produtos"
                            aria-expanded={openProdutos ? 'true' : 'false'}
                            sx={{ '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                        >
                            <ListItemIcon>
                                {/* Reuse um ícone já importado no projeto, se tiver, ou importe um como Category/Inventory */}
                                <ShoppingCartIcon sx={{ color: '#142442' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Produtos"
                                sx={{ '& .MuiListItemText-primary': { color: '#142442' } }}
                            />
                            {openProdutos ? <ExpandLess sx={{ color: '#142442' }} /> : <ExpandMore sx={{ color: '#142442' }} />}
                        </ListItemButton>
                    </ListItem>

                    <Collapse in={openProdutos} timeout={300} unmountOnExit>
                        <List component="div" disablePadding id="submenu-produtos">
                            {/* Link direto para lista/cadastro de produtos */}
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{ pl: 4, '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                                    onClick={() => navigate('/produtos')}
                                >
                                    <ListItemText primary="Produto" />
                                </ListItemButton>
                            </ListItem>

                            {/* Segundo nível: Gerências */}
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => setOpenGerencias((prev) => !prev)}
                                    aria-controls="submenu-gerencias"
                                    aria-expanded={openGerencias ? 'true' : 'false'}
                                    sx={{ pl: 4, '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                                >
                                    <ListItemText primary="Gerências" />
                                    {openGerencias ? <ExpandLess sx={{ color: '#142442' }} /> : <ExpandMore sx={{ color: '#142442' }} />}
                                </ListItemButton>
                            </ListItem>

                            <Collapse in={openGerencias} timeout={300} unmountOnExit>
                                <List component="div" disablePadding id="submenu-gerencias">
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            sx={{ pl: 6, '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                                            onClick={() => navigate('/produtos/cores')}
                                        >
                                            <ListItemText primary="Cores" />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem disablePadding>
                                        <ListItemButton
                                            sx={{ pl: 6, '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                                            onClick={() => navigate('/produtos/tamanhos')}
                                        >
                                            <ListItemText primary="Tamanhos" />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem disablePadding>
                                        <ListItemButton
                                            sx={{ pl: 6, '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                                            onClick={() => navigate('/produtos/tipos')}
                                        >
                                            <ListItemText primary="Tipos" />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem disablePadding>
                                        <ListItemButton
                                            sx={{ pl: 6, '&:hover': { backgroundColor: 'rgba(20, 36, 66, 0.1)' } }}
                                            onClick={() => navigate('/produto/marca')}
                                        >
                                            <ListItemText primary="Marcas" />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </Collapse>
                        </List>
                    </Collapse>


                </List>
                <Divider/>
                <List>
                    <ListItem key="home" disablePadding>
                        <ListItemButton
                            onClick={() => alert("Em Breve!")}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 36, 66, 0.1)',
                                }
                            }}
                        >
                            <ListItemIcon>
                                <ContentPasteIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Relatórios"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>

                </List>
            </Drawer>
            <Box component="main" sx={{flexGrow: 1, p: 3, marginLeft: "-40px"}}>
            </Box>
        </Box>
    );
}