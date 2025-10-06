import React, {useState} from "react";

const AddFoodForm = ({categories, onAddFoodItem}) => {
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    image_url: "",
    is_available: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddFoodItem(newFoodItem);
      // Reset form after successful submission
      setNewFoodItem({
        name: "",
        category_id: "",
        description: "",
        price: "",
        image_url: "",
        is_available: true,
      });
    } catch (error) {
      console.error("Error in AddFoodForm:", error);
    }
  };

  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setNewFoodItem({
      ...newFoodItem,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="add-food-form">
      <h2>Add New Food Item</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            type="text"
            name="name"
            placeholder="Food Name"
            value={newFoodItem.name}
            onChange={handleInputChange}
            required
          />
          <select name="category_id" value={newFoodItem.category_id} onChange={handleInputChange} required>
            <option value="">Select Category</option>
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
            placeholder="Price"
            value={newFoodItem.price}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="image_url"
            placeholder="Image URL"
            value={newFoodItem.image_url}
            onChange={handleInputChange}
          />
        </div>
        <textarea
          name="description"
          placeholder="Description"
          value={newFoodItem.description}
          onChange={handleInputChange}
          rows="3"
        />
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_available"
              checked={newFoodItem.is_available}
              onChange={handleInputChange}
            />
            Available for order
          </label>
        </div>
        <button type="submit">Add Food Item</button>
      </form>
    </div>
  );
};

export default AddFoodForm;
