"use client";
import { useRef, useState } from "react";

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const startCall = async () => {
    setIsCallActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection();
    setPeerConnection(pc);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    const remotePc = new RTCPeerConnection();
    pc.onicecandidate = (e) => e.candidate && remotePc.addIceCandidate(e.candidate);
    remotePc.onicecandidate = (e) => e.candidate && pc.addIceCandidate(e.candidate);
    remotePc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
    stream.getTracks().forEach((track) => remotePc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await remotePc.setRemoteDescription(offer);

    const answer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(answer);
    await pc.setRemoteDescription(answer);
  };

  const endCall = () => {
    setIsCallActive(false);
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    peerConnection?.close();
    setPeerConnection(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  const toggleAudio = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsVideoOff(!isVideoOff);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setIsScreenSharing(true);
      alert("Screen share started (mock). In real app, this should send stream to peer.");
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600">🎥 Video Call Room</h1>

      {/* Video Panels */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative bg-black rounded-xl overflow-hidden shadow-lg transform transition hover:scale-105">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-64 md:h-96 object-cover ${isVideoOff ? "hidden" : ""}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/70 text-white font-bold">
              Video Off
            </div>
          )}
          <span className="absolute top-2 left-2 bg-gray-800/70 text-white px-2 py-1 rounded text-xs">
            You
          </span>
        </div>
        <div className="relative bg-black rounded-xl overflow-hidden shadow-lg transform transition hover:scale-105">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 md:h-96 object-cover"
          />
          <span className="absolute top-2 left-2 bg-gray-800/70 text-white px-2 py-1 rounded text-xs">
            Participant
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {!isCallActive ? (
          <button
            onClick={startCall}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-lg transition transform hover:scale-105"
          >
            Start Call
          </button>
        ) : (
          <>
            <button
              onClick={endCall}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg transition transform hover:scale-105"
            >
              End Call
            </button>
            <button
              onClick={toggleAudio}
              className={`px-6 py-3 rounded-full font-semibold shadow-md transition transform hover:scale-105 ${
                isMuted ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={toggleVideo}
              className={`px-6 py-3 rounded-full font-semibold shadow-md transition transform hover:scale-105 ${
                isVideoOff ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              {isVideoOff ? "Turn On Video" : "Turn Off Video"}
            </button>
            <button
              onClick={shareScreen}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold shadow-md transition transform hover:scale-105"
            >
              {isScreenSharing ? "Sharing" : "Share Screen"}
            </button>
          </>
        )}
      </div>

      {isCallActive && (
        <p className="text-gray-500 text-sm mt-4 max-w-md text-center">
          Call is active {isScreenSharing && "- Screen Sharing"}{" "}
          {!isVideoOff && !isMuted ? "" : "- Adjusting Media"}
        </p>
      )}
    </div>
  );
}
