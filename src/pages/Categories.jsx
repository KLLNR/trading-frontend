import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userApi, CATEGORIES } from '../api/userApi';

const Categories = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    userApi.getProducts().then((data) => {
      console.log('Fetched products for category:', data);
      if (categoryName) {
        const filteredProducts = data.filter((product) => product.category === categoryName);
        setProducts(filteredProducts);
      } else {
        setProducts(data); // Якщо категорія не вказана, показуємо всі
      }
    }).catch((error) => console.error('Error fetching products:', error));
  }, [categoryName]);

  return (
    <div>
      <h2>Категорії</h2>
      <ul>
        {CATEGORIES.map((category) => (
          <li key={category}>
            <a href={`/categories/${category}`}>{category}</a>
          </li>
        ))}
      </ul>
      <h3>Товари в категорії: {categoryName || 'Усі'}</h3>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h3>{product.name}</h3>
              <p>Ціна: {product.price} грн</p>
              <p>Опис: {product.description}</p>
              {product.image && (
                <img src={product.image} alt={product.name} style={{ width: '150px', height: '150px' }} />
              )}
              <p>Категорія: {product.category}</p>
              <p>Контакти: {product.contactInfo}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Товари в цій категорії відсутні.</p>
      )}
    </div>
  );
};

export default Categories;