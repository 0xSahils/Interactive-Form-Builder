// Helper functions for form operations

export const createEmptyForm = () => ({
  title: "Untitled Form",
  description: "",
  headerImage: "",
  questions: [],
  isPublished: false,
});

export const createEmptyQuestion = (type) => {
  const baseQuestion = {
    type,
  };

  switch (type) {
    case "categorize":
      return {
        ...baseQuestion,
        categorizeData: {
          question: "",
          image: "",
          categories: ["Category 1", "Category 2"],
          items: [
            { text: "Item 1", correctCategory: "Category 1" },
            { text: "Item 2", correctCategory: "Category 2" },
          ],
        },
      };

    case "cloze":
      return {
        ...baseQuestion,
        clozeData: {
          question: "",
          image: "",
          text: "The quick brown [fox] jumps over the lazy [dog].",
          blanks: [
            { word: "fox", position: 0 },
            { word: "dog", position: 1 },
          ],
        },
      };

    case "comprehension":
      return {
        ...baseQuestion,
        comprehensionData: {
          passage: "Enter your passage here...",
          image: "",
          questions: [
            {
              question: "What is the main idea of the passage?",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
            },
          ],
        },
      };

    default:
      return baseQuestion;
  }
};

export const validateForm = (form) => {
  const errors = [];

  if (!form.title?.trim()) {
    errors.push("Form title is required");
  }

  if (!form.questions || form.questions.length === 0) {
    errors.push("At least one question is required");
  }

  form.questions?.forEach((question, index) => {
    const questionNum = index + 1;

    switch (question.type) {
      case "categorize":
        if (!question.categorizeData?.question?.trim()) {
          errors.push(`Question ${questionNum}: Question text is required`);
        }
        if (!question.categorizeData?.categories?.length) {
          errors.push(
            `Question ${questionNum}: At least one category is required`
          );
        }
        if (!question.categorizeData?.items?.length) {
          errors.push(`Question ${questionNum}: At least one item is required`);
        }
        break;

      case "cloze":
        if (!question.clozeData?.question?.trim()) {
          errors.push(`Question ${questionNum}: Question text is required`);
        }
        if (!question.clozeData?.text?.trim()) {
          errors.push(`Question ${questionNum}: Cloze text is required`);
        }
        if (!question.clozeData?.blanks?.length) {
          errors.push(
            `Question ${questionNum}: At least one blank is required`
          );
        }
        break;

      case "comprehension":
        if (!question.comprehensionData?.passage?.trim()) {
          errors.push(`Question ${questionNum}: Passage is required`);
        }
        if (!question.comprehensionData?.questions?.length) {
          errors.push(`Question ${questionNum}: At least one MCQ is required`);
        }
        question.comprehensionData?.questions?.forEach((mcq, mcqIndex) => {
          if (!mcq.question?.trim()) {
            errors.push(
              `Question ${questionNum}, MCQ ${
                mcqIndex + 1
              }: Question text is required`
            );
          }
          if (!mcq.options?.length || mcq.options.length < 2) {
            errors.push(
              `Question ${questionNum}, MCQ ${
                mcqIndex + 1
              }: At least 2 options are required`
            );
          }
        });
        break;
    }
  });

  return errors;
};

export const processClozeBlanks = (text) => {
  // Find words wrapped in square brackets [word] and convert them to blanks
  const blanks = [];
  let processedText = text;
  let blankIndex = 0;

  // Find all matches of [word] pattern
  const matches = text.match(/\[([^\]]+)\]/g);

  if (matches) {
    matches.forEach((match) => {
      const word = match.slice(1, -1); // Remove brackets
      blanks.push({
        word: word,
        position: blankIndex,
      });

      // Replace [word] with a placeholder for blank
      processedText = processedText.replace(match, `___BLANK_${blankIndex}___`);
      blankIndex++;
    });
  }

  return {
    processedText,
    blanks,
  };
};

export const renderClozeText = (text, blanks, answers = {}) => {
  let renderedText = text;

  blanks.forEach((blank, index) => {
    const placeholder = `___BLANK_${index}___`;
    const answer = answers[index] || "";
    const blankHtml = `<input type="text" class="cloze-blank" data-blank-index="${index}" value="${answer}" placeholder="____" />`;
    renderedText = renderedText.replace(placeholder, blankHtml);
  });

  return renderedText;
};

export const generateFormUrl = (formId, type = "fill") => {
  const baseUrl = window.location.origin;
  switch (type) {
    case "fill":
      return `${baseUrl}/form/${formId}`;
    case "preview":
      return `${baseUrl}/preview/${formId}`;
    case "analytics":
      return `${baseUrl}/analytics/${formId}`;
    default:
      return `${baseUrl}/form/${formId}`;
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};
