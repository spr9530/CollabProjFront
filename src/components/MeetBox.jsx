import React, { useEffect, useRef } from 'react';
import tempV from '../assets/tempV.mp4'

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
                className='h-full w-full object-fit rounded-3xl'
                ref={videoRef}
                autoPlay
                playsInline
            />
            {/* <video
                className='h-full w-full object-fi rounded-3xl'
                src={tempV}
                autoPlay
            /> */}
        </div>
    );
}

export default MeetBox;
