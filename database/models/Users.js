import mongoose from "mongoose";
const { Schema } = mongoose;
const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        required: true,
        default: false
    },
    isVerified:{
        type: Boolean,
        required: true,
        default: false
    }
});

export default mongoose.model('User', UserSchema);
