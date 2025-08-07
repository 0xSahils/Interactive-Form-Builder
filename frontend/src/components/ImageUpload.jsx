import React, { useState, useRef } from "react";
import { Upload, Link, X, Image as ImageIcon, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { CLOUDINARY_CONFIG } from "../config/cloudinary";

const ImageUpload = ({
  value,
  onChange,
  label = "Image",
  placeholder = "Enter image URL or upload file",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("url"); // "url" or "upload"
  const fileInputRef = useRef(null);

  // Cloudinary configuration from config file
  const { CLOUD_NAME, UPLOAD_PRESET } = CLOUDINARY_CONFIG;

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check if Cloudinary is configured
    if (
      !CLOUD_NAME ||
      CLOUD_NAME === "your-cloud-name" ||
      !UPLOAD_PRESET ||
      UPLOAD_PRESET === "your-upload-preset"
    ) {
      toast.error(
        "Cloudinary is not configured. Please set up your credentials in src/config/cloudinary.js"
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.secure_url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        "Failed to upload image. Please try again or use URL method."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>

        {/* Upload Method Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setUploadMethod("url")}
            className={`text-xs px-2 py-1 rounded ${
              uploadMethod === "url"
                ? "bg-primary-100 text-primary-800"
                : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
            }`}
          >
            <Link className="h-3 w-3 inline mr-1" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod("upload")}
            className={`text-xs px-2 py-1 rounded ${
              uploadMethod === "upload"
                ? "bg-primary-100 text-primary-800"
                : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
            }`}
          >
            <Upload className="h-3 w-3 inline mr-1" />
            Upload
          </button>
        </div>
      </div>

      {uploadMethod === "url" ? (
        /* URL Input Method */
        <div className="space-y-2">
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="input"
            placeholder={placeholder}
          />
          <p className="text-xs text-secondary-500">
            Enter a direct image URL (jpg, png, gif, webp)
          </p>
        </div>
      ) : (
        /* File Upload Method */
        <div className="space-y-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading
                ? "border-primary-300 bg-primary-50"
                : "border-secondary-300 hover:border-primary-400 hover:bg-primary-50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader className="h-8 w-8 text-primary-600 animate-spin" />
                <p className="text-sm text-primary-600">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-secondary-400" />
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Click to upload
                  </button>
                  <span className="text-secondary-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-secondary-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-5 w-5 text-secondary-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  Image selected
                </p>
                <p className="text-xs text-secondary-500 truncate">{value}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="text-secondary-400 hover:text-red-500 transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Image Preview */}
          <div className="mt-2">
            <img
              src={value}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded-lg border border-secondary-200"
              onError={(e) => {
                e.target.style.display = "none";
                toast.error("Failed to load image. Please check the URL.");
              }}
            />
          </div>
        </div>
      )}

      {/* Cloudinary Setup Instructions */}
      {uploadMethod === "upload" &&
        (!CLOUD_NAME ||
          CLOUD_NAME === "your-cloud-name" ||
          !UPLOAD_PRESET ||
          UPLOAD_PRESET === "your-upload-preset") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Setup Required:</strong> To use file upload, configure
              your Cloudinary credentials in{" "}
              <code>src/config/cloudinary.js</code>
            </p>
            <div className="mt-2 text-xs text-yellow-700">
              <p>
                1. Sign up at{" "}
                <a
                  href="https://cloudinary.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  cloudinary.com
                </a>
              </p>
              <p>2. Get your Cloud Name and create an Upload Preset</p>
              <p>3. Update the configuration file with your credentials</p>
            </div>
          </div>
        )}
    </div>
  );
};

export default ImageUpload;
