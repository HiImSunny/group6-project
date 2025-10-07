import React, { useState } from 'react';
import axios from 'axios';

function AddUser({ onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { name, email };

    axios.post('http://localhost:3000/api/users', newUser)
      .then(res => {
        onUserAdded(res.data); // Thông báo cho component cha
        setName('');
        setEmail('');
      })
      .catch(err => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Thêm User Mới</h3>
      <input 
        type="text" 
        placeholder="Tên" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        required 
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        required 
      />
      <button type="submit">Thêm</button>
    </form>
  );
}

export default AddUser;
