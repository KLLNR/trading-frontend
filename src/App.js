import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Завантаження...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RedirectToLoginOnStart = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname === '/') {
      window.location.href = '/login'; // Редірект при першому завантаженні
    }
  }, [user, loading, location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <RedirectToLoginOnStart />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;