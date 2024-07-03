import React, { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { getUserInfo } from '../user/userApi';
import { useParams } from 'react-router-dom';
import { triggerEditEvent } from '../socket/triggerEditor';
import MeetBox from '../components/MeetBox';

function MeetingPage({ pusher }) {
    const myVideoRef = useRef(null);
    const userVideoRefs = useRef({});

    const peer = useRef(null);
    const [userInfo, setUserInfo] = useState(null);
    const [myId, setMyId] = useState(null);
    const [peerIds, setPeerIds] = useState([]);
    const { roomId, roomCode } = useParams();
    const [socketId, setSocketId] = useState(null);
    const [meetChannel, setMeetChannel] = useState(null);
    const [viewRow, setViewRow] = useState('row');

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
            triggerEditEvent({ channel: `meet-${roomCode}`, event: 'userJoined', message: `${userInfo._id}`, socketId });
        }
    }, [socketId, userInfo, roomCode]);

    useEffect(() => {
        if (!userInfo) return;
        setMyId(userInfo._id);
    }, [userInfo]);

    useEffect(() => {
        if (!myId || !socketId) return;

        const peerInstance = new Peer(`${myId}`, {
            host: 'collabproject-2.onrender.com',
            secure: true,
            port: 443,
            path: '/app/v1/room/meeting',
            debug: 3
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
                const peerId = call.peer;
                call.on('stream', (remoteStream) => {
                    handlePeer({ peerId, remoteStream });
                });
            }).catch((error) => {
                console.error('Error answering call:', error);
            });
        });

        peer.current = peerInstance;

        return () => {
            if (userInfo) {
                triggerEditEvent({ channel: `meet-${roomCode}`, event: 'userLeft', message: `${userInfo._id}`, socketId });
            }
            peerInstance.destroy();
        };
    }, [myId, socketId, roomCode]);

    const handlePeer = ({ peerId, remoteStream }) => {
        const videoRef = userVideoRefs.current[peerId];
        if (videoRef && videoRef.current) {
            videoRef.current.srcObject = remoteStream;
        }
    };

    useEffect(() => {
        if (!userInfo || !meetChannel) return;

        meetChannel.bind('userJoined', function (data) {
            alert(data.message);
            callPeer(data.message);
            setPeerIds((prevPeerIds) => [...prevPeerIds, data.message]);
        });

        meetChannel.bind('userLeft', function (data) {
            alert(`User Left: ${data.message}`);
            setPeerIds((prevPeerIds) => prevPeerIds.filter((id) => id !== data.message));
            if (userVideoRefs.current[data.message]) {
                delete userVideoRefs.current[data.message];
            }
        });

        return () => {
            meetChannel.unbind_all();
            meetChannel.unsubscribe();
        };
    }, [meetChannel, userInfo]);

    const callPeer = useCallback((peerId) => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then((stream) => {
            const call = peer.current.call(peerId, stream);
            call.on('stream', (remoteStream) => {
                handlePeer({ peerId, remoteStream });
            });
        }).catch((error) => {
            console.error('Error calling peer:', error);
        });
    }, []);

    useEffect(() => {
        console.log(peerIds);
    }, [peerIds]);

    if (!socketId) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Meeting Page</h1>
            <div>
                <h2>User Videos</h2>
                <div className='flex gap-2 w-screen h-screen overflow-scroll scrollbar-none'>
                    <div className='w-9/12 h-full flex flex-col items-center justify-center p-1 gap-2'>
                        <div className='w-full h-[70%]'>
                            <MeetBox videoRef={myVideoRef} />
                        </div>
                        <div className={`flex items-center gap-2 w-full overflow-x-scroll ${viewRow === 'row' && 'flex-wrap items-center justify-center'}`}>
                            {peerIds.map((id) => (
                                <div className='h-full w-4/12' key={id}>
                                    <MeetBox videoRef={userVideoRefs.current[id]} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='w-3/12 h-full bg-black'>
                        {/* Additional content for right panel */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MeetingPage;
