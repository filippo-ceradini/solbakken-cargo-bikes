import Booking from "../database/models/bookings.js";
import checkAuthenticationForEvent from "../utils/authentication.js";
import mongoose from "mongoose";

const bookingSocketHandlers = (socket) => {

    socket.on(
        "createBooking",  async (data) => {
            const { startTime, endTime, itemID } = data;
            console.log("New Booking is being created")
            // Validate the required fields
            if (!startTime || !endTime || !itemID) {
                socket.emit("booking-messages", {
                    status: 400,
                    message: "Please provide all required booking details",
                });
                return;
            }

            // Retrieve the user's email from the session
            const userEmail = "wer@wer.com";
            if (!userEmail) {
                socket.emit("booking-messages", {
                    status: 400,
                    message: "User is not authenticated",
                });
                return;
            }

            try {
                // Find the user by their email
                const user = await User.findOne({ email: userEmail });
                if (!user) {
                    socket.emit("booking-messages", {
                        status: 404,
                        message: "User not found",
                    });
                    return;
                }

                // Create a new booking
                const newBooking = new Booking({
                    startTime,
                    endTime,
                    itemID,
                    userID: user._id, // Use the user's ID from the database
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
        }
    );

    // Read Booking √
    socket.on(
        "getBookings",    async () => {
        try {

            const bookings = await Booking.find();
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
    })
        
    // Update Booking √
    socket.on(
        "updateBooking",  async (data) => {
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
    })
    
    // Delete Booking √
    socket.on(
        "deleteBooking",  async (data) => {
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
    })
    // Get Bookings by Date √
    socket.on(
        "getBookingsByDate",  async (date) => {
        try {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            const bookings = await Booking.find({
                startTime: { $gte: startDate, $lt: endDate }
            });

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
    })

    socket.on("test", () => {
        console.log("test")
    }  )
    // Get Bookings by Date √
    socket.on(
        "getBookingsByDateAndItemId",  async (data) => {
            console.log("getBookingsByDateAndItemId")
            const { startDate, endDate, bikeId } = data;
            try {
                const bookings = await Booking.find({
                    startTime: { $gte: startDate, $lt: endDate },
                });

                console.log(bookings)
                socket.emit("booking-messages", {
                    status: 200,
                    message: "Retrieved bookings for the specified date and Id successfully",
                    bookings,
                });
            } catch (error) {
                socket.emit("booking-messages", {
                    status: 500,
                    message: "Server error",
                });
            }
        })

    // Check if Item is Available √
    socket.on(
        "getBikeStatus",  async (bikeId) => {
            try {
                console.log("Checking bike status")
                console.log(bikeId)
                const now = new Date();
                const bookings = await Booking.find({
                    itemID: bikeId,
                    startTime: { $lte: now },
                    endTime: { $gte: now }
                });
                console.log(bookings)
                const status = bookings.length > 0 ? "Booked" : "Availablle";
                socket.emit("bike-status", { bikeId, status });
            } catch (error) {
                socket.emit("bike-status", { bikeId, status: "Error" });
            }
        })

        
    // Get Bookings by User √
    socket.on(
        "getBookingsByUser",  async (userId) => {
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
    })

        
    // Get Bookings by Item √
   socket.on(
    "getBookingsByItem",  async (itemId) => {
        try {

            const bookings = await Booking.find({ });
            console.log("Booking read Req", bookings)
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
    })
};

export default bookingSocketHandlers;

