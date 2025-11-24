import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { CATEGORIES } from '../api/constants';
import '../styles/Categories.css';
import { 
  FaLaptop, FaTshirt, FaAppleAlt, FaFootballBall, FaEllipsisH,
  FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const categoryIcons = {
  'Електроніка': <FaLaptop size={50} />,
  'Одяг': <FaTshirt size={50} />,
  'Їжа': <FaAppleAlt size={50} />,
  'Спорт': <FaFootballBall size={50} />,
  'Інше': <FaEllipsisH size={50} />,
};

const getCategoryName = (categoryId) => {
  const cat = CATEGORIES.find(c => c.id === Number(categoryId));
  return cat ? cat.name : 'Інше';
};

const Categories = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const pageSize = categoryName ? 8 : 4; 

  const getProductImage = (product) => product?.imageUrl || 'https://via.placeholder.com/300';
  const getProductTitle = (product) => product?.title || 'Без назви';

  useEffect(() => {
    setCurrentPage(0);
  }, [categoryName]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {

        const response = await productApi.getProducts({
          sort: 'id,desc',
          size: 1000
        });

        let allFetchedData = [];
        if (response?.content) {
          allFetchedData = response.content;
        } else if (Array.isArray(response)) {
          allFetchedData = response;
        }

        let filteredData = allFetchedData;
        if (categoryName) {
          const targetCat = CATEGORIES.find(c => c.name === categoryName);
          if (targetCat) {
            filteredData = allFetchedData.filter(p => 
              Number(p.categoryId) === targetCat.id || p.category?.id === targetCat.id
            );
          }
        }

        // Рахуємо скільки всього сторінок вийшло після фільтрації
        const totalPagesCount = Math.ceil(filteredData.length / pageSize);
        setTotalPages(totalPagesCount);

        // Вирізаємо шматок масиву для поточної сторінки
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const productsForCurrentPage = filteredData.slice(startIndex, endIndex);

        setProducts(productsForCurrentPage);

      } catch (err) {
        console.error('Помилка:', err);
        setError('Не вдалося завантажити оголошення.');
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchData();
  }, [categoryName, currentPage, pageSize]); // Якщо змінюється сторінка -> перераховуємо slice

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
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
        {CATEGORIES.map(cat => (
          <li key={cat.id} className={`category-card ${categoryName === cat.name ? 'active' : ''}`}>
            <Link to={`/categories/${cat.name}`}>
              <div className="icon-wrapper">
                {categoryIcons[cat.name] || <FaEllipsisH size={50} />}
              </div>
              <span>{cat.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h3 className="category-title">
        {categoryName ? `Нещодавні оголошення в категорії: ${categoryName}` : 'Нещодавно додані оголошення'}
      </h3>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="loading-text">Завантаження...</p>
      ) : products.length > 0 ? (
        <>
          <ul className="products-list">
            {products.map(product => (
              <li
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img src={getProductImage(product)} alt={getProductTitle(product)} />
                <h3>{getProductTitle(product)}</h3>
                <p className="category-label">
                   {getCategoryName(product.categoryId || product.category?.id)}
                </p>
                
                {product.isForSale ? (
                  <p className="product-price">{product.price ?? 0} грн</p>
                ) : product.isForTrade ? (
                  <p className="product-exchange">На обмін</p>
                ) : null}
              </li>
            ))}
          </ul>

          {/* Пагінація відображається тільки якщо сторінок більше однієї */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
              >
                <FaChevronLeft /> Назад
              </button>
              
              <span className="pagination-info">
                {currentPage + 1} / {totalPages}
              </span>
              
              <button 
                className="pagination-btn" 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages - 1}
              >
                Далі <FaChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-products">
            <p>Оголошення в цій категорії відсутні.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;