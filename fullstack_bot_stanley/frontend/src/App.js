import React, { useState, useEffect } from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';

import NavBar from './components/navbar';
import DashboardPage from './pages/dashboard/Dashboard';
import ProfilePage from './pages/Profile';
import UserProfilePage from './pages/UserProfile';
import TasksPage from './pages/Tasks';
import AuthPage from './pages/AuthPage';

const App = () => {
  
  const [taskTable, setTaskTable] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('username');
    
    if (token && userData) {
      setUser({ username: userData });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex">
        <NavBar onLogout={handleLogout} username={user.username}/>
        <div className="p-7 w-full bg-light-white h-full">
       
        <Routes>
          <Route path="/" element={<DashboardPage/>}/>
          <Route path="/dashboard" element={<DashboardPage/>}/>
          <Route path="/tasks" element={<TasksPage taskTable={taskTable} setTaskTable={setTaskTable}/> }/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/user-profile" element={<UserProfilePage/>}/>
          <Route path="/logout" element={<div>Logging out...</div>}/>
        </Routes>
          
        </div>

      </div>
      
      
    </Router>
  );
};

export default App;