const router = require("express").Router();

const QuizTime = require("../models/quiz-time");

router.post("/", async (req, res) => {
  const result = await QuizTime.find();
  const quizTime = result[0];

  const duration = quizTime.duration;
  let startTime = quizTime.startTime;

  startTime = new Date(startTime).getTime();
  const endTime = startTime + duration;

  const currentTime = new Date().getTime();

  if (currentTime >= startTime && currentTime < endTime) {
    const remainingTime = startTime - currentTime + duration;
    res.status(200).send({ startTime, endTime, duration, remainingTime });
  } else if (currentTime > endTime) {
    res.status(400).send({
      msg: "QuestiA is over!",
      status: "after",
      data: { startTime, endTime },
    });
  } else {
    res.status(400).send({
      msg: "Not yet time for QuestiA.",
      status: "before",
      data: { startTime, endTime },
    });
  }
});

module.exports = router;
