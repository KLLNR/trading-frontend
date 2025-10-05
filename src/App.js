import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import AddProduct from './pages/AddProduct';
import Header from './components/Header';
import Footer from './components/Footer'; 
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Завантаження...</div>;
  return user ? children : <Navigate to="/register" replace />;
};

const RedirectToRegisterOnStart = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname === '/') {
      window.location.href = '/register';
    }
  }, [user, loading, location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <RedirectToRegisterOnStart />
        <div className="app-wrapper">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/:categoryName?"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer className="app-footer" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
