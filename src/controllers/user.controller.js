import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import jwt, { decode } from "jsonwebtoken";

const generateAccessAndRefreshToken = async(UserId)=>{
    try {
        const user=await User.findById(UserId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave: false})
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh Token")
    }
}

const registerUser = asyncHandler( async(req,res)=>{
    //get user details from frontend
    const{username,email,fullname,password} = req.body;
    // console.log(email,fullname);


    //Validation - not empty
    if(
        [username,email,fullname,password].some((field)=>
            field.trim()===""
        )
    ){
        throw new ApiError(400,"All fields are required");
    }


    //check if user already exists : username,email
    const existingUser= await User.findOne({
        $or: [{username},{email}]
    });

    if(existingUser){   
        throw new ApiError(409,"user already exist");
    }
    
    //check for images, check for avatar
    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverLocalPath= req.files?.coverImage[0]?.path;
    
    let coverLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverLocalPath=req.files.coverImage[0].path;
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar field is required");
    }

    //upload them to cloudinary,avatar
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar upload failed");
    }

    //create user object-create entry in db
    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage? coverImage.url:"",
        username: username.toLowerCase(),
        email,
        password
    })

    //remove pass and refresh token field from response
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if(!createdUser){
        throw new ApiError(400,"Something went wrong while creating user");
    }


    //return res
    return res.status(201).json(
        new ApiResponse(201,createdUser,"User succesfully created")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    //req boyd -> data
    console.log(req.body);
    const {username,email,password}=req.body;
    //username or email
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    } 
    
    //find the user
    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    //password check
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credential")
    }

    //access and refresh token generate
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedUser= await User.findById(user._id).select("-password -refreshToken")
    
    //send cookies
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedUser,accessToken,refreshToken
            },
            "User logged in Succesfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken:undefined}
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized login")
    }

    try {
        const decoded=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decode?._id)   
        
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh Token is Invalid")
        }
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accesToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(200,{accessToken,newrefreshToken},"Access token refreshed")
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
})


export {registerUser,loginUser,logoutUser,refreshAccessToken}
