import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

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
  // Otherwise, render the main DashboardPage.
  return user ? (
    <DashboardPage user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={setUser} />
  );
}

export default App;