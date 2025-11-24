import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';
import ExchangePropose from './pages/ExchangePropose';
import ExchangeDetail from './pages/ExchangeDetail';
import ExchangeIncoming from './pages/ExchangeIncoming';
import ExchangeOutgoing from './pages/ExchangeOutgoing';

import Header from './components/Header';
import Footer from './components/Footer';

import './App.css';


// -----------------------------
// Protected Route
// -----------------------------
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Завантаження...</div>;
  return user ? children : <Navigate to="/register" replace />;
};


// -----------------------------
// Redirect on start
// -----------------------------
const RedirectToRegisterOnStart = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && location.pathname === '/') {
      navigate('/register');
    }
  }, [user, loading, location.pathname, navigate]);

  return null;
};


// -----------------------------
// Routes Config (для чистоти)
// -----------------------------
const protectedRoutes = [
  { path: '/', element: <Home /> },
  { path: '/my-products', element: <Products /> },
  { path: '/categories/:categoryName?', element: <Categories /> },
  { path: '/add-product', element: <AddProduct /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/edit-product/:id', element: <EditProduct /> },
  { path: '/exchange/propose/:productId', element: <ExchangePropose /> },
  { path: '/exchange/:id', element: <ExchangeDetail /> },
  { path: '/exchange/incoming', element: <ExchangeIncoming /> },
  { path: '/exchange/outgoing', element: <ExchangeOutgoing /> },
];


// -----------------------------
// App Component
// -----------------------------
function App() {
  return (
    <AuthProvider>
      <Router>
        <RedirectToRegisterOnStart />

        <div className="app-wrapper">
          <Header />

          <main className="main-content">
            <Routes>

              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              {protectedRoutes.map(({ path, element }) => (
                <Route
                  key={path}
                  path={path}
                  element={<ProtectedRoute>{element}</ProtectedRoute>}
                />
              ))}

            </Routes>
          </main>

          <Footer className="app-footer" />
        </div>

      </Router>
    </AuthProvider>
  );
}

export default App;
