import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import Pessoa from "./pages/Pessoa";
import Estoque from "./pages/Estoque";
import Funcionario from "./pages/Funcionario";
import NovoFuncionario from "./NewPages/Funcionario";
import NovoProduto from "./NewPages/Produto";
import NovaMarca from "./pages/GerenciasProdutos/Form/Pessoa";
import Marca from "./pages/GerenciasProdutos/List/MarcaN"
import Financeiro from "./pages/Financeiro"
import Fornecedor from "./pages/Fornecedor";
import PessoaNovo from "./NewPages/Pessoa";
import ADDNovoFornecedor from "./NewPages/Fornecedor";
import ListCargos from './pages/Cargos';
import NovoCargo from './NewPages/Cargos';
import NovoCompras from './NewPages/Compras';
import ListCompras from './pages/Compras';
import EstornoList from './NewPages/Estorno';
function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={<Home/>}/>
                    <Route path="/produtos" exact element={<Estoque/>}/>
                    <Route path="/pessoa" exact element={<Pessoa/>}/>
                    <Route path="/pessoa/novo" element={<PessoaNovo/>}/>
                    <Route path="/pessoa/editar/:id" element={<PessoaNovo/>}/>
                    <Route path="/funcionarios" element={<Funcionario/>}/>
                    <Route path="/funcionarios/novo" element={<NovoFuncionario/>}/>
                    <Route path="/funcionarios/editar/:id" element={<NovoFuncionario/>}/>
                    <Route path="/estoque" element={<Estoque/>}/>
                    <Route path="/produto/novo" element={<NovoProduto/>}/>
                    <Route path="/produto/editar/:id" element={<NovoProduto/>}/>
                    <Route path="produto/marca/novo" element={<NovaMarca/>}/>
                    <Route path="produto/marca" element={<Marca/>}/>
                    <Route path="produto/marca/editar/:id" element={<NovaMarca/>}/>
                    <Route path="/financeiro" element={<Financeiro/>}/>
                    <Route path="/fornecedor/" element={<Fornecedor/>}/>
                    <Route path ="/fornecedor/novo" element={<ADDNovoFornecedor/>}/>
                    <Route path ="/fornecedor/editar/:id" element={<ADDNovoFornecedor/>}/>
                    <Route path="/cargos" element={<ListCargos/>}/>
                    <Route path="/cargos/novo" element={<NovoCargo/>}/>
                    <Route path="/cargos/editar/:id" element={<NovoCargo/>}/>
                    <Route path="/cargos/editar/:id" element={<NovoCargo/>}/>
                    <Route path="/compras" element={<ListCompras/>}/>
                    <Route path="/compras/novo" element={<NovoCompras/>}/>
                    <Route path="/compras/estorno/:id" element={<EstornoList/>}/>

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;