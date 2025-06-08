import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import logo from "./logo.png";
import {useNavigate} from "react-router-dom";

const drawerWidth = 240;

export default function PermanentDrawerLeft() {
    const navigate = useNavigate();

    return (
        <Box sx={{
            display: 'flex',
            bgcolor: "#C9C8CF",
            top: 0,
            left: 0

        }}>
            <CssBaseline/>
            <style jsx global>{`
                html, body, #root {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    background-color: #C9C8CF !important;
                }
            `}</style>

            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#AEB8D6',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar>
                    <Box sx={{display: 'flex', justifyContent: 'center', flexGrow: 1}}>
                        <img src={logo} alt="Logo" style={{height: '100px', width: 'auto'}}/>
                    </Box>
                </Toolbar>
                <Divider sx={{borderColor: '#142442'}}/>
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
                            primary="Home"
                            sx={{
                                '& .MuiListItemText-primary': {
                                    color: '#142442'
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>
                <ListItem key="cliente" disablePadding>
                    <ListItemButton
                        onClick={() => navigate("/pessoa")}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(20, 36, 66, 0.1)',
                            }
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
                </ListItem>
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
                            <ShoppingCartIcon sx={{color: '#142442'}}/>
                        </ListItemIcon>
                        <ListItemText
                            primary="Venda"
                            sx={{
                                '& .MuiListItemText-primary': {
                                    color: '#142442'
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>
                <Divider sx={{borderColor: '#142442'}}/>
            </Drawer>
            <Box
                component="main"
                sx={{flexGrow: 1, bgcolor: '#C9C8CF', p: 3}}
            >
                <Toolbar/>
            </Box>
        </Box>
    );
}