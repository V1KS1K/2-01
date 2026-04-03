import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.getUsers().then(setUsers).catch(() => navigate('/'));
    }, [navigate]);

    const changeRole = async (id, newRole) => {
        try {
            await api.updateUser(id, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (e) { alert("Ошибка смены роли"); }
    };

    const del = async (id) => {
        if (window.confirm("Удалить?")) {
            await api.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="container" style={{padding:'40px'}}>
            <h2>Панель администратора: Пользователи</h2>
            <button className="btn-add" onClick={()=>navigate('/')}>Вернуться в магазин</button>
            <table style={{width:'100%', marginTop:'30px', borderCollapse:'collapse'}}>
                <thead>
                    <tr style={{background:'#eee', textAlign:'left'}}>
                        <th style={{padding:'10px'}}>Username</th>
                        <th style={{padding:'10px'}}>Email</th>
                        <th style={{padding:'10px'}}>Роль</th>
                        <th style={{padding:'10px'}}>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{borderBottom:'1px solid #ddd'}}>
                            <td style={{padding:'10px'}}>{u.username}</td>
                            <td style={{padding:'10px'}}>{u.email}</td>
                            <td style={{padding:'10px'}}>
                                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td style={{padding:'10px'}}><button onClick={()=>del(u.id)} style={{color:'red'}}>Удалить</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default AdminPage;