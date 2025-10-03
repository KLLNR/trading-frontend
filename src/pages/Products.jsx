import React, { useEffect, useState } from 'react';
import { userApi, CATEGORIES } from '../api/userApi';

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
    userApi.getProducts().then((data) => {
      console.log('Fetched products:', data);
      setProducts(data);
    }).catch((error) => console.error('Error fetching products:', error));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const result = await userApi.addProduct(newProduct);
    setProducts([...products, result]);
    setNewProduct({
      name: '',
      price: 0,
      description: '',
      image: '',
      category: '',
      contactInfo: '',
    });
    alert('Товар додано!');
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <h2>Сторінка товарів</h2>
      {currentProducts.length > 0 ? (
        <ul>
          {currentProducts.map((product) => (
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
        <p>Наразі немає товарів.</p>
      )}
      <div>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Назад</button>
        <span> Сторінка {currentPage} з {totalPages} </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Далі</button>
      </div>
      <h3>Додати новий товар</h3>
      <form onSubmit={handleAddProduct}>
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
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <select
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          required
        >
          <option value="" disabled>Оберіть категорію</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
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