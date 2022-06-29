import { Request, Response } from "express";
import mkdirp from "mkdirp";
import * as fs from "fs";
import logging from "../../config/logging";
import { decrypt, encrypt } from "../../helper/utils";

export const createFile = (req: Request, res: Response) => {
  try {
    console.log("request ", req.file, req.body);
    const path = req.file?.path;
    if (!path)
      return res
        .status(202)
        .json({ message: "success", data: "path is undefined" });

    encrypt({
      filePath: path,
      password: req.body?.password,
      cb: (status) => {
        console.log("status", status);
      },
    });

    res.status(200).json({ message: "success", data: "" });
  } catch (error) {
    logging.error("Create File", "unable to create file", error);
    res.status(500).json({
      message: "error",
      error,
    });
  }
};

export const downloadFile = (req: Request, res: Response) => {
  try {
    const { path = "", password = "", fileName = "" } = req.body;

    const _path = globalThis.__dirname + path + "/" + fileName;
    if (!path)
      return res
        .status(202)
        .json({ message: "success", data: "path is undefined" });

    decrypt({
      filePath: _path,
      password: password,
      cb: (status) => {
        console.log("status", status);
        if (status) {
          const _npath = _path.slice(0, -4);
          const readStream = fs.createReadStream(_npath);
          const stat = fs.statSync(_npath);
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Length": stat.size,
          });

          // return res
          //   .status(200)
          //   .json({
          //     message: "success",
          //     descp: "successfully fetched your file",
          //     data: "",
          //   });
          readStream.pipe(res);
          readStream.on("close", () => {
            logging.info("Download", "File successfully served");
            fs.unlink(_npath, (err) => {
              if (err) logging.error("Download", "unable to delete file!");
            });
          });
          readStream.on("error", () => {
            logging.error("Download", "Error to serve file");
          });
        } else {
          return res.status(400).json({
            message: "error",
            descp: "may be password is wrong!",
            data: "",
          });
        }
      },
    });
  } catch (error) {
    logging.error("Create File", "unable to create file", error);
    res.status(500).json({
      message: "error",
      error,
    });
  }
};

export const createFolder = (req: Request, res: Response) => {
  try {
    console.log("request folder create++++++++++++ ", req.body);
    const { folderName = "", path = "" } = req.body;
    if (folderName === "")
      return res.status(202).json({
        message: "error",
        discription: "Please provide folder name",
      });
    const _path = globalThis.__dirname + "/" + path;
    console.log("_path_", _path + "/" + folderName);
    mkdirp.sync(_path + "/" + folderName);
    return res.status(200).json({
      message: "success",
      discription: "Folder successfully created",
    });
  } catch (error) {
    logging.error("Create Folder", "unable to create folder", error);
    res.status(500).json({
      message: "error",
      error,
    });
  }
};

const deleteFolder = (req: Request, res: Response) => {
  try {
    const { folderName = "", path = "" } = req.body;
    if (folderName === "")
      return res.status(202).json({
        message: "error",
        discription: "Please provide folder name",
      });
    const status = fs.rmdirSync("", { recursive: true });
    logging.info("Delete Folder ", path + folderName, status);
    return res.status(200).json({
      message: "success",
      discription: "Folder successfully created",
    });
  } catch (error) {
    logging.error("Delete Folder", "unable to delete folder", error);
    res.status(500).json({
      message: "error",
      error,
    });
  }
};
