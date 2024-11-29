import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/MyBusinesses.css";

// Componente para renderizar cada negócio
const BusinessItem = ({ business, onEdit }) => (
  <li className="business-item">
    <h3 className="business-name">{business.nome}</h3>
    <p className="business-status">
      Status:{" "}
      {business.status === "pendente"
        ? "Aguardando aprovação"
        : business.status === "aprovado"
        ? "Aprovado"
        : "Negado"}
    </p>
    <button className="edit-button" onClick={() => onEdit(business)}>
      Editar
    </button>
  </li>
);

// Modal de Edição
const EditBusinessModal = ({ business, onClose, onSave }) => {
  const [form, setForm] = useState({
    nome: business.nome,
    cnpj: business.cnpj,
    descricao: business.descricao,
    categoria: business.categoria,
    endereco: business.endereco,
    telefone: business.telefone,
    email: business.email,
    horarioDeFuncionamento: business.horarioDeFuncionamento,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const businessRef = doc(db, "lojas", business.id);
      await updateDoc(businessRef, form);
      onSave();
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Loja</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(form).map((key) => (
            <label key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}:
              <input
                type="text"
                name={key}
                value={form[key]}
                onChange={handleChange}
                required
              />
            </label>
          ))}
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

// Componente Principal
const MyBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchBusinesses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, "lojas"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userBusinesses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(userBusinesses);
    } catch (error) {
      console.error("Erro ao buscar negócios do usuário:", error);
      setError("Ocorreu um erro ao carregar seus negócios. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleEdit = (business) => {
    setEditingBusiness(business);
  };

  const handleCloseModal = () => {
    setEditingBusiness(null);
  };

  const handleSaveChanges = () => {
    handleCloseModal();
    fetchBusinesses();
  };

  if (loading) {
    return <p className="loading-text">Carregando seus negócios...</p>;
  }

  return (
    <div className="businesses-container">
      <h2>Meus Negócios</h2>
      {error ? (
        <p className="error-text">{error}</p>
      ) : businesses.length === 0 ? (
        <p className="no-businesses-text">Você ainda não tem negócios cadastrados.</p>
      ) : (
        <ul className="business-list">
          {businesses.map((business) => (
            <BusinessItem key={business.id} business={business} onEdit={handleEdit} />
          ))}
        </ul>
      )}

      {editingBusiness && (
        <EditBusinessModal
          business={editingBusiness}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default MyBusinesses;
