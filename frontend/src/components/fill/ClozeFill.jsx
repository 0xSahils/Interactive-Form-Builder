import React, { useState, useEffect } from "react";

const ClozeFill = ({ data, response, onChange }) => {
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (response && response.clozeAnswer) {
      const answerMap = {};
      response.clozeAnswer.forEach((answer) => {
        answerMap[answer.blankIndex] = answer.answer;
      });
      setAnswers(answerMap);
    } else {
      setAnswers({});
    }
  }, [response]);

  const handleAnswerChange = (blankIndex, value) => {
    const newAnswers = { ...answers, [blankIndex]: value };
    setAnswers(newAnswers);

    // Convert to API format
    const clozeAnswer = Object.keys(newAnswers)
      .filter((key) => newAnswers[key].trim() !== "")
      .map((key) => ({
        blankIndex: parseInt(key),
        answer: newAnswers[key],
      }));

    onChange({ clozeAnswer });
  };

  const renderClozeText = () => {
    let text = data.text || "";

    // Replace [word] patterns with input fields
    const matches = text.match(/\[([^\]]+)\]/g);
    if (matches) {
      matches.forEach((match, index) => {
        const inputHtml = `<input 
          type="text" 
          class="cloze-blank-input" 
          data-blank-index="${index}" 
          value="${answers[index] || ""}" 
          placeholder="____"
        />`;
        text = text.replace(match, inputHtml);
      });
    }

    return text;
  };

  const handleClear = () => {
    setAnswers({});
    onChange({ clozeAnswer: [] });
  };

  const filledBlanks = Object.keys(answers).filter(
    (key) => answers[key].trim() !== ""
  ).length;
  const totalBlanks = data.blanks ? data.blanks.length : 0;

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

      {/* Clear Button */}
      <div className="flex justify-end">
        <button onClick={handleClear} className="btn-outline text-sm">
          Clear All
        </button>
      </div>

      {/* Cloze Text with Interactive Inputs */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <ClozeTextRenderer
          text={data.text}
          blanks={data.blanks}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
      </div>

      {/* Individual Blank Inputs (Alternative Method) */}
      {data.blanks && data.blanks.length > 0 && (
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-secondary-700 mb-3">
            Fill in the blanks:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.blanks.map((blank, index) => (
              <div key={index} className="flex items-center space-x-3">
                <label className="text-sm font-medium text-secondary-600 min-w-[80px]">
                  Blank {index + 1}:
                </label>
                <input
                  type="text"
                  value={answers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="input flex-1"
                  placeholder="Enter your answer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-secondary-700">
            Progress: {filledBlanks} of {totalBlanks} blanks filled
          </span>
          <div className="w-32 bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width:
                  totalBlanks > 0
                    ? `${(filledBlanks / totalBlanks) * 100}%`
                    : "0%",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to render cloze text with interactive inputs
const ClozeTextRenderer = ({ text, blanks, answers, onAnswerChange }) => {
  const renderTextWithInputs = () => {
    if (!text) return <span>Cloze text will appear here</span>;

    const parts = [];
    let currentIndex = 0;
    let blankIndex = 0;

    // Find all [word] patterns
    const matches = [...text.matchAll(/\[([^\]]+)\]/g)];

    matches.forEach((match, index) => {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(currentIndex, match.index)}
          </span>
        );
      }

      // Add input field for the blank
      parts.push(
        <input
          key={`blank-${blankIndex}`}
          type="text"
          value={answers[blankIndex] || ""}
          onChange={(e) => onAnswerChange(blankIndex, e.target.value)}
          className="inline-block mx-1 px-2 py-1 border border-secondary-300 rounded text-center min-w-[100px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="____"
        />
      );

      currentIndex = match.index + match[0].length;
      blankIndex++;
    });

    // Add remaining text after the last match
    if (currentIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(currentIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="text-lg leading-relaxed">{renderTextWithInputs()}</div>
  );
};

export default ClozeFill;
