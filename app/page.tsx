"use client"

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function Home() {

  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const { mutate: enterRoom } = useMutation({
    mutationFn: async () => {
      localStorage.setItem("username", username);
      const res = await api.rooms.create({ roomId: roomName }).post()
    }
  })

  return (
    <div className="w-full h-full background-home --font-jbm">
      {/* center box */}
      <div className="rounded-lg w-[500px] h-[500px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 background-mirror flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">UwUChat</h1>
        <br />
        <br />
        <p></p>
        <br />
        <p className="text-xl text-center">Hi!! Welcome to an IRC-Like, realtime chat app</p>
        <br />
        <div className="flex flex-col items-center justify-center pt-10">
          <p className="text-xl text-center">Select a room: </p>
          <br />
          <input type="text" placeholder="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          <br />
          <p className="text-xl text-center">and your username: </p>
          <br />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <br />
          <button onClick={() => enterRoom()} className="bg-black-500 hover:bg-black text-white font-bold pt-4 py-2 px-4 rounded">
            Join
          </button>
        </div>


      </div>
    </div>
  )
}
