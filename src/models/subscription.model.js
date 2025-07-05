import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User" // One who is subscribing
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User" // Owner of channel      
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);