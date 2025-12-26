const r = require("express").Router();
const c = require("../controllers/subeController");

r.get("/subeler", c.subeler);
r.get("/performans/:subeId", c.performans);
r.get("/kar-siralama/:yil", c.karSirala);
r.get("/sube-lokasyonlar", c.lokasyonlar);
r.get("/sube-yogunluk-toplam", c.yogunluk);

module.exports = r;
