const express = require("express");

const users = require("../routes/users");
const auth = require("../routes/auth");
const fund = require("../routes/fund");
const manualFund = require("../routes/manual-fund");
const participants = require("../routes/participants");
const question = require("../routes/question");
const { quizTime } = require("../routes/quiz-time");
const startQuiz = require("../routes/start-quiz");
const submit = require("../routes/submit");
const winners = require("../routes/winners");

const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());

  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/fund", fund);
  app.use("/api/manual-fund", manualFund);
  app.use("/api/participants", participants);
  app.use("/api/question", question);
  app.use("/api/quiz-time", quizTime);
  app.use("/api/start-quiz", startQuiz);
  app.use("/api/submit", submit);
  app.use("/api/winners", winners);

  app.use(error);
};
