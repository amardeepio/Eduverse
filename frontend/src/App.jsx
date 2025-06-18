import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AchievementsPage from './pages/AchievementsPage';

function App() {
  const [user, setUser] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const address = localStorage.getItem('userAddress');
    if (token && address) {
      setUser({ address, token });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    setUser(null);
  };
  
  // If no user is logged in, render the LoginPage.
  // Otherwise, set up the routes for the authenticated user.
  return (
    <Routes>
      {user ? (
        <>
          <Route 
            path="/" 
            element={<DashboardPage user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/achievements" 
            element={<AchievementsPage user={user} onLogout={handleLogout} />} 
          />
        </>
      ) : (
        <Route path="*" element={<LoginPage onLogin={setUser} />} />
      )}
    </Routes>
  );
}

export default App;