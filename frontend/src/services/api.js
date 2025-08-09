import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Form API endpoints
export const formAPI = {
  // Get all forms
  getAllForms: () => api.get("/forms"),

  // Get single form
  getForm: (id) => api.get(`/forms/${id}`),

  // Create new form
  createForm: (formData) => api.post("/forms", formData),

  // Update form
  updateForm: (id, formData) => api.put(`/forms/${id}`, formData),

  // Delete form
  deleteForm: (id) => api.delete(`/forms/${id}`),

  // Toggle publish status
  togglePublish: (id) => api.put(`/forms/${id}/publish`),
};

// Response API endpoints
export const responseAPI = {
  // Submit form response
  submitResponse: (responseData) => api.post("/responses", responseData),

  // Get responses for a form
  getFormResponses: (formId) => api.get(`/responses/form/${formId}`),

  // Get single response
  getResponse: (id) => api.get(`/responses/${id}`),

  // Get form analytics
  getFormAnalytics: (formId) => api.get(`/responses/form/${formId}/analytics`),
};

export default api;
