import React, { useCallback, useEffect, useRef, useState } from 'react';

import Peer from 'peerjs';
import { getUserInfo } from '../user/userApi'; 
import { useParams } from 'react-router-dom';
function Temp() {
   
    
    return (
        <div>
            <h1>Meeting Page</h1>
            <div>
                <h2>My Video</h2>

                <button onClick={callPeer}>call</button>
                <video ref={myVideo} autoPlay muted />
            </div>
            <div>
                <h2>User Video</h2>
                <video ref={userVideo} autoPlay />
            </div>
        </div>
    );
}

export default Temp;
