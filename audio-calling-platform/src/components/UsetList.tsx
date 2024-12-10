import React from 'react';

const UserList: React.FC = () => {
  const users = ['User1', 'User2', 'User3']; // Mock data

  return (
    <div className="user-list">
      <h3>Participants</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;