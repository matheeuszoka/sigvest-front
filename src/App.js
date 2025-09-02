import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import Pessoa from "./pages/Pessoa";
import Estoque from "./pages/Estoque";
import NovaPessoa from "./NewPages/Pessoa";
import Funcionario from "./pages/Funcionario";
import NovoFuncionario from "./NewPages/Funcionario";
import NovoProduto from "./NewPages/Produto";
import NovaMarca from "./NewPages/Marca";
import Marca from "./pages/Marca"
import Financeiro from "./pages/Financeiro"
import Fornecedor from "./pages/Fornecedor";
import novoFornecedor from "./NewPages/Fornecedor";
import Teste from "./NewPages/PessoaNovo";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={<Home/>}/>
                    <Route path="/produtos" exact element={<Estoque/>}/>
                    <Route path="/pessoa" exact element={<Pessoa/>}/>
                    <Route path="/pessoa/novo" element={<Teste/>}/>
                    <Route path="/pessoa/editar/:id" element={<Teste/>}/>
                    <Route path="/funcionarios" element={<Funcionario/>}/>
                    <Route path="/funcionarios/novo" element={<NovoFuncionario/>}/>
                    <Route path="/funcionarios/editar/:id" element={<NovoFuncionario/>}/>
                    <Route path="/estoque" element={<Estoque/>}/>
                    <Route path="/produto/novo" element={<NovoProduto/>}/>
                    <Route path="/produto/editar/:id" element={<NovoProduto/>}/>
                    <Route path="/marca/novo" element={<NovaMarca/>}/>
                    <Route path="/marca" element={<Marca/>}/>
                    <Route path="/marca/editar/:id" element={<NovaMarca/>}/>
                    <Route path="/financeiro" element={<Financeiro/>}/>
                    <Route path="/fornecedor/" element={<Fornecedor/>}/>
                    <Route path ="/fornecedor/novo" element={<novoFornecedor/>}/>
                    <Route path ="/fornecedor/novo" element={<novoFornecedor/>}/>
                    <Route path ="/pessoa/novoTeste" element={<Teste/>}/>


                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;