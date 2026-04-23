const express = require("express");
const router = express.Router();
const volumeController = require("../Controllers/VolumeController");
const multer = require("multer");
const upload = multer(); // memory storage for PDFs
const { deletePaper, updatePaper } = volumeController;

router.post("/", volumeController.createVolume);
router.delete("/:id", volumeController.deleteVolume);
router.post("/:id/issues", volumeController.createIssue);
router.delete("/:volumeId/issues/:issueId", volumeController.deleteIssue);
router.post("/:volumeId/issues/:issueId/papers", upload.single("pdf"), volumeController.addPaper);
router.get(
  "/:volumeId/issues/:issueId/papers/:paperId",
  volumeController.getPaper
);
router.get("/:volumeId/issues/:issueId/papers/:paperId/download", volumeController.downloadPaper);
router.get("/", volumeController.getVolumes);
router.delete(
  "/volume/:volumeId/issue/:issueId/paper/:paperId",
  volumeController.deletePaper
);

// Update paper
router.put(
  "/volume/:volumeId/issue/:issueId/paper/:paperId",
  upload.single("pdf"),
  volumeController.updatePaper
);

module.exports = router;
