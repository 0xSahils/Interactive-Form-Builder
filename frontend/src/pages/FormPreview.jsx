import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, ExternalLink, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { formAPI } from "../services/api";
import { generateFormUrl, copyToClipboard } from "../utils/formHelpers";

// Question Preview Components
import CategorizePreview from "../components/preview/CategorizePreview";
import ClozePreview from "../components/preview/ClozePreview";
import ComprehensionPreview from "../components/preview/ComprehensionPreview";

const FormPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getForm(id);
      const formData = response.data.data || response.data;
      console.log("FormPreview - API Response:", response.data);
      console.log("FormPreview - Form Data:", formData);
      setForm(formData);
    } catch (error) {
      toast.error("Failed to fetch form");
      console.error("Error fetching form:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = generateFormUrl(id);
    const success = await copyToClipboard(url);
    if (success) {
      toast.success("Form link copied to clipboard");
    } else {
      toast.error("Failed to copy link");
    }
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
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Form not found
          </h2>
          <p className="text-secondary-600 mb-4">
            The form you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-secondary-900">
                  Preview: {form.title}
                </h1>
                <p className="text-sm text-secondary-600">
                  This is how your form will appear to users
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/builder/${id}`}
                className="btn-outline flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>

              {form.isPublished && (
                <>
                  <button
                    onClick={handleCopyLink}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>

                  <a
                    href={generateFormUrl(id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Form</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="form-preview">
          {/* Form Header */}
          <div className="mb-8">
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

            <div className="flex items-center justify-between text-sm text-secondary-500 border-b pb-4">
              <span>{form.questions?.length || 0} questions</span>
              <span>
                {form.isPublished ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Draft
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {form.questions?.map((question, index) => (
              <div
                key={index}
                className="border-b border-secondary-200 pb-8 last:border-b-0"
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-secondary-500">
                    Question {index + 1} of {form.questions.length}
                  </span>
                </div>

                {question.type === "categorize" && (
                  <CategorizePreview data={question.categorizeData} />
                )}

                {question.type === "cloze" && (
                  <ClozePreview data={question.clozeData} />
                )}

                {question.type === "comprehension" && (
                  <ComprehensionPreview data={question.comprehensionData} />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-secondary-200 text-center">
            <p className="text-sm text-secondary-500">
              This is a preview.{" "}
              {form.isPublished
                ? "Users can fill this form using the public link."
                : "Publish this form to allow users to fill it."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
