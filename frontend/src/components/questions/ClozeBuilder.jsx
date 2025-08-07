import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import ImageUpload from "../ImageUpload";
import { processClozeBlanks } from "../../utils/formHelpers";

const ClozeBuilder = ({ data, onChange }) => {
  const [textInput, setTextInput] = useState(data.text || "");

  useEffect(() => {
    // Process the text to extract blanks whenever textInput changes
    const { processedText, blanks } = processClozeBlanks(textInput);

    if (JSON.stringify(blanks) !== JSON.stringify(data.blanks)) {
      onChange({
        ...data,
        text: textInput,
        blanks: blanks,
      });
    }
  }, [textInput]);

  const handleQuestionChange = (question) => {
    onChange({ ...data, question });
  };

  const handleImageChange = (image) => {
    onChange({ ...data, image });
  };

  const handleTextChange = (text) => {
    setTextInput(text);
  };

  const renderPreviewText = () => {
    let previewText = textInput;
    const matches = textInput.match(/\[([^\]]+)\]/g);

    if (matches) {
      matches.forEach((match) => {
        const word = match.slice(1, -1);
        previewText = previewText.replace(
          match,
          `<span class="bg-yellow-200 px-1 rounded">____</span>`
        );
      });
    }

    return previewText;
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
          placeholder="Enter your cloze question..."
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

      {/* Cloze Text */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <label className="block text-sm font-medium text-secondary-700">
            Cloze Text
          </label>
          <div className="flex items-center space-x-1 text-xs text-secondary-500">
            <Info className="h-4 w-4" />
            <span>Wrap words in [brackets] to create blanks</span>
          </div>
        </div>

        <textarea
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
          className="textarea"
          placeholder="The quick brown [fox] jumps over the lazy [dog]."
          rows={4}
        />

        <div className="mt-2 text-xs text-secondary-600">
          <p>Example: "The quick brown [fox] jumps over the lazy [dog]."</p>
          <p>Words in [brackets] will become fill-in-the-blank fields.</p>
        </div>
      </div>

      {/* Blanks Summary */}
      {data.blanks && data.blanks.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Detected Blanks ({data.blanks.length})
          </label>
          <div className="bg-secondary-50 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {data.blanks.map((blank, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {blank.word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-secondary-700 mb-3">Preview</h4>
        <div className="bg-secondary-50 p-4 rounded-lg">
          <p className="font-medium mb-3">
            {data.question || "Question text will appear here"}
          </p>

          <div className="prose prose-sm">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  renderPreviewText() ||
                  "Cloze text will appear here with blanks highlighted",
              }}
            />
          </div>

          {data.blanks && data.blanks.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-secondary-600 mb-2">
                Students will see input fields instead of highlighted words:
              </p>
              <div className="space-y-2">
                {data.blanks.map((blank, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm">Blank {index + 1}:</span>
                    <input
                      type="text"
                      className="input text-sm w-32"
                      placeholder="____"
                      disabled
                    />
                    <span className="text-xs text-secondary-500">
                      (Answer: {blank.word})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClozeBuilder;
