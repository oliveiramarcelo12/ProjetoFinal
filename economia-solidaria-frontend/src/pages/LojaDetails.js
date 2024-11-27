import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de que o Firebase está configurado corretamente
import Avaliacao from "./Avaliacao"; // Componente de avaliação
import "../styles/lojaDetails.css"; // Importar estilos
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"; // Importar componentes do Google Maps

const LojaDetails = () => {
  const { id } = useParams(); // Obtém o ID da loja da URL
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null); // Gerencia o erro de coordenadas

  // Função para pegar as coordenadas da loja
  const getCoordinatesFromBackend = useCallback(async (address) => {
    try {
      const response = await fetch("/get-coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, loja_id: id }), // Envia o endereço e o ID da loja
      });

      const data = await response.json();

      if (data.latitude && data.longitude) {
        setCoordinates({
          lat: data.latitude,
          lng: data.longitude,
        });
      } else {
        setError("Não foi possível encontrar as coordenadas para este endereço.");
      }
    } catch (error) {
      setError("Erro ao obter coordenadas.");
    }
  }, [id]); // A função agora depende de 'id'

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const lojaData = docSnap.data();
          const { comprovante, ...lojaSemComprovante } = lojaData; // Remover o campo 'comprovante', se existir
          setLoja(lojaSemComprovante);

          if (lojaData.endereco) {
            await getCoordinatesFromBackend(lojaData.endereco);
          }
        } else {
          setError("Loja não encontrada.");
        }
      } catch (error) {
        setError("Erro ao carregar detalhes da loja.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoja();
  }, [id, getCoordinatesFromBackend]); // Agora 'getCoordinatesFromBackend' está no array de dependências

  if (loading) {
    return <p>Carregando detalhes da loja...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!loja) {
    return <p>Loja não encontrada.</p>;
  }

  return (
    <div className="loja-details">
      <h2>{loja.nome}</h2>
      <img
        src={loja.foto || loja.imagens?.[0] || "default-image.jpg"}
        alt={`Imagem da loja ${loja.nome}`}
        className="loja-img"
      />
      <p><strong>Descrição:</strong> {loja.descricao}</p>
      <p><strong>Endereço:</strong> {loja.endereco}</p>
      <p><strong>Telefone:</strong> {loja.telefone}</p>
      <p><strong>Email:</strong> {loja.email}</p>
      <p><strong>Horário de Funcionamento:</strong> {loja.horarioDeFuncionamento}</p>

      {/* Mapa */}
      <div style={{ height: "400px", width: "100%", marginTop: "20px" }}>
        <LoadScript googleMapsApiKey="AIzaSyCf9D4DX8YXkrU73iXo-KlK0ORQmRBrMBo">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={coordinates || { lat: -23.550520, lng: -46.633308 }} // Posição padrão, caso as coordenadas não sejam encontradas
            zoom={15}
          >
            {coordinates && <Marker position={coordinates} />}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Espaço para avaliações */}
      <div style={{ marginTop: "50px" }}></div>

      {/* Seção de avaliação */}
      <div className="avaliacao-section">
        <Avaliacao lojaId={id} />
      </div>
    </div>
  );
};

export default LojaDetails;
