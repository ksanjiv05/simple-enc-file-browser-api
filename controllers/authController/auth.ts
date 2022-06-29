import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcryptjs from "bcryptjs";
import logging from "../../config/logging";
import User from "../../models/User";
import { SECRET_KEY } from "../../config/config";
import { IUser } from "../../interfaces/IUser";


const login = async (req: Request, res: Response) => {
    try {
        const { email = "", password = "" }:IUser = req.body;

        if (email === "" || password === "")
            return res.status(202).json({
                message: "error",
                discription: "Please provide email and password"
            });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(202).json({
                message: "error",
                discription: "Email or password is invalid"
            });
        const isMatch = await bcryptjs.compare(password, user.password)

        if (!isMatch)
            return res.status(202).json({
                message: "error",
                discription: "Email or password is invalid"
            });

        const paylode = {
            _id: user._id
        }

        const options = {
            expiresIn: '2 days',
        }
        const token = jwt.sign(paylode, SECRET_KEY, options)
        res.status(200).json({
            message: "success",
            token
        })
    } catch (error) {
        logging.error("Login", "unable to login", error);
        res.status(500).json({
            message: "error",
            error
        })
    }
}


const register = async (req: Request, res: Response) => {
    try {
        const { email = "", password = "",recoveryCode="" }:IUser = req.body;

        if (email === "" || password === ""||recoveryCode==="")
            return res.status(202).json({
                message: "error",
                discription: "Please provide email password and recoveryCode"
            });

        const user = await User.findOne({ email });
       
        res.status(200).json({
            message: "success",
            descryption:"hey you are successfully registred with us"
        })
    } catch (error) {
        logging.error("Login", "unable to login", error);
        res.status(500).json({
            message: "error",
            error
        })
    }
}

export={login,register}