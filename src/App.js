import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import Pessoa from "./pages/Pessoa";
import Produto from "./pages/Produto";
import NovaPessoa from "./Pessoa/Pessoa";

function App() {
  return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/" exact element={<Home/>}/>
            <Route path="/produtos" exact element={<Produto/>}/>
            <Route path="/pessoa" exact element={<Pessoa/>}/> {/* Lista de pessoas */}
            <Route path="/pessoa/novo" element={<NovaPessoa/>}/> {/* Nova pessoa */}
            <Route path="/pessoa/editar/:id" element={<NovaPessoa/>}/> {/* Editar pessoa */}
          </Routes>
        </BrowserRouter>
      </>
  )
}

export default App;