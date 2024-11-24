import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar o 'db'
import { getAuth } from "firebase/auth"; // Para pegar o UID do usuário autenticado
import "../styles/registerbusiness.css";

const RegisterBusiness = () => {
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
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const auth = getAuth();
  const user = auth.currentUser; // Verifica o usuário autenticado
  const userUid = user ? user.uid : null; // Obtém o UID do usuário
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError("Você pode enviar no máximo 6 imagens do seu negócio.");
    } else {
      const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024); // Limite de 5MB por imagem
      if (invalidFiles.length > 0) {
        setError("Cada imagem deve ter no máximo 5 MB.");
      } else {
        setImages((prevImages) => [...prevImages, ...files]);
        setError(""); // Limpa o erro ao adicionar novas imagens
      }
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errorMessage = "";

    // Validação dos campos
    if (!businessName || !businessDescription || !category || !address || !phone || !email) {
      errorMessage += "Por favor, preencha todos os campos obrigatórios.\n";
    }

    if (images.length === 0 || !cnDoc) {
      errorMessage += "Por favor, carregue imagens do seu negócio e o comprovante do Simples Nacional.\n";
    }

    if (!termsAccepted) {
      errorMessage += "É necessário aceitar os Termos e Condições.\n";
    }

    // Verificação de formato de e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {
      errorMessage += "O e-mail fornecido não é válido.\n";
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError(""); // Limpa a mensagem de erro antes de tentar enviar

    try {
      // Converter imagens para base64 ou outras manipulações, se necessário
      const imageBase64Promises = images.map(async (image) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result); // Salva o resultado em base64
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const imageBase64 = await Promise.all(imageBase64Promises);

      // Salvar no Firestore na coleção "negocios_pendentes", incluindo o UID do usuário e status "pendente"
      const docRef = await addDoc(collection(db, "negocios_pendentes"), {
        nome: businessName,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefone: phone,
        email,
        horarioDeFuncionamento: workingHours,
        imagens: imageBase64, // Salva as imagens em base64
        comprovante: cnDoc.name, // Salva o nome do arquivo do comprovante
        userId: userUid, // Adiciona o UID do usuário
        status: "pendente", // Definindo o status como "pendente"
      });

      // Mensagem de sucesso com a alteração para aguardar aprovação do admin
      alert("Cadastro enviado, aguardando aprovação do admin!");

      // Após o envio, redireciona o usuário para a home
      navigate("/");

    } catch (err) {
      console.error("Erro ao cadastrar negócio:", err);
      setError("Erro ao cadastrar o negócio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-business-page">
      <form className="register-business-form" onSubmit={handleSubmit}>
        <h2>Cadastro de Negócio</h2>

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
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Selecione a Categoria</option>
          <option value="restaurante">Restaurante</option>
          <option value="loja">Loja</option>
          <option value="servicos">Serviços</option>
          <option value="artesanato">Artesanato</option>
          <option value="beleza">Beleza e Estética</option>
          <option value="educacao">Educação e Cursos</option>
          <option value="saude">Saúde e Bem-estar</option>
          <option value="esportes">Esportes e Lazer</option>
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

        <div className="upload-instructions">
          <label htmlFor="businessImages">
            <strong>Carregue imagens do seu negócio (máximo de 6 imagens, máximo de 5 MB cada)</strong>
          </label>
          <input
            type="file"
            id="businessImages"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <div key={index} className="image-wrapper">
                  <img src={URL.createObjectURL(image)} alt={`preview ${index}`} />
                  <button className="remove-image" onClick={() => removeImage(index)}>
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && error.includes("Você pode enviar no máximo 6 imagens") && (
          <div className="error">{error}</div>
        )}

        <div className="upload-instructions">
          <label htmlFor="cnDoc">
            <strong>Comprovante do Simples Nacional</strong>
          </label>
          <input
            type="file"
            id="cnDoc"
            accept="application/pdf"
            onChange={(e) => setCnDoc(e.target.files[0])}
            required
          />
        </div>

        {error && !error.includes("Você pode enviar no máximo 6 imagens") && (
          <div className="error">{error}</div>
        )}

        {loading && <div className="loading">Carregando...</div>}

        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label htmlFor="terms">
            Aceito os{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Termos e Condições
            </a>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          Enviar Cadastro
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
