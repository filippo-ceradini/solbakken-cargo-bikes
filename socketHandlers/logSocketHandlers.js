import User from "../database/models/Users.js";
import bcrypt from "bcrypt";
import isAuthenticated from "../utils/auth.js";

const logSocketHandlers = (socket) => {
    // Login - Logout
    socket.on("login", async (data) => {
        const { email, password } = data;
        // Validate the required fields
        if (!email || !password) {
            socket.emit("log-messages", {
                success: false,
                message: 'Please provide all required credentials',
            });
            return;
        }

        // Check if user exists
        const userFound = await User.findOne({ email: email });

        if (userFound) {
            // Check if password is the same
            const isSamePassword = await bcrypt.compare(
                password,
                userFound.password
            );

            if (isSamePassword) {
                // Save the user info in the session
                socket.request.session.user = {
                    id: userFound._id,
                    email: userFound.email,
                    isAdmin: userFound.isAdmin,
                    isVerified: userFound.isVerified,

                };


                socket.request.session.save((error) => {
                    if (error) {
                        console.log("Error saving session:", error);
                    }
                });
                socket.emit("log-messages", {
                    success: true,
                    message: "Logged in " + userFound.email,
                    username: userFound.username,
                });
                // Notify other clients about the successful login
                socket.broadcast.emit("brd-log-messages", {
                    success: true,
                    email: socket.request.session.user.email });
                console.log("logged in", userFound.email);
            } else {
                socket.emit("log-messages", {
                    success: false,
                    message: "Wrong password. Try again",
                });
            }
        } else {
            socket.emit("log-messages", {
                success: false,
                message: "User Not found",
            });
        }
    });

    socket.on("logout", () => {
        isAuthenticated(socket, () => {
            if (socket.request.session) {
                const user = socket.request.session.user;
                socket.request.session.destroy((err) => {
                    if (err) {
                        console.error(err);
                        socket.emit("log-messages", {
                            status: 500,
                            message: "Internal Server Error",
                        });
                    } else {
                        socket.emit("log-messages", {
                            success: true,
                            message: "Logged out successfully",
                        });
                        console.log(`User ${user.email} logged out`);
                        // Notify other clients about the logout
                        socket.broadcast.emit("log-messages");
                        socket.disconnect();
                    }
                });
            } else {
                // Handle the case where there is no session
                socket.emit("log-messages", {
                    status: 400,
                    message: "No active session to log out from",
                });
            }
        });
    });
}


export default logSocketHandlers;
