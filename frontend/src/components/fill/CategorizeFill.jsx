import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

const DragItem = ({ item, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "item",
    item: { item, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`drag-item cursor-move p-4 bg-white border-2 border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="font-medium">{item.text}</span>
    </div>
  );
};

const DropZone = ({ category, items, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "item",
    drop: (draggedItem) => {
      onDrop(draggedItem.item, category);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`drop-zone min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver
          ? "border-primary-400 bg-primary-50"
          : "border-secondary-300 bg-gray-50"
      }`}
    >
      <h4 className="font-semibold text-secondary-700 mb-3">{category}</h4>

      {items.length === 0 ? (
        <p className="text-sm text-secondary-500">Drop items here</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-secondary-200 rounded p-2 text-sm"
            >
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategorizeFill = ({ data, response, onChange }) => {
  const [categorizedItems, setCategorizedItems] = useState({});
  const [uncategorizedItems, setUncategorizedItems] = useState([]);

  useEffect(() => {
    // Initialize items
    if (response && response.categorizeAnswer) {
      // Load from existing response
      const categorized = {};
      data.categories.forEach((category) => {
        categorized[category] = [];
      });

      response.categorizeAnswer.forEach((answer) => {
        if (categorized[answer.selectedCategory]) {
          categorized[answer.selectedCategory].push({ text: answer.item });
        }
      });

      setCategorizedItems(categorized);

      // Find uncategorized items
      const categorizedItemTexts = response.categorizeAnswer.map((a) => a.item);
      const uncategorized = data.items.filter(
        (item) => !categorizedItemTexts.includes(item.text)
      );
      setUncategorizedItems(uncategorized);
    } else {
      // Initialize empty categories
      const categorized = {};
      data.categories.forEach((category) => {
        categorized[category] = [];
      });
      setCategorizedItems(categorized);
      setUncategorizedItems([...data.items]);
    }
  }, [data, response]);

  const handleDrop = (item, targetCategory) => {
    // Remove item from its current location
    const newCategorizedItems = { ...categorizedItems };
    const newUncategorizedItems = [...uncategorizedItems];

    // Remove from uncategorized
    const uncategorizedIndex = newUncategorizedItems.findIndex(
      (uncatItem) => uncatItem.text === item.text
    );
    if (uncategorizedIndex !== -1) {
      newUncategorizedItems.splice(uncategorizedIndex, 1);
    }

    // Remove from other categories
    Object.keys(newCategorizedItems).forEach((category) => {
      newCategorizedItems[category] = newCategorizedItems[category].filter(
        (catItem) => catItem.text !== item.text
      );
    });

    // Add to target category
    if (!newCategorizedItems[targetCategory]) {
      newCategorizedItems[targetCategory] = [];
    }
    newCategorizedItems[targetCategory].push(item);

    setCategorizedItems(newCategorizedItems);
    setUncategorizedItems(newUncategorizedItems);

    // Update response
    const categorizeAnswer = [];
    Object.keys(newCategorizedItems).forEach((category) => {
      newCategorizedItems[category].forEach((catItem) => {
        categorizeAnswer.push({
          item: catItem.text,
          selectedCategory: category,
        });
      });
    });

    onChange({
      categorizeAnswer,
    });
  };

  const handleReset = () => {
    const categorized = {};
    data.categories.forEach((category) => {
      categorized[category] = [];
    });
    setCategorizedItems(categorized);
    setUncategorizedItems([...data.items]);
    onChange({ categorizeAnswer: [] });
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <h3 className="text-xl font-semibold text-secondary-900 mb-4">
          {data.question}
        </h3>

        {data.image && (
          <div className="mb-4">
            <img
              src={data.image}
              alt="Question"
              className="max-w-md h-48 object-cover rounded-lg border"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Drag and drop the items below into the
          correct categories.
        </p>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button onClick={handleReset} className="btn-outline text-sm">
          Reset All
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Uncategorized Items */}
        <div>
          <h4 className="text-lg font-medium text-secondary-900 mb-4">
            Items to Categorize ({uncategorizedItems.length})
          </h4>
          <div className="space-y-3">
            {uncategorizedItems.map((item, index) => (
              <DragItem
                key={`uncategorized-${index}`}
                item={item}
                index={index}
              />
            ))}
            {uncategorizedItems.length === 0 && (
              <div className="text-center py-8 text-secondary-500">
                All items have been categorized!
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-lg font-medium text-secondary-900 mb-4">
            Categories
          </h4>
          <div className="space-y-4">
            {data.categories.map((category, index) => (
              <DropZone
                key={category}
                category={category}
                items={categorizedItems[category] || []}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-secondary-700">
            Progress: {data.items.length - uncategorizedItems.length} of{" "}
            {data.items.length} items categorized
          </span>
          <div className="w-32 bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((data.items.length - uncategorizedItems.length) /
                    data.items.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorizeFill;
