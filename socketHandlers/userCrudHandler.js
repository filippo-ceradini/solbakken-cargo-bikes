import User from "../database/models/Users.js";
import bcrypt from "bcrypt";
import userVerification from "../database/models/UserVerification.js";
import { socketAuthentication } from "../utils/authUtilities.js";

const userSocketHandlers = (socket) => {

    // Create User √
    socket.on("createUser", () => {
        socketAuthentication(socket,
        async (data) => {
            console.log(data)
            const {name, email, password} = data;
            console.log("User Creation Request");
            console.log({name, email, password});

            // Validate the required fields
            if (!name || !email || !password) {
                socket.emit("user-messages", {
                    status: 400,
                    message: "Please provide all required credentials",
                });
                return;
            }

            try {
                // Check if user exists
                const userExists = await User.findOne({email});

                if (userExists) {
                    socket.emit("user-messages", {
                        status: 400,
                        message: "User already exists",
                    });
                } else {
                    // Create a new user
                    const newUser = new User({
                        username: name,
                        email,
                        password: await bcrypt.hash(password, 10),
                        isVerified: true,
                    });

                    await newUser.save();

                    socket.emit("user-messages", {
                        status: 200,
                        message: "User created successfully",
                        user: newUser,
                    });
                }
            } catch (error) {
                socket.emit("user-messages", {
                    status: 500,
                    message: "Server error",
                });
            }
        })});

    // Read User √
    socket.on("getUsers", () => {
        socketAuthentication(socket,
        async (socket) => {
        try {
            const users = await User.find();
            console.log("User Read Request");
            socket.emit("user-messages", {
                status: 200,
                message: "Retrieved users successfully",
                users,
            });
            console.log(users);
        } catch (error) {
            socket.emit("user-messages", {
                status: 500,
                message: "Server error",
            });
        }
    }
    )});

    // Update User √
    socket.on("updateUser", () => {
        socketAuthentication(socket,
        async (data) => {
            const {id, username, email} = data;
            console.log("User Update Request");
            console.log(data);
            console.log("ID:", id);
            console.log("Username:", username);
            console.log("Email:", email);
            // Validate the required fields
            if (!id) {
                socket.emit("user-messages", {
                    status: 400,
                    message: "User ID is required",
                });
                return;
            }

            try {
                const user = await User.findByIdAndUpdate(
                    id,
                    {username},
                    {email},

                    {new: true}
                );

                if (user) {
                    socket.emit("user-messages", {
                        status: 200,
                        message: "User updated successfully",
                        user,
                    });
                } else {
                    socket.emit("user-messages", {
                        status: 404,
                        message: "User not found",
                    });
                }
            } catch (error) {
                console.log(error);
                socket.emit("user-messages", {
                    status: 500,
                    message: "Server error",
                });
            }
        }
        )});

    // Delete all Users √
    socket.on("delete-all-users", () => {
        socketAuthentication(socket,
        async () => {
            console.log("here");
            try {
                await User.deleteMany({});
                await userVerification.deleteMany({});
                console.log("User Delete Request");
                socket.emit("user-messages", {
                    status: 200,
                    message: "All users deleted successfully",
                });
            } catch (error) {
                socket.emit("user-messages", {
                    status: 500,
                    message: "Server error",
                });
            }
        }
        )});

    // Delete Single User √
    socket.on("deleteUser", () => {
        socketAuthentication(socket,async (data) => {
            const {id} = data;
            console.log("User Delete Request");
            console.log(data);
            console.log("ID:", id);
            // Validate the required fields
            if (!id) {
                socket.emit("user-messages", {
                    status: 400,
                    message: "Please provide user ID",
                });
                return;
            }

            try {
                const user = await User.findByIdAndDelete(id);

                if (user) {
                    socket.emit("user-messages", {
                        status: 200,
                        message: "User deleted successfully",
                        user,
                    });
                } else {
                    socket.emit("user-messages", {
                        status: 404,
                        message: "User not found",
                    });
                }
            } catch (error) {
                console.log(error);
                socket.emit("user-messages", {
                    status: 500,
                    message: "Server error",
                });
            }
        }
        )});
};

export default userSocketHandlers;
