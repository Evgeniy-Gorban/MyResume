const express = require("express");
const router = express.Router();
const notesController = require("../controllers/Notes/notes");
const uploadNotesFiles = require("../middleware/uploadNotesFiles");

router.get("/", notesController.notesGet);
router.post("/create", notesController.notesCreatePost);

router.get("/edit", notesController.notedEditGet)
router.put("/edit", notesController.notedEditPut)

router.delete("/delete", notesController.notedDelete)

router.get("/download", notesController.notedDownloadPost)

router.post("/upload", uploadNotesFiles.single('noteFile'), notesController.notedUploadPost)


module.exports = router;
