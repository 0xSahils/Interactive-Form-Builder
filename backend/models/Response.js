import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true, // Index for faster queries
    },
    responses: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        questionType: {
          type: String,
          enum: ["categorize", "cloze", "comprehension"],
          required: true,
        },

        userAnswers: mongoose.Schema.Types.Mixed,
        answers: [mongoose.Schema.Types.Mixed],

        // Scoring information
        score: { type: Number, default: 0 },
        maxScore: { type: Number, default: 1 },
        percentage: { type: Number, default: 0 },

        // Legacy fields for backward compatibility
        categorizeAnswer: [
          {
            item: { type: String },
            selectedCategory: { type: String },
          },
        ],
        clozeAnswer: [
          {
            blankIndex: { type: Number },
            answer: { type: String },
          },
        ],
        comprehensionAnswer: [
          {
            questionIndex: { type: Number },
            selectedOption: { type: Number },
          },
        ],
      },
    ],

    // Overall response scoring
    totalScore: { type: Number, default: 0 },
    maxTotalScore: { type: Number, default: 0 },
    overallPercentage: { type: Number, default: 0 },

    // Timestamps
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by submission time
    },

    // User information (optional)
    userInfo: {
      ipAddress: { type: String },
      userAgent: { type: String },
      sessionId: { type: String },
    },

    // Additional metadata
    metadata: {
      timeSpent: { type: Number }, // Time spent in seconds
      deviceType: { type: String, enum: ["desktop", "tablet", "mobile"] },
      browserInfo: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
responseSchema.index({ formId: 1, submittedAt: -1 });
responseSchema.index({ "responses.questionType": 1 });

// Virtual for calculating completion percentage
responseSchema.virtual("completionPercentage").get(function () {
  if (this.maxTotalScore === 0) return 0;
  return Math.round((this.totalScore / this.maxTotalScore) * 100);
});

// Method to calculate scores
responseSchema.methods.calculateScores = function () {
  let totalScore = 0;
  let maxTotalScore = 0;

  this.responses.forEach((response) => {
    totalScore += response.score || 0;
    maxTotalScore += response.maxScore || 1;
    response.percentage =
      response.maxScore > 0
        ? Math.round((response.score / response.maxScore) * 100)
        : 0;
  });

  this.totalScore = totalScore;
  this.maxTotalScore = maxTotalScore;
  this.overallPercentage =
    maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

  return this;
};

// Pre-save middleware to calculate scores
responseSchema.pre("save", function (next) {
  this.calculateScores();
  next();
});

const Response = mongoose.model("Response", responseSchema);
export default Response;
