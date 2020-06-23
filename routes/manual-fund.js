const router = require("express").Router();
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const { User, getReferrer } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  const phone = req.body.phone;
  const amount = req.body.amount;

  try {
    const user = await User.findOne({ phone });

    // The user who referred this user.
    const referrer = await getReferrer(user);

    if (referrer) {
      const referralBonus = 100;

      // TODO: The referral bonus should be taken from QuestiA's own account.

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: amount } },
        opts
      );

      await User.updateOne(
        { _id: referrer._id },
        { $inc: { referralBonus } },
        opts
      );

      await User.updateOne(
        { _id: user._id },
        { $set: { creditedReferrer: true } },
        opts
      );
    } else {
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: amount } },
        opts
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.send("Funding successful!");
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Error in funding wallet manually.");
  }
});

function validate(data) {
  const schema = Joi.object({
    phone: Joi.string().trim().length(11).required(),
    amount: Joi.number().min(100).max(10000).required(),
  });

  return schema.validate(data);
}

module.exports = router;
