import React from "react";
import VideoCall from "../../components/videocall/videocall"; // Correct import

const VideoCallPage: React.FC = () => {
  return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-indigo-600">🎥 Video Call Room</h1>
        <VideoCall />
      </div>
  );
};

export default VideoCallPage;
