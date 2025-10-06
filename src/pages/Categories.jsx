import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import '../styles/Categories.css';
import { FaLaptop, FaTshirt, FaAppleAlt, FaFootballBall, FaEllipsisH } from 'react-icons/fa';

const CATEGORIES = ['Електроніка', 'Одяг', 'Їжа', 'Спорт', 'Інше'];

const categoryIcons = {
  'Електроніка': <FaLaptop size={50} />,
  'Одяг': <FaTshirt size={50} />,
  'Їжа': <FaAppleAlt size={50} />,
  'Спорт': <FaFootballBall size={50} />,
  'Інше': <FaEllipsisH size={50} />,
};

const Categories = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    userApi.getProducts()
      .then((data) => {
        let filtered = data;
        if (categoryName) {
          filtered = data.filter(p => p.category === categoryName);
        }
        const lastFive = filtered.slice(-4).reverse(); 
        setProducts(lastFive);
      })
      .catch(err => console.error('Error fetching products:', err));
  }, [categoryName]);

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="categories-container">
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Пошук товарів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Пошук</button>
      </div>

      {/* Категорії */}
      <h2>Категорії</h2>
      <ul className="categories-nav">
        {CATEGORIES.map(category => (
          <li key={category} className="category-card">
            <Link to={`/categories/${category}`}>
              <div className="icon-wrapper">
                {categoryIcons[category] || <FaEllipsisH size={50} />}
              </div>
              <span>{category}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h3 className="category-title">
  {categoryName ? `Товари в категорії: ${categoryName}` : 'Останні додані товари'}
</h3>


      {products.length > 0 ? (
        <ul className="products-list">
          {products.map(product => (
            <li
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)} 
            >
              {product.images && product.images.length > 0 && (
                <img src={product.images[0]} alt={product.name} />
              )}
              <h3>{product.name}</h3>
              <p>Кількість: {product.count} шт</p>
              <p>Категорія: {product.category}</p>
              <p>Контакти: {product.contactInfo}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-products">Товари в цій категорії відсутні.</p>
      )}
    </div>
  );
};

export default Categories;
