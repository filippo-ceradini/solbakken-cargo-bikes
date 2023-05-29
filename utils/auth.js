export default function hasAuthentication(socket) {
    console.log('User isVerified:', socket.request.session.user?.isVerified);
    if (!socket?.request?.session?.user?.isVerified) {

        console.log('You are not authenticated.');
        return false;
    } else {
        return true;
    }
}