import React, { useState, useEffect } from "react";
import {Box, Paper, Table, TableBody,TableContainer,TableCell,TableHead,TablePagination,TableRow,IconButton,Snackbar,Alert} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from 'axios';
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import Sidenav from "../NSidenav";


const FinanceiroList = () => {
    const [financeiros, setFinanceiros] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackMessage, setSnackMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState(false);

    const navigate = useNavigate();

    const fetchFinanceiros = async () => {
        try{
            const response = await axios.get("http://localhost:8080/financeiro");
            setFinanceiros(response.data);
        }catch (error){
            console.log("Erro Ao carregar Financeiro", error);
            setSnackbarSeverity('error');
            setSnackMessage("Erro ao carregar a lista de financeiros");
            setOpenSnackbar(true);
        }
    };
    useEffect(()=> {fetchFinanceiros();}, []);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event, newPage) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    }
return (
    <>
    <Box sx={{display: 'flex'}}>
        <Sidenav/>

    </Box>

    </>
)

};
export default FinanceiroList;