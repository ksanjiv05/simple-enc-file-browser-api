import express from "express";
import getFiles from "../controllers/fileController/file";
import { createFile, createFolder, downloadFile } from "../controllers/fileController/manage";
import { upload } from "../helper/utils";

const router = express.Router();

router.get("/files", getFiles);
router.post("/file",upload.single("file"),createFile);
router.put("/file",downloadFile)
router.post("/folder",createFolder);



export default router;
