import mongoose from "mongoose";

const { Schema } = mongoose;
const ItemSchema = new Schema({
    name:{
        type: String,
        required: true,
    }
});

export default mongoose.model('Item', ItemSchema);
