module.exports = function (err, req, res, next) {
  if (err.response) {
    console.log(
      "err: ",
      err,
      "Message:",
      err.response.data,
      "\nStatus code:",
      err.response.status
    );
    res.status(err.response.status).send(err.response.data);
  } else {
    console.log(err);
    res.status(500).send("Something failed! Please try again.");
  }
};
