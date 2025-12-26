const Auth = require("../models/authModel");

exports.login = (req, res) => {
  const { username, password } = req.body;

  Auth.login(username, password, (err, rows) => {
    if (err) return res.json({ success: false });
    res.json({ success: rows.length > 0 });
  });
};
