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
            const videoElement = track.attach();
            videoElement.style.width = "100%";
            videoElement.style.height = "100%";
            videoElement.style.objectFit = "cover";
            localVideoRef.current?.appendChild(videoElement);
          }
        });
      }

      // Existing participants
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
    participantDiv.className =
      "relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-lg";

    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed) {
        const track = publication.track;
        const videoElement = track.attach();
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        participantDiv.appendChild(videoElement);
      }
    });

    participant.on("trackSubscribed", (track: any) => {
      const videoElement = track.attach();
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = "cover";
      participantDiv.appendChild(videoElement);
    });

    remoteVideoContainerRef.current?.appendChild(participantDiv);
  };

  // ---------------- REMOVE PARTICIPANT VIDEO ----------------
  const removeParticipantVideo = (identity: string) => {
    const participantDiv = document.getElementById(identity);
    if (participantDiv) participantDiv.remove();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col items-center p-6">

      <h1 className="text-4xl font-bold mb-8 tracking-wide">
        Twilio Video Call App
      </h1>

      {/* Controls Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col gap-4">

        <input
          className="p-2 rounded bg-white text-black"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          className="p-2 rounded bg-white text-black"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        <div className="flex justify-between text-sm">
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

        <div className="flex gap-4 justify-center">
          <button
            onClick={connectToRoom}
            disabled={room !== null}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            Connect
          </button>

          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            Leave
          </button>
        </div>

        <p className="text-center text-sm text-gray-300">
          Status: {status}
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-md">
          {notification}
        </div>
      )}

      {/* Local Video */}
      <div className="mt-12 w-full max-w-6xl">
        <h2 className="mb-4 text-lg font-semibold">Local Video</h2>
        <div
          ref={localVideoRef}
          className="w-full h-64 bg-black rounded-xl overflow-hidden shadow-lg"
        ></div>
      </div>

      {/* Remote Videos */}
      <div className="mt-12 w-full max-w-6xl">
        <h2 className="mb-6 text-lg font-semibold">Remote Participants</h2>
        <div
          ref={remoteVideoContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        ></div>
      </div>

    </div>
  );
}
