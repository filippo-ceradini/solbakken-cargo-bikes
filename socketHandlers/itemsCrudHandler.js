import Item from "../database/models/Items.js";
import isAuthenticated from "../utils/auth.js";

//
//CRUD for Items
//
const itemSocketHandlers = socket => {
    // Create Item √
    socket.on("createItem", isAuthenticated(socket,
            async (data) => {
                const {name} = data;
                console.log(name)
                // Validate the required field
                if (!name) {
                    socket.emit("item-messages", {
                        status: 400,
                        message: "Please provide the item name",
                    });
                    return;
                }

                try {
                    // Create a new item
                    const newItem = new Item({
                        name,
                    });

                    await newItem.save();

                    socket.emit("item-messages", {
                        status: 200,
                        message: "Item created successfully",
                        item: newItem,
                    });
                } catch (error) {
                    socket.emit("item-messages", {
                        status: 500,
                        message: "Server error",
                    });
                }
            }));
    // Get Items √
    socket.on("getItems", isAuthenticated(socket,
            async () => {
                try {
                    const items = await Item.find();

                    socket.emit("item-messages", {
                        status: 200,
                        message: "Retrieved items successfully",
                        items,
                    });
                } catch (error) {
                    socket.emit("item-messages", {
                        status: 500,
                        message: "Server error",
                    });
                }
            }));
    // Update Item √
    socket.on("updateItem", isAuthenticated(socket,
            async (data) => {
                const {id, name} = data;

                // Validate the required fields
                if (!id || !name) {
                    socket.emit("item-messages", {
                        status: 400,
                        message: "Please provide item ID and name",
                    });
                    return;
                }

                try {
                    const item = await Item.findByIdAndUpdate(id, {name}, {new: true});

                    if (item) {
                        socket.emit("item-messages", {
                            status: 200,
                            message: "Item updated successfully",
                            item,
                        });
                    } else {
                        socket.emit("item-messages", {
                            status: 404,
                            message: "Item not found",
                        });
                    }
                } catch (error) {
                    socket.emit("item-messages", {
                        status: 500,
                        message: "Server error",
                    });
                }
            }));
    // Delete Item √
    socket.on("deleteItem", isAuthenticated(socket,
        async (data) => {
            const {id} = data;

            // Validate the required field
            if (!id) {
                socket.emit("item-messages", {
                    status: 400,
                    message: "Please provide item ID",
                });
                return;
            }

            try {
                const item = await Item.findByIdAndDelete(id);

                if (item) {
                    socket.emit("item-messages", {
                        status: 200,
                        message: "Item deleted successfully",
                        item,
                    });
                } else {
                    socket.emit("item-messages", {
                        status: 404,
                        message: "Item not found",
                    });
                }
            } catch (error) {
                socket.emit("item-messages", {
                    status: 500,
                    message: "Server error",
                });
            }
        }));
}

export default itemSocketHandlers;
