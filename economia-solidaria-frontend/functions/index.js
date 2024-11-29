const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();

exports.getCoordinates = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Endereço inválido. Por favor, forneça um endereço válido.'
    );
  }

  try {
    // Get API key from environment config
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || functions.config().googlemaps?.key;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Configuração da API do Google Maps não encontrada'
      );
    }

    // Encode address for URL
    const encodedAddress = encodeURIComponent(data.address.trim());
    
    // Make API request to Google Maps Geocoding API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
      { timeout: 10000 }
    );

    // Check API response
    if (response.data.status === 'ZERO_RESULTS') {
      throw new functions.https.HttpsError(
        'not-found',
        'Endereço não encontrado'
      );
    }

    if (response.data.status !== 'OK') {
      console.error('Google Maps API Error:', response.data);
      throw new functions.https.HttpsError(
        'internal',
        'Erro ao processar o endereço'
      );
    }

    const location = response.data.results[0].geometry.location;
    const formattedAddress = response.data.results[0].formatted_address;

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: formattedAddress
    };
  } catch (error) {
    console.error('Error in getCoordinates:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao obter coordenadas. Por favor, tente novamente mais tarde.',
      error.message
    );
  }
});