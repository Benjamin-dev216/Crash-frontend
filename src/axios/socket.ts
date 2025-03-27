import io from "socket.io-client";

const socketInstance = io("http://localhost:4001"); // Adjust to your backend URL

export default socketInstance;
