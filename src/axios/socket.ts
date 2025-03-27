import io from "socket.io-client";

const socketInstance = io(import.meta.env.VITE_SOCKET_URL); // Adjust to your backend URL

export default socketInstance;
