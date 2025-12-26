const S = require("../models/subeModel");

exports.subeler = (r, s) => S.subeler((e, d) => s.json(d));

exports.performans = (r, s) =>
  S.performans(r.params.subeId, (e, d) => s.json(d));

exports.karSirala = (r, s) =>
  S.karSirala(r.params.yil, (e, d) =>
    s.json({ top5: d.slice(0, 5), low5: d.slice(-5) })
  );

exports.lokasyonlar = (r, s) =>
  S.lokasyonlar((e, d) => s.json(d));

exports.yogunluk = (r, s) =>
  S.yogunluk((e, d) => s.json(d));
