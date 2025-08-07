import React from "react";

const CategorizePreview = ({ data }) => {
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

      {/* Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Items */}
        <div>
          <h4 className="text-lg font-medium text-secondary-900 mb-4">
            Items to Categorize
          </h4>
          <div className="space-y-3">
            {data.items?.map((item, index) => (
              <div
                key={index}
                className="drag-item bg-white border-2 border-secondary-200 rounded-lg p-4 cursor-move hover:border-primary-300 hover:shadow-md transition-all"
              >
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-lg font-medium text-secondary-900 mb-4">
            Categories
          </h4>
          <div className="space-y-4">
            {data.categories?.map((category, index) => (
              <div
                key={index}
                className="drop-zone bg-gray-50 border-2 border-dashed border-secondary-300 rounded-lg p-6 min-h-[120px] transition-colors"
              >
                <h5 className="font-semibold text-secondary-700 mb-2">
                  {category}
                </h5>
                <p className="text-sm text-secondary-500">Drop items here</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Preview Mode:</strong> Drag and drop functionality will be
          available when users fill the form.
        </p>
      </div>
    </div>
  );
};

export default CategorizePreview;
