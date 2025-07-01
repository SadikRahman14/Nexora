import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User" // One who is subscribing
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User" // Owner iof channel      
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);