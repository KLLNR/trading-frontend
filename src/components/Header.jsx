import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import exchangeApi from '../api/exchangeApi';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasPendingExchanges, setHasPendingExchanges] = useState(false);
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

  useEffect(() => {
    if (location.pathname === '/exchange/incoming') {
      setHasPendingExchanges(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    const checkIncoming = async () => {
      if (location.pathname === '/exchange/incoming') return;

      try {
        const response = await exchangeApi.getIncomingProposals({
          page: 0,
          size: 10,
          sort: 'createdAt,desc'
        });
        const list = response.content || [];
        setHasPendingExchanges(list.some(item => item.status === 'PENDING'));
      } catch (error) {
        console.error(error);
      }
    };

    checkIncoming();
    const interval = setInterval(checkIncoming, 60000);
    return () => clearInterval(interval);
  }, [user, location.pathname]); 

  return (
    <header className={`app-header ${hidden ? "hidden" : ""}`}>
      <div className="header-content">
        
        <Link to="/categories" className="logo" onClick={closeMenu}>
          <img src="/logosvg.svg" alt="Logo" className="logo-icon" />
          TradingAuction
        </Link>
      
        <button className="burger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            
            {user && (
              <li className="mobile-only-btn">
                <Link to="/add-product" className="nav-btn btn-primary" onClick={closeMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Додати
                </Link>
              </li>
            )}

            <li>
              <Link to="/categories" onClick={closeMenu}>
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Головна
              </Link>
            </li>
            
            <li>
              <Link to="/my-products" onClick={closeMenu}>
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                Мої оголошення
              </Link>
            </li>

            {user && (
              <>
                <li className="notification-wrapper">
                  <Link to="/exchange/incoming" onClick={closeMenu}>
                    <div className="icon-wrapper">
                      <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {hasPendingExchanges && <span className="notification-dot"></span>}
                    </div>
                    Вхідні
                  </Link>
                </li>
                <li>
                  <Link to="/exchange/outgoing" onClick={closeMenu}>
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    Пропозиції
                  </Link>
                </li>
              </>
            )}

            <li className="divider-vertical"></li>

            <li>
              <Link to="/" onClick={closeMenu} className="profile-link">
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Профіль
              </Link>
            </li>

            {user && (
              <>
                 <li className="desktop-only-btn">
                  <Link to="/add-product" className="nav-btn btn-primary" onClick={closeMenu}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Додати</span>
                  </Link>
                </li>
                <li>
                  <button onClick={() => { logout(); closeMenu(); }} className="nav-btn btn-icon-only" title="Вийти">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
      </div>
    </header>
  );
};

export default Header;