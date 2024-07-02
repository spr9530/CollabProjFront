import React, { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { getUserInfo } from '../user/userApi';
import { useParams } from 'react-router-dom';
import { triggerEditEvent } from '../socket/triggerEditor';
import global from 'global'
import * as process from "process";
global.process = process;
import SimplePeer from 'simple-peer';

function MeetingPage({ pusher }) {
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const peer = useRef(null)
    const [userInfo, setUserInfo] = useState(null);
    const [myId, setMyId] = useState(null)
    const [peerId, setPeerId] = useState(null)
    const { roomId, roomCode } = useParams()
    const [meetUser, setMeetUsers] = useState([])
    const [socketId, setSocketId] = useState(null)
    const [meetChannel, setMeetChannel] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    // const [peer, setPeer] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);


    const fetchUserInfo = useCallback(async () => {
        try {
            const userInfo = await getUserInfo();
            if (userInfo.error) {
                navigate('/', { replace: true, state: { from: `/room/${id}` } });
            }
            setUserInfo(userInfo);
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    useEffect(() => {
        if (pusher && pusher.connection) {
            const handleConnectionStateChange = () => {
                if (pusher.connection.state === 'connected') {
                    setSocketId(pusher.connection.socket_id);
                    setMeetChannel(pusher.subscribe(`meet-${roomCode}`));
                }
            };

            handleConnectionStateChange();
            pusher.connection.bind('state_change', handleConnectionStateChange);

            return () => {
                pusher.connection.unbind('state_change', handleConnectionStateChange);
            };
        }
    }, [pusher, roomCode]);

    useEffect(() => {
        if (!socketId && !userInfo) return;

        if (userInfo) {
            triggerEditEvent({ channel: `meet-${roomCode}`, event: 'userJoined', message: `${userInfo._id}`, socketId })
        }
        if (pusher)
            setMeetChannel(pusher.subscribe(`meet-${roomCode}`))
    }, [socketId, userInfo]);

    useEffect(()=>{
        if(!userInfo) return;
        setMyId(userInfo._id);
    }, [userInfo])

    useEffect(() => {
        if(!myId && !socketId ) return;
        const peerInstance = new Peer(`${myId}`, {
            host: 'collabproject-2.onrender.com',
            secure: true,  
            port: 443,   
            path: '/app/v1/room/meeting',  // Path configured on your backend for PeerJS
            debug: 3       // Set debug level to see PeerJS logs
        });

        peerInstance.on('open', (id) => {
            console.log('My Peer ID:', id);
        });

        peerInstance.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            }).then((stream) => {
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    if (myVideo.current) {
                        myVideo.current.srcObject = remoteStream;
                    }
                });
            }).catch((error) => {
                console.error('Error answering call:', error);
            });
        });

        peer.current = peerInstance;
        return () => {
            peerInstance.destroy(); // Clean up PeerJS instance on unmount
        };
    }, [myId, socketId]);

    useEffect(() => {

        if (!userInfo || !meetChannel) return;

        meetChannel.bind('userJoined', function (data) {
            alert(data.message);
            setPeerId(data.message)
        });

        return () => {
            meetChannel.unbind_all();
            meetChannel.unsubscribe();
        };
    }, [meetChannel, userInfo])


    const callPeer = useCallback((peerId) => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then((stream) => {
            const call = peer.current.call(peerId, stream);
            call.on('stream', (remoteStream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
                 if (myVideo.current) {
                    myVideo.current.srcObject = stream;
                }
            });
        }).catch((error) => {
            console.error('Error calling peer:', error);
        });
    }, [socketId]);



    if (!socketId) {
        return <>loading</>
    }

    return (
        <>
            <div>
                <h1>Meeting Page</h1>
                <div>
                    <h2>My Video</h2>

                    {
                        peerId&& 
                        <button onClick={()=> callPeer(peerId)}>call</button>
                    }
                    <video ref={myVideo} autoPlay muted />
                </div>
                <div>
                    <h2>User Video</h2>
                    <video ref={userVideo} autoPlay />
                </div>
            </div>
        </>
    );
}

export default MeetingPage;
