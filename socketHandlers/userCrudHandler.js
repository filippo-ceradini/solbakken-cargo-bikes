import User from "../database/models/Users.js";
import bcrypt from "bcrypt";
import hasAuthentication from "../utils/authentication.js";
import userVerification from "../database/models/UserVerification.js";


const userSocketHandlers = (socket) => {
    // Create User
    socket.on("createUser", async (data) => {
        const {email, password} = data;
        console.log("User Creation Request")
        // Validate the required fields
        if (!email || !password) {
            socket.emit("user-messages", {
                status: 400,
                message: 'Please provide all required credentials',
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
                    email,
                    password: await bcrypt.hash(password, 10),
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
    });

    socket.on("getUsers", () => hasAuthentication(socket, async () => {
        try {
            const users = await User.find();
            console.log("User Read Request")
            socket.emit("user-messages", {
                status: 200,
                message: "Retrieved users successfully",
                users,
            });
        } catch (error) {
            socket.emit("user-messages", {
                status: 500,
                message: "Server error",
            });
        }
    })());
    // Update User
    socket.on("updateUser", (data) => hasAuthentication(socket, async () => {
        const {id, email} = data;
        console.log("User Update Request")
        console.log(data);
        console.log("ID:", id);
        console.log("Email:", email);
        // Validate the required fields
        if (!id || !email) {
            socket.emit("user-messages", {
                status: 400,
                message: 'Please provide user ID and email',
            });
            return;
        }

        try {
            const user = await User.findByIdAndUpdate(
                id,
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
    })(data));
    // Delete All Users & User Verifications
    socket.on("delete-all-users", () => hasAuthentication(socket, async () => {
        console.log("here")
        try {
            await User.deleteMany({});
            await userVerification.deleteMany({});
            console.log("User Delete Request")
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
    })());
}

export default userSocketHandlers