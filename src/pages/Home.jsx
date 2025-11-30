import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';
import { CATEGORIES } from '../api/constants';
import '../styles/Home.css';
import '../styles/Categories.css';

const Home = () => {
  const { user, updateProfile, logout } = useAuth(); 
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    street: '',
    postalCode: ''
  });

  const [userProducts, setUserProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const productsPerPage = 4; 

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        city: user.address?.city || '',
        street: user.address?.street || '',
        postalCode: user.address?.postalCode || ''
      });
    }
  }, [user]);

  const getCategoryName = (categoryId) => {
    const cat = CATEGORIES.find(c => c.id === Number(categoryId));
    return cat ? cat.name : 'Інше';
  };

  const getProductImage = (product) => {
    if (Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
      return product.imageUrl[0];
    }
    return product?.imageUrl || 'https://via.placeholder.com/300?text=No+Image';
  };

  const fetchUserProducts = useCallback(async () => {
    if (!user?.id) return;

    setLoadingProducts(true);
    try {
      const response = await productApi.getUserProducts(user.id, {
        page: currentPage,
        size: productsPerPage,
        sort: 'id,desc'
      });
      setUserProducts(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Не вдалося завантажити товари:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [user?.id, currentPage]);

  useEffect(() => {
    fetchUserProducts();
  }, [fetchUserProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: {
        country: user.address?.country || '', 
        city: formData.city,
        street: formData.street,
        postalCode: formData.postalCode
      }
    };

    try {
      await updateProfile(payload);
      setIsEditing(false);
      alert('Профіль успішно оновлено!');
    } catch (error) {
      alert('Помилка оновлення профілю');
      console.error(error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Ви впевнені, що хочете вийти?')) {
        if (logout) logout();
        navigate('/login');
    }
  };

  if (!user) return <div className="loading-text">Будь ласка, увійдіть.</div>;

  return (
    <div className="categories-container" style={{ paddingTop: '100px' }}>
      
      <div className="profile-header-section">
        <div className="profile-card">
          <div className="profile-title-row">
             <h2>Мій Профіль</h2>
             <div className="profile-actions">
                {!isEditing && (
                    <button 
                        className="btn-secondary" 
                        onClick={() => setIsEditing(true)}
                    >
                        Редагувати
                    </button>
                )}
                <button className="btn-danger" onClick={handleLogout}>Вийти</button>
             </div>
          </div>

          {!isEditing ? (
            /* РЕЖИМ ПЕРЕГЛЯДУ */
            <div className="profile-details-grid">
               <div className="detail-item">
                 <span className="label">Ім'я та Прізвище</span>
                 <span className="value">{user.firstName} {user.lastName || '—'}</span>
               </div>
               <div className="detail-item">
                 <span className="label">Email</span>
                 <span className="value">{user.email}</span>
               </div>
               <div className="detail-item">
                 <span className="label">Телефон</span>
                 <span className="value">{user.phone || 'Не вказано'}</span>
               </div>
               
               <div className="detail-item">
                 <span className="label">Країна</span>
                 <span className="value">{user.address?.country || 'Не вказано'}</span>
               </div>
               <div className="detail-item">
                 <span className="label">Місто</span>
                 <span className="value">{user.address?.city || 'Не вказано'}</span>
               </div>
               <div className="detail-item">
                 <span className="label">Вулиця</span>
                 <span className="value">{user.address?.street || 'Не вказано'}</span>
               </div>
               <div className="detail-item">
                 <span className="label">Індекс</span>
                 <span className="value">{user.address?.postalCode || 'Не вказано'}</span>
               </div>

               <div className="detail-item full-width">
                 <span className="label">Статус акаунта</span>
                 <span className="value badge-success">Активний</span>
               </div>
            </div>
          ) : (
            <form className="edit-profile-form" onSubmit={handleUpdateProfile}>
              <div className="form-grid">
                <div className="form-group">
                    <label>Ім'я</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Прізвище</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Телефон</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+380..."
                    />
                </div>
              </div>
              
              <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                      Скасувати
                  </button>
                  <button type="submit" className="pagination-btn active-btn">
                      Зберегти зміни
                  </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <hr style={{ margin: '48px 0', borderColor: 'var(--border-light)' }} />
      <div className="my-products-header">
          <h2>Мої оголошення</h2>
      </div>

      {loadingProducts ? (
        <p className="loading-text">Завантаження товарів...</p>
      ) : userProducts.length === 0 ? (
        <div className="no-products">
           <p>У вас ще немає активних оголошень.</p>
           <Link to="/add-product" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Створити перше оголошення</Link>
        </div>
      ) : (
        <>
          <div className="products-list"> 
            {userProducts.map((product) => (
              <div key={product.id} className="product-card">
                 <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <img 
                        src={getProductImage(product)} 
                        alt={product.title} 
                    />
                    <h3>{product.title}</h3>

                    <div className="product-meta-row">
                        <span className="category-label">
                            {getCategoryName(product.categoryId || product.category?.id)}
                        </span>
                        <span className="product-date">
                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString('uk-UA') : ''}
                        </span>
                    </div>

                    {product.isForSale ? (
                        <p className="product-price">{product.price} грн</p>
                    ) : (
                        <p className="product-exchange">На обмін</p>
                    )}
                 </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                disabled={currentPage === 0}
              >
                Назад
              </button>
              <span className="pagination-info">{currentPage + 1} / {totalPages}</span>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={currentPage >= totalPages - 1}
              >
                Далі
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;