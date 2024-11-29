import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../firebase";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./LojaDetails.css";

const LojaDetails = () => {
  const { id } = useParams();
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);

  const getCoordinatesFromBackend = useCallback(async (address) => {
    try {
      const functions = getFunctions();
      const getCoordinates = httpsCallable(functions, 'getCoordinates');
      
      console.log('Requesting coordinates for address:', address);
      const result = await getCoordinates({ address });
      console.log('Coordinates response:', result.data);

      if (result.data.latitude && result.data.longitude) {
        setCoordinates({
          lat: result.data.latitude,
          lng: result.data.longitude
        });
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
      setError('Erro ao carregar o mapa. Por favor, tente novamente mais tarde.');
    }
  }, []);

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const lojaData = docSnap.data();
          setLoja(lojaData);

          if (lojaData.endereco) {
            await getCoordinatesFromBackend(lojaData.endereco);
          }
        } else {
          setError("Loja não encontrada");
        }
      } catch (error) {
        console.error("Error fetching loja:", error);
        setError("Erro ao carregar os detalhes da loja");
      } finally {
        setLoading(false);
      }
    };

    fetchLoja();
  }, [id, getCoordinatesFromBackend]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!loja) return <div>Loja não encontrada</div>;

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    marginTop: "20px",
    marginBottom: "20px"
  };

  const defaultCenter = {
    lat: -23.550520, // São Paulo
    lng: -46.633308
  };

  return (
    <div className="loja-details">
      <h1>{loja.nome}</h1>
      
      {loja.foto && (
        <img 
          src={loja.foto} 
          alt={loja.nome} 
          className="loja-image"
        />
      )}

      <div className="loja-info">
        <p><strong>Descrição:</strong> {loja.descricao}</p>
        <p><strong>Endereço:</strong> {loja.endereco}</p>
        <p><strong>Telefone:</strong> {loja.telefone}</p>
        <p><strong>Email:</strong> {loja.email}</p>
        {loja.horarioFuncionamento && (
          <p><strong>Horário de Funcionamento:</strong> {loja.horarioFuncionamento}</p>
        )}
      </div>

      {/* Google Maps Section */}
      <div className="map-container">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={coordinates || defaultCenter}
            zoom={15}
          >
            {coordinates && (
              <Marker
                position={coordinates}
                title={loja.nome}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default LojaDetails;