const router = require("express").Router();
const demoController = require("../controllers/demoController");

router.get("/subeler-demo", demoController.getDemoSubeler);
router.post("/subeler-yonetim", demoController.addDemoSube);
router.delete("/subeler-demo/:id", demoController.deleteDemoSube);

module.exports = router;
