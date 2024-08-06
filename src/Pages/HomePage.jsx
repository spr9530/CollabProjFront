import React, { useCallback, useEffect, useState } from 'react'
import { FaCircleArrowRight } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { FaCirclePlus } from "react-icons/fa6";
import { IoMdPeople } from "react-icons/io";
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
// import { updateUserApi } from '../user/userApi';
import { createRoomApi, createRoomCode, roomPermission } from '../roomSlice/RoomApi';
import { triggerEvent } from '../socket/trigger';
import { useDispatch, useSelector } from 'react-redux';
import { getLoggedUserAsync, getUser, getUserRoom, updateUserAsync } from '../user/userSlice';
import { MdDelete } from "react-icons/md";
import { createRoomAsync, deleteRoomAsync, selectNewRoom } from '../roomSlice/RoomSlice';
// import { getAllTaskAsync } from '../task/TaskSlice';
import { useForm } from "react-hook-form"
import { addTodoAsync, deleteTodoAsync, getTodoAsync, getTodoTasks, updateTodoAsync } from '../todo/todoSlice';



function HomePage({ pusher }) {

    const [joinRoomDisplay, setJoinRoomDisplay] = useState('hidden')
    const [createRoomDisplay, setCreateRoomDisplay] = useState('hidden')
    const [createTask, setCreateTask] = useState('hidden');
    const [set, setSet] = useState('Rooms')
    const [viewTasks, setViewTasks] = useState({});
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const userInfo = useSelector(getUser)
    const roomInfo = useSelector(getUserRoom)
    // const taskInfo = useSelector(getUserAllTask)
    const todos = useSelector(getTodoTasks)
    const today = new Date().toISOString().split('T')[0];

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        dispatch(getLoggedUserAsync());
        dispatch(getTodoAsync())
    }, [dispatch])


    // useEffect(() => {
    //     if (userInfo) {
    //         dispatch(getAllTaskAsync(userInfo._id))
    //     }
    // }, [userInfo])


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


    const toggleViewTask = (id, from, roomAddress) => {
        if (from == "Self") {
            setViewTasks((prevViewTasks) => ({
                ...prevViewTasks,
                [id]: !prevViewTasks[id],
            }));
        }
        else {
            navigate(`/room/${roomAddress}`);
        }
    };

    const handleDeleteTask = async (id) => {
        dispatch(deleteTodoAsync(id))
    }

    const handleUpdateTodo = (data, id) => {
        const currDone = data.done;
        const newData = { ...data, done: !currDone };
        dispatch(updateTodoAsync({ newData, id }));
    }


    if (!userInfo && !roomInfo) {
        return <>Loading....</>
    }
    return (
        <>
            <Navbar />
            <JoinRoom visible={joinRoomDisplay} setVisible={setJoinRoomDisplay} user={userInfo} pusher={pusher} />
            <CreateRoom user={userInfo} visible={createRoomDisplay} setVisible={setCreateRoomDisplay} roomInfo={roomInfo} />

            {/* //Crete task */}
            <form onSubmit={handleSubmit((data) => {
                dispatch(addTodoAsync(data))
                setCreateTask('hidden')
            })}>
                <div className={`absolute rounded-md flex flex-col gap-2 w-full md:w-7/12 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-primaryBackground p-3 ${createTask}`}>
                    <div className='flex flex-col'>
                        <input
                            type="text"
                            name="taskName"
                            className='bg-transparent text-white outline-none border-2 border-gray-700 p-1 rounded-md'
                            {...register('taskName', {
                                required: "Task Name is required",
                                minLength: { value: 3, message: "Task Name must be at least 3 characters long" }
                            })}
                            placeholder='Task Name'
                        />
                        {errors.taskName && <span className='text-red-500 text-sm'>{errors.taskName.message}</span>}
                    </div>

                    <div className='flex flex-col'>
                        <input
                            type="date"
                            name="taskDate"
                            className='bg-transparent text-white outline-none border-2 border-gray-700 p-1 rounded-md'
                            {...register('taskDate', {
                                required: "Task Date is required",
                                validate: value => value > today || "Date must be today or later"
                            })}
                        // min={today}
                        />
                        {errors.taskDate && <span className='text-red-500 text-sm'>{errors.taskDate.message}</span>}
                    </div>

                    <div>
                        <textarea
                            id=""
                            name="taskDescription"
                            className='bg-transparent w-full text-white outline-none border-2 border-gray-700 p-1 rounded-md'
                            {...register('taskDescription')}
                            placeholder='Desciption'></textarea>
                    </div>

                    <div className='flex w-full justify-between'>
                        <button type='submit' className='bg-green-500 text-white py-1 px-3 rounded-md'>Add</button>
                        <button type='button' className='bg-red-500 text-white py-1 px-3 rounded-md' onClick={() => { setCreateTask('hidden'), reset() }}>Cancel</button>
                    </div>
                </div>
            </form>


            <div>
                <div className='bg-primaryBackground w-full flex  gap-2 justify-center '>
                    <div className='w-full flex flex-col md:flex-row shadow-primaryBoxShadow m-2 p-2 md:p-4 rounded-md h-screen overflow-scroll scrollbar-none'>
                        <div className={`md:w-1/2 bg-secondaryBackground transition ease-in-out p-3 md:p-4 rounded-md m-2 h-screen ${set == 'Rooms' ? 'visible' : 'hidden'} md:block`}>
                            <div className='flex flex-wrap w-full justify-between'>
                                <div className='flex w-full gap-3 '>
                                    <h2
                                        className='text-white text-2xl font-bold border-b-2 border-white md:border-none'>
                                        Room
                                    </h2>
                                    <h2
                                        onClick={() => setSet('todo')}
                                        className='text-gray-500 text-2xl font-bold md:hidden'>
                                        To Do
                                    </h2>
                                </div>
                                <div className='flex gap-2 mt-4'>
                                    <button className='bg-primaryBlue text-white p-1 px-3 rounded-lg flex items-center gap-1' onClick={(e) => handleJoinRoom(e)}>Join Room <span><IoMdPeople /></span></button>
                                    <button className='bg-primaryGreen text-white p-1 px-3 rounded-lg flex items-center gap-1' onClick={(e) => handleCreateRoom(e)}>Create Room <span><FaCirclePlus /></span></button>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3 my-1 w-full p-1 md:p-3 max-h-[85%] overflow-scroll scrollbar-none '>
                                {roomInfo ? roomInfo.map((room, index) => (
                                    <div key={index} className='w-full sm:w-[48%] 2xl:w-[31%] h-fit'>
                                        <RoomInfoCard room={room} fn={handleRoomCard} userInfo={userInfo} />
                                    </div>
                                )) : <div className='w-full h-full flex justify-center items-center text-gray-500 m-4'>No Rooms Avaialable</div>}

                            </div>
                        </div>
                        <div className={`md:w-1/2 bg-secondaryBackground p-3 md:p-4 rounded-md m-2 h-screen  ${set == 'todo' ? 'visible' : 'hidden'} md:block`}>
                            <div className='flex flex-col w-full justify-between'>
                                <div className='flex w-full gap-3'>
                                    <h2
                                        onClick={() => setSet('Rooms')}
                                        className=' text-gray-500  text-2xl font-bold md:hidden'>
                                        Room
                                    </h2>
                                    <h2
                                        className='text-white text-2xl font-bold border-b-2 border-white md:border-none'>
                                        To Do
                                    </h2>

                                </div>
                                <div>
                                    <div className='w-full flex justify-between my-4'>
                                        <button className='bg-blue-500 text-white font-semibold py-1 px-3 rounded-md' onClick={() => setCreateTask('visible')}>Create</button>
                                    </div>

                                </div>
                            </div>
                            <div className='flex w-full h-full max-h-[78%] overflow-scroll scrollbar-none'>
                                <div className='flex flex-col w-full gap-3 ' >
                                    {todos && todos.map((todo, index) =>
                                        <div key={index} className={`bg-[#ffffff1a] rounded-lg p-4 text-white font-semibold flex flex-col ${todo.done ? 'opacity-50' : null}`}>
                                            <p>{todo.from}</p>
                                            <div className='flex w-full justify-between'>
                                                <p>{todo.name}</p>
                                                <p>{todo.date}</p>
                                            </div>
                                            <div className='flex w-full justify-between pt-4 '>
                                                <button
                                                    className={`${viewTasks[todo._id] ? 'bg-red-500' : 'bg-pink-600'} rounded-md py-1 px-3`}
                                                    onClick={() => toggleViewTask(todo._id, todo.from, todo.roomAddress)}
                                                >
                                                    {viewTasks[todo._id] ? 'Close' : 'View'}
                                                </button>
                                                <button className='bg-green-500 rounded-md py-1 px-3' onClick={() => handleUpdateTodo(todo, todo._id)}>{todo.done ? 'Undone' : 'Done'}</button>
                                                <button className='bg-red-500 rounded-md py-1 px-3' onClick={() => handleDeleteTask(todo._id)}>Delete</button>
                                            </div>
                                            {todo.description && viewTasks[todo._id] && (
                                                <div className='w-full'>
                                                    <div className='w-full'>
                                                        <input type="text" className='w-full bg-transparent' disabled value={todo.description} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}


const RoomInfoCard = React.memo(({ room, fn, userInfo }) => {
    const admin = room.users.find(user => user.role === 'Admin');
    
    const [showDelete, setShowDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [curr, setCurr] = useState(null);
    const dispatch = useDispatch();

    const handleDeleteRoom = ({ roomId, roomCode }) => {
        setCurr({ roomId, roomCode });
        setShowDelete(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await dispatch(deleteRoomAsync(curr));
            await dispatch(getLoggedUserAsync());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setShowDelete(false);
        }
    };

    return (
        <>
            {showDelete && curr && (
                <div className="w-full h-full absolute top-0 left-0">
                    <div className="flex flex-col justify-between absolute h-[150px] w-[300px] z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-gray-600 bg-primaryBackground p-3">
                        <div className="text-white font-bold text-lg">
                            Are you sure you want to delete?
                        </div>
                        {loading ? (
                            <div className="text-white font-bold">Loading...</div>
                        ) : (
                            <div className="w-full flex justify-evenly">
                                <button onClick={() => setShowDelete(false)} className="text-white bg-green-500 rounded-md font-semibold p-2 flex items-center justify-between gap-1">
                                    Cancel<IoCloseCircle />
                                </button>
                                <button onClick={confirmDelete} className="text-white bg-red-500 rounded-md font-semibold p-2 flex items-center justify-between gap-1">
                                    Sure<MdDelete />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="group h-[150px] w-full rounded-md bg-primaryBackground p-2 transform hover:scale-105 transition-all duration-800">
                <div className="flex flex-col justify-between h-full p-2">
                    <div onClick={() => fn(room)} className="cursor-pointer h-1/2">
                        <h3 className="text-white text-xl font-semibold">{room.roomName}</h3>
                    </div>
                    <div className="text-secondaryText text-sm">
                        <p>Created By:</p>
                        <span className="flex w-full items-center justify-between">
                            {admin ? admin.userId.userName : 'Unknown'}
                            {admin && userInfo._id == admin.userId._id &&
                                <button onClick={() => handleDeleteRoom({ roomId: room._id, roomCode: room.roomCode })}>
                                    <MdDelete className="text-red-500 text-lg hover:scale-150 z-20 cursor-pointer" />
                                </button>
                            }

                            <FaCircleArrowRight className="group-hover:text-primaryBlue" />
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
});

const JoinRoom = React.memo(({ visible, setVisible, user, pusher }) => {

    const [code, setCode] = useState('')
    const [joinBtn, setJoinBtn] = useState('Join')
    const [channel, setChannel] = useState(null)
    const dispatch = useDispatch();

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

    const handleClose = () => {
        setCode('')
        setVisible('hidden')
        setJoinBtn('Join')
    }

    useEffect(() => {
        if (!channel) return;
        channel.bind('reqstAccecpted', function (data) {
            updateUserRooms();
        });
        const updateUserRooms = async () => {
            let rooms = [...user.rooms, { _id: roomId }];
            dispatch(updateUserAsync(rooms))
        }
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [])


    return (
        <div className={`h-[200px] w-full md:w-7/12 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primaryBackground z-20 p-3 flex flex-col ${visible}`}>
            <div className='w-full p-2 flex justify-between'>
                <h2 className='text-white text-4xl font-bold'>Join Room</h2>
                <button onClick={() => handleClose()}> <IoCloseCircle className='text-white text-xl' /></button>
            </div>
            <div className='flex gap-3 h-full items-center p-2'>
                <input className='rounded-lg py-3 px-2 bg-secondaryBackground text-white w-9/12 outline-none' value={code} type="text" placeholder='Enter Room Code' onChange={(e) => setCode(e.target.value)} />
                <button className='rounded-lg py-3 px-2 bg-primaryBlue text-white w-3/12' onClick={() => { handleUserJoin(code) }}>{joinBtn}</button>
            </div>
            {/* <p className='text-red-600 p-2'>Please fill code properly</p> */}
        </div>
    )
});

const CreateRoom = React.memo(({ user, visible, setVisible, roomInfo }) => {
    const [createBtn, setCreateBtn] = useState('Create');
    const [createBtnProp, setCreateBtnProp] = useState('');
    const [joinCode, setJoinCode] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const newRoom = useSelector(selectNewRoom);

    useEffect(() => {
        if (newRoom) {
            const updateUser = async () => {
                try {
                    let rooms = [...user.rooms, { _id: newRoom._id }];
                    await dispatch(updateUserAsync(rooms));
                    await dispatch(getLoggedUserAsync());
                } catch (error) {
                    console.error('An unexpected error occurred:', error);
                    setError('An unexpected error occurred');
                }
            };
            updateUser();
        }
    }, [newRoom, dispatch]);

    const handleCreate = useCallback(async () => {
        if (createBtn === 'Copy') {
            try {
                await navigator.clipboard.writeText(`http://localhost:5173/room/${joinCode}/`);
                setCreateBtn('Copied');
                setTimeout(() => setCreateBtn('Copy'), 800);
                setCreateBtnProp('bg-orange-200 text-gray-600');
            } catch (error) {
                console.error('Unable to copy text to clipboard:', error);
            }
        } else {
            const code = await createRoomCode();
            if (code) {
                setJoinCode(code);
                setCreateBtn('Copy');
                setTimeout(() => setCreateBtn('Copy'), 800);
                dispatch(createRoomAsync({ roomCode: code, roomName }));
            } else {
                setError('Failed to create a unique room code.');
            }
        }
    }, [createBtn, joinCode, roomName, dispatch]);

    const handleJoin = useCallback(() => {
        if (newRoom) {
            navigate(`/room/${newRoom._id}/${newRoom.roomCode}`);
        }
    }, [newRoom, navigate]);

    const handleClose = useCallback(() => {
        setCreateBtn('Create');
        setError('');
        setRoomName('');
        setJoinCode('');
        setVisible('hidden');
    }, [setVisible]);

    return (
        <div className={`h-fit w-full md:w-7/12 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primaryBackground z-20 p-3 flex flex-col ${visible}`}>
            <div className='w-full p-2 flex justify-between'>
                <h2 className='text-white text-4xl font-bold'>Create Room</h2>
                <button onClick={handleClose}> <IoCloseCircle className='text-white text-xl' /></button>
            </div>
            <div className='flex gap-3 h-full items-center p-2'>
                <input
                    className='rounded-lg py-3 px-2 bg-secondaryBackground text-white w-full outline-none'
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder='Room Name'
                />
            </div>
            <div className='flex gap-3 h-full items-center p-2'>
                <input className='rounded-lg py-3 px-2 bg-secondaryBackground text-white w-9/12 outline-none' type="text" value={joinCode} disabled placeholder='####-####-####-####' />
                <button className={`rounded-lg py-3 px-2 bg-primaryBlue text-white w-3/12 ${createBtnProp} ${roomName ? 'opacity-100' : 'opacity-35'}`} disabled={!roomName} onClick={handleCreate}>{createBtn}</button>
            </div>
            <p className='text-red-500 text-center'>{error}</p>
            {joinCode && newRoom &&
                <button className='rounded-lg py-2 px-2 bg-primaryGreen text-white w-full' onClick={handleJoin}>Join</button>
            }
        </div>
    )
});


export default HomePage