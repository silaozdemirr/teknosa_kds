const db = require("./db");

/*
  İlçe listesi
  Harita, bubble chart ve tablo için kullanılır
*/
exports.getAll = (callback) => {
  const sql = `
    SELECT 
      ilce_id,
      ilce_adi,
      nufus2022,
      nufus2023,
      nufus2024,
      nufus2025,
      rakip_sayisi
    FROM ilceler
    ORDER BY ilce_adi
  `;
  db.query(sql, callback);
};

/*
  Bubble Chart için ilçe bazlı veri
  Nüfus - Kar - Rekabet
*/
exports.getBubbleData = (callback) => {
  const sql = `
    SELECT 
      i.ilce_adi,
      i.nufus2022,
      i.nufus2023,
      i.nufus2024,
      i.nufus2025,
      i.rakip_sayisi,
      SUM(y.kar) AS toplam_kar
    FROM ilceler i
    JOIN subeler s ON s.ilce_id = i.ilce_id
    JOIN yillik_sube_performansi y ON y.sube_id = s.sube_id
    GROUP BY i.ilce_id
  `;
  db.query(sql, callback);
};
