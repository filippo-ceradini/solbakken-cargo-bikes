const checkAuthenticationForEvent = (eventName, handler) => {
    return (socket) => {
        socket.on(eventName, handler);
        console.log("Event handler registered")
    };
};


export default checkAuthenticationForEvent;