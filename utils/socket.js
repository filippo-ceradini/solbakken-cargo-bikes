import { homePage, login, logout, testSession } from "../socketHandlers/logHandler.js";
import userSocketHandler  from "../socketHandlers/userCrudHandler.js";
import { createItem, getItems, updateItem, deleteItem } from "../socketHandlers/itemsCrudHandler.js";
import { createBooking, getBookings, updateBooking, deleteBooking, getBookingsByDate, getBookingsByUser } from "../socketHandlers/bookingCrudHandler.js";
import hasAuthentication from "./authentication.js";
import mailSocketHandlers from "../socketHandlers/mailSocketHandlers.js";

const configureSocketIO = (io) => {
    io.on("connection", (socket) => {

        // Login - Logout
        socket.on("login", login(socket));
        socket.on("logout", logout(socket));

        //Crud  Users
        userSocketHandler(socket)
        // socket.on("createUser", createUser(socket));
        // socket.on("getUsers", () => hasAuthentication(socket, getUsers(socket)));
        // socket.on("updateUser", (data) => hasAuthentication(socket, () => updateUser(socket)(data)));
        // socket.on("deleteUser", (data) => hasAuthentication(socket, () => deleteUser(socket)(data)));

        //CRUD for Items
        socket.on("createItem", (data) => hasAuthentication(socket, () => createItem(socket)(data)));
        socket.on("getItems", () => hasAuthentication(socket, getItems(socket)));
        socket.on("updateItem", (data) => hasAuthentication(socket, () => updateItem(socket)(data)));
        socket.on("deleteItem", (data) => hasAuthentication(socket, () => deleteItem(socket)(data)));

        //CRUD for Bookings
        socket.on("createBooking", (data) => hasAuthentication(socket, () => createBooking(socket)(data)));
        socket.on("getBookings", () => hasAuthentication(socket, getBookings(socket)));
        socket.on("updateBooking", (data) => hasAuthentication(socket, () => updateBooking(socket)(data)));
        socket.on("deleteBooking", (data) => hasAuthentication(socket, () => deleteBooking(socket)(data)));
        socket.on("getBookingsByDate", (date) => hasAuthentication(socket, () => getBookingsByDate(socket)(date)));
        socket.on("getBookingsByUser", (userId) => hasAuthentication(socket, () => getBookingsByUser(socket)(userId)));

        // Set up socket handlers
        mailSocketHandlers(socket);

        // Testing Endpoints
        socket.on("home", () => hasAuthentication(socket, homePage(socket)));
        socket.on("test",  () => hasAuthentication(socket, testSession(socket)));
    });

    return io;
};

export default configureSocketIO;
