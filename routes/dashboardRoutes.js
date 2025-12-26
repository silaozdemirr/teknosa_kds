const router = require("express").Router();
const c = require("../controllers/dashboardController");

router.get("/api/toplam-sube", c.toplamSube);
router.get("/api/bubble-yeni-ilce", c.yeniIlce);
router.get("/api/kapat-ilce", c.kapatIlce);

module.exports = router;
