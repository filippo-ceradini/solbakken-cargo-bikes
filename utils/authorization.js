const checkAuthorizationForEvent = (eventName, handler) => {
    return (socket) => {
        if (eventName !== 'login' && eventName !== 'logout') {
            if (!socket?.request?.session?.user?.isAdmin) {
                const error = new Error('You are not authenticated.');
                socket.emit("unauthorized", {message: error.message});
                return;
            }
        }

        socket.on(eventName, handler);
    };
};

export default checkAuthorizationForEvent();