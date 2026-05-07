
const EDU_API_URL = "https://api.worldbank.org/v2/country/all/indicator/SE.XPD.TOTL.GD.ZS?format=json&per_page=1000&mrv=10";


router.get('/education-expenditure', async (req, res) => {
    try {
        const response = await fetch(EDU_API_URL);
        const data = await response.json();
        res.json(data); // Invia i dati al tuo frontend
    } catch (error) {
        console.error("Error in Education Proxy:", error);
        res.status(500).json({ error: "Error al conectar con World Bank" });
    }
});