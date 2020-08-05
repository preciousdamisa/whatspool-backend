const mongoose = require('mongoose');

const winSchema = new mongoose.Schema({
  pos: {
    type: String,
    enum: ['First Place', 'Second Place', 'Third Place'],
  },
  date: Date,
});

const Win = mongoose.model('Win', winSchema);

exports.winSchema = winSchema;
exports.Win = Win;
