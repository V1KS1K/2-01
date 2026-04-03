import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { api } from './api';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import './App.css';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', price: '' });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. ТОВАРЫ ГРУЗИМ ВСЕГДА (ДЛЯ ВСЕХ)
    api.getProducts().then(setProducts).catch(console.error);

    // 2. ПРОВЕРЯЕМ КТО ЗАШЕЛ
    const token = localStorage.getItem('accessToken');
    if (token) api.getMe().then(setUser).catch(() => { localStorage.clear(); setUser(null); });
  }, []);

  const refresh = () => api.getProducts().then(setProducts);

  const save = async (e) => {
    e.preventDefault();
    if (editId) await api.updateProduct(editId, formData);
    else await api.createProduct(formData);
    setShowModal(false); setEditId(null);
    refresh();
  };

  return (
    <div className="store">
      <header className="header">
        <div className="container header-flex" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="logo">
            <h1>Nail Store</h1>
            {user ? <p style={{color:'#d4418e'}}>Привет, {user.username} ({user.role})</p> : <p>Витрина открыта</p>}
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            {!user ? (
              <button className="btn-add" onClick={()=>navigate('/login')}>Войти</button>
            ) : (
              <>
                {user.role === 'admin' && <button className="btn-add" style={{background:'#1f2937'}} onClick={()=>navigate('/admin')}>Юзеры</button>}
                {(user.role==='admin' || user.role==='seller') && <button className="btn-add" onClick={()=>setShowModal(true)}>+ Товар</button>}
                <button className="btn-add" style={{background:'#9ca3af'}} onClick={()=>{localStorage.clear(); window.location.reload();}}>Выход</button>
              </>
            )}
          </div>
        </div>
      </header>

      {showModal && (
        <div className="modal"><div className="modal-box">
          <form onSubmit={save} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <h2>{editId ? 'Правка' : 'Новый'}</h2>
            <input placeholder="Название" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required />
            <input placeholder="Цена" type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} required />
            <button type="submit" className="btn-save">Сохранить</button>
            <button type="button" onClick={()=>setShowModal(false)}>Отмена</button>
          </form>
        </div></div>
      )}

      {/* СЕТКА ТОВАРОВ - ТЕПЕРЬ ДЛЯ ВСЕХ */}
      <div className="grid container">
        {products.map(p => (
          <div key={p.id} className="card">
            <div className="card-top">
              <span className="tag">Beauty</span>
              <div className="actions">
                {user && (user.role==='admin' || user.role==='seller') && <button className="act-btn edit" onClick={()=>{setEditId(p.id); setFormData(p); setShowModal(true)}}>✎</button>}
                {user && user.role==='admin' && <button className="act-btn del" onClick={async()=>{if(window.confirm('Удалить?')){await api.deleteProduct(p.id); refresh();}}}>×</button>}
              </div>
            </div>
            <h3>{p.title}</h3>
            <p className="price">{p.price} ₽</p>
            <button className="btn-cart">В корзину</button>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Store />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;