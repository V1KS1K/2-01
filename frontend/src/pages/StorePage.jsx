import React, { useEffect, useState } from 'react';
import { api } from '../api';
import './StorePage.scss';

const StorePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getProducts().then(data => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Удалить товар?")) {
            await api.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="store-page">
            <header>
                <h1>IT-Shop</h1>
            </header>
            <div className="product-grid">
                {products.map(p => (
                    <div key={p.id} className="card">
                        <h3>{p.name}</h3>
                        <p className="cat">{p.category}</p>
                        <p>{p.description}</p>
                        <div className="price">{p.price} ₽</div>
                        <p>На складе: {p.stock} шт.</p>
                        <button onClick={() => handleDelete(p.id)} className="del-btn">Удалить</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StorePage;