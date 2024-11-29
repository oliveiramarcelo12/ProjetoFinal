import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import "../styles/registerbusiness.css";
import { validateForm } from "../components/validation";

const RegisterBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCNPJ, setBusinessCNPJ] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
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

  const fetchAddressByCep = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data && !data.erro) {
        setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
      } else {
        setError("CEP não encontrado.");
      }
    } catch {
      setError("Erro ao buscar o CEP.");
    }
  };

  const formatCNPJ = (cnpj) => {
    const cleaned = cnpj.replace(/[^\d]/g, "");
    if (cleaned.length <= 14) {
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    return cnpj;
  };

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/[^\d]/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    return phone;
  };

  const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), file.type, 0.8);
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 6) {
      setError("Você pode enviar no máximo 6 imagens.");
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError("Cada imagem deve ter no máximo 10 MB.");
      return;
    }

    const resizedImages = await Promise.all(files.map((file) => resizeImage(file)));
    setImages((prevImages) => [...prevImages, ...resizedImages]);
    setError("");
  };

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    setError("");

    try {
      const imageBase64Promises = images.map(async (image) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const imageBase64 = await Promise.all(imageBase64Promises);

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
        status: "pendente",
      });

      alert("Cadastro enviado, aguardando aprovação!");
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

        <input
          type="text"
          placeholder="CNPJ"
          value={businessCNPJ}
          onChange={(e) => setBusinessCNPJ(e.target.value)}
          onBlur={() => setBusinessCNPJ(formatCNPJ(businessCNPJ))}
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
          {/* Adicione suas categorias */}
        </select>

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onBlur={() => fetchAddressByCep(cep)}
          required
        />

        <input
          type="text"
          placeholder="Endereço"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setPhone(formatPhone(phone))}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Horário de Funcionamento"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
          required
        />

        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <input type="file" accept="application/pdf" onChange={(e) => setCnDoc(e.target.files[0])} required />

        <div>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label>Aceito os termos e condições</label>
        </div>

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Negócio"}
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
