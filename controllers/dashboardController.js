const Dashboard = require("../models/dashboardModel");

exports.toplamSube = (req, res) =>
  Dashboard.toplamSube((e, r) => res.json(r[0]));

exports.yeniIlce = (req, res) =>
  Dashboard.yeniIlce((e, r) => res.json(r[0]));

exports.kapatIlce = (req, res) =>
  Dashboard.kapatIlce((e, r) => res.json(r[0]));
