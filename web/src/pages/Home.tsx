import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { createRoom } from "../socketClient";

const HomePage = ({ history }: RouteComponentProps) => {
  const [roomIdInput, setRoomIdInput] = useState<string>("");
  return (
    <div className="App">
      <div>
        <h1>Create a room</h1>
        <button
          onClick={async () => {
            const roomId = await createRoom();
            history.push(`/${roomId}`);
          }}
        >
          New Room
        </button>
      </div>
      <div>
        <h1>Join a room</h1>
        <input
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          placeholder="Room Code"
        />
        <button
          onClick={() => {
            history.push(`/${roomIdInput}`);
          }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default HomePage;
