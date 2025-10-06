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
    name: '',
    count: 0,
    description: '',
    images: [],
    category: '',
    contactInfo: '',
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(3);

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    userApi.getProducts()
      .then((data) => {
        setProducts(data);
        if (searchQuery) {
          const filtered = data.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery))
          );
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(data);
        }
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, [searchQuery]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) {
      alert('Максимум 5 фото!');
      return;
    }

    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));

    Promise.all(readers).then(newImages => {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ...newImages] });
      setPreviewImages([...previewImages, ...newImages]);
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const result = await userApi.addProduct(newProduct);
    setProducts([...products, result]);
    setFilteredProducts([...filteredProducts, result]);
    setNewProduct({
      name: '',
      count: 0,
      description: '',
      images: [],
      category: '',
      contactInfo: '',
    });
    setPreviewImages([]);
    alert('Товар додано!');
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="products-container">
      <h2>Сторінка товарів</h2>

      {currentProducts.length > 0 ? (
        <ul className="products-list">
          {currentProducts.map(product => (
            <li
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: 'pointer' }}
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
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>Товари не знайдено.</p>
      )}

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Назад</button>
        <span>Сторінка {currentPage} з {totalPages}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Далі</button>
      </div>

      <div className="add-product-container">
        <h2>Додати новий товар</h2>
        <form onSubmit={handleAddProduct}>

          <span className="add-product-label">Вкажіть назву</span>
          <input
            type="text"
            placeholder="Назва товару"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />

          <span className="add-product-label">Вкажіть кількість</span>
          <input
            type="number"
            min={1}
            placeholder="Кількість"
            value={newProduct.count}
            onChange={(e) => setNewProduct({ ...newProduct, count: Number(e.target.value) })}
            required
          />

          <span className="add-product-label">Опис товару</span>
          <textarea
            placeholder="Опис"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows={5}
            maxLength={9000}
            required
          />
          <p className="add-product-charcount">{newProduct.description.length} / 9000</p>

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

          <span className="add-product-label">Ваші контактні дані</span>
          <input
            type="text"
            placeholder="email/телефон"
            value={newProduct.contactInfo}
            onChange={(e) => setNewProduct({ ...newProduct, contactInfo: e.target.value })}
            required
          />

          <button type="submit">Додати товар</button>
        </form>
      </div>
    </div>
  );
};

export default Products;
