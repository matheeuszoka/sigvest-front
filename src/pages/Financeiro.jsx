import React, {useState, useEffect} from 'react';
import {Box,Paper, TextField, Typography, Button, Snackbar,Alert } from '@mui/material';
import {useNavigate, useParams,useLocation} from 'react-router-dom';
import sidnav from "../NSidenav";
import axios from "axios";

const FinanceiroForm = ({onFinanceiroAdded}) => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const [editando, setEditando] = useState(false);




}