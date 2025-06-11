import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import Pessoa from "./pages/Pessoa";
import Produto from "./pages/Produto";
import NovaPessoa from "./NewPages/Pessoa";
import Funcionario from "./pages/Funcionario"
import NovoFuncionario from "./NewPages/Funcionario"
function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={<Home/>}/>
                    <Route path="/produtos" exact element={<Produto/>}/>
                    <Route path="/pessoa" exact element={<Pessoa/>}/>
                    <Route path="/pessoa/novo" element={<NovaPessoa/>}/>
                    <Route path="/pessoa/editar/:id" element={<NovaPessoa/>}/>
                    <Route path="/funcionarios" element={<Funcionario/>}/>
                    <Route path="/funcionarios/novo" element={<NovoFuncionario/>}/>
                    <Route path="/funcionarios/editar/:id" element={<NovoFuncionario/>}/>

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;