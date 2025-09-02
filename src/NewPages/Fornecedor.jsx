import React, { useState, useEffect } from "react";
import { Box, Paper, TextField, Typography, Button, Snackbar, Alert, MenuItem } from "@mui/material";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidenav from '../NSidenav';
import axios from "axios";
import { cnpj } from "cpf-cnpj-validator";
import { validateIE } from 'validations-br';

const FornecedorForm = ({ onFornecedorAdded }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    // campos
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [inscricaoEstadual, setInscricaoEstadual] = useState('');
    const [cnpjFornecedor, setCnpjFornecedor] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [tipo, setTipo] = useState('');
    const [endereco, setEndereco] = useState({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: {
            nomeCidade: '',
            estado: {
                nomeEstado: '',
                uf: ''
            }
        }
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cnpjError, setCnpjError] = useState('');

    useEffect(() => {
        const fetchFornecedorById = async (idFornecedor) => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/fornecedor/${idFornecedor}`);
                preencherFormulario(response.data);
            } catch (error) {
                console.log("Erro ao buscar fornecedores", error);
                setError('Erro ao carregar dados');
                setSnackbarSeverity('error');
                setSnackbarMessage("Erro ao carregar dados do fornecedor");
                setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            setIsEditing(true);
            fetchFornecedorById(id);
        } else if (location.state?.fornecedor) {
            setIsEditing(true);
            preencherFormulario(location.state.fornecedor);
        }
        // eslint-disable-next-line
    }, [id, location.state]);

    const preencherFormulario = (fornecedorData) => {
        setNomeFantasia(fornecedorData.nomeFantasia || '');
        setRazaoSocial(fornecedorData.razaoSocial || '');
        setInscricaoEstadual(formatIE(fornecedorData.inscricaoEstadual || ''));
        setCnpjFornecedor(formatCnpj(fornecedorData.cnpjFornecedor || ''));
        setTelefone(formatTelefone(fornecedorData.telefone || ''));
        setEmail(fornecedorData.email || '');
        setTipo(fornecedorData.tipo || '');
   // arrumar endereço, pra ser feito multiplicidade
    };

    const formatCnpj = (value) => {
        const cleanValue = (value || '').replace(/\D/g, '');
        if (cleanValue.length === 14) {
            return cnpj.format(cleanValue);
        }
        return value;
    };

    const validaCnpj = (value) => {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length === 14) {
            return cnpj.isValid(cleanValue);
        }
        return false;
    };

    const handleCnpjBlur = (e) => {
        const value = e.target.value;
        if (value && !validaCnpj(value)) {
            setCnpjError('CNPJ inválido');
        } else {
            setCnpjError('');
        }
    };

    const formatTelefone = (value) => {
        const cleanValue = (value || '').replace(/\D/g, '');
        if (cleanValue.length === 10) {
            return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1)$2-$3');
        } else if (cleanValue.length === 11) {
            return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
        }
        return value;
    };

    const formatCep = (value) => {
        const cleanValue = (value || '').replace(/\D/g, '');
        return cleanValue.replace(/(\d{5})(\d)/, '$1-$2');
    };

    const formatIE = (value) => {
        if (!value) return "";
        const cleanValue = value.replace(/\D/g, '');
        // Exemplo de formatação simples
        if (cleanValue.length <= 12) {
            return cleanValue
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1/$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return cleanValue;
    };

    const validarIE = (value) => {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length === 12) {
            return validateIE(cleanValue);
        }
        return false;
    };


    return (
        <Box>
            {/* Seu código JSX para o formulário aqui */}
        </Box>
    );
};

export default FornecedorForm;