import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../api/constants.js';
import { productApi } from '../api/productApi';
import '../styles/AddProduct.css'; 

const MAX_DESCRIPTION_LENGTH = 225;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const CLOUDINARY_PRESET = 'Trading-Auction-Images';
const CLOUDINARY_CLOUD_NAME = 'dr9m6rtou';

const validateFile = (file) => {
  if (!file) return 'Файл не обрано';
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Дозволені лише формати: JPG, PNG, WEBP';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Максимальний розмір файлу: ${MAX_FILE_SIZE_MB}MB`;
  }
  return null;
};

const AddProduct = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    isForTrade: true,
    isForSale: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      isForTrade: type === 'trade',
      isForSale: type === 'sale',
      price: type === 'trade' ? '' : prev.price
    }));
    if (errors.price) setErrors(prev => ({ ...prev, price: null }));
  };
  
  const processFile = useCallback((file) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }
    
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    setErrors((prev) => {
        if (prev.image) return { ...prev, image: null };
        return prev;
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Вкажіть назву товару';
    else if (formData.title.length < 3) newErrors.title = 'Назва надто коротка (мін. 3 символи)';

    if (!formData.description.trim()) newErrors.description = 'Додайте опис товару';
    else if (formData.description.length < 10) newErrors.description = 'Опис надто короткий (мін. 10 символів)';

    if (!formData.categoryId) newErrors.categoryId = 'Оберіть категорію';

    if (!selectedFile) newErrors.image = 'Фото товару є обов’язковим';

    if (formData.isForSale) {
      if (!formData.price) newErrors.price = 'Вкажіть ціну';
      else if (Number(formData.price) <= 0) newErrors.price = 'Ціна має бути більше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });

    if (!response.ok) throw new Error('Помилка завантаження зображення на сервер');
    const result = await response.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let imageUrl = '';
      try {
        imageUrl = await uploadToCloudinary(selectedFile);
      } catch (uploadErr) {
        console.error(uploadErr);
        setErrors((prev) => ({ ...prev, global: 'Не вдалося завантажити фото. Перевірте з\'єднання.' }));
        setLoading(false);
        return;
      }

      const productPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: imageUrl,
        categoryId: Number(formData.categoryId),
        isForTrade: formData.isForTrade,
        isForSale: formData.isForSale,
        price: formData.isForSale ? Number(formData.price) : 0,
      };

      const createdProduct = await productApi.addProduct(productPayload);
      
      navigate(`/product/${createdProduct.id}`);

    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, global: err.message || 'Щось пішло не так при створенні товару.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        
        <div className="form-header">
            <h2 className="add-product-title">Створити оголошення</h2>
            <p className="form-subtitle">Заповніть деталі, щоб додати новий лот</p>
        </div>

        {errors.global && (
          <div className="global-error-alert">
            {errors.global}
          </div>
        )}

        <form className="add-product-form" onSubmit={handleSubmit} noValidate>
          
          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label htmlFor="title">Назва товару <span className="required">*</span></label>
            <div className="input-wrapper">
                <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="Наприклад: IPhone 12 Pro Max"
                className="form-input"
                />
            </div>
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
            <label htmlFor="description">Опис <span className="required">*</span></label>
            <div className="input-wrapper">
                <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={loading}
                placeholder="Опишіть стан, дефекти, комплектацію..."
                className="form-textarea"
                />
                <div className="char-counter">
                    {formData.description.length} / {MAX_DESCRIPTION_LENGTH}
                </div>
            </div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className={`form-group ${errors.image ? 'has-error' : ''}`}>
            <label>Фотографії <span className="required">*</span></label>
            
            {!imagePreview ? (
              <div 
                className={`drop-zone ${isDragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="drop-zone-content">
                    <p>Перетягніть фото сюди або</p>
                    <label htmlFor="file-upload" className="upload-btn">
                        Оберіть файл
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="hidden-file-input"
                    />
                    <span className="file-hint">JPG, PNG до 5MB</span>
                </div>
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="remove-image-btn"
                    disabled={loading}
                    title="Видалити фото"
                >
                    &times;
                </button>
              </div>
            )}
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          <div className={`form-group ${errors.categoryId ? 'has-error' : ''}`}>
            <label htmlFor="categoryId">Категорія <span className="required">*</span></label>
            <div className="select-wrapper">
                <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={loading}
                className="form-select"
                >
                <option value="" disabled>Оберіть категорію зі списку</option>
                {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                </select>
            </div>
            {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label>Тип угоди <span className="required">*</span></label>
            <div className="radio-group-container">
                <label className={`radio-card ${formData.isForTrade ? 'active' : ''}`}>
                    <input
                        type="radio"
                        name="dealType"
                        checked={formData.isForTrade}
                        onChange={() => handleRadioChange('trade')}
                        disabled={loading}
                    />
                    <span className="radio-label">Обмін</span>
                </label>

                <label className={`radio-card ${formData.isForSale ? 'active' : ''}`}>
                    <input
                        type="radio"
                        name="dealType"
                        checked={formData.isForSale}
                        onChange={() => handleRadioChange('sale')}
                        disabled={loading}
                    />
                    <span className="radio-label">Продаж</span>
                </label>
            </div>
          </div>

          {formData.isForSale && (
            <div className={`form-group ${errors.price ? 'has-error' : ''} slide-in`}>
              <label htmlFor="price">Ціна (грн) <span className="required">*</span></label>
              <div className="input-wrapper price-wrapper">
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="0"
                  className="form-input"
                />
                <span className="currency-badge">₴</span>
              </div>
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
          )}

          <div className="form-actions">
            <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="cancel-btn"
                disabled={loading}
            >
                Скасувати
            </button>
            <button 
                type="submit" 
                disabled={loading} 
                className={`submit-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Публікація...' : 'Опублікувати'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;