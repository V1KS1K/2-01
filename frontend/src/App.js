import React, { useEffect, useState } from 'react';
import { api } from './api';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', description: '', price: '', stock: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => { refresh(); }, []);

  const refresh = () => api.getProducts().then(setProducts);

  const handleSave = async (e) => {
    e.preventDefault();
    if (editId) await api.updateProduct(editId, formData);
    else await api.createProduct(formData);
    close();
    refresh();
  };

  const close = () => { setShowModal(false); setEditId(null); setFormData({name:'', category:'', description:'', price:'', stock:''}); };

  const onEdit = (p) => { setEditId(p.id); setFormData(p); setShowModal(true); };

  const onDelete = async (id) => { if (window.confirm("Удалить?")) { await api.deleteProduct(id); refresh(); } };

  return (
    <div className="store">
      <header className="header">
        <div className="container header-flex">
          <div className="logo">
             <h1>Nail Store</h1>
             <p>Professional beauty supplies</p>
          </div>
          <button className="btn-add" onClick={() => setShowModal(true)}>+ Добавить товар</button>
        </div>
      </header>

      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>{editId ? "Редактировать" : "Новый товар"}</h2>
            <form onSubmit={handleSave}>
              <input placeholder="Название" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Категория" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              <input placeholder="Цена" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              <input placeholder="Склад" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
              <textarea placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="form-btns">
                <button type="submit" className="btn-save">Сохранить</button>
                <button type="button" className="btn-cancel" onClick={close}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid container">
        {products.map(p => (
          <div key={p.id} className="card">
            <div className="card-top">
              <span className="tag">{p.category}</span>
              <div className="actions">
                <button className="act-btn edit" onClick={() => onEdit(p)}>✎</button>
                <button className="act-btn del" onClick={() => onDelete(p.id)}>×</button>
              </div>
            </div>
            <h3>{p.name}</h3>
            <p className="desc">{p.description}</p>
            <div className="info">
              <span className="price">{p.price} ₽</span>
              <span className="stock">В наличии: {p.stock}</span>
            </div>
            <button className="btn-cart">В корзину</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;