import fetch from 'node-fetch';

const worldBankProxy = (app) => {
    // Endpoint que servirá de puente para obtener la población de un año
    app.get("/api/v1/integration/population/:year", async (req, res) => {
        const year = req.params.year;
        const url = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=${year}&format=json&per_page=300`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            // El Banco Mundial devuelve [metadatos, datos]
            res.status(200).send(data[1]); 
        } catch (error) {
            res.status(500).send("Error al conectar con World Bank API");
        }
    });
};

export default worldBankProxy;