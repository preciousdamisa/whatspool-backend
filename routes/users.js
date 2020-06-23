const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");

const { User, validate } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already registered.");
  }

  user = new User(
    _.pick(req.body, ["firstName", "lastName", "email", "phone"])
  );

  const hashed = await bcrypt.hash(req.body.password, 12);

  user.password = hashed;

  user.balance = 100;

  user.referralBonus = 0;

  // The referral code of the user who referred this user.
  let referrer;

  if (req.body.referrer) {
    const fetchedUser = await User.findOne({
      referralCode: req.body.referrer,
    });

    if (fetchedUser) {
      referrer = fetchedUser.referralCode;
    } else {
      return res.status(400).send("No user with the given referral code.");
    }
  }

  user.referrer = referrer;

  user.referralCode = shortid();

  if (referrer) {
    user.creditedReferrer = false;
  }

  await user.save();

  const token = user.genToken();

  res
    .status(201)
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(
      _.pick(user, [
        "_id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "balance",
      ])
    );
});

module.exports = router;
