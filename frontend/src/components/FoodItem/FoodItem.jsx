import React, {useContext} from "react";
import "./FoodItem.css";
import {assets} from "../../assets/frontend_assets/assets";
import {StoreContext} from "../../context/StoreContext";

const FoodItem = ({id, name, price, description, image, isDeleted}) => {
  const {cartItems, addToCart, removeFromCart, url} = useContext(StoreContext);

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        {/* Image URL routes through API Gateway to food-service */}
        <img className="food-item-image" src={url + "/images/" + image} alt="" />
        {isDeleted && (
          <div className="out-of-order-overlay">
            <span className="out-of-order-text">OUT OF ORDER</span>
          </div>
        )}
        {!isDeleted && !cartItems[id] ? (
          <img className="add" onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
        ) : !isDeleted ? (
          <div className="food-item-counter">
            <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
            <p>{cartItems[id]}</p>
            <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
          </div>
        ) : null}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
