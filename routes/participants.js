const router = require("express").Router();
const shortid = require("shortid");
const httpService = require("../services/http");

const { Participant, validate } = require("../models/participant");
const AccessPin = require("../models/accessPin");

router.get("/:walletId", async (req, res) => {
  const walletId = req.params.walletId;

  const participant = await Participant.findOne({ walletId });
  if (!participant)
    return res.status(404).send("No participant with the given Wallet ID.");

  res.send(participant);
});

router.post("/", async (req, res) => {
  let { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  let response = await httpService.get("/balance", {
    data: {
      walletId: req.body.walletId,
    },
  });

  if (response.data.balance < 100) {
    return res.status(400).send("Insufficient balance.");
  }

  response = await httpService.post("/transactions", {
    walletId: req.body.walletId,
    transactionPin: req.body.transactionPin,
    amount: req.body.amount,
    purpose: req.body.purpose,
  });

  error = response && response.status >= 400 && response.status <= 500;

  if (error) {
    return res.status(response.status).send(response.data);
  }

  const participantAccessPin = shortid();

  let participant = new Participant({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    walletId: req.body.walletId,
    accessPin: participantAccessPin,
  });

  const accessPin = new AccessPin({
    accessPin: participantAccessPin,
  });

  await accessPin.save();

  participant = await participant.save();
  res.send(participant);
});

module.exports = router;
