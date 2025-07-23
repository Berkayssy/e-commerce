import React from 'react';
import { useLocation } from 'react-router-dom';

const AssignAdmin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const communityId = params.get('communityId');

  return (
    <div style={{ padding: 32 }}>
      <h2>Assign Admin</h2>
      {communityId ? (
        <p>Assign admins for community ID: <b>{communityId}</b></p>
      ) : (
        <p>No community selected. Please select a community.</p>
      )}
      {/* TODO: Add admin assignment logic here */}
    </div>
  );
};

export default AssignAdmin; 