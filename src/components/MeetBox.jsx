import React, { useEffect, useRef } from 'react';

function MeetBox({ mediaStream }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            console.log('done')
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
        }
    }, [mediaStream]);


    return (
        <div className='h-full w-full bg-black rounded-3xl text-white'>
            <video
                className='h-full w-full object-cover rounded-3xl'
                ref={videoRef}
                autoPlay
                playsInline
            />
        </div>
    );
}

export default MeetBox;
