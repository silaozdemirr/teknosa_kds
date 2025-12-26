const router = require("express").Router();
const { liste } = require("../controllers/ilceController");

router.get("/ilceler", liste);

module.exports = router;
