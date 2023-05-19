import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const BookingSchema = new Schema({
    startTime:{
        type: Date,
        required: true,
    },
    endTime:{
        type: Date,
        required: true,
    },
    itemID:{
        type: ObjectId,
        ref: 'Item',
        required: true,
    },
    userID:{
        type: ObjectId, // this references to another document in User collection
        ref: 'User', // name of the model it refers to
        required: true,
    },
});

export default mongoose.model('Booking', BookingSchema);
