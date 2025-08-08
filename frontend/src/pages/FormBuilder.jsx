import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Save, Eye, Settings, Trash2, Globe, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { formAPI } from "../services/api";
import {
  createEmptyForm,
  createEmptyQuestion,
  validateForm,
} from "../utils/formHelpers";
import ImageUpload from "../components/ImageUpload";

// Question Builder Components
import CategorizeBuilder from "../components/questions/CategorizeBuilder";
import ClozeBuilder from "../components/questions/ClozeBuilder";
import ComprehensionBuilder from "../components/questions/ComprehensionBuilder";

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(createEmptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    setLoading(true);
    try {
      const response = await formAPI.getForm(id);
      setForm(response.data.data || createEmptyForm());
    } catch (error) {
      toast.error("Failed to fetch form");
      console.error("Error fetching form:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async () => {
    const errors = validateForm(form);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setSaving(true);
    try {
      let response;
      if (id) {
        response = await formAPI.updateForm(id, form);
        toast.success("Form updated successfully");
      } else {
        response = await formAPI.createForm(form);
        toast.success("Form created successfully");
        navigate(`/builder/${response.data.data._id}`);
      }
      setForm(response.data.data || form);
    } catch (error) {
      toast.error("Failed to save form");
      console.error("Error saving form:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!id) {
      toast.error("Please save the form first");
      return;
    }

    const errors = validateForm(form);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    try {
      const response = await formAPI.togglePublish(id);
      setForm(response.data);
      toast.success(
        response.data.isPublished
          ? "Form published successfully!"
          : "Form unpublished successfully!"
      );
    } catch (error) {
      toast.error("Failed to toggle publish status");
      console.error("Error toggling publish:", error);
    }
  };

  const handleAddQuestion = (type) => {
    const newQuestion = createEmptyQuestion(type);
    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    });
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[index] = updatedQuestion;
    setForm({
      ...form,
      questions: updatedQuestions,
    });
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = form.questions.filter((_, i) => i !== index);
      setForm({
        ...form,
        questions: updatedQuestions,
      });
    }
  };

  const handleMoveQuestion = (fromIndex, toIndex) => {
    const updatedQuestions = [...form.questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);
    setForm({
      ...form,
      questions: updatedQuestions,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-3xl font-bold text-secondary-900 bg-transparent border-none outline-none focus:ring-0 p-0"
            placeholder="Untitled Form"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-2 text-secondary-600 bg-transparent border-none outline-none focus:ring-0 p-0 resize-none"
            placeholder="Add a description..."
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-3">
          {id && (
            <button
              onClick={() => navigate(`/preview/${id}`)}
              className="btn-outline flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          )}

          <button
            onClick={handleSaveForm}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>

          {id && (
            <button
              onClick={handleTogglePublish}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                form.isPublished
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                  : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
              }`}
            >
              {form.isPublished ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Unpublish</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Publish</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Form Settings */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Form Settings</span>
          </h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <ImageUpload
              label="Header Image (Optional)"
              value={form.headerImage}
              onChange={(url) => setForm({ ...form, headerImage: url })}
              placeholder="Enter image URL or upload file"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {form.questions.map((question, index) => (
          <div key={index} className="question-builder">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-secondary-900">
                Question {index + 1} -{" "}
                {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
              </h4>
              <div className="flex items-center space-x-2">
                {index > 0 && (
                  <button
                    onClick={() => handleMoveQuestion(index, index - 1)}
                    className="btn-outline text-xs"
                  >
                    ↑
                  </button>
                )}
                {index < form.questions.length - 1 && (
                  <button
                    onClick={() => handleMoveQuestion(index, index + 1)}
                    className="btn-outline text-xs"
                  >
                    ↓
                  </button>
                )}
                <button
                  onClick={() => handleDeleteQuestion(index)}
                  className="btn-outline text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {question.type === "categorize" && (
              <CategorizeBuilder
                data={question.categorizeData}
                onChange={(data) =>
                  handleUpdateQuestion(index, {
                    ...question,
                    categorizeData: data,
                  })
                }
              />
            )}

            {question.type === "cloze" && (
              <ClozeBuilder
                data={question.clozeData}
                onChange={(data) =>
                  handleUpdateQuestion(index, { ...question, clozeData: data })
                }
              />
            )}

            {question.type === "comprehension" && (
              <ComprehensionBuilder
                data={question.comprehensionData}
                onChange={(data) =>
                  handleUpdateQuestion(index, {
                    ...question,
                    comprehensionData: data,
                  })
                }
              />
            )}
          </div>
        ))}

        {/* Add Question Buttons */}
        <div className="card">
          <div className="card-content">
            <h4 className="text-lg font-medium text-secondary-900 mb-4">
              Add New Question
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleAddQuestion("categorize")}
                className="btn-outline flex flex-col items-center space-y-2 p-6 h-auto"
              >
                <Plus className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-medium">Categorize</div>
                  <div className="text-xs text-secondary-600">
                    Drag & drop items into categories
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAddQuestion("cloze")}
                className="btn-outline flex flex-col items-center space-y-2 p-6 h-auto"
              >
                <Plus className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-medium">Cloze</div>
                  <div className="text-xs text-secondary-600">
                    Fill in the blanks
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAddQuestion("comprehension")}
                className="btn-outline flex flex-col items-center space-y-2 p-6 h-auto"
              >
                <Plus className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-medium">Comprehension</div>
                  <div className="text-xs text-secondary-600">
                    Passage with MCQ questions
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
