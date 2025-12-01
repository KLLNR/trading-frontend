import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Icons = {
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Map: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
};

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-grid">
          
          <div className="footer-column brand-column">
            <Link to="/categories" className="footer-logo">
              <img src="/logosvg.svg" alt="TradingAuction" className="logo-icon" />
              TradingAuction
            </Link>
            <p className="footer-description">
              Зручна платформа для обміну та торгівлі.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Навігація</h3>
            <ul className="footer-links">
              <li><Link to="/categories">Головна</Link></li>
              <li><Link to="/add-product">Додати оголошення</Link></li>
              <li><Link to="/my-products">Мої оголошення</Link></li>
              <li><Link to="/profile">Профіль</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Контакти</h3>
            <ul className="contact-list">
              <li>
                <Icons.Mail />
                <a href="mailto:support@tradingauction.com">support@tradingauction.com</a>
              </li>
              <li>
                <Icons.Phone />
                <a href="tel:+380123456789">+380 12 345 67 89</a>
              </li>
              <li>
                <Icons.Map />
                <span>Львів, Україна</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TradingAuction. Усі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;