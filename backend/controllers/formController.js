import Form from "../models/Form.js";

const validateFormData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Form title is required");
  }

  if (data.title && data.title.length > 200) {
    errors.push("Form title must not exceed 200 characters");
  }

  if (data.description && data.description.length > 1000) {
    errors.push("Form description must not exceed 1000 characters");
  }

  if (data.headerImage && !isValidUrl(data.headerImage)) {
    errors.push("Header image must be a valid URL");
  }

  if (data.questions && !Array.isArray(data.questions)) {
    errors.push("Questions must be an array");
  }

  return errors;
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find()
      .select(
        "title description headerImage questions isPublished createdAt updatedAt"
      )
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching forms",
    });
  }
};

export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.json({
      success: true,
      data: form,
    });
  } catch (error) {
    console.error("Error fetching form:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching form",
    });
  }
};

export const createForm = async (req, res) => {
  try {
    const { title, description, headerImage, questions } = req.body;

    const validationErrors = validateFormData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const form = new Form({
      title,
      description,
      headerImage,
      questions: questions || [],
    });

    const savedForm = await form.save();

    res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: savedForm,
    });
  } catch (error) {
    console.error("Error creating form:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating form",
    });
  }
};

export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, headerImage, questions } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    const validationErrors = validateFormData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    form.title = title;
    form.description = description;
    form.headerImage = headerImage;
    form.questions = questions || [];
    form.updatedAt = new Date();

    const updatedForm = await form.save();

    res.json({
      success: true,
      message: "Form updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating form:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating form",
    });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findByIdAndDelete(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.json({
      success: true,
      message: "Form deleted successfully",
      data: { id: form._id },
    });
  } catch (error) {
    console.error("Error deleting form:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting form",
    });
  }
};

export const togglePublishForm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    if (
      !form.isPublished &&
      (!form.title || !form.questions || form.questions.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot publish form: Form must have a title and at least one question",
      });
    }

    form.isPublished = !form.isPublished;
    form.updatedAt = new Date();

    const updatedForm = await form.save();

    res.json({
      success: true,
      message: `Form ${
        form.isPublished ? "published" : "unpublished"
      } successfully`,
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error toggling form publish status:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating form publish status",
    });
  }
};

export const getPublishedForms = async (req, res) => {
  try {
    const forms = await Form.find({ isPublished: true })
      .select("title description headerImage createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    console.error("Error fetching published forms:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching published forms",
    });
  }
};
