const db = require("./db");

// Demo şubeleri listele
exports.getDemoSubeler = (cb) => {
  const sql = `
    SELECT 
      d.sube_id, 
      d.sube_adi, 
      d.enlem, 
      d.boylam,
      i.ilce_adi
    FROM subeler_demo d
    LEFT JOIN ilceler i ON d.ilce_id = i.ilce_id
    ORDER BY d.sube_id
  `;
  db.query(sql, cb);
};

// Demo şube ekle
exports.addDemoSube = (sube_adi, ilce_adi, enlem, boylam, cb) => {

  const ilceQuery = "SELECT ilce_id FROM ilceler WHERE ilce_adi = ?";

  db.query(ilceQuery, [ilce_adi], (err, ilceRes) => {
    if (err) return cb(err);
    if (ilceRes.length === 0) return cb("İlçe bulunamadı");

    const ilce_id = ilceRes[0].ilce_id;

    const insertSql = `
      INSERT INTO subeler_demo (sube_adi, ilce_id, enlem, boylam)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [sube_adi, ilce_id, enlem, boylam], cb);
  });
};

// Demo şube sil
exports.deleteDemoSube = (id, cb) => {
  const sql = "DELETE FROM subeler_demo WHERE sube_id = ?";
  db.query(sql, [id], cb);
};
