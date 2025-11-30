import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import userApi from '../api/userApi';
import { CATEGORIES } from '../api/constants';
import '../styles/Home.css';
import '../styles/Categories.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState('');
  const [userProducts, setUserProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [showPhone, setShowPhone] = useState(false);

  const productsPerPage = 4;

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const data = await userApi.getUserById(id);
        setProfileUser(data);
      } catch (err) {
        console.error(err);
        setError('Користувача не знайдено. Можливо, неправильний ID або немає доступу.');
      } finally {
        setLoadingUser(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

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
    if (!id) return;
    setLoadingProducts(true);
    try {
      const response = await productApi.getUserProducts(id, {
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
  }, [id, currentPage]);

  useEffect(() => {
    fetchUserProducts();
  }, [fetchUserProducts]);

  if (loadingUser) return <div className="loading-container"><p className="loading-text">Завантаження профілю...</p></div>;
  if (error || !profileUser) return <div className="error-container"><p className="error-text">{error || 'Користувача не знайдено'}</p></div>;

  return (
    <div className="categories-container" style={{ paddingTop: '100px' }}>
      
      <button onClick={() => navigate(-1)} className="back-link" style={{marginBottom: '20px', display: 'inline-block'}}>
        &larr; Назад
      </button>
      <div className="profile-header-section">
        <div className="profile-card">
          <div className="profile-title-row">
             <h2>Профіль користувача: {profileUser.firstName}</h2>
          </div>
          <div className="profile-details-grid">
               <div className="detail-item">
                 <span className="label">Ім'я та Прізвище</span>
                 <span className="value">{profileUser.firstName} {profileUser.lastName || ''}</span>
               </div>
               
               <div className="detail-item">
  <span className="label">Телефон</span>
  {showPhone ? (
    <span className="value phone-revealed">
      {profileUser.phone || 'Не вказано'}
    </span>
  ) : (
    <button 
      onClick={() => setShowPhone(true)} 
      className="show-phone-btn"
    >
      Показати номер телефону
    </button>
  )}
</div>

           </div>
        </div>
      </div>
      <hr style={{ margin: '48px 0', borderColor: 'var(--border-light)' }} />
      
      <div className="my-products-header">
          <h2>Оголошення користувача {profileUser.firstName}</h2>
      </div>
      {loadingProducts ? (
        <p className="loading-text">Завантаження товарів...</p>
      ) : userProducts.length === 0 ? (
        <div className="no-products">
           <p>У цього користувача немає активних оголошень.</p>
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

export default UserProfile;