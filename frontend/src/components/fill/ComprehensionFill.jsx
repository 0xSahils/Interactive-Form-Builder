import React, { useState, useEffect } from "react";

const ComprehensionFill = ({ data, response, onChange }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    if (response && response.comprehensionAnswer) {
      const answerMap = {};
      response.comprehensionAnswer.forEach((answer) => {
        answerMap[answer.questionIndex] = answer.selectedOption;
      });
      setSelectedAnswers(answerMap);
    } else {
      setSelectedAnswers({});
    }
  }, [response]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    const newSelectedAnswers = {
      ...selectedAnswers,
      [questionIndex]: selectedOption,
    };
    setSelectedAnswers(newSelectedAnswers);

    // Convert to API format
    const comprehensionAnswer = Object.keys(newSelectedAnswers).map((key) => ({
      questionIndex: parseInt(key),
      selectedOption: newSelectedAnswers[key],
    }));

    onChange({ comprehensionAnswer });
  };

  const handleClear = () => {
    setSelectedAnswers({});
    onChange({ comprehensionAnswer: [] });
  };

  const answeredQuestions = Object.keys(selectedAnswers).length;
  const totalQuestions = data.questions ? data.questions.length : 0;

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

      {/* Clear Button */}
      <div className="flex justify-end">
        <button onClick={handleClear} className="btn-outline text-sm">
          Clear All Answers
        </button>
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
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnswers[questionIndex] === optionIndex
                      ? "border-primary-500 bg-primary-50"
                      : "border-secondary-200 hover:bg-secondary-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={optionIndex}
                    checked={selectedAnswers[questionIndex] === optionIndex}
                    onChange={() =>
                      handleAnswerChange(questionIndex, optionIndex)
                    }
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-secondary-700 flex-1">
                    <span className="font-medium">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>{" "}
                    {option}
                  </span>
                  {selectedAnswers[questionIndex] === optionIndex && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </label>
              ))}
            </div>

            {/* Question Status */}
            <div className="mt-3 text-right">
              {selectedAnswers[questionIndex] !== undefined ? (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Answered
                </span>
              ) : (
                <span className="text-xs text-secondary-500">Not answered</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-secondary-700">
            Progress: {answeredQuestions} of {totalQuestions} questions answered
          </span>
          <div className="w-32 bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width:
                  totalQuestions > 0
                    ? `${(answeredQuestions / totalQuestions) * 100}%`
                    : "0%",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {answeredQuestions > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Your Answers Summary:
          </h4>
          <div className="space-y-1">
            {data.questions?.map(
              (question, questionIndex) =>
                selectedAnswers[questionIndex] !== undefined && (
                  <div key={questionIndex} className="text-sm text-blue-700">
                    <span className="font-medium">Q{questionIndex + 1}:</span>{" "}
                    {String.fromCharCode(65 + selectedAnswers[questionIndex])}.{" "}
                    {question.options[selectedAnswers[questionIndex]]}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensionFill;
