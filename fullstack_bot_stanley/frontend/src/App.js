import React, { useState } from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';

import NavBar from './components/navbar';
import DashboardPage from './pages/dashboard/Dashboard';
import ProfilePage from './pages/Profile';
import TasksPage from './pages/Tasks';

const App = () => {
  
  const [taskTable, setTaskTable] = useState([]);

  return (
    <Router>
      <div className="flex">
        <NavBar/>
        <div className="p-7 w-full bg-light-white h-full">
       
        <Routes>
          <Route path="/" element={<DashboardPage/>}/>
          <Route path="/dashboard" element={<DashboardPage/>}/>
          <Route path="/tasks" element={<TasksPage taskTable={taskTable} setTaskTable={setTaskTable}/> }/>
          <Route path="profile" element={<ProfilePage/>}/>
          <Route path="/logout"/>
        </Routes>
          
        </div>

      </div>
      
      
    </Router>
  );
};

export default App;