"use client";

import { useState, useRef } from "react";
import axios from "axios";
import Video from "twilio-video";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [room, setRoom] = useState<any>(null);
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [notification, setNotification] = useState("");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  // ---------------- CONNECT ----------------
  const connectToRoom = async () => {
    try {
      if (room) return;

      if (!roomName || !userName) {
        alert("Enter name and room");
        return;
      }

      setStatus("Connecting...");

      const tracks = await Video.createLocalTracks({
        audio: enableAudio,
        video: enableVideo,
      });

      setLocalTracks(tracks);

      const response = await axios.post(
        "https://video-app-rz9w.onrender.com/generate-token",
        {
          identity: userName,
          roomName,
        }
      );

      const token = response.data.token;

      const connectedRoom = await Video.connect(token, {
        name: roomName,
        tracks: tracks,
      });

      setRoom(connectedRoom);
      setStatus("Connected");

      // Attach local video
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
        tracks.forEach((track: any) => {
          if (track.kind === "video") {
            localVideoRef.current?.appendChild(track.attach());
          }
        });
      }

      // Handle existing participants
      connectedRoom.participants.forEach((participant: any) => {
        addParticipantVideo(participant);
      });

      // New participant joins
      connectedRoom.on("participantConnected", (participant: any) => {
        setNotification(`${participant.identity} joined`);
        setTimeout(() => setNotification(""), 3000);

        addParticipantVideo(participant);
      });

      // Participant leaves
      connectedRoom.on("participantDisconnected", (participant: any) => {
        removeParticipantVideo(participant.identity);

        setNotification(`${participant.identity} left`);
        setTimeout(() => setNotification(""), 3000);
      });

    } catch (error) {
      console.error(error);
      setStatus("Connection Failed");
    }
  };

  // ---------------- ADD PARTICIPANT VIDEO ----------------
  const addParticipantVideo = (participant: any) => {
    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    participantDiv.className = "border p-2";

    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed) {
        const track = publication.track;
        participantDiv.appendChild(track.attach());
      }
    });

    participant.on("trackSubscribed", (track: any) => {
      participantDiv.appendChild(track.attach());
    });

    remoteVideoContainerRef.current?.appendChild(participantDiv);
  };

  // ---------------- REMOVE PARTICIPANT VIDEO ----------------
  const removeParticipantVideo = (identity: string) => {
    const participantDiv = document.getElementById(identity);
    if (participantDiv) {
      participantDiv.remove();
    }
  };

  // ---------------- TOGGLE AUDIO ----------------
  const toggleAudio = () => {
    localTracks.forEach((track) => {
      if (track.kind === "audio") {
        track.isEnabled ? track.disable() : track.enable();
      }
    });
  };

  // ---------------- TOGGLE VIDEO ----------------
  const toggleVideo = () => {
    localTracks.forEach((track) => {
      if (track.kind === "video") {
        track.isEnabled ? track.disable() : track.enable();
      }
    });
  };

  // ---------------- LEAVE ----------------
  const leaveRoom = () => {
    if (room) {
      room.disconnect();
      localTracks.forEach((track) => track.stop());

      setRoom(null);
      setStatus("Disconnected");

      if (localVideoRef.current) localVideoRef.current.innerHTML = "";
      if (remoteVideoContainerRef.current)
        remoteVideoContainerRef.current.innerHTML = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Twilio Video Call App</h1>

      <input
        className="border p-2 w-64"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <input
        className="border p-2 w-64"
        placeholder="Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />

      <div className="flex gap-4">
        <label>
          <input
            type="checkbox"
            checked={enableVideo}
            onChange={() => {
              setEnableVideo(!enableVideo);
              toggleVideo();
            }}
          /> Enable Video
        </label>

        <label>
          <input
            type="checkbox"
            checked={enableAudio}
            onChange={() => {
              setEnableAudio(!enableAudio);
              toggleAudio();
            }}
          /> Enable Audio
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={connectToRoom}
          disabled={room !== null}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect
        </button>

        <button
          onClick={leaveRoom}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Leave
        </button>
      </div>

      <p>Status: {status}</p>

      {notification && (
        <div className="bg-yellow-400 px-4 py-2 rounded">
          {notification}
        </div>
      )}

      <div className="mt-4">
        <h2>Local Video</h2>
        <div
          ref={localVideoRef}
          className="border w-72 h-52"
        ></div>
      </div>

      <div className="mt-4">
        <h2>Remote Participants</h2>
        <div
          ref={remoteVideoContainerRef}
          className="grid grid-cols-2 gap-4"
        ></div>
      </div>
    </div>
  );
}
