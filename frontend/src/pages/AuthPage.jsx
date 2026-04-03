import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await api.login({ email: formData.email, password: formData.password });
        navigate('/');
      } else {
        await api.register(formData);
        setIsLogin(true);
        alert("Регистрация успешна! Теперь войдите.");
      }
    } catch (err) { alert("Ошибка данных!"); }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', marginTop:'50px' }}>
      <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:'15px', width:'320px', padding:'20px', border:'1px solid #ddd' }}>
        <h2 style={{textAlign:'center'}}>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {!isLogin && <input placeholder="Логин (Username)" onChange={e=>setFormData({...formData, username:e.target.value})} required />}
        <input placeholder="Email" onChange={e=>setFormData({...formData, email:e.target.value})} required />
        <input type="password" placeholder="Пароль" onChange={e=>setFormData({...formData, password:e.target.value})} required />
        <button type="submit" style={{background:'#d4418e', color:'white', border:'none', padding:'12px', cursor:'pointer'}}>{isLogin ? 'Войти' : 'Создать аккаунт'}</button>
        <p style={{textAlign:'center', cursor:'pointer', color:'#6366f1'}} onClick={()=>setIsLogin(!isLogin)}>
          {isLogin ? 'Нужен аккаунт? Регистрация' : 'Уже есть аккаунт? Вход'}
        </p>
      </form>
    </div>
  );
};
export default AuthPage;