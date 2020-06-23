const router = require("express").Router();

const { Winner } = require("../models/winner");

router.get("/", async (req, res) => {
  const fetchedWinners = await Winner.find();

  const winners = { haveWinners: true };

  winners.firstPlaceWinners = getFirstPlaceWinners(fetchedWinners);
  winners.secondPlaceWinners = getSecondPlaceWinners(fetchedWinners);
  winners.thirdPlaceWinners = getThirdPlaceWinners(fetchedWinners);

  if (
    winners.firstPlaceWinners.length === 0 &&
    winners.secondPlaceWinners.length === 0 &&
    winners.thirdPlaceWinners.length === 0
  ) {
    winners.haveWinners = false;
  }

  res.send(winners);
});

function getFirstPlaceWinners(winners) {
  return winners.slice(0, 2);
}

function getSecondPlaceWinners(winners) {
  return winners.slice(2, 5);
}

function getThirdPlaceWinners(winners) {
  return winners.slice(5, 10);
}

module.exports = router;
