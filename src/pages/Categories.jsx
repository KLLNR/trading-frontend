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
    const [usersMap, setUsersMap] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const getProductImage = (product) => {
      if (Array.isArray(product?.image_url) && product.image_url.length > 0) {
        return product.image_url[0];
      }
      return 'https://via.placeholder.com/150';
    };  

      const getProductTitle = (product) => 
      product?.title || 'Без назви';

    const getOwnerId = (product) =>
      product?.owner_id ?? product?.ownerId;

    useEffect(() => {
      const fetchData = async () => {
        try {
          const allProducts = await userApi.getProducts();

          // Фільтрація по категорії
          let filtered = categoryName
            ? allProducts.filter(p => p.category === categoryName)
            : allProducts;

          const lastFour = filtered.slice(-4).reverse();
          setProducts(lastFour);

          // Підтягуємо власників
          const ownerIds = [...new Set(lastFour.map(getOwnerId))];
          const usersTemp = {};
          for (const id of ownerIds) {
            try {
              const user = await userApi.getUser(id);
              usersTemp[id] = user;
            } catch (err) {
              console.warn('Не вдалося отримати користувача', id);
            }
          }
          setUsersMap(usersTemp);

        } catch (err) {
          console.error('Error fetching products:', err);
        }
      };

      fetchData();
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
            {products.map(product => {
              const ownerId = getOwnerId(product);
              const owner = usersMap[ownerId];

              return (
                <li
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img src={getProductImage(product)} alt={getProductTitle(product)} />
                  <h3>{getProductTitle(product)}</h3>
                  <p>Кількість: {product.count ?? '-'}</p>
                  <p>Категорія: {product.category ?? '-'}</p>
                  {product.is_for_sale || product.type === 'sell' ? (
                    <p className="product-price">Ціна: {product.price ?? 0} грн</p>
                  ) : product.is_for_trade || product.type === 'exchange' ? (
                    <p className="product-exchange">На обмін</p>
                  ) : null}
                  <p>Опис: {product.description ?? '-'}</p>
                  {owner && <p>Контакти: {owner.email || owner.phone || '-'}</p>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="no-products">Товари в цій категорії відсутні.</p>
        )}
      </div>
    );
  };

  export default Categories;
