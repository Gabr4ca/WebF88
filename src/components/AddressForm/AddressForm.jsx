import React, {useState, useContext} from "react";
import {StoreContext} from "../../context/StoreContext";
import "./AddressForm.css";

const AddressForm = ({onClose, onAddressAdded}) => {
  const {addAddress} = useContext(StoreContext);
  const [formData, setFormData] = useState({
    address: "",
    street: "",
    apartment: "",
    city: "",
    province: "",
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.province.trim()) {
      newErrors.province = "Province is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const result = await addAddress(formData);

      if (result.success) {
        if (onAddressAdded) {
          onAddressAdded(result.data);
        }
        if (onClose) {
          onClose();
        }
      } else {
        alert("Error adding address: " + result.error);
      }
    } catch (error) {
      alert("Error adding address: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-form-overlay">
      <div className="address-form-container">
        <div className="address-form-header">
          <h2>Add New Address</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="address-form">
          <div className="form-group">
            <label htmlFor="address">Address Name *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., Home, Work, etc."
              className={errors.address ? "error" : ""}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="street">Street Address *</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              className={errors.street ? "error" : ""}
            />
            {errors.street && <span className="error-message">{errors.street}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apartment">Apartment/Unit (Optional)</label>
            <input
              type="text"
              id="apartment"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
              placeholder="Apt 4B, Unit 2, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City name"
                className={errors.city ? "error" : ""}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="province">Province *</label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="Province"
                className={errors.province ? "error" : ""}
              />
              {errors.province && <span className="error-message">{errors.province}</span>}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleInputChange} />
              <span className="checkmark"></span>
              Set as default address
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Adding..." : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
