import User from "../database/models/Users.js";
import bcrypt from "bcrypt";

const logSocketHandlers = socket => {
    // Login - Logout
    socket.on("login", async (data) => {
        const {email, password} = data;

        // Validate the required fields
        if (!email || !password) {
            socket.emit("log-messages", {
                status: 400,
                message: 'Please provide all required credentials',
            });
            return;
        }

        //Check if user exists
        const userFound = await User.findOne({email: email});

        if (userFound) {
            //Check if password is the same
            const isSamePassword = await bcrypt.compare(
                password,
                userFound.password
            );

            if (isSamePassword) {
                //save the user info in the session
                socket.request.session.user = {
                    id: userFound._id,
                    email: userFound.email,
                };
                socket.request.session.save();

                socket.emit("log-messages", {
                    status: 200,
                    message: "Logged in " + userFound.email,
                });

                // Notify other clients about the successful login
                socket.broadcast.emit("log-messages", {email: userFound.email});
            } else {
                socket.emit("log-messagese", {
                    status: 400,
                    message: "Wrong password. Try again",
                });
            }
        } else {
            socket.emit("log-messages", {
                status: 404,
                message: "User Not found",
            });
        }
    });
    socket.on("logout", () => {
        if (socket.request.session) {
            socket.request.session.destroy((err) => {
                if (err) {
                    console.error(err);
                    socket.emit("log-messages", {
                        status: 500,
                        message: "Internal Server Error",
                    });
                } else {
                    socket.emit("log-messages", {
                        status: 200,
                        message: "Logged out successfully",
                    });

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
}


export default logSocketHandlers;
