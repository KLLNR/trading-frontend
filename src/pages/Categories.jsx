import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [products, setProducts] = useState([]);

  useEffect(() => {
    userApi.getProducts()
      .then((data) => {
        if (categoryName) {
          const filtered = data.filter(p => p.category === categoryName);
          setProducts(filtered);
        } else {
          setProducts(data);
        }
      })
      .catch(err => console.error('Error fetching products:', err));
  }, [categoryName]);

  return (
    <div className="categories-container">
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
        Товари в категорії: {categoryName || 'Усі'}
      </h3>

      {products.length > 0 ? (
        <ul className="products-list">
          {products.map(product => (
            <li key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>Кількість: {product.count} шт</p>
              <p>Опис: {product.description}</p>
              {product.image && <img src={product.image} alt={product.name} />}
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
