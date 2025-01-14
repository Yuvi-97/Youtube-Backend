import { model } from "mongoose"
import mongoose,{Schema} from mongoose

const subscriptionSchema = new Schema({
    subscribe:{
        type:Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //one who is being subscribed 
        ref:"User"

    },
    
})


export const Subscription = model("Subscription",subscriptionSchema);