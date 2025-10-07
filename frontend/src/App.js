import React, { useState } from 'react';
import UserList from './UserList';
import AddUser from './AddUser';

function App() {
  const [newUserAdded, setNewUserAdded] = useState(null);

  // Khi user được thêm, cập nhật trạng thái để UserList tái render
  const handleUserAdded = (user) => {
    setNewUserAdded(user);
  };

  return (
    <div className="App">
      <AddUser onUserAdded={handleUserAdded} />
      <UserList key={newUserAdded ? newUserAdded.email : 'init'} />
    </div>
  );
}

export default App;
