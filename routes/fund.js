const router = require("express").Router();
const mongoose = require("mongoose");

const { User, getReferrer } = require("../models/user");
const verifyTransfer = require("../services/verify-transfer");

router.post("/:fundInfo", async (req, res) => {
  const txref = req.query.txref;
  const fundInfo = req.params.fundInfo.split("-");

  const userId = fundInfo[0];
  const amount = fundInfo[1];

  const data = { txref, amount };
  const { status, code, chargeAmount } = await verifyTransfer(data);

  if (status === "successful" && code === 0 && chargeAmount >= amount) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const opts = { session };

    try {
      const user = await User.findById(userId);

      // referrer is the user who referred this user.
      const referrer = await getReferrer(user);

      if (referrer) {
        const referralBonus = 100;

        // TODO: The referral bonus should be taken from Pied Wallet's own account.

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
      res.status(500).send("Error in funding wallet via e-gateway.");
    }
  }
});

module.exports = router;
