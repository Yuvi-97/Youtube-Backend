import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";


export const verfiyJWT = asyncHandler(async (req, _, next) => {
try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Unauthorized requrest")
        }
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decoded?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Acess Token")
        }
        req.user=user;
        next()
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid acces Token")
}
})