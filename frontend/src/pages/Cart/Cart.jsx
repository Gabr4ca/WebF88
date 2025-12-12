import React, {useContext, useState} from "react";
import "./Cart.css";
import {StoreContext} from "../../context/StoreContext";
import {useNavigate} from "react-router-dom";

const Cart = () => {
  const {food_list, cartItems, setCartItems, addToCart, removeFromCart, getTotalCartAmount, url} =
    useContext(StoreContext);

  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const handleRemoveClick = (itemId, itemName) => {
    setItemToRemove({id: itemId, name: itemName});
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id);
    }
    setShowConfirm(false);
    setItemToRemove(null);
  };

  const cancelRemove = () => {
    setShowConfirm(false);
    setItemToRemove(null);
  };

  return (
    <div className="cart">
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Remove Item</h3>
            <p>Are you sure you want to remove "{itemToRemove?.name}" from your cart?</p>
            <div className="confirm-buttons">
              <button onClick={confirmRemove} className="btn-yes">
                Yes
              </button>
              <button onClick={cancelRemove} className="btn-no">
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div>
                <div className="cart-items-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>${item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>${item.price * cartItems[item._id]}</p>
                  <p onClick={() => handleRemoveClick(item._id, item.name)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
