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
    // necessary for content to be below app bar
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

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#AEB8D6',
                    },
                }}
            >
                <DrawerHeader>
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
                                primary="Cliente"
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#142442'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem> <ListItem key="home" disablePadding>
                    <ListItemButton
                        onClick={() => navigate("/")}
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
                            onClick={() => navigate("/")}
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
                                <AttachMoneyIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Financeiro"
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
                            onClick={() => navigate("/")}
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
                            onClick={() => navigate("/")}
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
                                <InventoryIcon sx={{color: '#142442'}}/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Estoque"
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
                            onClick={() => navigate("/")}
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
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <DrawerHeader/>
            </Box>
        </Box>
    );
}