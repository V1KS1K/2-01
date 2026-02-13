const express = require('express');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Начальный список товаров
let products = [
    { id: 1, name: 'Ноутбук', price: 75000 },
    { id: 2, name: 'Смартфон', price: 45000 },
    { id: 3, name: 'Наушники', price: 5000 }
];

// ============== КОРНЕВОЙ МАРШРУТ ==============
app.get('/', (req, res) => {
    res.send('Сервер с товарами работает! Доступные маршруты: /products');
});

// ============== CRUD ДЛЯ ТОВАРОВ ==============

// 1. ПОЛУЧИТЬ ВСЕ ТОВАРЫ (Read - все)
app.get('/products', (req, res) => {
    res.json(products);
});

// 2. ПОЛУЧИТЬ ТОВАР ПО ID (Read - один)
app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

// 3. СОЗДАТЬ НОВЫЙ ТОВАР (Create)
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    // Проверка, что поля переданы
    if (!name || !price) {
        return res.status(400).json({ message: 'Необходимо указать name и price' });
    }
    
    // Создаем новый товар
    const newProduct = {
        id: Date.now(), // уникальный ID на основе времени
        name: name,
        price: price
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// 4. ОБНОВИТЬ ТОВАР (Update)
app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;
    
    // Ищем товар
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Обновляем поля (если они переданы)
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    
    res.json(product);
});

// 5. УДАЛИТЬ ТОВАР (Delete)
app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = products.length;
    
    products = products.filter(p => p.id !== id);
    
    if (products.length < initialLength) {
        res.json({ message: 'Товар удален' });
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

// ============== ЗАПУСК СЕРВЕРА ==============
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
    console.log(`📦 Доступные маршруты:`);
    console.log(`   GET    /products          - все товары`);
    console.log(`   GET    /products/:id      - товар по ID`);
    console.log(`   POST   /products          - создать товар`);
    console.log(`   PUT    /products/:id      - обновить товар`);
    console.log(`   DELETE /products/:id      - удалить товар`);
});