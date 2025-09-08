import React, { useState } from 'react';

const UserProfilePage = () => {
  const [profile, setProfile] = useState({
    // Shipping Info
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    
    // Payment Info (encrypted storage needed)
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const handleSave = async () => {
    // Save encrypted profile to backend
    const response = await fetch('http://localhost:3001/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Payment & Shipping Profile</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
          <input 
            placeholder="Email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            className="w-full p-2 border rounded mb-2"
          />
          <input 
            placeholder="First Name"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            className="w-full p-2 border rounded mb-2"
          />
          {/* Add all shipping fields */}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
          <input 
            placeholder="Card Number"
            value={profile.cardNumber}
            onChange={(e) => setProfile({...profile, cardNumber: e.target.value})}
            className="w-full p-2 border rounded mb-2"
            type="password"
          />
          {/* Add all payment fields */}
        </div>
      </div>
      
      <button 
        onClick={handleSave}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded"
      >
        Save Profile
      </button>
    </div>
  );
};

export default UserProfilePage;
