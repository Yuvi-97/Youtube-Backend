const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandle(req,res,next)).
        catch((err)=>next(err))
    }
}

export {asyncHandler}

// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(err){
//         res.status(err.code || 500).json({
//             success:false,
//             messae:err.message
//         })
//     }
// }