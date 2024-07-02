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
    const [userInfo, setUserInfo] = useState(null);
    const { roomId, roomCode } = useParams()
    const [meetUser, setMeetUsers] = useState([])
    const [socketId, setSocketId] = useState(null)
    const [meetChannel, setMeetChannel] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [peer, setPeer] = useState(null);
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
            triggerEditEvent({ channel: `meet-${roomCode}`, event: 'userJoined', message: `${userInfo.name} joined meet`, socketId })
        }
        if (pusher)
            setMeetChannel(pusher.subscribe(`meet-${roomCode}`))
    }, [socketId, userInfo]);

    useEffect(() => {
        if (!localStream && myVideo.current) {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then((stream) => {
                        setLocalStream(stream);
                        console.log('Local stream:', stream);
                        myVideo.current.srcObject = stream;
                    })
                    .catch((error) => {
                        console.error('Error accessing media devices:', error.name, error.message);
                    });
            }

        }
    }, [localStream, socketId]);


    useEffect(() => {

        if (!userInfo || !meetChannel) return;

        meetChannel.bind('signal', (signal) => {
            if (signal.peerId === userInfo._id) return;
            console.log(signal)
            if (signal.type === 'offer') {
                handleOffer(signal);
            } else if (signal.type === 'answer') {
                handleAnswer(signal);
            } else if (signal.type === 'candidate') {
                handleCandidate(signal);
            }
        });

        meetChannel.bind('userJoined', function (data) {
            alert(data.message);
        });

        return () => {
            meetChannel.unbind_all();
            meetChannel.unsubscribe();
        };
    }, [meetChannel, userInfo])

    const initiateCall = async () => {
        try {
            if (!userInfo || !localStream || !meetChannel) {
                console.log('userInfo, localStream, or meetChannel is not available.');
                return;
            }
            const peerInstance = new SimplePeer({
                initiator: true,
                
            });

            peerInstance.on('signal', (data) => {
                meetChannel.trigger('signal', {
                    peerId: userInfo._id,
                    type: 'offer',
                    data: data,
                });
            });

            peerInstance.on('stream', (stream) => {
                setRemoteStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
            });

            setPeer(peerInstance);
        } catch (error) {
            console.error('Error initializing SimplePeer in initiateCall:', error);
            // Handle error appropriately, e.g., notify user or retry initialization
        }
    };

    const handleOffer = async (signal) => {
        try {
            if (!userInfo || !localStream) {
                console.log('userInfo or localStream is not available.');
                return;
            }

            const peerInstance = new SimplePeer({
                initiator: false,
                stream: localStream,
                trickle: false,
            });

            peerInstance.signal(signal.data);

            peerInstance.on('signal', (data) => {
                meetChannel.trigger('signal', {
                    peerId: userInfo._id,
                    type: 'answer',
                    data: data,
                });
            });

            peerInstance.on('stream', (stream) => {
                setRemoteStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
            });

            setPeer(peerInstance);
        } catch (error) {
            console.error('Error initializing SimplePeer in handleOffer:', error);
            // Handle error appropriately, e.g., notify user or retry initialization
        }
    };



    // Function to handle incoming answer signal
    const handleAnswer = async (signal) => {
        if (peer) {
            peer.signal(signal.data);
        }
    };

    // Function to handle incoming ICE candidate signal
    const handleCandidate = async (signal) => {
        if (peer) {
            peer.signal(signal.data);
        }
    };

    if (!socketId) {
        return <>loading</>
    }

    return (
        <>
            <div>
                <h1>Meeting Page</h1>
                <div>
                    <h2>My Video</h2>

                    <button onClick={initiateCall}>call</button>
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
