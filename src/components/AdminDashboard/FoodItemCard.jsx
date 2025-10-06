import React, {useState} from "react";

const FoodItemCard = ({item, categories, onUpdate, onDelete, onToggleAvailability}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name,
    category_id: item.category_id,
    description: item.description || "",
    price: item.price,
    image_url: item.image_url || "",
    is_available: item.is_available,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(item.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving food item:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: item.name,
      category_id: item.category_id,
      description: item.description || "",
      price: item.price,
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  if (isEditing) {
    return (
      <div className="food-card">
        <form onSubmit={handleSave} className="edit-food-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Food Name"
            required
          />
          <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Price"
            required
          />
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            placeholder="Image URL"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            rows="2"
          />
          <label>
            <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleInputChange} />
            Available
          </label>
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="food-card">
      <div className="food-image">
        {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="no-image">No Image</div>}
      </div>
      <div className="food-info">
        <h3>{item.name}</h3>
        <p className="category">{item.category_name}</p>
        <p className="description">{item.description}</p>
        <p className="price">${item.price}</p>
        <div className="availability">
          <label>
            <input
              type="checkbox"
              checked={item.is_available}
              onChange={(e) => onToggleAvailability(item.id, e.target.checked)}
            />
            Available
          </label>
        </div>
      </div>
      <div className="food-actions">
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default FoodItemCard;
