import React from "react";
import { Plus, Trash2 } from "lucide-react";
import ImageUpload from "../ImageUpload";

const ComprehensionBuilder = ({ data, onChange }) => {
  const handlePassageChange = (passage) => {
    onChange({ ...data, passage });
  };

  const handleImageChange = (image) => {
    onChange({ ...data, image });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...data.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };
    onChange({ ...data, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...data.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };
    onChange({ ...data, questions: updatedQuestions });
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...data.questions];
    const currentOptions = updatedQuestions[questionIndex].options;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    };
    onChange({ ...data, questions: updatedQuestions });
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...data.questions];
    const currentQuestion = updatedQuestions[questionIndex];

    if (currentQuestion.options.length <= 2) {
      alert("At least 2 options are required");
      return;
    }

    const updatedOptions = currentQuestion.options.filter(
      (_, i) => i !== optionIndex
    );

    // Adjust correct answer index if necessary
    let newCorrectAnswer = currentQuestion.correctAnswer;
    if (optionIndex === currentQuestion.correctAnswer) {
      newCorrectAnswer = 0; // Reset to first option
    } else if (optionIndex < currentQuestion.correctAnswer) {
      newCorrectAnswer = currentQuestion.correctAnswer - 1;
    }

    updatedQuestions[questionIndex] = {
      ...currentQuestion,
      options: updatedOptions,
      correctAnswer: newCorrectAnswer,
    };

    onChange({ ...data, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: `Question ${data.questions.length + 1}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
    };
    onChange({
      ...data,
      questions: [...data.questions, newQuestion],
    });
  };

  const handleRemoveQuestion = (questionIndex) => {
    if (data.questions.length <= 1) {
      alert("At least 1 question is required");
      return;
    }

    const updatedQuestions = data.questions.filter(
      (_, i) => i !== questionIndex
    );
    onChange({ ...data, questions: updatedQuestions });
  };

  return (
    <div className="space-y-6">
      {/* Passage Image */}
      <ImageUpload
        label="Passage Image (Optional)"
        value={data.image}
        onChange={handleImageChange}
        placeholder="Enter image URL or upload file"
      />

      {/* Passage Text */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Passage Text
        </label>
        <textarea
          value={data.passage}
          onChange={(e) => handlePassageChange(e.target.value)}
          className="textarea"
          placeholder="Enter the passage for comprehension..."
          rows={6}
        />
      </div>

      {/* Questions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-secondary-700">
            Multiple Choice Questions
          </label>
          <button
            onClick={handleAddQuestion}
            className="btn-outline text-xs flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="space-y-6">
          {data.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="border border-secondary-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium text-secondary-700">
                  Question {questionIndex + 1}
                </h5>
                {data.questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(questionIndex)}
                    className="btn-outline text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "question",
                      e.target.value
                    )
                  }
                  className="textarea"
                  placeholder="Enter your question..."
                  rows={2}
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-secondary-700">
                    Options
                  </span>
                  <button
                    onClick={() => handleAddOption(questionIndex)}
                    className="btn-outline text-xs flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Option</span>
                  </button>
                </div>

                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() =>
                        handleQuestionChange(
                          questionIndex,
                          "correctAnswer",
                          optionIndex
                        )
                      }
                      className="text-primary-600"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                      className="input flex-1"
                      placeholder={`Option ${String.fromCharCode(
                        65 + optionIndex
                      )}`}
                    />
                    {question.options.length > 2 && (
                      <button
                        onClick={() =>
                          handleRemoveOption(questionIndex, optionIndex)
                        }
                        className="btn-outline text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 text-xs text-secondary-600">
                Select the radio button next to the correct answer
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-secondary-700 mb-3">Preview</h4>
        <div className="bg-secondary-50 p-4 rounded-lg">
          {/* Passage Preview */}
          <div className="mb-4">
            <h5 className="font-medium mb-2">Passage:</h5>
            <div className="bg-white p-3 rounded border text-sm">
              {data.passage || "Passage text will appear here"}
            </div>
          </div>

          {/* Questions Preview */}
          <div className="space-y-4">
            {data.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-white p-3 rounded border">
                <h6 className="font-medium mb-2">
                  {questionIndex + 1}.{" "}
                  {question.question || "Question text will appear here"}
                </h6>
                <div className="space-y-1">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name={`preview-${questionIndex}`}
                        disabled
                        className="text-primary-600"
                      />
                      <span className="text-sm">
                        {String.fromCharCode(65 + optionIndex)}. {option}
                        {question.correctAnswer === optionIndex && (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            (Correct)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensionBuilder;
