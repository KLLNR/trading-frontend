import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userApi, CATEGORIES } from '../api/userApi';
import '../styles/Products.css';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    count: 0,
    description: '',
    image_url: [],
    category: '',
    contactInfo: '',
    is_for_trade: true,
    is_for_sale: false,
    price: '',
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(3);

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  // === Отримання продуктів ===
  useEffect(() => {
    userApi.getProducts()
      .then((data) => {
        setProducts(data);
        if (searchQuery) {
          const filtered = data.filter(p =>
            p.title?.toLowerCase().includes(searchQuery) ||
            p.description?.toLowerCase().includes(searchQuery)
          );
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(data);
        }              
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, [searchQuery]);

  // === Зміна фото ===
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.image_url.length > 5) {
      alert('Максимум 5 фото!');
      return;
    }

    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));

    Promise.all(readers).then(newImages => {
      setNewProduct({ ...newProduct, image_url: [...newProduct.image_url, ...newImages] });
      setPreviewImages([...previewImages, ...newImages]);
    });
  };

  // === Додавання продукту ===
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (!currentUser) {
      alert('Будь ласка, увійдіть у систему.');
      return;
    }

    const productWithUser = {
      ...newProduct,
      owner_id: currentUser.id,
      price: newProduct.is_for_sale ? Number(newProduct.price) : 0,
    };

    const result = await userApi.addProduct(productWithUser);

    setProducts([...products, result]);
    setFilteredProducts([...filteredProducts, result]);
    setNewProduct({
      title: '',
      count: 0,
      description: '',
      image_url: [],
      category: '',
      contactInfo: '',
      is_for_trade: true,
      is_for_sale: false,
      price: '',
    });
    setPreviewImages([]);
    alert('Товар додано!');
  };

  // === Пагінація ===
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="products-container">
      <h2>Товари</h2>

      {currentProducts.length > 0 ? (
        <ul className="products-list">
          {currentProducts.map(product => (
            <li
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {product.image_url && product.image_url.length > 0 && (
                <img src={product.image_url[0]} alt={product.title} />
              )}
              <h3>{product.title}</h3>
              <p>Кількість: {product.count} шт</p>
              <p>Категорія: {product.category}</p>

              {product.is_for_sale ? (
                <p className="product-price">Ціна: {product.price} грн</p>
              ) : (
                <p className="product-exchange">На обмін</p>
              )}

              <p>Контакти: {product.contactInfo}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>Товари не знайдено.</p>
      )}

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Назад</button>
        <span>Сторінка {currentPage} з {totalPages}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Далі</button>
      </div>

      {/* === Додавання нового товару === */}
      <div className="add-product-container">
        <h2>Додати новий товар</h2>
        <form onSubmit={handleAddProduct}>

          <span className="add-product-label">Назва</span>
          <input
            type="text"
            placeholder="Назва товару"
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
            required
          />

          <span className="add-product-label">Кількість</span>
          <input
            type="number"
            min={1}
            placeholder="Кількість"
            value={newProduct.count}
            onChange={(e) => setNewProduct({ ...newProduct, count: Number(e.target.value) })}
            required
          />

          <span className="add-product-label">Опис</span>
          <textarea
            placeholder="Опис товару"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows={5}
            maxLength={9000}
            required
          />
          <p className="add-product-charcount">{newProduct.description.length} / 9000</p>

          <span className="add-product-label">Тип товару</span>
          <div className="type-options">
            <label>
              <input
                type="radio"
                name="type"
                value="sell"
                checked={newProduct.is_for_sale}
                onChange={() => setNewProduct({ ...newProduct, is_for_sale: true, is_for_trade: false })}
              />
              На продаж
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="exchange"
                checked={newProduct.is_for_trade}
                onChange={() => setNewProduct({ ...newProduct, is_for_trade: true, is_for_sale: false, price: '' })}
              />
              На обмін
            </label>
          </div>

          {newProduct.is_for_sale && (
            <>
              <span className="add-product-label">Ціна (грн)</span>
              <input
                type="number"
                placeholder="Вкажіть ціну"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
            </>
          )}

          <span className="add-product-label">Фото</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          <div className="preview-images">
            {previewImages.map((img, index) => (
              <img key={index} src={img} alt={`Попередній перегляд ${index + 1}`} />
            ))}
          </div>

          <span className="add-product-label">Категорія</span>
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
          >
            <option value="" disabled>Оберіть категорію</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <span className="add-product-label">Контактна інформація</span>
          <input
            type="text"
            placeholder="email/телефон"
            value={newProduct.contactInfo}
            onChange={(e) => setNewProduct({ ...newProduct, contactInfo: e.target.value })}
            required
          />

          <button type="submit" className="add-product-button">Додати товар</button>
        </form>
      </div>
    </div>
  );
};

export default Products;
