const express = require('express');

const users = require('../routes/users');
const auth = require('../routes/auth');
const fund = require('../routes/fund');
const fundLink = require('../routes/fund-link');
const manualFund = require('../routes/manual-fund');
const transactions = require('../routes/transactions');
const transfers = require('../routes/transfers');
const participants = require('../routes/participants');
const question = require('../routes/question');
const { quizTime } = require('../routes/quiz-time');
const startQuiz = require('../routes/start-quiz');
const submit = require('../routes/submit');
const winners = require('../routes/winners');
const messages = require('../routes/messages');

const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json());
  app.set('view engine', 'ejs');

  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/fund', fund);
  app.use('/api/transactions', transactions);
  app.use('/api/transfers', transfers);
  app.use('/api/manual-fund', manualFund);
  app.use('/api/fund-link', fundLink);
  app.use('/api/participants', participants);
  app.use('/api/question', question);
  app.use('/api/quiz-time', quizTime);
  app.use('/api/start-quiz', startQuiz);
  app.use('/api/submit', submit);
  app.use('/api/winners', winners);
  app.use('/api/messages', messages);

  app.use(error);
};
