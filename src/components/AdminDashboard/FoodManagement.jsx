import React from "react";
import AddFoodForm from "./AddFoodForm";
import FoodItemCard from "./FoodItemCard";

const FoodManagement = ({
  foodItems,
  categories,
  onAddFoodItem,
  onUpdateFoodItem,
  onDeleteFoodItem,
  onToggleAvailability,
}) => {
  return (
    <div className="food-management">
      <AddFoodForm categories={categories} onAddFoodItem={onAddFoodItem} />

      <div className="food-items-list">
        <h2>Manage Food Items ({foodItems.length} items)</h2>
        <div className="food-grid">
          {foodItems.map((item) => (
            <FoodItemCard
              key={item.id}
              item={item}
              categories={categories}
              onUpdate={onUpdateFoodItem}
              onDelete={onDeleteFoodItem}
              onToggleAvailability={(id, available) => onToggleAvailability(id, available)}
            />
          ))}
        </div>
        {foodItems.length === 0 && (
          <div className="empty-state">
            <p>No food items found. Add your first item above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodManagement;
