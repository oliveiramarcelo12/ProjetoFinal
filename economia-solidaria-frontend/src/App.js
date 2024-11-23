import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Avaliacao from "./pages/Avaliacao";
import LojaPage from  "./pages/LojaPage";
import CadastrarLoja from  "./pages/RegisterSeller";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/avaliacao" element={<Avaliacao />} />
        <Route path="/loja/:lojaId" element={<LojaPage />} />
        <Route path="/cadastrar-loja" element={<CadastrarLoja />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
