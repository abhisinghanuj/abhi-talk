import { WebSocketServer, WebSocket } from "ws";
const PORT = process.env.PORT || 8080
const wss = new WebSocketServer({port: PORT});

interface User{
    socket: WebSocket,
    room: string
}

let allSockets: User[] = [];

wss.on("connection", function(socket){


    socket.on("message", (message)=>{
        const parsedMessage = JSON.parse(message as unknown as string);
        if(parsedMessage.type === "join"){
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            })
        }
        if(parsedMessage.type === "chat"){
            let currentUserRoom = null;
            for(let i=0; i<allSockets.length; i++){
                if(allSockets[i].socket == socket){
                    currentUserRoom = allSockets[i].room;
                }
            }
            for(let i=0; i<allSockets.length; i++){
                if(allSockets[i].room == currentUserRoom){
                    allSockets[i].socket.send(JSON.stringify({
                        type: "chat",
                        payload: {
                            name: parsedMessage.payload.name,
                            message: parsedMessage.payload.message
                        }
                        })
)
                }
            }
        }
    })
    socket.on("close", ()=> {
        allSockets = allSockets.filter(x=> x.socket!=socket)
    })
})