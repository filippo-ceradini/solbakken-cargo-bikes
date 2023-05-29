import User from "../database/models/Users.js";
import bcrypt from "bcrypt";
import checkAuthenticationForEvent from "../utils/authentication.js";
import userVerification from "../database/models/UserVerification.js";
import hasAuthentication from "../utils/auth.js";

const userSocketHandlers = (socket) => {
    // Create User √
    // checkAuthenticationForEvent(
    //     "createUser", async (data) => {
    //         const {name, email, password} = data;
    //         console.log("User Creation Request");
    //         console.log({name, email, password});
    //
    //         // Validate the required fields
    //         if (!name || !email || !password) {
    //             socket.emit("user-messages", {
    //                 status: 400,
    //                 message: "Please provide all required credentials",
    //             });
    //             return;
    //         }
    //
    //         try {
    //             // Check if user exists
    //             const userExists = await User.findOne({email});
    //
    //             if (userExists) {
    //                 socket.emit("user-messages", {
    //                     status: 400,
    //                     message: "User already exists",
    //                 });
    //             } else {
    //                 // Create a new user
    //                 const newUser = new User({
    //                     username: name,
    //                     email,
    //                     password: await bcrypt.hash(password, 10),
    //                     isVerified: true,
    //                 });
    //
    //                 await newUser.save();
    //
    //                 socket.emit("user-messages", {
    //                     status: 200,
    //                     message: "User created successfully",
    //                     user: newUser,
    //                 });
    //             }
    //         } catch (error) {
    //             socket.emit("user-messages", {
    //                 status: 500,
    //                 message: "Server error",
    //             });
    //         }
    //     })
    // (socket);

    // Read User √
    socket.on("getUsers", async (socket) => {
        if (!hasAuthentication(socket)) {
            socket.emit("user-messages", {
                status: 401,
                message: "You are not authenticated",
            });
            return;
        }
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
    })


    // // Update User √
    // checkAuthenticationForEvent(
    //     "updateUser", async (data) => {
    //         const {id, email} = data;
    //         console.log("User Update Request");
    //         console.log(data);
    //         console.log("ID:", id);
    //         console.log("Email:", email);
    //         // Validate the required fields
    //         if (!id || !email) {
    //             socket.emit("user-messages", {
    //                 status: 400,
    //                 message: "Please provide user ID and email",
    //             });
    //             return;
    //         }
    //
    //         try {
    //             const user = await User.findByIdAndUpdate(
    //                 id,
    //                 {email},
    //                 {new: true}
    //             );
    //
    //             if (user) {
    //                 socket.emit("user-messages", {
    //                     status: 200,
    //                     message: "User updated successfully",
    //                     user,
    //                 });
    //             } else {
    //                 socket.emit("user-messages", {
    //                     status: 404,
    //                     message: "User not found",
    //                 });
    //             }
    //         } catch (error) {
    //             console.log(error);
    //             socket.emit("user-messages", {
    //                 status: 500,
    //                 message: "Server error",
    //             });
    //         }
    //     })
    // (socket);
    //
    // // Delete all Users √
    // checkAuthenticationForEvent(
    //     "delete-all-users", async () => {
    //         console.log("here");
    //         try {
    //             await User.deleteMany({});
    //             await userVerification.deleteMany({});
    //             console.log("User Delete Request");
    //             socket.emit("user-messages", {
    //                 status: 200,
    //                 message: "All users deleted successfully",
    //             });
    //         } catch (error) {
    //             socket.emit("user-messages", {
    //                 status: 500,
    //                 message: "Server error",
    //             });
    //         }
    //     })
    // (socket);
    //
    // // Delete Single User √
    // checkAuthenticationForEvent(
    //     "deleteUser", async (data) => {
    //         const {id} = data;
    //         console.log("User Delete Request");
    //         console.log(data);
    //         console.log("ID:", id);
    //         // Validate the required fields
    //         if (!id) {
    //             socket.emit("user-messages", {
    //                 status: 400,
    //                 message: "Please provide user ID",
    //             });
    //             return;
    //         }
    //
    //         try {
    //             const user = await User.findByIdAndDelete(id);
    //
    //             if (user) {
    //                 socket.emit("user-messages", {
    //                     status: 200,
    //                     message: "User deleted successfully",
    //                     user,
    //                 });
    //             } else {
    //                 socket.emit("user-messages", {
    //                     status: 404,
    //                     message: "User not found",
    //                 });
    //             }
    //         } catch (error) {
    //             console.log(error);
    //             socket.emit("user-messages", {
    //                 status: 500,
    //                 message: "Server error",
    //             });
    //         }
    //     })
    // (socket);
};

export default userSocketHandlers;
