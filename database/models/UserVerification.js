import mongoose from "mongoose";
const { Schema } = mongoose;
const UserVerificationSchema = new Schema ({
    userId: String,
    uniqueString: String,
    expiresAt: Date,
});
export default mongoose.model('UserVerification', UserVerificationSchema);
