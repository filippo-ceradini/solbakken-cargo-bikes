const checkAuthenticationForEvent = (eventName, handler) => {
    return (socket) => {
        if (!socket?.request?.session?.user?.isVerified) {
            const error = new Error('You are not authenticated.');
            socket.emit("unauthorized", {message: error.message});
            return;
        }
        socket.on(eventName, handler);
    };
};

export default checkAuthenticationForEvent;