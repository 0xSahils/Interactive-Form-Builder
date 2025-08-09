import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Copy,
  ExternalLink,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { formAPI } from "../services/api";
import { generateFormUrl, copyToClipboard } from "../utils/formHelpers";

const HomePage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await formAPI.getAllForms();
      console.log("API Response:", response.data); // Debug log
      console.log("Forms data:", response.data.data); // Debug log
      setForms(response.data.data || []); // Access the nested data array
    } catch (error) {
      toast.error("Failed to fetch forms");
      console.error("Error fetching forms:", error);
      setForms([]); // Ensure forms is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form?")) {
      return;
    }

    try {
      await formAPI.deleteForm(formId);
      setForms(forms.filter((form) => form._id !== formId));
      toast.success("Form deleted successfully");
    } catch (error) {
      toast.error("Failed to delete form");
      console.error("Error deleting form:", error);
    }
  };

  const handleTogglePublish = async (formId) => {
    try {
      const response = await formAPI.togglePublish(formId);
      const updatedForm = response.data.data || response.data;
      setForms(forms.map((form) => (form._id === formId ? updatedForm : form)));
      toast.success(
        updatedForm.isPublished ? "Form published" : "Form unpublished"
      );
    } catch (error) {
      toast.error("Failed to update form status");
      console.error("Error toggling publish:", error);
    }
  };

  const handleCopyLink = async (formId) => {
    const url = generateFormUrl(formId);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">My Forms</h1>
          <p className="text-secondary-600 mt-2">
            Create and manage your interactive forms
          </p>
        </div>
        <Link to="/builder" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create New Form</span>
        </Link>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-24 w-24 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-secondary-900 mb-2">
            No forms yet
          </h3>
          <p className="text-secondary-600 mb-6">
            Get started by creating your first interactive form
          </p>
          <Link to="/builder" className="btn-primary">
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div
              key={form._id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 truncate">
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        form.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {form.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-content">
                <div className="flex items-center justify-between text-sm text-secondary-600 mb-4">
                  <span>{form.questions?.length || 0} questions</span>
                  <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/builder/${form._id}`}
                      className="btn-outline text-xs"
                      title="Edit Form"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    <Link
                      to={`/preview/${form._id}`}
                      className="btn-outline text-xs"
                      title="Preview Form"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <Link
                      to={`/analytics/${form._id}`}
                      className="btn-outline text-xs"
                      title="View Analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex items-center space-x-2">
                    {form.isPublished && (
                      <>
                        <button
                          onClick={() => handleCopyLink(form._id)}
                          className="btn-outline text-xs"
                          title="Copy Form Link"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        <a
                          href={generateFormUrl(form._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline text-xs"
                          title="Open Form"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </>
                    )}

                    <button
                      onClick={() => handleTogglePublish(form._id)}
                      className={`text-xs px-2 py-1 rounded ${
                        form.isPublished
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {form.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => handleDeleteForm(form._id)}
                      className="btn-outline text-xs text-red-600 hover:bg-red-50"
                      title="Delete Form"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
