import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";

const registerUser = asyncHandler( async(req,res)=>{
    //get user details from frontend
    const{username,email,fullname,password} = req.body;
    console.log(email,fullname);


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


export {registerUser}
