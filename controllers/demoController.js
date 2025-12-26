const Demo = require("../models/demoModel");

// Demo şubeleri getir
exports.getDemoSubeler = (req, res) => {
  Demo.getDemoSubeler((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Demo şube ekle
exports.addDemoSube = (req, res) => {
  const { sube_adi, ilce_adi, enlem, boylam } = req.body;

  Demo.addDemoSube(sube_adi, ilce_adi, enlem, boylam, (err, result) => {
    if (err) return res.status(400).json({ message: err });
    res.json({ message: "Şube eklendi", id: result.insertId });
  });
};

// Demo şube sil
exports.deleteDemoSube = (req, res) => {
  const id = req.params.id;

  Demo.deleteDemoSube(id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Demo şube silindi" });
  });
};
