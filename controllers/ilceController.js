const Ilce = require("../models/ilceModel");

exports.liste = (req, res) => {
  Ilce.getAll((err, rows) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }
    res.json(rows);
  });
};

exports.bubbleData = (req, res) => {
  Ilce.getBubbleData((err, rows) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }
    res.json(rows);
  });
};
