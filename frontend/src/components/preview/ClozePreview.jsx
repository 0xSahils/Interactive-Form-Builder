import React from "react";

const ClozePreview = ({ data }) => {
  const renderClozeText = () => {
    let text = data.text || "";

    // Replace [word] patterns with blank inputs
    const matches = text.match(/\[([^\]]+)\]/g);
    if (matches) {
      matches.forEach((match, index) => {
        const placeholder = `<input type="text" class="cloze-blank inline-block mx-1 px-2 py-1 border border-secondary-300 rounded text-center min-w-[80px]" placeholder="____" disabled />`;
        text = text.replace(match, placeholder);
      });
    }

    return text;
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
          <strong>Instructions:</strong> Fill in the blanks with the appropriate
          words.
        </p>
      </div>

      {/* Cloze Text */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <div
          className="text-lg leading-relaxed"
          dangerouslySetInnerHTML={{
            __html:
              renderClozeText() ||
              "Cloze text will appear here with fill-in-the-blank fields.",
          }}
        />
      </div>

      {/* Blanks Summary */}
      {data.blanks && data.blanks.length > 0 && (
        <div className="bg-gray-50 border border-secondary-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-secondary-700 mb-3">
            Blanks to fill ({data.blanks.length}):
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.blanks.map((blank, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-secondary-600">
                  Blank {index + 1}:
                </span>
                <input
                  type="text"
                  className="input text-sm flex-1"
                  placeholder="____"
                  disabled
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Preview Mode:</strong> Input fields will be functional when
          users fill the form.
        </p>
      </div>
    </div>
  );
};

export default ClozePreview;
