import Booking from "../database/models/bookings.js";

// Create Booking
const createBooking = (socket) => async (data) => {
    const { startTime, endTime, itemID, userID } = data;
    console.log("New Booking is being created")
    // Validate the required fields
    if (!startTime || !endTime || !itemID || !userID) {
        socket.emit("booking-messages", {
            status: 400,
            message: "Please provide all required booking details",
        });
        return;
    }

    try {
        // Create a new booking
        const newBooking = new Booking({
            startTime,
            endTime,
            itemID,
            userID,
        });

        await newBooking.save();

        socket.emit("booking-messages", {
            status: 200,
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

// Get Bookings
const getBookings = (socket) => async () => {
    try {

        const bookings = await Booking.find().populate("userID");
        console.log("Booking read Req")
        socket.emit("booking-messages", {
            status: 200,
            message: "Retrieved bookings successfully",
            bookings,
        });
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

// Get Bookings for a Certain Date
const getBookingsByDate = (socket) => async (date) => {
    try {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const bookings = await Booking.find({
            startTime: { $gte: startDate, $lt: endDate }
        }).populate("userID");

        socket.emit("booking-messages", {
            status: 200,
            message: "Retrieved bookings for the specified date successfully",
            bookings,
        });
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

// Get Bookings for a Certain User
const getBookingsByUser = (socket) => async (userId) => {
    try {
        const bookings = await Booking.find({ userID: userId }).populate("userID", "_id");

        socket.emit("booking-messages", {
            status: 200,
            message: "Retrieved bookings for the specified user successfully",
            bookings,
        });
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};


// Get Bookings for a Certain Item
const getBookingsByItem = (socket) => async (itemId) => {
    try {
        const bookings = await Booking.find({ itemID: itemId }).populate("userID");

        socket.emit("booking-messages", {
            status: 200,
            message: "Retrieved bookings for the specified item successfully",
            bookings,
        });
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};


// Update Booking
const updateBooking = (socket) => async (data) => {
    const { id, startTime, endTime, itemID, userID } = data;
    console.log("update booking")
    // Validate the required fields
    if (!id || !startTime || !endTime || !itemID || !userID) {
        socket.emit("booking-messages", {
            status: 400,
            message: "Please provide booking ID and all required booking details",
        });
        return;
    }

    try {
        const booking = await Booking.findByIdAndUpdate(
            id,
            { startTime, endTime, itemID, userID },
            { new: true }
        ).populate("userID");

        if (booking) {
            socket.emit("booking-messages", {
                status: 200,
                message: "Booking updated successfully",
                booking,
            });
        } else {
            socket.emit("booking-messages", {
                status: 404,
                message: "Booking not found",
            });
        }
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

// Delete Booking
const deleteBooking = (socket) => async (data) => {
    const { id } = data;

    // Validate the required fields
    if (!id) {
        socket.emit("booking-messages", {
            status: 400,
            message: "Please provide booking ID",
        });
        return;
    }

    try {
        const booking = await Booking.findByIdAndDelete(id).populate("userID");

        if (booking) {
            socket.emit("booking-messages", {
                status: 200,
                message: "Booking deleted successfully",
                booking,
            });
        } else {
            socket.emit("booking-messages", {
                status: 404,
                message: "Booking not found",
            });
        }
    } catch (error) {
        socket.emit("booking-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

export {  createBooking,  getBookings, getBookingsByDate, getBookingsByUser, getBookingsByItem, updateBooking, deleteBooking };

