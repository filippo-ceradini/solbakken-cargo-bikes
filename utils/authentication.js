const checkAuthenticationForEvent = (eventName, handler) => {
    return (socket) => {
        console.log('Socket user:', socket.request.session.user);
        console.log('User isVerified:', socket.request.session.user?.isVerified);

        if (!socket?.request?.session?.user?.isVerified) {
            const error = new Error('You are not authenticated.');
            console.log(error);
            return;
        }
        socket.on(eventName, handler);
        console.log("Event handler registered")
    };
};


export default checkAuthenticationForEvent;