import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', CLOUDINARY_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: data,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Помилка завантаження зображення');
  }
  
  const result = await response.json();
  return result.secure_url;
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); 
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    isForTrade: true,
    isForSale: false,
    imageUrl: '', 
  });

  const [selectedFile, setSelectedFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getProductById(id);

        setFormData({
          title: data.title,
          description: data.description,
          categoryId: data.category?.id || data.categoryId || '',
          price: data.price || '',
          isForTrade: data.isForTrade,
          isForSale: data.isForSale,
          imageUrl: data.imageUrl,
        });

        setImagePreview(data.imageUrl);
      } catch (err) {
        console.error('Error loading product:', err);
        setErrors({ global: 'Не вдалося завантажити дані товару.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    return () => {
      if (imagePreview && selectedFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, selectedFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
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
    setErrors((prev) => ({ ...prev, image: null }));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
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
    setFormData(prev => ({ ...prev, imageUrl: '' })); 
  };

  const preventNegativeInput = (e) => {
    if (['-', '+', 'e'].includes(e.key)) e.preventDefault();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Вкажіть назву товару';
    else if (formData.title.length < 3) newErrors.title = 'Назва надто коротка';

    if (!formData.description.trim()) newErrors.description = 'Додайте опис товару';
    else if (formData.description.length < 10) newErrors.description = 'Опис надто короткий';

    if (!formData.categoryId) newErrors.categoryId = 'Оберіть категорію';

    if (!imagePreview) newErrors.image = 'Фото товару є обов’язковим';

    if (formData.isForSale) {
      if (!formData.price) newErrors.price = 'Вкажіть ціну';
      else if (Number(formData.price) <= 0) newErrors.price = 'Ціна має бути більше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    
    try {
      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        try {
          finalImageUrl = await uploadToCloudinary(selectedFile);
        } catch (uploadErr) {
          console.error(uploadErr);
          setErrors((prev) => ({ ...prev, global: 'Не вдалося завантажити нове фото.' }));
          setSubmitting(false);
          return;
        }
      }

      const productToUpdate = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: finalImageUrl,
        categoryId: Number(formData.categoryId),
        isForTrade: formData.isForTrade,
        isForSale: formData.isForSale,
        price: formData.isForSale ? Number(formData.price) : 0,
      };

      await productApi.updateProduct(id, productToUpdate);
      
      navigate(`/product/${id}`);

    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ 
        ...prev, 
        global: err.response?.data?.message || err.message || 'Помилка при оновленні товару.' 
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="add-product-page"><div className="loading-spinner">Завантаження даних...</div></div>;
  }

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        
        <div className="form-header">
            <h2 className="add-product-title">Редагувати оголошення</h2>
            <p className="form-subtitle">Внесіть зміни та збережіть результат</p>
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                    <p>Перетягніть нове фото сюди або</p>
                    <label htmlFor="file-upload" className="upload-btn">
                        Оберіть файл
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={submitting}
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
                    disabled={submitting}
                    title="Видалити фото"
                >
                    &times;
                </button>
                {!selectedFile && <div className="image-status-badge">Поточне фото</div>}
                {selectedFile && <div className="image-status-badge new">Нове фото</div>}
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
                  disabled={submitting}
                  className="form-select"
                >
                  <option value="" disabled>Оберіть категорію</option>
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
                        disabled={submitting}
                    />
                    <span className="radio-label">Обмін</span>
                </label>

                <label className={`radio-card ${formData.isForSale ? 'active' : ''}`}>
                    <input
                        type="radio"
                        name="dealType"
                        checked={formData.isForSale}
                        onChange={() => handleRadioChange('sale')}
                        disabled={submitting}
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
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  onKeyDown={preventNegativeInput}
                  disabled={submitting}
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
                disabled={submitting}
            >
                Скасувати
            </button>
            <button 
                type="submit" 
                disabled={submitting} 
                className={`submit-btn ${submitting ? 'loading' : ''}`}
            >
              {submitting ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProduct;