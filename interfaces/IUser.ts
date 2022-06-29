import { Document } from "mongoose"

interface IUser extends Document{
    email:string,
    password:string,
    recoveryCode:string
}

export {IUser}