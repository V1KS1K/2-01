const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Nail Store API', version: '1.0.0' },
        servers: [{ url: `http://localhost:${port}` }],
    },
    apis: ['./app.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let products = [
    { id: "1", name: "UV/LED Лампа 48W", category: "Оборудование", description: "Мощная гибридная лампа", price: 2500, stock: 12 },
    { id: "2", name: "Аппарат Strong 210", category: "Оборудование", description: "35000 об/мин", price: 12500, stock: 5 },
    { id: "3", name: "База Rubber Strong", category: "Гель-лаки", description: "Каучуковая база", price: 650, stock: 50 },
    { id: "4", name: "Топ без липкого слоя", category: "Гель-лаки", description: "Идеальный глянец", price: 700, stock: 40 },
    { id: "5", name: "Набор гель-лаков 'Pastel'", category: "Гель-лаки", description: "5 оттенков", price: 1800, stock: 10 },
    { id: "6", name: "Масло для кутикулы", category: "Уход", description: "Питательное масло", price: 250, stock: 100 },
    { id: "7", name: "Набор фрез (5 шт)", category: "Расходники", description: "Алмазные фрезы", price: 950, stock: 30 },
    { id: "8", name: "Обезжириватель 3-в-1", category: "Жидкости", description: "500мл", price: 450, stock: 25 },
    { id: "9", name: "Безворсовые салфетки", category: "Расходники", description: "1000 шт", price: 350, stock: 60 },
    { id: "10", name: "Праймер бескислотный", category: "Жидкости", description: "Для сцепки", price: 550, stock: 35 }
];

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', (req, res) => {
    const newProduct = { id: nanoid(6), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        res.json(products[index]);
    } else res.status(404).send();
});

app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.listen(port, () => console.log(`Сервер: http://localhost:3000`));