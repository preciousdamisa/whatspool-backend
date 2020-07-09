const router = require('express').Router();

const { Winner } = require('../models/winner');
const moderator = require('../middleware/moderator');
const auth = require('../middleware/auth');

// Gets all winners.
router.get('/', async (req, res) => {
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
  return winners.slice(0, 1);
}

function getSecondPlaceWinners(winners) {
  return winners.slice(1, 3);
}

function getThirdPlaceWinners(winners) {
  return winners.slice(3, 6);
}

// Gets the total number of winners.
router.get('/count', async (req, res) => {
  const count = await Winner.find().count();

  res.send({ count });
});

// Deletes all winners.
router.delete('/', auth, moderator, async (req, res) => {
  const result = await Winner.remove({});

  res.send({ result, msg: 'Winners deleted succesfully' });
});

module.exports = router;
