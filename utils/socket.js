import { homePage, login, logout, testSession } from "../router/logEvents.js";
import { createUser, getUser, updateUser, deleteUser } from "../router/userCrudEvents.js"
import hasAuthentication from "./authentication.js";

const configureSocketIO = (io) => {
    io.on("connection", (socket) => {

        // Login - Logout
        socket.on("login", login(socket));
        socket.on("logout", logout(socket));

        //TODO Crud for Bookings and Users
        socket.on("createUser",  createUser(socket));
        socket.on("getUser", () => hasAuthentication(socket, getUser(socket)));

        //Testing Endpoints
        socket.on("getUser", () => hasAuthentication(socket, getUser(socket)));
        socket.on("home", () => hasAuthentication(socket, homePage(socket)));
        socket.on("test",  () => hasAuthentication(socket, testSession(socket)));
    });

    return io;
};

export default configureSocketIO;
