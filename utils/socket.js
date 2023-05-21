import logSocketHandlers from "../socketHandlers/logSocketHandlers.js";
import userSocketHandlers  from "../socketHandlers/userCrudHandler.js";
import itemSocketHandlers from "../socketHandlers/itemsCrudHandler.js";
import bookingSocketHandlers from "../socketHandlers/bookingCrudHandler.js";
import { mailSocketHandlers } from "../socketHandlers/mailSocketHandlers.js";


const configureSocketIO = (io) => {
    io.on("connection", (socket) => {

        // Login - Logout
        logSocketHandlers(socket)

        //Crud  Users
        userSocketHandlers(socket)

        //CRUD for Items
        itemSocketHandlers(socket)

        //CRUD for Bookings
        bookingSocketHandlers(socket)

        // Set up socket handlers
        mailSocketHandlers(socket);

    });
    return io;
};

export default configureSocketIO;
