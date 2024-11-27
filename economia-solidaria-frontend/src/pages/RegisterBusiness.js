import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import axios from "axios";  // Importando o Axios
import "../styles/registerbusiness.css";
import { validateForm } from "../components/validation";

const RegisterBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCNPJ, setBusinessCNPJ] = useState("");
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
  const user = auth.currentUser;
  const userUid = user ? user.uid : null;

  // Função para buscar coordenadas com o endereço
  const fetchCoordinates = async (address) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCf9D4DX8YXkrU73iXo-KlK0ORQmRBrMBo`
      );
      const location = response.data.results[0]?.geometry.location;
      return location ? { lat: location.lat, lng: location.lng } : null;
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      setError("Erro ao obter as coordenadas do endereço.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Chama a função de validação
    const validationError = validateForm({
      businessName,
      businessCNPJ,
      businessDescription,
      category,
      address,
      phone,
      email,
      images,
      cnDoc,
      termsAccepted,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(""); // Limpa a mensagem de erro antes de tentar enviar

    try {
      // Buscar coordenadas do endereço
      const coordinates = await fetchCoordinates(address);
      if (!coordinates) {
        setError("Não foi possível obter as coordenadas do endereço.");
        setLoading(false);
        return;
      }

      const imageBase64Promises = images.map(async (image) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result); // Salva o resultado em base64
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const imageBase64 = await Promise.all(imageBase64Promises);

      // Enviar os dados para o Firestore, incluindo as coordenadas
      await addDoc(collection(db, "negocios_pendentes"), {
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefone: phone,
        email,
        horarioDeFuncionamento: workingHours,
        imagens: imageBase64,
        comprovante: cnDoc.name,
        userId: userUid,
        status: "pendente", // Definindo o status como "pendente"
        coordenadas: coordinates, // Adiciona as coordenadas no Firestore
      });

      alert("Cadastro enviado, aguardando aprovação do admin!");
      navigate("/"); // Após o envio, redireciona o usuário para a home
    } catch (err) {
      console.error("Erro ao cadastrar negócio:", err);
      setError("Erro ao cadastrar o negócio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar o CNPJ (apenas para exibição)
  const formatCNPJ = (cnpj) => {
    if (!cnpj) return cnpj;
    return cnpj.replace(/\D/g, "")
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  // Função para formatar o telefone
  const formatPhone = (phone) => {
    if (!phone) return phone;
    return phone.replace(/\D/g, "")
      .replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  };

  // Função para lidar com o upload das imagens
  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  // Função para remover uma imagem do estado
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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

        <input
          type="text"
          placeholder="CNPJ"
          value={formatCNPJ(businessCNPJ)}
          onChange={(e) => setBusinessCNPJ(e.target.value)}
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
          value={formatPhone(phone)}
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
            <strong>
              Carregue imagens do seu negócio (máximo de 6 imagens, máximo de
              5MB cada)
            </strong>
          </label>
          <input
            type="file"
            id="businessImages"
            accept="image/*"
            multiple
            required
            onChange={handleImageUpload}
          />

          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <div key={index} className="image-wrapper">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`preview ${index}`}
                  />
                  <button
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Carregando...</div>}

        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label htmlFor="terms">
            Aceito os <strong>termos de serviço</strong>
          </label>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          Cadastrar Negócio
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
