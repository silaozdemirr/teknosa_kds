const db = require("./db");

exports.subeler = cb =>
  db.query("SELECT sube_id, sube_adi FROM subeler", cb);

exports.performans = (id, cb) =>
  db.query(
    `SELECT yil, gelir, gider, kar, musteri_sayisi
     FROM yillik_sube_performansi
     WHERE sube_id=? ORDER BY yil`,
    [id],
    cb
  );

exports.karSirala = (yil, cb) =>
  db.query(
    `SELECT s.sube_adi,y.kar
     FROM yillik_sube_performansi y
     JOIN subeler s ON y.sube_id=s.sube_id
     WHERE y.yil=? ORDER BY y.kar DESC`,
    [yil],
    cb
  );

exports.lokasyonlar = cb =>
  db.query(
    `SELECT s.sube_id,s.sube_adi,s.enlem,s.boylam,
     i.ilce_adi,i.gelismislik_puani,i.rakip_sayisi
     FROM subeler s JOIN ilceler i ON s.ilce_id=i.ilce_id`,
    cb
  );

exports.yogunluk = cb =>
  db.query(
    `SELECT s.sube_id,s.sube_adi,s.enlem,s.boylam,
     SUM(y.musteri_sayisi) toplam_musteri,
     SUM(y.kar) toplam_kar
     FROM subeler s JOIN yillik_sube_performansi y
     ON s.sube_id=y.sube_id GROUP BY s.sube_id`,
    cb
  );
