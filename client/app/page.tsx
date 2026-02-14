"use client";

import { useState, useRef } from "react";
import axios from "axios";
import Video from "twilio-video";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [notification, setNotification] = useState("");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  // ---------------- CONNECT ----------------
  const connectToRoom = async () => {
    try {
      if (room) {
        alert("Already connected!");
        return;
      }

      if (!roomName) {
        alert("Please enter room name");
        return;
      }

      if (!userName) {
        alert("Please enter your name");
        return;
      }

      setStatus("Connecting...");

      const tracks = await Video.createLocalTracks({
        audio: enableAudio,
        video: enableVideo,
      });

      setLocalTracks(tracks);

      const response = await axios.post(
        "http://localhost:5000/generate-token",
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

      // Clear previous video containers
      if (localVideoRef.current) localVideoRef.current.innerHTML = "";
      if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";

      // Attach local video
      tracks.forEach((track: any) => {
        if (track.kind === "video") {
          localVideoRef.current?.appendChild(track.attach());
        }
      });

      // Existing participants
      connectedRoom.participants.forEach((participant: any) => {
        setParticipants((prev) => [...prev, participant.identity]);

        participant.tracks.forEach((publication: any) => {
          if (publication.isSubscribed) {
            remoteVideoRef.current?.appendChild(
              publication.track.attach()
            );
          }
        });
      });

      // New participant joins
      connectedRoom.on("participantConnected", (participant: any) => {
        setParticipants((prev) => [...prev, participant.identity]);

        setNotification(`${participant.identity} has joined the room`);
        setTimeout(() => setNotification(""), 3000);

        participant.on("trackSubscribed", (track: any) => {
          remoteVideoRef.current?.appendChild(track.attach());
        });
      });

      // Participant leaves
      connectedRoom.on("participantDisconnected", (participant: any) => {
        setParticipants((prev) =>
          prev.filter((name) => name !== participant.identity)
        );

        // Clear remote video
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
        }

        setNotification(`${participant.identity} has left the room`);
        setTimeout(() => setNotification(""), 3000);
      });

    } catch (error) {
      console.error(error);
      setStatus("Connection Failed");
    }
  };

  // ---------------- TOGGLE AUDIO ----------------
  const toggleAudio = () => {
    localTracks.forEach((track) => {
      if (track.kind === "audio") {
        if (track.isEnabled) {
          track.disable();
        } else {
          track.enable();
        }
      }
    });
  };

  // ---------------- TOGGLE VIDEO ----------------
  const toggleVideo = () => {
    localTracks.forEach((track) => {
      if (track.kind === "video") {
        if (track.isEnabled) {
          track.disable();
        } else {
          track.enable();
        }
      }
    });
  };

  // ---------------- LEAVE ----------------
  const leaveRoom = () => {
    if (room) {
      room.disconnect();

      localTracks.forEach((track) => {
        track.stop();
      });

      setLocalTracks([]);
      setRoom(null);
      setParticipants([]);
      setStatus("Disconnected");
      setNotification("");

      if (localVideoRef.current) localVideoRef.current.innerHTML = "";
      if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Twilio Video Call App</h1>

      <input
        className="border p-2 w-64"
        placeholder="Enter Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <input
        className="border p-2 w-64"
        placeholder="Enter Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enableVideo}
            onChange={() => {
              setEnableVideo(!enableVideo);
              toggleVideo();
            }}
          />
          Enable Video
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enableAudio}
            onChange={() => {
              setEnableAudio(!enableAudio);
              toggleAudio();
            }}
          />
          Enable Audio
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={connectToRoom}
          disabled={room !== null}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
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

      <p className="font-semibold">Status: {status}</p>

      {notification && (
        <div className="bg-yellow-400 text-black px-4 py-2 rounded shadow-md">
          {notification}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold">Connected Participants:</h3>
        {participants.length === 0 ? (
          <p>No one else connected</p>
        ) : (
          participants.map((name, index) => (
            <p key={index}>{name} has connected ✅</p>
          ))
        )}
      </div>

      <div className="flex gap-8 mt-6">
        <div>
          <h2 className="font-semibold mb-2">Local Video</h2>
          <div
            ref={localVideoRef}
            className="border w-72 h-52 flex items-center justify-center"
          ></div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Remote Video</h2>
          <div
            ref={remoteVideoRef}
            className="border w-72 h-52 flex items-center justify-center"
          ></div>
        </div>
      </div>
    </div>
  );
}
