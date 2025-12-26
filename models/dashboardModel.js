const db = require("./db");

exports.toplamSube = cb =>
  db.query("SELECT COUNT(*) AS toplam_sube FROM subeler", cb);

exports.yeniIlce = cb => {
  const sql = `/* AYNI SQL – DOKUNMADIM */ 
  SELECT i.ilce_id,i.ilce_adi,i.nufus2025,i.rakip_sayisi,
  COALESCE(SUM(y.kar),0) toplam_kar,
  ((i.nufus2025/1000)+(COALESCE(SUM(y.kar),0)/500000)-(i.rakip_sayisi*1.5)) skor
  FROM ilceler i
  LEFT JOIN subeler s ON s.ilce_id=i.ilce_id
  LEFT JOIN yillik_sube_performansi y ON y.sube_id=s.sube_id AND y.yil=2025
  WHERE i.ilce_id NOT IN (SELECT ilce_id FROM subeler)
  GROUP BY i.ilce_id
  ORDER BY skor DESC LIMIT 1`;
  db.query(sql, cb);
};

exports.kapatIlce = cb => {
  const sql = `/* AYNI SQL */ 
  SELECT i.ilce_id,i.ilce_adi,
  COALESCE(SUM(y.kar),0) toplam_kar,
  i.rakip_sayisi,
  ((COALESCE(SUM(y.kar),0)/500000)-(i.rakip_sayisi*1.5)) skor
  FROM ilceler i
  LEFT JOIN subeler s ON s.ilce_id=i.ilce_id
  LEFT JOIN yillik_sube_performansi y ON y.sube_id=s.sube_id AND y.yil=2025
  WHERE i.ilce_id IN (SELECT ilce_id FROM subeler)
  GROUP BY i.ilce_id
  ORDER BY skor ASC LIMIT 1`;
  db.query(sql, cb);
};
