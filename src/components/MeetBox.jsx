import React, { useEffect } from 'react'

function MeetBox({videoRef}) {
    useEffect(() => {
        console.log('Video Ref:', videoRef); // Check if videoRef is correctly passed
        if (videoRef && videoRef.current) {
            console.log('Current Video Element:', videoRef.current); // Check current element reference
        }
    }, [videoRef]);
    return (
        <>
            <div className='h-full w-full bg-black rounded-3xl text-white '>
                <video className='h-full w-full object-cover rounded-3xl' ref={videoRef} autoPlay>
                </video>
            </div>
        </>
    )
}

export default MeetBox
