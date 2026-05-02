import fetch from 'node-fetch';
import { countryCodes } from './countryCodes.js';

export async function getCovidData(country) {
    const code = countryCodes[country.trim()];
    
    if (!code) {
        console.log(` No tengo el código ISO configurado para: ${country}`);
        return { error: `Falta configurar el código ISO para el país: ${country}` };
    }

    const url = `https://coronavirus-smartable.p.rapidapi.com/stats/v1/${code}/`; 
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'ad97ef76e3msh2b781eca540599ep19e5fajsn89a7953f8f31', 
            'x-rapidapi-host': 'coronavirus-smartable.p.rapidapi.com' 
        }
    };

    try {
        console.log(`Pidiendo datos de COVID para ${country} (Código: ${code})`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            console.log(`Error de RapidAPI: ${response.status}`);
            return { error: `La API de COVID no tiene datos para ${country} (Error ${response.status})` };
        }

        const data = await response.json();
        
        console.log(`Datos recibidos correctamente para ${country}`);
        
        return data; 

    } catch (err) {
        console.error("Error de conexión interno:", err.message);
        return { error: "Fallo de conexión con el servidor de RapidAPI" };
    }
}