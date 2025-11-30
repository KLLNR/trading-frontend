import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Payment.css';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate('/categories'), 5000); 
  }, [navigate]);

  return (
    <div className="payment-container success">
      <h2>Платіж успішний!</h2>
      <p>Дякуємо за покупку. Ви будете перенаправлені на головну сторінку через 5 секунд.</p>
    </div>
  );
};

export default Success;