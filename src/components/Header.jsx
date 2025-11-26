import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScroll = useRef(0);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (!isMenuOpen) { 
        if (currentScroll > lastScroll.current && currentScroll > 80) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      }
      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <header className={`app-header ${hidden ? "hidden" : ""}`}>
      <div className="header-content">
        
        <Link to="/categories" className="logo" onClick={closeMenu}>
          Trading-Auction
        </Link>

        <button 
          className="burger-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            
            {user && (
              <li>
                <Link to="/add-product" className="nav-btn btn-primary" onClick={closeMenu}>
                  <span></span> Додати оголошення
                </Link>
              </li>
            )}

            <li><Link to="/categories" onClick={closeMenu}>Головна</Link></li>
            <li><Link to="/my-products" onClick={closeMenu}>Мої оголошення</Link></li>

            {user && (
              <>
                <li><Link to="/exchange/incoming" onClick={closeMenu}>Вхідні обміни</Link></li>
                <li><Link to="/exchange/outgoing" onClick={closeMenu}>Мої пропозиції</Link></li>
              </>
            )}

            <li><Link to="/" onClick={closeMenu}>Профіль</Link></li>

            {user && (
              <li>
                <button onClick={() => { logout(); closeMenu(); }} className="nav-btn btn-outline">
                  Вийти
                </button>
              </li>
            )}
          </ul>
        </nav>
        
        <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
      </div>
    </header>
  );
};

export default Header;