const router = require('express').Router();
const config = require('config');
const mongoose = require('mongoose');

const { Winner } = require('../models/winner');
const { User } = require('../models/user');
const { Win } = require('../models/win');
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

router.get('/leaderboard', async (req, res) => {
  let users = await User.find({ totalAmountWon: { $gt: 0 } }).select(
    'firstName lastName playedCount wins totalAmountWon'
  );

  users = users.map((u) => {
    return {
      firstName: u.firstName,
      lastName: u.lastName[0] + '.',
      playedCount: u.playedCount,
      winCount: u.wins.length,
      totalAmountWon: u.totalAmountWon,
    };
  });

  res.send(users);
});

// Deletes all winners.
router.delete('/', auth, moderator, async (req, res) => {
  const winners = await Winner.find();

  const firstPlaceWinners = getFirstPlaceWinners(winners);
  const secondPlaceWinners = getSecondPlaceWinners(winners);
  const thirdPlaceWinners = getThirdPlaceWinners(winners);

  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  try {
    if (firstPlaceWinners.length !== 0) {
      await updateFirstPlaceUsers(firstPlaceWinners, opts);
    }

    if (secondPlaceWinners.length !== 0) {
      await updateSecondPlaceUsers(secondPlaceWinners, opts);
    }

    if (thirdPlaceWinners.length !== 0) {
      await updateThirdPlaceUsers(thirdPlaceWinners, opts);
    }

    const result = await Winner.deleteMany({});

    await session.commitTransaction();
    session.endSession();

    res.send({ result, msg: 'Operation successful' });
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send('Something failed! Please try again.');
  }
});

async function updateFirstPlaceUsers(winners, opts) {
  winners.forEach(async (w) => {
    const user = await User.findById(w.user);

    const win = new Win({
      pos: 'First Place',
      date: w.createdAt,
    });

    user.wins.push(win);

    await user.save(opts);
    await user.updateOne({
      $inc: { totalAmountWon: config.get('firstPlacePrize') },
      opts,
    });
  });
}

async function updateSecondPlaceUsers(winners, opts) {
  winners.forEach(async (w) => {
    const user = await User.findById(w.user);

    const win = new Win({
      pos: 'Second Place',
      date: w.createdAt,
    });

    user.wins.push(win);

    await user.save(opts);

    await user.updateOne({
      $inc: { totalAmountWon: config.get('secondPlacePrize') },
      opts,
    });
  });
}

async function updateThirdPlaceUsers(winners, opts) {
  winners.forEach(async (w) => {
    const user = await User.findById(w.user);

    const win = new Win({
      pos: 'Third Place',
      date: w.createdAt,
    });

    user.wins.push(win);

    await user.save(opts);

    await user.updateOne({
      $inc: { totalAmountWon: config.get('thirdPlacePrize') },
      opts,
    });
  });
}

module.exports = router;
