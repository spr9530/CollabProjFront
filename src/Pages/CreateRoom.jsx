import React, { useEffect, useState } from 'react'
import '../App.css'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../user/userSlice';
import { useForm } from "react-hook-form";
import { createRoomAsync, selectRoomInfo, updateRoomUsersAsync } from '../roomSlice/RoomSlice';
import { createRoomApi } from '../roomSlice/RoomApi';



function CreateRoom({ socket }) {

    const navigate = useNavigate()

    const [code, setCode] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [showPopup, setShowPopup] = useState(false);

    const { register, handleSubmit } = useForm();
    const user = useSelector(getUser)

    const generateCode = () => {
        let s1 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
        let s2 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
        let s3 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
        let s4 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
        setCode(`${s1}-${s2}-${s3}-${s4}`)
    }

    const copyCode = () => {
        navigator.clipboard.writeText(code)
            .catch((error) => {
                console.error('Unable to copy text to clipboard:', error);
            });
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    }

    const ShowPopUp = () => {
        return (
            <div className='w-full fle justify-center'>
                <div className='copy-popup mx-auto'>
                    Copy to Clipboard
                </div>
            </div>

        );
    }

    const [userInfo, setUserInfo] = useState('')
    const token = localStorage.getItem('token')

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                if (!token) {
                    navigate('/')
                }
                const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/getUserInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                })

                const { userInfo } = await response.json();
                setUserInfo(userInfo)
            } catch (error) {
                console.log({ error })
            }
        }

        getUserInfo()
    }, [])

    const [roomCreated, setRoomCreated] = useState(false)
    const createRoom = async (info) => {
        const response = await createRoomApi(info);
        if (response.data.error) {
            return (<div>{roomInfo.error}</div>)
        }
        const updateUser = await fetch('https://collab-project-indol.vercel.app/app/v1/user/updateUser', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rooms: [...userInfo.rooms, { _id: response.data.roomInfo._id }]
            })
        })

        setRoomCreated(true)
    }

    const handleCreateRoom = () => {
        socket.emit('roomCreate', code)
    }

    const handleJoinRoomCode = (e) => {
        setJoinCode(e.target.value)
        socket.emit('joinRoom', joinCode)
    }

    const roomInfo = useSelector(selectRoomInfo)



    return (
        <>
            <div className='bg-slate-900 h-screen w-screen flex justify-center flex-col'>
                {roomCreated && <Navigate to={`/room/${code}`} replace={true} />}
                <div><h2 className='text-white text-2xl text-center p-2'>Room {userInfo.userName} </h2></div>
                <div className='flex flex-col md:flex-row p-3 gap-3 w-full'>
                    <div className='w-1/2 p-4 flex flex-col bg-slate-400 rounded-md '>
                        <div><h4 className='text-slate-900 text-center text-lg'>Create Room</h4></div>
                        <form onSubmit={handleSubmit((data) => {
                            const { roomName } = data;
                            const info = {
                                roomCode: code,
                                roomName,
                            }
                            createRoom(info)
                        })}>
                            <input
                                name='roomName'
                                {...register('roomName')}
                                className='rounded-md outline-none px-2 py-2 my-2' required type="text" id='userName' placeholder='Your Name' />
                            <span className='flex row gap-2 w-full'>
                                <input
                                    className='w-6/12 rounded-md outline-none px-2 py-2 my-2' required type="text" id="generateId" defaultValue={code} placeholder='Generate Code' />
                                <button className='bg-red-400 w-2/12 p-2 my-2 rounded-md' onClick={copyCode}>Copy</button>
                                <button className='w-4/12 bg-orange-400 rounded-md outline-none p-2 my-2' onClick={generateCode}>Generate</button>
                            </span>
                            {code &&
                                <button className='w-full bg-green-400 rounded-md outline-none p-2' type='submit' onClick={handleCreateRoom}>Create Room</button>
                            }
                        </form>
                    </div>
                    <div className='w-1/2 p-4 flex flex-col bg-slate-400 rounded-md '>
                        <div><h4 className='text-slate-900 text-center text-lg'>Join Room</h4></div>
                        <input className='rounded-md outline-none px-2 py-2 my-2' type="text" id='userName' placeholder='Your Name' />
                        <input className='rounded-md outline-none px-2 py-2 my-2' type="text" id="generateId" onChange={(e) => { handleJoinRoomCode(e) }} placeholder='Enter Code' />
                        <Link to={`/room/${joinCode}`}>
                            {joinCode &&
                                <button className='w-full bg-green-400 rounded-md outline-none p-2'>Enter Room</button>
                            }
                        </Link>
                    </div>

                </div>
            </div>
            {showPopup && <ShowPopUp />}
        </>
    )
}

export default CreateRoom