import React from 'react';

const Controls = ({ video, setVideo, audio, setAudio, screen, setScreen, localStreamRef, peerIds }) => {
    const toggleVideo = () => {
        const enabled = localStreamRef.current.getVideoTracks()[0].enabled;
        localStreamRef.current.getVideoTracks()[0].enabled = !enabled;
        setVideo(!enabled);
    };

    const toggleAudio = () => {
        const enabled = localStreamRef.current.getAudioTracks()[0].enabled;
        localStreamRef.current.getAudioTracks()[0].enabled = !enabled;
        setAudio(!enabled);
    };

    const toggleScreen = () => {
        // Implement screen sharing toggle logic
        setScreen(!screen);
    };

    return (
        <div className="controls">
            <button onClick={toggleVideo}>{video ? 'Turn off Video' : 'Turn on Video'}</button>
            <button onClick={toggleAudio}>{audio ? 'Mute' : 'Unmute'}</button>
            <button onClick={toggleScreen}>{screen ? 'Stop Sharing' : 'Share Screen'}</button>
        </div>
    );
};

export default Controls;
