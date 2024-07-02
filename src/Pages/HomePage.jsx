import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Temp from '../components/Temp'
import { FaCircleArrowRight } from "react-icons/fa6";
import { FaRegBell } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { FaCirclePlus } from "react-icons/fa6";
import { IoMdPeople } from "react-icons/io";
import { FaPencilRuler } from "react-icons/fa";
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserInfo, updateUserApi } from '../user/userApi';
import { createRoomApi, roomPermission } from '../roomSlice/RoomApi';
import { triggerEvent } from '../socket/trigger';



function HomePage({pusher }) {



    const [joinRoomDisplay, setJoinRoomDisplay] = useState('hidden')
    const [createRoomDisplay, setCreateRoomDisplay] = useState('hidden')
    const [userInfo, setUserInfo] = useState(null)
    const navigate = useNavigate()



    useEffect(() => {
        const getUser = async () => {
            const userInfo = await getUserInfo()
            if (userInfo.error) {
                navigate('/login', { replace: true })
            }
            setUserInfo(userInfo)
        }
        getUser()
    }, [])

    const handleJoinRoom = useCallback((e) => {
        e.preventDefault();
        setJoinRoomDisplay('visible');
    }, []);

    const handleCreateRoom = useCallback((e) => {
        e.preventDefault();
        setCreateRoomDisplay('visible');
    }, []);

    const handleRoomCard = useCallback((room) => {
        navigate(`/room/${room._id}/${room.roomCode}`);
    }, [navigate]);

    if (!userInfo) {
        return <>Loading....</>
    }
    return (
        <>
            <Navbar />
            <JoinRoom visible={joinRoomDisplay} setVisible={setJoinRoomDisplay} user={userInfo} pusher={pusher} />
            <CreateRoom user={userInfo} visible={createRoomDisplay} setVisible={setCreateRoomDisplay} setUser={setUserInfo} />
            <div>
                <div className='bg-primaryBackground w-full flex gap-2 justify-center '>
                    <div className='w-full flex shadow-primaryBoxShadow m-2 p-4 rounded-md h-screen overflow-scroll scrollbar-none'>
                        <div className='w-1/2 bg-secondaryBackground p-4 rounded-md m-2'>
                            <div className='flex w-full justify-between'>
                                <h2 className='text-white text-3xl font-bold'>Rooms</h2>
                                <div className='flex gap-2'>
                                    <button className='bg-primaryBlue text-white p-1 px-3 rounded-lg flex items-center gap-1' onClick={(e) => handleJoinRoom(e)}>Join Room <span><IoMdPeople /></span></button>
                                    <button className='bg-primaryGreen text-white p-1 px-3 rounded-lg flex items-center gap-1' onClick={(e) => handleCreateRoom(e)}>Create Room <span><FaCirclePlus /></span></button>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3 my-2'>
                                {userInfo.rooms[0] ? userInfo.rooms.map((room, index) => (
                                    <div key={index} onClick={() => { handleRoomCard(room) }}>
                                        <RoomInfoCard room={room} />
                                    </div>
                                )) : <div className='w-full h-full flex justify-center items-center text-gray-500 m-4'>No Rooms Avaialable</div>}

                            </div>
                        </div>
                        <div className='w-1/2 bg-secondaryBackground p-4 rounded-md m-2'>
                            <div className='flex w-full justify-between'>
                                <h2 className='text-white text-3xl font-bold'>Tasks</h2>
                            </div>
                            <div className='flex flex-wrap gap-3 my-2'>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

function RoomInfoCard({ room }) {
    const admin = room.users.find((user) => (user.role === 'Admin' ? user.userId : 'd'))
    return (
        <div className='group h-[150px] w-[150px] rounded-md bg-primaryBackground p-2 transform  hover:scale-105 transition-all duration-800 cursor-pointer'>
            <div className='flex flex-col justify-between h-full  p-2'>
                <div>
                    <h3 className='text-white text-xl font-semibold'>{room.roomName}</h3>
                </div>
                <div className='text-secondaryText text-sm'>
                    <p>Created By:-</p>
                    <span className='flex w-full items-center justify-between'>{admin.userId.userName}<FaCircleArrowRight className='group-hover:text-primaryBlue' /></span>
                </div>
            </div>
        </div>
    )
}

// function Notification() {
//     return (
//         <div className=' h-fit w-full rounded-md bg-[#ffffffcf] p-2cursor-pointer'>
//             <div className='flex flex-col justify-between h-full  p-2'>
//                 <div>
//                     <h3 className='text-primaryBackground text-md font-semibold'>from</h3>
//                 </div>
//                 <p className='text-secondaryBackground text-[8px]'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repudiandae sunt, aut illo praesentium repellendus ad?</p>
//             </div>
//         </div>
//     )
// }

function JoinRoom({ visible, setVisible, user, pusher }) {

    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [joinBtn, setJoinBtn] = useState('Join')

    const [channel, setChannel] = useState(null)
    useEffect(() => {
        console.log('cc')
    }, [pusher])

    const handleUserJoin = async (code) => {
        try {
            setJoinBtn('Wait...');

            const response = await roomPermission({ roomCode: code, user });
            setChannel(pusher.subscribe(`${code}`))
            triggerEvent({
                channel: `${code}`,
                event: `updateRequests`,
                message: `updateRequests`,
            })



        } catch (error) {
            console.error('An error occurred:', error);
        }
    }

    useEffect(() => {
        if (!channel) return ;
        channel.bind('reqstAccecpted', function (data) {
                updateUserRooms();
        });
        const updateUserRooms = async () => {
            let rooms = [...user.rooms, { _id: roomId }];
            const updateUser = await updateUserApi(rooms);
        }
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [])


    return (
        <div className={`h-[200px] w-7/12 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primaryBackground z-20 p-3 flex flex-col ${visible}`}>
            <div className='w-full p-2 flex justify-between'>
                <h2 className='text-white text-4xl font-bold'>Join Room</h2>
                <button onClick={() => setVisible('hidden')}> <IoCloseCircle className='text-white text-xl' /></button>
            </div>
            <div className='flex gap-3 h-full items-center p-2'>
                <input className='rounded-lg py-3 px-2 bg-secondaryBackground text-white w-9/12 outline-none' type="text" placeholder='Enter Room Code' onChange={(e) => setCode(e.target.value)} />
                <button className='rounded-lg py-3 px-2 bg-primaryBlue text-white w-3/12' onClick={() => { handleUserJoin(code) }}>{joinBtn}</button>
            </div>
            <p className='text-red-600 p-2'>Please fill code properly</p>
        </div>
    )
}

function CreateRoom({ user, visible, setVisible, setUser }) {

    const [createBtn, setCreateBtn] = useState('Create');
    const [createBtnProp, setCreateBtnProp] = useState('');
    const [joinCode, setJoinCode] = useState(null);
    const [roomInfo, setRoomInfo] = useState(null)
    const [roomName, setRoomName] = useState(null)
    const [error, setError] = useState(null)

    const navigate = useNavigate();



    const createRoom = async (code) => {
        try {
            const createRoom = await createRoomApi({
                roomCode: code,
                roomName,
            });
            setRoomInfo(createRoom)

            setError(null);


        } catch (error) {
            console.error('An unexpected error occurred:', error);
            setError('An unexpected error occurred');
        }
    }

    useEffect(() => {
        const updateUser = async () => {
            console.log(roomInfo.roomInfo._id)
            try {
                const rooms = [...user.rooms, { _id: roomInfo.roomInfo._id }];

                const updateUser = await updateUserApi(rooms);

                const response = await getUserInfo()
                setUser(response)
            } catch (error) {
                console.error('An unexpected error occurred:', error);
                setError('An unexpected error occurred');
            }
        }
        if (roomInfo) {
            updateUser()
        }
    }, [roomInfo])

    const handleCreate = async () => {

        if (createBtn === 'Copy') {


            navigator.clipboard.writeText(`http://localhost:5173/room/${joinCode}/`)
                .catch((error) => {
                    console.error('Unable to copy text to clipboard:', error);
                });
            setTimeout(setCreateBtn('Copied'), 800);
            setCreateBtnProp('bg-orange-200 text-gray-600')
        }

        else {

            let s1 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
            let s2 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
            let s3 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
            let s4 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
            setJoinCode(`${s1}-${s2}-${s3}-${s4}`)
            setTimeout(setCreateBtn('Copy'), 800);
            createRoom(`${s1}-${s2}-${s3}-${s4}`)
        }
    }


    const handleJoin = () => {
        if (roomInfo) {
            navigate(`/room/${roomInfo.roomInfo._id}/${roomInfo.roomInfo.roomCode}`)
        }
    }

    const handleClose = () => {
        setCreateBtn('Create')
        setRoomName('')
        setJoinCode('')
        setVisible('hidden')
    }




    return (
        <div className={`h-fit w-7/12 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primaryBackground z-20 p-3 flex flex-col ${visible}`}>
            <div className='w-full p-2 flex justify-between'>
                <h2 className='text-white text-4xl font-bold'>Create Room</h2>
                <button onClick={() => { handleClose() }}> <IoCloseCircle className='text-white text-xl' /></button>
            </div>
            <div className='flex gap-3 h-full items-center p-2'>
                <input className='rounded-lg py-3 px-2 bg-secondaryBackground text-white w-full outline-none' type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder='Room Name' />
            </div>
            <div className='flex gap-3 h-full items-center p-2'>
                <input className='rounded-lg py-3 px-2 bg-secondaryBackground text-white w-9/12 outline-none' type="text" value={joinCode} disabled placeholder='####-####-####-####' />
                <button className={`rounded-lg py-3 px-2 bg-primaryBlue text-white w-3/12 ${createBtnProp}`} onClick={() => { handleCreate() }}>{createBtn}</button>
            </div>
            <p className='text-red-500 text-center'>{error}</p>
            {joinCode && roomInfo &&
                <button className='rounded-lg py-2 px-2 bg-primaryGreen text-white w-full' onClick={handleJoin}>Join</button>
            }
        </div>
    )
}


export default HomePage