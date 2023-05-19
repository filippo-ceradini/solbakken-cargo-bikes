import User from "../database/models/users.js";
import bcrypt from "bcrypt";

// Create User
const createUser = (socket) => async (data) => {
    const { email, password } = data;

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
        const userExists = await User.findOne({ email });

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
};

// Read User
const getUser = (socket) => async () => {
    try {
        const users = await User.find();

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
};

// Update User
const updateUser = (socket) => async (data) => {
    const { id, email } = data;

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
            { email },
            { new: true }
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
        socket.emit("user-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

// Delete Event
const deleteUser = (socket) => async (data) => {
    const { id } = data;

    // Validate the required fields
    if (!id) {
        socket.emit("user-messages", {
            status: 400,
            message: 'Please provide user ID',
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
        socket.emit("user-messages", {
            status: 500,
            message: "Server error",
        });
    }
};

export { createUser, getUser, updateUser, deleteUser };