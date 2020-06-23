const router = require("express").Router();

const QuizTime = require("../models/quiz-time");

router.post("/", async (req, res) => {
  const startTime = new Date("2020-05-23T08:00:00.000Z");
  const duration = 10000;

  let quizTime = new QuizTime({ startTime, duration });

  quizTime = await quizTime.save();

  res.send(quizTime);
});

router.get("/", async (req, res) => {
  const result = await QuizTime.find();
  const quizTime = result[0];

  const duration = quizTime.duration;
  let startTime = quizTime.startTime;

  startTime = new Date(startTime).getTime();
  const endTime = startTime + duration;

  res.send({ quizStartTime: startTime, quizEndTime: endTime });
});

exports.quizTime = router;
