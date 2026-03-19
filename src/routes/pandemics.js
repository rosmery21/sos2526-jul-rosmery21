import express from 'express';
import { readFile } from '../../utils/readFile.js';
import dataStore from 'nedb';

const router = express.Router();

const store = new dataStore({filename: './data/storage/pandemics.db', autoload: true});

// Campos requeridos para validación (v2)
const requiredFields = ['entity', 'code', 'year', 'yaws', 'polio', 'guinea_worm', 'rabies', 'malaria', 'hiv_aids', 'tuberculosis', 'smallpox', 'cholera'];

// Actualiza esta URL con tu nueva documentación de Postman para la v2
const DOCUMENTATION_URL = "https://documenter.getpostman.com/view/52276047/2sBXigLDEC";

router.get('/pandemics/docs', (req, res) => {
    res.redirect(DOCUMENTATION_URL);
});

// Carga de datos iniciales
router.get('/pandemics/loadInitialData', (req, res) => {
    store.count({}, (err, count) => {
        if (count > 0) {
            return res.sendStatus(409); // Conflict
        }
        let data = readFile('pandemics.csv');
        let filteredData = data.map(item => ({
            entity: item.Entity,
            code: item.Code,
            year: parseInt(item.Year),
            yaws: item.Yaws || 0,
            polio: item.Polio || 0,
            guinea_worm: item.Guinea_worm || 0,
            rabies: item.Rabies || 0,
            malaria: item.Malaria || 0,
            hiv_aids: item['Hiv_aids'] || 0,
            tuberculosis: item.Tuberculosis || 0,
            smallpox: item.Smallpox || 0,
            cholera: item.Cholera || 0
        }));
        store.insert(filteredData.slice(0, 10), (err, docs) => {
            docs.forEach(d => delete d._id);
            res.status(201).json(docs);
        });
    });
});

// GET Colección con filtrado y paginación (Estilo Santiago)
router.get('/pandemics', (req, res) => {
    const query = {};
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    // Filtros
    if (req.query.entity) query.entity = new RegExp(`^${req.query.entity}$`, "i");
    if (req.query.code) query.code = new RegExp(`^${req.query.code}$`, "i");
    if (req.query.year) query.year = parseInt(req.query.year);
    // Filtros numéricos $gt
    ['yaws', 'polio', 'guinea_worm', 'rabies', 'malaria', 'hiv_aids', 'tuberculosis', 'smallpox', 'cholera'].forEach(f => {
        if (req.query[f]) query[f] = { $gt: parseFloat(req.query[f]) };
    });

    store.find(query).skip(offset).limit(limit).exec((err, data) => {
        if (data.length === 0) return res.sendStatus(404);
        
        data.forEach(d => delete d._id);
        
        // Si solo hay uno y es una búsqueda específica, devolvemos objeto, si no array
        if (data.length === 1 && (req.query.entity && req.query.year)) {
            res.status(200).json(data[0]);
        } else {
            res.status(200).json(data);
        }
    });
});

// POST para crear recurso
router.post('/pandemics', (req, res) => {
    const newData = req.body;
    
    // Validación de campos (Acepta el valor 0)
    const isMissingFields = requiredFields.some(field => newData[field] === undefined);
    const hasExtraFields = Object.keys(newData).some(key => !requiredFields.includes(key));

    if (isMissingFields || hasExtraFields) return res.sendStatus(400);

    store.findOne({ entity: newData.entity, year: newData.year }, (err, doc) => {
        if (doc) return res.sendStatus(409);
        store.insert(newData, (err, inserted) => {
            delete inserted._id;
            res.status(201).json(inserted);
        });
    });
});

// GET Recurso específico
router.get('/pandemics/:entity/:year', (req, res) => {
    const { entity, year } = req.params;
    store.findOne({ entity: new RegExp(`^${entity}$`, "i"), year: parseInt(year) }, (err, data) => {
        if (!data) return res.sendStatus(404);
        delete data._id;
        res.status(200).json(data);
    });
});

// PUT Recurso específico
router.put('/pandemics/:entity/:year', (req, res) => {
    const { entity, year } = req.params;
    const newData = req.body;

    if (newData.entity !== entity || parseInt(newData.year) !== parseInt(year)) return res.sendStatus(400);
    
    const isMissingFields = requiredFields.some(field => newData[field] === undefined);
    if (isMissingFields) return res.sendStatus(400);

    store.update({ entity: new RegExp(`^${entity}$`, "i"), year: parseInt(year) }, newData, {}, (err, num) => {
        if (num === 0) return res.sendStatus(404);
        res.sendStatus(200);
    });
});

// DELETE Recurso específico
router.delete('/pandemics/:entity/:year', (req, res) => {
    const { entity, year } = req.params;
    store.remove({ entity: new RegExp(`^${entity}$`, "i"), year: parseInt(year) }, {}, (err, num) => {
        if (num === 0) return res.sendStatus(404);
        res.sendStatus(204);
    });
});

// DELETE Colección
router.delete('/pandemics', (req, res) => {
    store.remove({}, { multi: true }, () => res.sendStatus(204));
});

// Métodos no permitidos
router.put('/pandemics', (req, res) => res.sendStatus(405));
router.post('/pandemics/:entity', (req, res) => res.sendStatus(405));

export default router;