import { useEffect, useRef, useState } from 'react'


function App() {
  const [phase, setPhase] = useState("init");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([{name: "System", message: "start chatting"}]);
  const wsRef = useRef();
  const messageRef = useRef(null);

  useEffect(() => {
      if(phase=== "chat"){
        const ws = new WebSocket("ws://localhost:8080");
      ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data.payload]);
      }
    };

      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "join",
          payload: {
            roomId: roomId,
            name: name
          }
        }))
      }
      }
  },[phase]);
  if (phase === "init") {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4 bg-black'>
      <div className='bg-white p-10 flex flex-col rounded-xl'>
        <h1 className=' flex text-2xl font-bold justify-center'>AbhiTalk</h1>
        <div className='flex flex-col items-center mt-3 gap-3'>
          <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='border p-2 rounded w-64'
      />
        <input
          placeholder="Room ID to join"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className='border p-2 rounded w-64'
        />
        </div>
        <div className='flex gap-4 justify-center mt-3'>
          <button
          className='bg-black text-white p-2 rounded-lg cursor-pointer hover:bg-gray-900'
          onClick={() => {
            if(!name || !roomId){
              alert("Name/RoomId missing!");
              return;
            }
            setPhase("chat");
          }}
        >
          Join Room
        </button>

      <button
        className='bg-black text-white p-2 rounded-lg cursor-pointer hover:bg-gray-900'
        onClick={() => {
          if(!name){
              alert("Enter your name first!");
              return;
            }
          const generatedRoom = Math.random().toString(36).substring(2, 8);
          setRoomId(generatedRoom);
          setMessages([{name: "System", message: `Room Id: ${generatedRoom}`}])
          setPhase("chat");
        }}
      >
        Create Room
      </button>
        </div>
      </div>
    </div>
  );
}


  return (
    <>
      <div className='h-[85vh] bg-black'>
        <div className='h-[85vh] flex flex-col'>
          {messages.map((msg, idx) => (
          <span key={idx} className='bg-white text-black rounded-xl mt-3 ml-2 mr-2 p-3 inline-block max-w-fit max-h-fit'>
          <strong>{msg.name}:</strong> {msg.message}
          </span>
          ))}
        </div>
        <div className='w-full bg-white flex p-2'>
          <div className='flex w-full gap-4'>
            <input ref={messageRef} type="text" className='flex-[9] border rounded-lg' onKeyDown={(e) => {
              if(e.key==="Enter"){
                const message = messageRef.current?.value;
                wsRef.current.send(JSON.stringify({
                  type: "chat",
                  payload: {
                    name: name,
                    message: message
                  }
                }))
                messageRef.current.value = "";
              }
            }}/>
          <button className='flex-[1] bg-black text-white p-3 rounded-xl' onClick={()=>{
            const message = messageRef.current?.value;
            wsRef.current.send(JSON.stringify({
              type: "chat",
              payload: {
                name: name,
                message: message
              }
            }))
            messageRef.current.value = "";
          }}>Send Message</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
