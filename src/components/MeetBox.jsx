import React, { useEffect } from 'react';

function MeetBox({ videoRef }) {
    useEffect(() => {
        if (videoRef && videoRef.current) {
            console.log('Video Ref:', videoRef.current);
        }
    }, [videoRef]);

    return (
        <div className='h-full w-full bg-black rounded-3xl text-white'>
            <video className='h-full w-full object-cover rounded-3xl' ref={videoRef} autoPlay />
        </div>
    );
}

export default MeetBox;
