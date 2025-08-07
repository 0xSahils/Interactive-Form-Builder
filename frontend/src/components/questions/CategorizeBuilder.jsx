import React from "react";
import { Plus, Trash2 } from "lucide-react";
import ImageUpload from "../ImageUpload";

const CategorizeBuilder = ({ data, onChange }) => {
  const handleQuestionChange = (question) => {
    onChange({ ...data, question });
  };

  const handleImageChange = (image) => {
    onChange({ ...data, image });
  };

  const handleCategoryChange = (index, value) => {
    const updatedCategories = [...data.categories];
    updatedCategories[index] = value;
    onChange({ ...data, categories: updatedCategories });
  };

  const handleAddCategory = () => {
    const newCategory = `Category ${data.categories.length + 1}`;
    onChange({
      ...data,
      categories: [...data.categories, newCategory],
    });
  };

  const handleRemoveCategory = (index) => {
    if (data.categories.length <= 2) {
      alert("At least 2 categories are required");
      return;
    }

    const categoryToRemove = data.categories[index];
    const updatedCategories = data.categories.filter((_, i) => i !== index);

    // Update items that were assigned to the removed category
    const updatedItems = data.items.map((item) => ({
      ...item,
      correctCategory:
        item.correctCategory === categoryToRemove
          ? updatedCategories[0]
          : item.correctCategory,
    }));

    onChange({
      ...data,
      categories: updatedCategories,
      items: updatedItems,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...data.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange({ ...data, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem = {
      text: `Item ${data.items.length + 1}`,
      correctCategory: data.categories[0],
    };
    onChange({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const handleRemoveItem = (index) => {
    if (data.items.length <= 1) {
      alert("At least 1 item is required");
      return;
    }

    const updatedItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: updatedItems });
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Question Text
        </label>
        <textarea
          value={data.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          className="textarea"
          placeholder="Enter your categorize question..."
          rows={3}
        />
      </div>

      {/* Question Image */}
      <ImageUpload
        label="Question Image (Optional)"
        value={data.image}
        onChange={handleImageChange}
        placeholder="Enter image URL or upload file"
      />

      {/* Categories */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-secondary-700">
            Categories
          </label>
          <button
            onClick={handleAddCategory}
            className="btn-outline text-xs flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="space-y-2">
          {data.categories.map((category, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={category}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                className="input flex-1"
                placeholder={`Category ${index + 1}`}
              />
              {data.categories.length > 2 && (
                <button
                  onClick={() => handleRemoveCategory(index)}
                  className="btn-outline text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-secondary-700">
            Items to Categorize
          </label>
          <button
            onClick={handleAddItem}
            className="btn-outline text-xs flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) =>
                  handleItemChange(index, "text", e.target.value)
                }
                className="input flex-1"
                placeholder={`Item ${index + 1}`}
              />

              <select
                value={item.correctCategory}
                onChange={(e) =>
                  handleItemChange(index, "correctCategory", e.target.value)
                }
                className="input w-48"
              >
                {data.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {data.items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="btn-outline text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-secondary-700 mb-3">Preview</h4>
        <div className="bg-secondary-50 p-4 rounded-lg">
          <p className="font-medium mb-3">
            {data.question || "Question text will appear here"}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Items */}
            <div>
              <h5 className="text-sm font-medium mb-2">Items</h5>
              <div className="space-y-2">
                {data.items.map((item, index) => (
                  <div key={index} className="drag-item text-sm">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h5 className="text-sm font-medium mb-2">Categories</h5>
              <div className="space-y-2">
                {data.categories.map((category, index) => (
                  <div key={index} className="drop-zone text-sm">
                    <strong>{category}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorizeBuilder;
