import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Payment.css';

const Cancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate('/categories'), 5000);
  }, [navigate]);

  return (
    <div className="payment-container cancel">
      <h2>Платіж скасовано</h2>
      <p>Ви скасували платіж. Ви будете перенаправлені на головну сторінку через 5 секунд.</p>
    </div>
  );
};

export default Cancel;