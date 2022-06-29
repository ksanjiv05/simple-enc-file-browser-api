import { Request, Response } from "express";
import logging from "../../config/logging";
import  {getAllFiles} from "../../helper/utils";
import { IFile } from "../../interfaces/IFile";

const getFiles = (req: Request, res: Response) => {
    try {
        const {path=""}=req.query
        const files:IFile[] = getAllFiles(globalThis.__dirname,path)
        // logging.info("Files","files",files)
        return res.status(200).json({message:"success",data:files})
    } catch (error) {
        logging.error("GetAllFiles", "unable to getfile", error);
        res.status(500).json({
            message: "error",
            error
        })
    }
}

const getFile = (req: Request, res: Response) => {
    try {
        const {path="/"}=req.query
        const files:IFile[] = getAllFiles(globalThis.__dirname,path)
        logging.info("Files","files",files)
        return res.status(200).json({message:"success",files})
    } catch (error) {
        logging.error("GetAllFiles", "unable to getfile", error);
        res.status(500).json({
            message: "error",
            error
        })
    }
}

export default getFiles;