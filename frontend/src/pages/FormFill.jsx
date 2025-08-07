import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  BarChart3,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { formAPI, responseAPI } from "../services/api";

// Fill Components
import CategorizeFill from "../components/fill/CategorizeFill";
import ClozeFill from "../components/fill/ClozeFill";
import ComprehensionFill from "../components/fill/ComprehensionFill";

const FormFill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responseCount, setResponseCount] = useState(null);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getForm(id);
      const formData = response.data;

      if (!formData.isPublished) {
        toast.error("This form is not published");
        return;
      }

      setForm(formData);

      // Initialize responses object
      const initialResponses = {};
      formData.questions.forEach((_, index) => {
        initialResponses[index] = null;
      });
      setResponses(initialResponses);
    } catch (error) {
      toast.error("Failed to load form");
      console.error("Error fetching form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIndex, response) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: response,
    }));
  };

  const validateResponses = () => {
    const errors = [];

    form.questions.forEach((question, index) => {
      const response = responses[index];

      if (!response) {
        errors.push(`Question ${index + 1} is required`);
        return;
      }

      switch (question.type) {
        case "categorize":
          if (
            !response.categorizeAnswer ||
            response.categorizeAnswer.length === 0
          ) {
            errors.push(`Question ${index + 1}: Please categorize all items`);
          }
          break;

        case "cloze":
          if (!response.clozeAnswer || response.clozeAnswer.length === 0) {
            errors.push(`Question ${index + 1}: Please fill in all blanks`);
          }
          break;

        case "comprehension":
          if (
            !response.comprehensionAnswer ||
            response.comprehensionAnswer.length === 0
          ) {
            errors.push(`Question ${index + 1}: Please answer all questions`);
          }
          break;
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateResponses();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      // Format responses for API
      const formattedResponses = form.questions.map((question, index) => ({
        questionIndex: index,
        questionType: question.type,
        ...responses[index],
      }));

      const submitResponse = await responseAPI.submitResponse({
        formId: id,
        responses: formattedResponses,
      });

      // Try to get response count for display
      try {
        const analyticsResponse = await responseAPI.getFormAnalytics(id);
        setResponseCount(analyticsResponse.data.totalResponses);
      } catch (error) {
        // If analytics fails, it's not critical
        console.log("Could not fetch response count:", error);
      }

      setSubmitted(true);
      toast.success("Form submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit form");
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < form.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFillAgain = () => {
    if (
      window.confirm(
        "Are you sure you want to fill this form again? This will start a new session."
      )
    ) {
      window.location.reload();
    }
  };

  const handleViewResults = () => {
    // Navigate to analytics page
    navigate(`/analytics/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Form Not Available
          </h2>
          <p className="text-secondary-600">
            This form is either not published or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="animate-bounce">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Thank You!
          </h2>
          <p className="text-secondary-600 mb-6">
            Your response has been submitted successfully.
          </p>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-secondary-900 mb-2">
              {form.title}
            </h3>
            <div className="text-sm text-secondary-600 mb-4">
              <p>Form completed on {new Date().toLocaleDateString()}</p>
              {responseCount && (
                <p className="mt-1">
                  You are response #{responseCount} • Thank you for
                  participating!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up">
              <button
                onClick={handleViewResults}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Results</span>
              </button>

              <button
                onClick={handleFillAgain}
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Fill Again</span>
              </button>

              <button
                onClick={() => navigate(`/preview/${id}`)}
                className="btn-outline flex items-center justify-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Preview Form</span>
              </button>

              <button
                onClick={() => window.history.back()}
                className="btn-outline flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>
                • <strong>View Results:</strong> See analytics and response
                statistics
              </li>
              <li>
                • <strong>Fill Again:</strong> Submit another response to this
                form
              </li>
              <li>
                • <strong>Preview Form:</strong> Review the form you just
                completed
              </li>
              <li>
                • <strong>Go Back:</strong> Return to the previous page
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = form.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / form.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {form.headerImage && (
            <div className="mb-6">
              <img
                src={form.headerImage}
                alt="Form header"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            {form.title}
          </h1>

          {form.description && (
            <p className="text-lg text-secondary-600 mb-6">
              {form.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-secondary-600 mb-2">
              <span>
                Question {currentQuestion + 1} of {form.questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="mb-6">
            <span className="text-sm font-medium text-secondary-500">
              Question {currentQuestion + 1} of {form.questions.length}
            </span>
          </div>

          {currentQuestionData.type === "categorize" && (
            <CategorizeFill
              data={currentQuestionData.categorizeData}
              response={responses[currentQuestion]}
              onChange={(response) =>
                handleResponseChange(currentQuestion, response)
              }
            />
          )}

          {currentQuestionData.type === "cloze" && (
            <ClozeFill
              data={currentQuestionData.clozeData}
              response={responses[currentQuestion]}
              onChange={(response) =>
                handleResponseChange(currentQuestion, response)
              }
            />
          )}

          {currentQuestionData.type === "comprehension" && (
            <ComprehensionFill
              data={currentQuestionData.comprehensionData}
              response={responses[currentQuestion]}
              onChange={(response) =>
                handleResponseChange(currentQuestion, response)
              }
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {form.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-primary-600 text-white"
                    : responses[index]
                    ? "bg-green-100 text-green-800"
                    : "bg-secondary-200 text-secondary-600"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === form.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Form"}
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormFill;
