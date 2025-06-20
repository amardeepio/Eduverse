import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AchievementsPage from './pages/AchievementsPage';
import InterestPage from './pages/InterestPage';

function App() {
  const [user, setUser] = useState(null);
  // 2. Add state to track if interests have been selected
  const [interestsSelected, setInterestsSelected] = useState(true);

  // Check login status and interest selection on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const address = localStorage.getItem('userAddress');
    if (token && address) {
      setUser({ address, token });
      // Check if interests have been saved in local storage
      const savedInterests = localStorage.getItem('userInterests');
      setInterestsSelected(!!savedInterests); // Sets to true if exists, false otherwise
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // After login, check if the user needs to select interests
    const savedInterests = localStorage.getItem('userInterests');
    setInterestsSelected(!!savedInterests);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    localStorage.removeItem('userInterests'); // <-- Add this line
    setUser(null);
  };
  
  // 3. Update the main return logic with the new flow
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!interestsSelected) {
    return <InterestPage onInterestsSelected={() => setInterestsSelected(true)} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<DashboardPage user={user} onLogout={handleLogout} />} 
      />
      <Route 
        path="/achievements" 
        element={<AchievementsPage user={user} onLogout={handleLogout} />} 
      />
    </Routes>
  );
}

export default App;