import React from 'react';
import '../CSS/ProductCard.css'

function CartProduct({isAuthenticated, product, setcart }) {
  function truncateTitle(title, maxLength) {
  return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  }
    const handlecart=()=>{
      setcart(prev => prev.filter(id => id !== product["Product Id"]));
    }

  return (
    <div className="product-card">
      <img src={product["Image Url"]} alt={product["Product Name"]} className="card-img" />
      <div className="card-body">
        <h2 className="card-title">{truncateTitle(product["Product Name"], 50)}</h2>
        <p className="card-category">{product["Main Category"]} , {product["Sub Category"]}</p>
        <p className="card-desc">{truncateTitle(product["Product Description"],100)}</p>
        <p className="card-price"><b>Price : ${product["Product Price"]}</b></p>
        <div className="card-footer">
          <button className='visit btn btn-info'><a href={product["Product Url"]}  target='blank'>Visit Store</a></button>
          <button className='visit btn btn-dark' onClick={handlecart}> Remove Item</button>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
