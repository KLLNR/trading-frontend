import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [hidden, setHidden] = useState(false);

  const lastScroll = useRef(0); // краще useRef замість state — не викликає ререндери

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll.current && currentScroll > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`app-header ${hidden ? "hidden" : ""}`}>
      <Link to="/categories" className="logo">Trading-Auction</Link>

      <nav>
        <ul className="nav-links">
          {user && (
            <li>
              <Link to="/add-product" className="add-product-btn">
                Додати оголошення
              </Link>
            </li>
          )}

          <li><Link to="/categories">Головна</Link></li>
          <li><Link to="/my-products">Товари</Link></li>

          {user && (
            <>
              <li><Link to="/exchange/incoming">Вхідні обміни</Link></li>
              <li><Link to="/exchange/outgoing">Мої пропозиції</Link></li>
            </>
          )}

          <li><Link to="/">Профіль</Link></li>

          {user && (
            <li>
              <button onClick={logout} className="logout-btn">
                Вийти
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
