import React from "react";

const ComprehensionPreview = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Image */}
      {data.image && (
        <div className="mb-4">
          <img
            src={data.image}
            alt="Passage"
            className="max-w-md h-48 object-cover rounded-lg border"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Read the passage below and answer the
          multiple choice questions.
        </p>
      </div>

      {/* Passage */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Passage
        </h3>
        <div className="prose prose-secondary max-w-none">
          <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap">
            {data.passage || "Passage text will appear here"}
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-secondary-900">Questions</h3>

        {data.questions?.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="bg-white border border-secondary-200 rounded-lg p-6"
          >
            <h4 className="text-base font-semibold text-secondary-900 mb-4">
              {questionIndex + 1}. {question.question}
            </h4>

            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`preview-question-${questionIndex}`}
                    value={optionIndex}
                    className="text-primary-600 focus:ring-primary-500"
                    disabled
                  />
                  <span className="text-secondary-700">
                    <span className="font-medium">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>{" "}
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Preview Mode:</strong> Radio buttons will be functional when
          users fill the form.
        </p>
      </div>
    </div>
  );
};

export default ComprehensionPreview;
