<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class GeocodingController extends Controller
{
    public function getCoordinates(Request $request)
    {
        $address = $request->input('address');

        // Substitua sua chave de API do Google Maps aqui
        $googleMapsApiKey = 'AIzaSyCf9D4DX8YXkrU73iXo-KlK0ORQmRBrMBo';

        // URL da API do Google Maps
        $url = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=" . $googleMapsApiKey;

        // Criando o cliente Guzzle
        $client = new Client();

        try {
            // Fazendo a requisição para a API
            $response = $client->get($url);
            $data = json_decode($response->getBody(), true);

            // Verificando se a resposta é válida
            if ($data['status'] === 'OK') {
                $latitude = $data['results'][0]['geometry']['location']['lat'];
                $longitude = $data['results'][0]['geometry']['location']['lng'];

                return response()->json([
                    'latitude' => $latitude,
                    'longitude' => $longitude
                ]);
            }

            return response()->json(['error' => 'Endereço não encontrado.'], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao se comunicar com a API do Google Maps.'], 500);
        }
    }
}
