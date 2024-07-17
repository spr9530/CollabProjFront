import React, { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { getUserInfo } from '../user/userApi';
import { useParams, useNavigate } from 'react-router-dom';
import { triggerEditEvent } from '../socket/triggerEditor';
import MeetBox from '../components/MeetBox';
import { RiUnpinFill } from "react-icons/ri";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa";


function MeetingPage({ pusher }) {
    const navigate = useNavigate();
    const peer = useRef(null);
    const [userInfo, setUserInfo] = useState(null);
    const [meet, setMeet] = useState(false);
    const [myId, setMyId] = useState(null);
    const [peerIds, setPeerIds] = useState([]);
    const { roomCode } = useParams();
    const [socketId, setSocketId] = useState(null);
    const [meetChannel, setMeetChannel] = useState(null);
    const [video, setVideo] = useState(true)
    const [audio, setAudio] = useState(true)
    const [screen, setScreen] = useState(false)
    const [localStream, setLocalStream] = useState(null);
    const [localMssg, setLocalMssg] = useState('')
    const [messages, setMessages] = useState([])





    const fetchUserInfo = useCallback(async () => {
        try {
            const userInfo = await getUserInfo();
            if (userInfo.error) {
                navigate('/', { replace: true, state: { from: `/room/${roomCode}` } });
            }
            setUserInfo(userInfo);
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    }, [navigate, roomCode]);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (userInfo && socketId) {
                triggerEditEvent({ channel: `meet-${roomCode}`, event: 'userJoined', message: `${userInfo._id}`, socketId });
            }

        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
        setMeet(true);
    };

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
            debug: 3,
        });

        peerInstance.on('open', (id) => {
            console.log('My Peer ID:', id);

        });

        peerInstance.on('connection', (conn) => {
            conn.on('open', function () {
                console.log('conn open');
            });
            conn.on('data', function (data) {
                setMessages((prevMessage) => [...prevMessage, data])
            });
        })

        peerInstance.on('call', (call) => {
            call.answer(localStream);
            const peerId = call.peer;
            const conn = peerInstance.connect(call.peer);
            call.on('stream', (remoteStream) => {
                handlePeer({ peerId, remoteStream, calling: call, conn });
            });
        });

        peer.current = peerInstance;

        return () => {
            if (userInfo) {
                triggerEditEvent({ channel: `meet-${roomCode}`, event: 'userLeft', message: `${userInfo._id}`, socketId });
            }
            if (localStream && localStream.getTracks()) localStream.getTracks().forEach(track => track.stop())
            peerInstance.destroy();
            window.location.reload()
        };
    }, [myId, socketId, roomCode])

    const handlePeer = useCallback(({ peerId, remoteStream, calling, conn }) => {
        setPeerIds((prevPeerIds) => {
            const existingPeer = prevPeerIds.find((peer) => peer.peerId === peerId);
            if (existingPeer) {
                existingPeer.stream = remoteStream;
                return [...prevPeerIds];
            } else {
                return [...prevPeerIds, { peerId, stream: remoteStream, isScaled: false, calling, conn }];
            }
        });
    }, []);


    useEffect(() => {
        if (!userInfo || !meetChannel) return;

        meetChannel.bind('userJoined', function (data) {
            alert(data.message);
            peer.current.connect(data.message)
            callPeer(data.message);
        });

        meetChannel.bind('userLeft', function (data) {
            alert(`User Left: ${data.message}`);
            setPeerIds((prevPeerIds) => prevPeerIds.filter((id) => id !== data.message));
        });

        return () => {
            meetChannel.unbind_all();
            meetChannel.unsubscribe();
        };
    }, [meetChannel, userInfo]);

    const callPeer = useCallback((peerId) => {
        if (!localStream) {
            console.error('Local stream is not available.');
            return;
        }
        const conn = peer.current.connect(peerId);
        const call = peer.current.call(peerId, localStream);
        call.on('stream', (remoteStream) => {
            handlePeer({ peerId, remoteStream, calling: call, conn: conn });
        });
        call.on('close', () => {
            console.log(`Call with ${peerId} has ended.`);
            // Handle call end if needed
        });

        call.on('error', (error) => {
            console.error(`Error calling peer ${peerId}:`, error);
            // Handle call error if needed
        });
    }, [localStream])
    function createBlackVideoTrack({ width = 640, height = 480 } = {}) {
        const canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext("2d").fillRect(0, 0, width, height); // fill the canvas with black
        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    function createSilentAudioTrack() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        oscillator.connect(mediaStreamDestination);
        oscillator.start();
        oscillator.frequency.setValueAtTime(0, audioContext.currentTime); // silent
        return Object.assign(mediaStreamDestination.stream.getAudioTracks()[0], { enabled: false });
    }

    const streamNullMedia = () => {
        const silentAudioTrack = createSilentAudioTrack();
        const blackVideoTrack = createBlackVideoTrack();

        setLocalStream(new MediaStream([silentAudioTrack, blackVideoTrack]));

        peerIds.forEach((peer) => {
            const senders = peer.calling.peerConnection.getSenders();
            senders.forEach((sender) => {
                if (sender.track) {
                    if (sender.track.kind === 'audio') {
                        sender.replaceTrack(silentAudioTrack);
                    } else if (sender.track.kind === 'video') {
                        sender.replaceTrack(blackVideoTrack);
                    }
                } else {
                    // Handle case where sender.track is null
                    if (sender.track === null || sender.kind === 'video') {
                        sender.replaceTrack(blackVideoTrack);
                    } else if (sender.track === null && sender.kind === 'audio') {
                        sender.replaceTrack(silentAudioTrack);
                    }
                }
            });
        });
    };
    useEffect(() => {
        if (meet) {
            handleToggleVideo()
        }
    }, [audio, video, screen])
    
    const handleToggleVideo = () => {
        if (!video && !audio && !screen) {
            streamNullMedia();
        } else if (!screen) {
            const constraints = { video: video, audio: audio };
            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    const videoTrack = video ? stream.getVideoTracks()[0] : createBlackVideoTrack();
                    const audioTrack = audio ? stream.getAudioTracks()[0] : createSilentAudioTrack();
                    setLocalStream(new MediaStream([audioTrack, videoTrack])); // Update local state with the correct stream

                    peerIds.forEach((peer) => {
                        const senders = peer.calling.peerConnection.getSenders();
                        let videoSender = senders.find((s) => s.track && s.track.kind === 'video');
                        let audioSender = senders.find((s) => s.track && s.track.kind === 'audio');

                        if (videoSender) {
                            if (!video) {
                                videoSender.replaceTrack(createBlackVideoTrack());
                            } else {
                                videoSender.replaceTrack(videoTrack);
                            }
                        } else {
                            let newVideoSender = senders.find((s) => s.track == null && s.kind === 'video');
                            if (newVideoSender) newVideoSender.replaceTrack(videoTrack);
                        }

                        if (audioSender) {
                            audioSender.replaceTrack(audioTrack);
                        } else {
                            let newAudioSender = senders.find((s) => s.track == null && s.kind === 'audio');
                            if (newAudioSender) newAudioSender.replaceTrack(audioTrack);
                        }
                    });
                })
                .catch((error) => {
                    console.error('Error accessing media devices:', error);
                });
        }
        else if (screen) {
            navigator.mediaDevices.getDisplayMedia({ video: true })
                .then((screenStream) => {
                    const videoTrack = screenStream.getVideoTracks()[0];

                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then((audioStream) => {
                            const audioTrack = audio ? audioStream.getAudioTracks()[0] : createSilentAudioTrack()

                            const combinedStream = new MediaStream([videoTrack, audioTrack]);
                            setLocalStream(combinedStream);

                            peerIds.forEach((peer) => {
                                const senders = peer.calling.peerConnection.getSenders();
                                const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
                                const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');

                                if (videoSender) {
                                    videoSender.replaceTrack(videoTrack);
                                } else {
                                    const newVideoSender = senders.find((s) => s.track == null && s.kind === 'video');
                                    if (newVideoSender) newVideoSender.replaceTrack(videoTrack);
                                }

                                if (audioSender) {
                                    audioSender.replaceTrack(audioTrack);
                                } else {
                                    const newAudioSender = senders.find((s) => s.track == null && s.kind === 'audio');
                                    if (newAudioSender) newAudioSender.replaceTrack(audioTrack);
                                }
                            });
                        })
                        .catch((error) => {
                            console.error('Error accessing audio devices:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error accessing display media:', error);
                });

        }
    };


    const sendMessage = (message) => {
        peerIds.forEach((id) => {
            setMessages((prevMessage) => [...prevMessage, { sender: 'local', message: message }]);
            id.conn.send({ sender: 'streamer', message: message })
            setLocalMssg('')
        })
    };
    const handleScale = (id) => {
        setPeerIds(peerIds.map((peer) => {
            if (peer.peerId != id && peer.isScaled == true) {
                return {
                    ...peer,
                    isScaled: false
                }
            } else if (peer.peerId == id) {
                return {
                    ...peer,
                    isScaled: true
                }
            }
            return peer;
        }))
    }
    const unScaleAll = () => {
        setPeerIds(peerIds.map((peer) => {
            if (peer.isScaled == true) {
                return {
                    ...peer,
                    isScaled: false
                }
            }
            return peer;
        }))
    }
    const leavemeet = () => {
        const handleLeaveRoom = () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
        handleLeaveRoom()
        window.location.reload()
        setMeet(false);
    }

    if (!socketId && !userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div className='bg-primaryBackground relative'>
            
            <div className="controls absolute text-white text-3xl flex gap-3 z-20">
                <div className='rounded-full p-2 bg-gray-700'>
                    {video ? <BsFillCameraVideoOffFill className='text-red-500 cursor-pointer' onClick={() => setVideo(false)} />
                        :
                        <BsFillCameraVideoFill className='cursor-pointer' onClick={() => { setVideo(true), setScreen(false) }} />
                    }
                </div>
                <div className=' rounded-full p-2 bg-gray-700'>
                    {audio ? <IoMdMicOff className='text-red-500 cursor-pointer' onClick={() => setAudio(false)} /> : <IoMdMic className='cursor-pointer' onClick={() => setAudio(true)} />}
                </div>
                <div className=' rounded-full p-2 bg-gray-700'>
                    {screen ? <MdStopScreenShare className='text-red-500 cursor-pointer' onClick={() => setScreen(false)} /> : <MdScreenShare className='cursor-pointer' onClick={() => { setScreen(true), setVideo(false) }} />}
                </div>
                <div className=' rounded-full p-2 bg-gray-700'>
                    <button onClick={leavemeet}>Leave</button>
                </div>
                <div className=' rounded-full p-2 bg-gray-700'>
                    <button onClick={() => startMedia()}>Ready</button>
                </div>
            </div>
            <div>
                <div className='flex  w-full h-full justify-center relative'>
                    {peerIds && peerIds.map((peer) => (
                        peer.isScaled ?
                            <>
                                <div className='absolute top-4 right-10 text-2xl text-white rounded-full p-4 bg-gray-600 hover:cursor-pointer z-20' onClick={unScaleAll}><RiUnpinFill /></div>

                                <div className='flex bg-black h-[90vh] w-[95vw] '>
                                    <MeetBox mediaStream={peer.stream} />
                                </div>
                            </>
                            :
                            null
                    ))}
                </div>
                <div className='flex w-full h-screen overflow-scroll scrollbar-none px-2'>
                    <div className={`flex flex-wrap w-full gap-3 h-full overflow-scroll p-1 justify-center relative scrollbar-trans`}>
                        {peerIds && peerIds.map((peer) => (
                            <div className={`w-[30%] flex-shrink-0 h-[200px] ${!peer.isScaled ? 'visible' : 'hidden'}`} onClick={() => handleScale(peer.peerId)} key={peer.peerId}>
                                <MeetBox mediaStream={peer.stream} />
                            </div>
                        ))}
                        {
                            localStream && <div id='12' className='w-[30%] flex-shrink-0 h-[200px]  hover:cursor-pointer' onClick={(e) => handleScale('11')} >
                                <MeetBox mediaStream={localStream} />
                            </div>
                        }
                    </div>
                    <div className='w-4/12 h-full border-2 border-black rounded-md p-2'>
                        <div className='w-full flex flex-col h-full bg-primaryBackground p-2 rounded-md'>
                            <div className='w-full h-full flex flex-col gap-2'>
                                {
                                    messages && messages.map((message) => (
                                        message.sender === 'local' ?
                                            <div className='relative text-white w-full gap-2 flex justify-end'>
                                                <div className='bg-green-600 rounded-lg w-8/12 p-1'>
                                                    {message.message}
                                                </div>
                                            </div>
                                            :
                                            <div className='relative text-white w-full gap-2 flex justify-start'>
                                                <div className='bg-purple-600 rounded-lg w-8/12 p-1'>
                                                    {message.message}
                                                </div>
                                            </div>
                                    ))
                                }



                            </div>
                            <div className='w-full h-2/12'>
                                <div className='bg-gray-800 rounded-md p-2 w-full flex gap-2'>
                                    <textarea
                                        placeholder="Type something..."
                                        value={localMssg}
                                        onChange={(e) => setLocalMssg(e.target.value)}
                                        className="bg-transparent text-white outline-none w-10/12 resize-none h-10 max-h-40 p-2 border border-gray-300 rounded-md scrollbar-none"
                                    />
                                    <div className='text-purple-600 bg-primaryBackground w-fit flex items-center justify-center rounded-full p-2' onClick={() => sendMessage(localMssg)}>
                                        <FaPaperPlane className='-ml-1' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MeetingPage;
