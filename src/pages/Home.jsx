import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Stack,
    Avatar,
    Paper,
    Fade,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    People,
    Inventory,
    Business,
    AttachMoney,
    ShoppingCart,
    Refresh,
    Assessment,
    MonetizationOn,
    AccountBalance,
    Receipt,
    LocalShipping,
    GroupAdd,
    AddShoppingCart,
    Timeline,
    BarChart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidenav from "../NSidenav";
import axios from 'axios';

export default function Dashboard() {
    const navigate = useNavigate();
    const [dados, setDados] = useState({
        vendas: {
            totalMes: 0,
            totalAno: 0,
            metaMes: 50000,
            crescimento: 0,
            vendasRecentes: []
        },
        estoque: {
            totalProdutos: 0,
            valorEstoque: 0,
            produtosBaixo: 0,
            produtosCriticos: 0
        },
        funcionarios: {
            total: 0,
            ativos: 0,
            departamentos: []
        },
        fornecedores: {
            total: 0,
            ativos: 0,
            pendencias: 0
        },
        financeiro: {
            saldoAtual: 0,
            receitaMes: 0,
            despesaMes: 0,
            lucroMes: 0,
            fluxoCaixa: []
        }
    });

    const [loading, setLoading] = useState(true);

    const carregarDados = async () => {
        try {
            setLoading(true);

            // Simulação de dados - substitua pelas suas APIs reais
            const [produtosRes, funcionariosRes, clientesRes, fornecedoresRes] = await Promise.all([
                axios.get('http://localhost:8080/produto'),
                axios.get('http://localhost:8080/pessoa/atrib/funcionario'),
                axios.get('http://localhost:8080/pessoa/atrib/cliente'),
                axios.get('http://localhost:8080/fornecedor')
            ]);

            // Processamento dos dados reais
            const produtos = produtosRes.data;
            let valorEstoque = 0;
            let produtosBaixo = 0;

            produtos.forEach(produto => {
                if (produto.derivacoes) {
                    produto.derivacoes.forEach(derivacao => {
                        const valor = (derivacao.precoCusto || 0) * (derivacao.estoque || 0);
                        valorEstoque += valor;
                        if (derivacao.estoque < 10) produtosBaixo++;
                    });
                }
            });

            // Simular dados de vendas e financeiro
            const vendasMes = Math.floor(Math.random() * 80000) + 20000;
            const receitaMes = vendasMes * 1.2;
            const despesaMes = receitaMes * 0.65;

            setDados({
                vendas: {
                    totalMes: vendasMes,
                    totalAno: vendasMes * 8.5,
                    metaMes: 50000,
                    crescimento: 12.5,
                    vendasRecentes: [
                        { produto: 'Camiseta Polo', valor: 89.90, cliente: 'João Silva' },
                        { produto: 'Calça Jeans', valor: 159.90, cliente: 'Maria Santos' },
                        { produto: 'Tênis Sport', valor: 299.90, cliente: 'Pedro Costa' }
                    ]
                },
                estoque: {
                    totalProdutos: produtos.length,
                    valorEstoque: valorEstoque,
                    produtosBaixo: produtosBaixo,
                    produtosCriticos: Math.floor(produtosBaixo * 0.3)
                },
                funcionarios: {
                    total: funcionariosRes.data.length,
                    ativos: funcionariosRes.data.length - 1,
                    departamentos: [
                        { nome: 'Vendas', count: 4 },
                        { nome: 'Estoque', count: 2 },
                        { nome: 'Administrativo', count: 3 }
                    ]
                },
                fornecedores: {
                    total: fornecedoresRes.data.length,
                    ativos: fornecedoresRes.data.length - 1,
                    pendencias: 2
                },
                financeiro: {
                    saldoAtual: 125890.50,
                    receitaMes: receitaMes,
                    despesaMes: despesaMes,
                    lucroMes: receitaMes - despesaMes,
                    fluxoCaixa: [
                        { mes: 'Jan', entrada: 45000, saida: 32000 },
                        { mes: 'Fev', entrada: 52000, saida: 38000 },
                        { mes: 'Mar', entrada: 48000, saida: 35000 }
                    ]
                }
            });

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    // Card de Métrica Principal
    const MetricCard = ({ titulo, valor, icone, cor, meta, trend, onClick, subtitle }) => {
        const porcentagem = meta ? (valor / meta * 100) : null;

        return (
            <Card
                onClick={onClick}
                sx={{
                    height: 180,
                    cursor: onClick ? 'pointer' : 'default',
                    background: `linear-gradient(135deg, ${cor}15, ${cor}05)`,
                    border: `1px solid ${cor}25`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': onClick ? {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 30px ${cor}20`
                    } : {}
                }}
            >
                <CardContent sx={{ height: '100%', p: 3 }}>
                    <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    {titulo}
                                </Typography>
                                <Typography variant="h4" fontWeight="800" sx={{ color: cor, mt: 0.5 }}>
                                    {loading ? '...' : valor}
                                </Typography>
                                {subtitle && (
                                    <Typography variant="caption" color="text.secondary">
                                        {subtitle}
                                    </Typography>
                                )}
                            </Box>
                            <Avatar sx={{ bgcolor: `${cor}20`, color: cor, width: 56, height: 56 }}>
                                {icone}
                            </Avatar>
                        </Stack>

                        {trend && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {trend > 0 ? (
                                    <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />
                                ) : (
                                    <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />
                                )}
                                <Typography
                                    variant="caption"
                                    color={trend > 0 ? 'success.main' : 'error.main'}
                                    fontWeight="600"
                                >
                                    {Math.abs(trend)}% este mês
                                </Typography>
                            </Stack>
                        )}

                        {porcentagem && (
                            <Box>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Meta: {typeof meta === 'number' ? meta.toLocaleString() : meta}
                                    </Typography>
                                    <Typography variant="caption" color={cor} fontWeight="600">
                                        {porcentagem.toFixed(0)}%
                                    </Typography>
                                </Stack>
                                <Box sx={{
                                    width: '100%',
                                    bgcolor: `${cor}10`,
                                    borderRadius: 1,
                                    height: 6,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        width: `${Math.min(porcentagem, 100)}%`,
                                        bgcolor: cor,
                                        height: '100%',
                                        borderRadius: 1,
                                        transition: 'width 1s ease'
                                    }} />
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidenav />
            <Box sx={{
                flexGrow: 1,
                p: { xs: 2, md: 4 },
                bgcolor: '#f8fafc',
                overflow: 'auto'
            }}>
                {/* Header */}
                <Paper
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #142442 0%, #AEB8D6 100%)',
                        color: 'white'
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h3" fontWeight="800">
                                Dashboard de Gestão
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Controle completo do seu negócio • {new Date().toLocaleDateString('pt-BR')}
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={carregarDados}
                            disabled={loading}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
                        </IconButton>
                    </Stack>
                </Paper>

                <Grid container spacing={3}>
                    {/* Seção de Vendas */}
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="700" sx={{ mb: 2, color: '#142442' }}>
                            💰 Vendas & Receita
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Vendas do Mês"
                                    valor={`R$ ${dados.vendas.totalMes.toLocaleString()}`}
                                    icone={<ShoppingCart />}
                                    cor="#10b981"
                                    meta={dados.vendas.metaMes}
                                    trend={dados.vendas.crescimento}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Vendas do Ano"
                                    valor={`R$ ${Math.floor(dados.vendas.totalAno).toLocaleString()}`}
                                    icone={<MonetizationOn />}
                                    cor="#059669"
                                    subtitle="Acumulado 2025"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Card sx={{ height: 180, borderRadius: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="700" gutterBottom>
                                            Vendas Recentes
                                        </Typography>
                                        <Stack spacing={1}>
                                            {dados.vendas.vendasRecentes.map((venda, index) => (
                                                <Box key={index} sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    bgcolor: '#f0f9ff',
                                                    borderRadius: 1
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="600">
                                                            {venda.produto}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {venda.cliente}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`R$ ${venda.valor}`}
                                                        color="success"
                                                        size="small"
                                                    />
                                                </Box>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Seção de Estoque */}
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="700" sx={{ mb: 2, mt: 2, color: '#142442' }}>
                            📦 Controle de Estoque
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Total de Produtos"
                                    valor={dados.estoque.totalProdutos}
                                    icone={<Inventory />}
                                    cor="#3b82f6"
                                    onClick={() => navigate('/estoque')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Valor do Estoque"
                                    valor={`R$ ${Math.floor(dados.estoque.valorEstoque).toLocaleString()}`}
                                    icone={<Assessment />}
                                    cor="#1d4ed8"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Estoque Baixo"
                                    valor={dados.estoque.produtosBaixo}
                                    icone={<TrendingDown />}
                                    cor="#f59e0b"
                                    subtitle="Produtos < 10 un."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Produtos Críticos"
                                    valor={dados.estoque.produtosCriticos}
                                    icone={<TrendingDown />}
                                    cor="#ef4444"
                                    subtitle="Estoque zerado"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Seção de Recursos Humanos */}
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="700" sx={{ mb: 2, mt: 2, color: '#142442' }}>
                            👥 Recursos Humanos
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <MetricCard
                                    titulo="Total de Funcionários"
                                    valor={dados.funcionarios.total}
                                    icone={<People />}
                                    cor="#8b5cf6"
                                    onClick={() => navigate('/funcionarios')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <MetricCard
                                    titulo="Funcionários Ativos"
                                    valor={dados.funcionarios.ativos}
                                    icone={<GroupAdd />}
                                    cor="#7c3aed"
                                    subtitle="Em atividade"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card sx={{ height: 180, borderRadius: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="700" gutterBottom>
                                            Por Departamento
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {dados.funcionarios.departamentos.map((dept, index) => (
                                                <Stack key={index} direction="row" justifyContent="space-between">
                                                    <Typography variant="body2">{dept.nome}</Typography>
                                                    <Chip
                                                        label={dept.count}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Seção de Fornecedores */}
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="700" sx={{ mb: 2, mt: 2, color: '#142442' }}>
                            🏭 Fornecedores
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <MetricCard
                                    titulo="Total de Fornecedores"
                                    valor={dados.fornecedores.total}
                                    icone={<Business />}
                                    cor="#f59e0b"
                                    onClick={() => navigate('/fornecedor')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <MetricCard
                                    titulo="Fornecedores Ativos"
                                    valor={dados.fornecedores.ativos}
                                    icone={<LocalShipping />}
                                    cor="#d97706"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <MetricCard
                                    titulo="Pendências"
                                    valor={dados.fornecedores.pendencias}
                                    icone={<Receipt />}
                                    cor="#ef4444"
                                    subtitle="Pagamentos pendentes"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Seção Financeira */}
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="700" sx={{ mb: 2, mt: 2, color: '#142442' }}>
                            💳 Financeiro
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Saldo Atual"
                                    valor={`R$ ${dados.financeiro.saldoAtual.toLocaleString()}`}
                                    icone={<AccountBalance />}
                                    cor="#059669"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Receita do Mês"
                                    valor={`R$ ${Math.floor(dados.financeiro.receitaMes).toLocaleString()}`}
                                    icone={<TrendingUp />}
                                    cor="#10b981"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Despesas do Mês"
                                    valor={`R$ ${Math.floor(dados.financeiro.despesaMes).toLocaleString()}`}
                                    icone={<TrendingDown />}
                                    cor="#ef4444"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard
                                    titulo="Lucro Líquido"
                                    valor={`R$ ${Math.floor(dados.financeiro.lucroMes).toLocaleString()}`}
                                    icone={<BarChart />}
                                    cor={dados.financeiro.lucroMes > 0 ? '#059669' : '#ef4444'}
                                    subtitle="Mês atual"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Ações Rápidas */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 3, mt: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="700" gutterBottom>
                                    🚀 Ações Rápidas
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<AddShoppingCart />}
                                            onClick={() => navigate('/produto/novo')}
                                            sx={{
                                                py: 1.5,
                                                bgcolor: '#142442',
                                                '&:hover': { bgcolor: '#AEB8D6', color: '#142442' }
                                            }}
                                        >
                                            Novo Produto
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<People />}
                                            onClick={() => navigate('/pessoa/novo')}
                                            sx={{ py: 1.5, borderColor: '#142442', color: '#142442' }}
                                        >
                                            Novo Cliente
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<GroupAdd />}
                                            onClick={() => navigate('/funcionarios/novo')}
                                            sx={{ py: 1.5, borderColor: '#142442', color: '#142442' }}
                                        >
                                            Novo Funcionário
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<Business />}
                                            onClick={() => navigate('/fornecedor/novo')}
                                            sx={{ py: 1.5, borderColor: '#142442', color: '#142442' }}
                                        >
                                            Novo Fornecedor
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<Timeline />}
                                            onClick={() => navigate('/relatorios')}
                                            sx={{ py: 1.5, borderColor: '#142442', color: '#142442' }}
                                        >
                                            Relatórios
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
