import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES_LIST } from '../api/constants.js';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: {
      country: '',
      city: '',
      postalCode: '',
      street: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // 1. Стан завантаження
  const [showCountryOptions, setShowCountryOptions] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const filteredCountries = useMemo(() => {
    return COUNTRIES_LIST.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Введіть коректний email';
      isValid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Пароль має бути мінімум 8 символів';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
      isValid = false;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    
    if (!formData.phone || !phoneRegex.test(formData.phone) || phoneDigits.length < 10) {
      newErrors.phone = 'Невірний формат (напр: +380991234567)';
      isValid = false;
    }

    const isValidCountry = COUNTRIES_LIST.some(c => c.name === formData.address.country);
    if (!formData.address.country || !isValidCountry) {
      newErrors.country = 'Оберіть країну зі списку';
      isValid = false;
    }
    
    if (!formData.address.city.trim()) {
      newErrors.city = 'Вкажіть місто';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (['city', 'postalCode', 'street'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCountrySelect = (country) => {
    setFormData((prev) => ({
      ...prev,
      phone: (prev.phone.length < 2) ? country.dialCode : prev.phone,
      address: { ...prev.address, country: country.name }
    }));
    setCountrySearch(country.name);
    setShowCountryOptions(false);
    
    if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
  };

  const handleCountrySearchChange = (e) => {
    const value = e.target.value;
    setCountrySearch(value);

    const exactMatch = COUNTRIES_LIST.find(c => c.name.toLowerCase() === value.toLowerCase());
    
    setFormData(prev => ({
       ...prev, 
       address: { ...prev.address, country: exactMatch ? exactMatch.name : value } 
    }));
    setShowCountryOptions(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(formData);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors(prev => ({ ...prev, global: err.message || 'Помилка реєстрації' }));
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Реєстрація</h2>
        {errors.global && <div className="error-banner" role="alert">{errors.global}</div>}

        <form onSubmit={handleSubmit} noValidate>
          
          <div className="form-group-row">
            <div className="input-wrapper">
              <label htmlFor="firstName">Ім'я</label>
              <input 
                id="firstName"
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                className={errors.firstName ? 'input-error' : ''}
                disabled={isLoading}
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="lastName">Прізвище</label>
              <input 
                id="lastName"
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                className={errors.lastName ? 'input-error' : ''}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="country">Країна</label>
            <div className="custom-select" ref={dropdownRef}>
              <input 
                id="country"
                type="text" 
                name="country"
                value={countrySearch} 
                onChange={handleCountrySearchChange}
                onFocus={() => setShowCountryOptions(true)}
                placeholder="Пошук країни..."
                className={errors.country ? 'input-error' : ''}
                autoComplete="off"
                disabled={isLoading}
              />
              {showCountryOptions && (
                <ul className="options-list">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <li key={c.code} onClick={() => handleCountrySelect(c)}>
                        {/* Припускаємо, що flag - це emoji або компонент */}
                        <span className="flag">{c.flag}</span> {c.name}
                      </li>
                    ))
                  ) : (
                    <li className="no-options">Країну не знайдено</li>
                  )}
                </ul>
              )}
            </div>
            {errors.country && <span className="error-text">{errors.country}</span>}
          </div>

          <div className="form-group-row">
             <div className="input-wrapper" style={{flex: 1}}>
                <label htmlFor="city">Місто</label>
                <input 
                  id="city"
                  type="text" 
                  name="city" 
                  value={formData.address.city} 
                  onChange={handleChange}
                  className={errors.city ? 'input-error' : ''}
                  disabled={isLoading}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
             </div>
             <div className="input-wrapper" style={{flex: 1}}>
                <label htmlFor="phone">Телефон</label>
                <input 
                  id="phone"
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="+380..." 
                  className={errors.phone ? 'input-error' : ''}
                  disabled={isLoading}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
             </div>
          </div>

          <div className="form-group-row">
            <div className="input-wrapper" style={{flex: 2}}>
                <label htmlFor="street">Вулиця</label>
                <input 
                  id="street" type="text" name="street" 
                  value={formData.address.street} onChange={handleChange} 
                  disabled={isLoading}
                />
            </div>
            <div className="input-wrapper" style={{flex: 1}}>
                <label htmlFor="postalCode">Індекс</label>
                <input 
                  id="postalCode" type="text" name="postalCode" 
                  value={formData.address.postalCode} onChange={handleChange} 
                  disabled={isLoading}
                />
            </div>
          </div>

          <div className="divider">Дані входу</div>

          <div className="input-wrapper">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              autoComplete="username"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group-row">
            <div className="input-wrapper">
              <label htmlFor="password">Пароль</label>
              <input 
                id="password"
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete="new-password"
                disabled={isLoading}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="input-wrapper">
              <label htmlFor="confirmPassword">Підтвердження</label>
              <input 
                id="confirmPassword"
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
                autoComplete="new-password"
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>
        
        <p className="login-link">
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;