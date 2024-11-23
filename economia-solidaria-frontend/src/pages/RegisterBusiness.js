import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/registerbusiness.css";

const RegisterBusiness = () => {
  // Estado do formulário
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [images, setImages] = useState([]);
  const [cnDoc, setCnDoc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Função de envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    let errorMessage = "";
    
    // Validação dos campos obrigatórios
    if (!businessName || !businessDescription || !category || !address || !phone || !email) {
      errorMessage += "Por favor, preencha todos os campos obrigatórios.\n";
    }

    // Validação das imagens e do comprovante
    if (images.length === 0 || !cnDoc) {
      errorMessage += "Por favor, carregue imagens do seu negócio e o comprovante do Simples Nacional.\n";
    }

    // Validação do aceite dos termos
    if (!termsAccepted) {
      errorMessage += "É necessário aceitar os Termos e Condições.\n";
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    alert("Cadastro de negócio realizado com sucesso!");
    navigate("/home");
  };

  // Função de upload de imagens
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError("Você pode enviar no máximo 5 imagens do seu negócio.");
    } else {
      setImages((prevImages) => [...prevImages, ...files]);
    }
  };

  // Função para remover imagem
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="register-business-page">
      <form className="register-business-form" onSubmit={handleSubmit}>
        {/* Título do formulário */}
        <h2>Cadastro de Negócio</h2>

        {/* Campos do formulário */}
        <input
          type="text"
          placeholder="Nome do Negócio"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
        <textarea
          placeholder="Descreva o seu negócio"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Selecione a Categoria</option>
          <option value="restaurante">Restaurante</option>
          <option value="loja">Loja</option>
          <option value="serviço">Serviço</option>
          <option value="outro">Outro</option>
        </select>
        <input
          type="text"
          placeholder="Endereço Completo"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Telefone de Contato"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail para Contato"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Horários de Funcionamento"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
        />

        {/* Upload de imagens */}
        <div className="upload-instructions">
          <label htmlFor="businessImages">
            Carregue imagens do seu negócio (ex.: fachada, interior, ambiente, etc.)
          </label>
          <input
            type="file"
            id="businessImages"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          <p className="upload-info">Você pode enviar até 5 imagens. Formatos aceitos: PNG, JPG ou JPEG.</p>
          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <div className="image-wrapper" key={index}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`preview ${index}`}
                  />
                  <button className="remove-image" onClick={() => removeImage(index)}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload do comprovante do Simples Nacional */}
        <div className="upload-instructions">
          <label htmlFor="cnDoc">Comprovante do Simples Nacional</label>
          <input
            type="file"
            id="cnDoc"
            accept="application/pdf"
            onChange={(e) => setCnDoc(e.target.files[0])}
            required
          />
        </div>

        {/* Exibição de erros */}
        {error && <div className="error">{error}</div>}

        {/* Termos e condições */}
        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            aria-label="Aceitar os termos e condições"
          />
          <label htmlFor="terms">
            Aceito os{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">
              Termos e Condições
            </a>
          </label>
        </div>

        {/* Botão de envio */}
        <button type="submit" disabled={!termsAccepted}>Cadastrar Negócio</button>
      </form>
    </div>
  );
};

export default RegisterBusiness;