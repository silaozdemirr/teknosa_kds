const db = require("./db");

exports.login = (username, password, cb) => {
  const sql = "SELECT * FROM kullanici WHERE kullanici_adi=? AND sifre=?";
  db.query(sql, [username, password], cb);
};
