const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const quizTimeSchema = new Schema(
  {
    startTime: {
      type: Date,
      unique: true,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  { collection: "quiz-time" }
);

const QuizTime = mongoose.model("Quiz-Time", quizTimeSchema);

module.exports = QuizTime;
