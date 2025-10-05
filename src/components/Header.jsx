import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <header className={`app-header ${hidden ? "hidden" : ""}`}>
      <Link to="/categories" className="logo">Trading-Auction</Link>

      <nav>
      <ul className="nav-links">
  {user && (
    <li><Link to="/add-product" className="add-product-btn">Додати товар</Link></li>
  )}
  <li><Link to="/categories">Головна</Link></li>
  <li><Link to="/products">Товари</Link></li>
  <li><Link to="/">Профіль</Link></li>
  {user && (
    <li>
      <button onClick={logout} className="logout-btn">Вийти</button>
    </li>
  )}
</ul>

      </nav>
    </header>
  );
};

export default Header;
