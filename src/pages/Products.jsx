import React, { useEffect, useState } from 'react';
import { userApi, CATEGORIES } from '../api/userApi';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    image: '',
    category: '',
    contactInfo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(3);

  useEffect(() => {
    userApi.getProducts()
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const result = await userApi.addProduct(newProduct);
    setProducts([...products, result]);
    setNewProduct({ name: '', price: 0, description: '', image: '', category: '', contactInfo: '' });
    alert('Товар додано!');
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="products-container">
      <h2>Сторінка товарів</h2>

      {currentProducts.length > 0 ? (
        <ul className="products-list">
          {currentProducts.map(product => (
            <li key={product.id} className="product-card">
              {product.image && <img src={product.image} alt={product.name} />}
              <h3>{product.name}</h3>
              <p>Ціна: {product.price} грн</p>
              <p>Опис: {product.description}</p>
              <p>Категорія: {product.category}</p>
              <p>Контакти: {product.contactInfo}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>Наразі немає товарів.</p>
      )}

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Назад</button>
        <span>Сторінка {currentPage} з {totalPages}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Далі</button>
      </div>

      <h3>Додати новий товар</h3>
      <form className="add-product-form" onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Назва товару"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Ціна"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
          required
        />
        <input
          type="text"
          placeholder="Опис"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          required
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <select
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          required
        >
          <option value="" disabled>Оберіть категорію</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="text"
          placeholder="Контактні дані (email/телефон)"
          value={newProduct.contactInfo}
          onChange={(e) => setNewProduct({ ...newProduct, contactInfo: e.target.value })}
          required
        />
        <button type="submit">Додати товар</button>
      </form>
    </div>
  );
};

export default Products;
