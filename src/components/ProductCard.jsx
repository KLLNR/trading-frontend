import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div style={{border: "1px solid #ccc", padding: "10px", margin: "10px", borderRadius: "8px"}}>
      <img src={product.image_url} alt={product.title} width="150" />
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      {product.is_for_trade && <span>🔄 Обмін можливий</span>}
      {product.is_for_sale && <span>💰 Продаж можливий</span>}
    </div>
  );
};

export default ProductCard;
