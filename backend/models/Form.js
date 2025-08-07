import mongoose from "mongoose";

//Categorize Question
const categorizeQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  image: { type: String },
  categories: [{ type: String, required: true }],
  items: [
    {
      text: { type: String, required: true },
      correctCategory: { type: String, required: true },
    },
  ],
});

//Cloze Question
const clozeQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  image: { type: String },
  text: { type: String, required: true },
  blanks: [
    {
      word: { type: String, required: true },
      position: { type: Number, required: true },
    },
  ],
});

//Comprehension Question
const comprehensionQuestionSchema = new mongoose.Schema({
  passage: { type: String, required: true },
  image: { type: String },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true },
    },
  ],
});

// Main Form Schema
const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  headerImage: { type: String },
  questions: [
    {
      type: {
        type: String,
        enum: ["categorize", "cloze", "comprehension"],
        required: true,
      },
      categorizeData: categorizeQuestionSchema,
      clozeData: clozeQuestionSchema,
      comprehensionData: comprehensionQuestionSchema,
    },
  ],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
formSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Form = mongoose.model("Form", formSchema);
export default Form;
