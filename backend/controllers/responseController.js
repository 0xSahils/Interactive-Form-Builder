import Response from "../models/Response.js";
import Form from "../models/Form.js";

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const validateResponseData = (data) => {
  const errors = [];

  if (!data.formId) {
    errors.push("Form ID is required");
  }

  if (data.formId && !isValidObjectId(data.formId)) {
    errors.push("Form ID must be a valid MongoDB ObjectId");
  }

  if (!data.responses || !Array.isArray(data.responses)) {
    errors.push("Responses must be an array");
  }

  if (data.responses && data.responses.length === 0) {
    errors.push("At least one response is required");
  }

  return errors;
};

export const submitResponse = async (req, res) => {
  try {
    console.log("=== Response Submission Debug ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { formId, responses } = req.body;

    const validationErrors = validateResponseData(req.body);
    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    if (!form.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Form is not published and cannot accept responses",
      });
    }

    const processedResponses = responses.map((response, index) => {
      const question = form.questions[index];
      let score = 0;
      let maxScore = 1; // Default to 1 to avoid division by zero

      if (question) {
        console.log(`Processing question ${index}:`, question.type);
        console.log(`User response:`, response);

        // Extract the actual answer data from the response
        const userAnswer = response.answer || response.userAnswer || response;

        switch (question.type) {
          case "categorize":
            const categorizeData = question.categorizeData;
            maxScore = categorizeData?.items?.length || 1;
            if (userAnswer && Array.isArray(userAnswer)) {
              score = userAnswer.filter((item, idx) => {
                const correctCategory =
                  categorizeData?.items?.[idx]?.correctCategory;
                return item.category === correctCategory;
              }).length;
            }
            break;

          case "cloze":
            const clozeData = question.clozeData;
            maxScore = clozeData?.blanks?.length || 1;
            if (userAnswer && Array.isArray(userAnswer)) {
              score = userAnswer.filter((answer, idx) => {
                const correctAnswer = clozeData?.blanks?.[idx]?.word;
                return (
                  answer?.toLowerCase().trim() ===
                  correctAnswer?.toLowerCase().trim()
                );
              }).length;
            }
            break;

          case "comprehension":
            const comprehensionData = question.comprehensionData;
            maxScore = comprehensionData?.questions?.length || 1;
            if (userAnswer && Array.isArray(userAnswer)) {
              score = userAnswer.filter((answer, idx) => {
                const correctAnswer =
                  comprehensionData?.questions?.[idx]?.correctAnswer;
                return answer === correctAnswer;
              }).length;
            }
            break;
        }
      }

      console.log(`Question ${index} score: ${score}/${maxScore}`);

      return {
        questionIndex: index,
        questionType: question?.type || "unknown",
        userAnswers: response,
        score,
        maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      };
    });

    const newResponse = new Response({
      formId,
      responses: processedResponses,
      submittedAt: new Date(),
      totalScore: processedResponses.reduce((sum, r) => sum + r.score, 0),
      maxTotalScore: processedResponses.reduce((sum, r) => sum + r.maxScore, 0),
    });

    const savedResponse = await newResponse.save();

    res.status(201).json({
      success: true,
      message: "Response submitted successfully",
      data: savedResponse,
    });
  } catch (error) {
    console.error("=== Response Submission Error ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Data validation error",
        details: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while submitting response",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "submittedAt",
      sortOrder = "desc",
    } = req.query;

    if (!isValidObjectId(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const responses = await Response.find({ formId })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalResponses = await Response.countDocuments({ formId });

    res.json({
      success: true,
      data: responses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResponses / parseInt(limit)),
        totalResponses,
        hasNextPage: skip + responses.length < totalResponses,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching form responses:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching responses",
    });
  }
};

export const getFormAnalytics = async (req, res) => {
  try {
    const { formId } = req.params;

    if (!isValidObjectId(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    const responses = await Response.find({ formId });

    if (responses.length === 0) {
      return res.json({
        success: true,
        data: {
          totalResponses: 0,
          averageScore: 0,
          averagePercentage: 0,
          completionRate: 0,
          questionAnalytics: [],
          responseDistribution: [],
          submissionTrend: [],
          lastSubmission: null,
        },
      });
    }

    const totalScore = responses.reduce((sum, r) => sum + r.totalScore, 0);
    const maxTotalScore = responses.reduce(
      (sum, r) => sum + r.maxTotalScore,
      0
    );
    const averageScore = totalScore / responses.length;
    const averagePercentage =
      maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

    const questionAnalytics = form.questions.map((question, index) => {
      const questionResponses = responses
        .map((r) => r.responses[index])
        .filter(Boolean);
      const correctAnswers = questionResponses.filter(
        (r) => r.score === r.maxScore
      ).length;
      const totalAnswers = questionResponses.length;

      return {
        questionId: question._id,
        questionText: question.question,
        questionType: question.type,
        totalAnswers,
        correctAnswers,
        accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
      };
    });

    const scoreRanges = [
      { range: "0-25%", count: 0 },
      { range: "26-50%", count: 0 },
      { range: "51-75%", count: 0 },
      { range: "76-100%", count: 0 },
    ];

    responses.forEach((response) => {
      const percentage =
        response.maxTotalScore > 0
          ? (response.totalScore / response.maxTotalScore) * 100
          : 0;
      if (percentage <= 25) scoreRanges[0].count++;
      else if (percentage <= 50) scoreRanges[1].count++;
      else if (percentage <= 75) scoreRanges[2].count++;
      else scoreRanges[3].count++;
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayResponses = responses.filter((r) => {
        const responseDate = new Date(r.submittedAt);
        return responseDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toISOString().split("T")[0],
        count: dayResponses.length,
      };
    }).reverse();

    res.json({
      success: true,
      data: {
        totalResponses: responses.length,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        completionRate: 100,
        questionAnalytics,
        responseDistribution: scoreRanges,
        submissionTrend: last7Days,
        lastSubmission:
          responses.length > 0
            ? responses[responses.length - 1].submittedAt
            : null,
      },
    });
  } catch (error) {
    console.error("Error fetching form analytics:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    });
  }
};

export const getResponseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid response ID format",
      });
    }

    const response = await Response.findById(id).populate(
      "formId",
      "title description questions"
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Response not found",
      });
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching response:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid response ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching response",
    });
  }
};

export const deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid response ID format",
      });
    }

    const response = await Response.findByIdAndDelete(id);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Response not found",
      });
    }

    res.json({
      success: true,
      message: "Response deleted successfully",
      data: { id: response._id },
    });
  } catch (error) {
    console.error("Error deleting response:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid response ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting response",
    });
  }
};
