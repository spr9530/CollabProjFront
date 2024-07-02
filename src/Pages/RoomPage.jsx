import React, { useCallback, useEffect, useState } from 'react'
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaRegBell } from "react-icons/fa";
import { FaCode } from "react-icons/fa6";
import { MdOutlineTextFields } from "react-icons/md";
import { VscRootFolderOpened } from "react-icons/vsc";
import { FaUser } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { FaPencilRuler } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { LuScreenShare } from "react-icons/lu";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { getUserInfo } from '../user/userApi';
import { acceptPermission, createRoomFile, downloadFiles, getRoomFiles, getRoomInfo, rejectPermission, updateRoomUsers } from '../roomSlice/RoomApi';
import { useForm } from "react-hook-form";
import Navbar from '../components/Navbar';
import CreateTask from '../components/CreateTask';
import { getUsersTask } from '../task/TaskApi';
import TaskInfo from '../components/TaskInfo';
import { triggerEvent } from '../socket/trigger';



function RoomPage({ pusher }) {
    let { id1, id2 } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [admin, setAdmin] = useState([]);
    const [allowed, setAllowed] = useState(false);
    const [userInfo, setUserInfo] = useState(null)
    const [roomInfo, setRoomInfo] = useState()
    const [taskInfo, setTaskInfo] = useState([])
    const [taskUpdated, setTaskUpdated] = useState(false);
    const [roomFiles, setRoomFiles] = useState([])
    const [currFile, setCurrFile] = useState(null)
    const [filePath, setFilePath] = useState('/')
    const [pathHistory, setPathHistory] = useState([])
    const [askPermission, setAskPermission] = useState(false)
    const [askingUser, setAskingUser] = useState('null')
    const [createDivVisibility, setCreateDivVisibility] = useState('hidden')
    const [taskDivVisibility, setTaskDivVisibility] = useState('hidden')
    const [downloadBtn, setDownloadBtn] = useState('enable');



    //fetch UserInfo
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
    }, [navigate]);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const fetchRoomInfo = useCallback(async () => {
        try {
            const response = await getRoomInfo(id1);
            setRoomInfo(response.roomInfo);
            if (userInfo) {
                const userExists = response.roomInfo.users.some((user) => user.userId._id === userInfo._id);
                setAllowed(userExists);
            }
        } catch (error) {
            console.error("Error fetching room info:", error);
        } finally {
            setLoading(false);
        }
    }, [id1, userInfo]);

    useEffect(() => {
        if (userInfo) {
            fetchRoomInfo();
        }
    }, [userInfo, fetchRoomInfo]);

    const fetchRoomFiles = useCallback(async () => {
        try {
            const response = await getRoomFiles({ id1, parentId: currFile ? currFile._id : 'root' });
            if (response.error) {
                setRoomFiles([]);
            } else {
                setRoomFiles(response.files);
                setPathHistory([...pathHistory, response.files]);
            }
        } catch (error) {
            console.error("Error fetching room files:", error);
        }
    }, [id1, currFile, pathHistory]);

    useEffect(() => {
        if (roomInfo) {
            fetchRoomFiles();
            setAdmin(() => roomInfo.users.filter((user) => user.role === 'Admin'));
        }
    }, [roomInfo]);

    const fetchTask = useCallback(async () => {
        try {
            const task = await getUsersTask({ id1, id2: userInfo._id });
            setTaskInfo(task);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }, [id1, userInfo]);

    useEffect(() => {
        if (userInfo || taskUpdated) {
            fetchTask();
            setTaskUpdated(false);
        }
    }, [userInfo, taskUpdated, fetchTask]);

    useEffect(() => {
        const channel = pusher.subscribe(`${id1}`);
        const rqstChannel = pusher.subscribe(`${id2}`);
        channel.bind('userJoind', function (data) {
            if (admin[0].userId._id === userInfo._id) {
                alert('Received data: ' + JSON.stringify(data));
            }
        });
        rqstChannel.bind('updateRequests', function (data) {
            if (admin[0].userId._id === userInfo._id) {
                fetchRoomInfo();
            }
        });
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            rqstChannel.unbind_all();
            rqstChannel.unsubscribe();
        };
    }, [pusher, id1, admin, userInfo]);

    useEffect(() => {
        triggerEvent({ channel: `${id1}`, event: `userJoind`, message: 'hello worl' })
    }, [id1])

    // const handlePermissionGrant = async (e) => {
    //     e.preventDefault();
    //     try {
    //         let users = [...roomInfo.users, { userId: askingUser._id, role: 'co-Admin', _id: askingUser._id }];
    //         const updateRoom = await updateRoomUsers({ id2, users });
    //         if (updateRoom.response) {
    //             socket.emit('userAllowed', { code: roomInfo.roomCode, roomId: roomInfo._id });
    //             setAskPermission(false);
    //             setAskingUser('null');
    //         }
    //     } catch (error) {
    //         console.error('Error updating room or user:', error);
    //     }
    // };

    const handleCreate = () => {
        setCreateDivVisibility('visible');
    };

    const handleOpenFile = useCallback(async (fileInfo) => {
        if (fileInfo.type === 'folder') {
            try {
                const response = await getRoomFiles({ id1, parentId: fileInfo._id });
                if (!response.error) {
                    setFilePath(fileInfo.path === '/' ? `/${fileInfo.name}` : `${fileInfo.path}/${fileInfo.name}`);
                    setPathHistory([...pathHistory, fileInfo]);
                    setCurrFile(fileInfo);
                    setRoomFiles(response.files);
                }
            } catch (error) {
                console.error("Error opening file:", error);
            }
        } else {
            navigate(`/room/${roomInfo._id}/${id2}/${fileInfo._id}`);
        }
    }, [id1, navigate, pathHistory, roomInfo]);

    const handlePath = async (path) => {
        if (path === '/') {
            const response = await getRoomFiles({ id1, parentId: 'root' });
            if (response.error) {
                setRoomFiles([]);
            } else {
                setRoomFiles(response.files);
                setPathHistory([]);
                setFilePath('/');
            }
        } else {
            const file = pathHistory.find((file) => file.name === path);
            handleOpenFile(file);
        }
    };

    const handleDownload = async () => {
        setDownloadBtn('disable');
        const response = await downloadFiles({ roomId: id1 });
        if (response.success) {
            setDownloadBtn('enable');
        }
    };

    if (loading) {
        return <>Loading...</>;
    }

    if (!allowed) {
        return <Navigate to='/askPermission' />;
    }
    return (
        <>
            <Navbar />
            <div>
                {/* {askPermission &&
                    <div className='bg-slate-900 p-5 rounded-md absolute top-1/2 left-1/2 flex flex-col z-50'>
                        <div className='text-white text-xl'>{askingUser.userName} is asking permission to join</div>
                        <button className='bg-white p-2 text-slate-900' onClick={(e) => (handlePermissionGrant(e))}>Grant</button>
                    </div>
                } */}
                <RoomUsers roomInfo={roomInfo} admin={admin} user={userInfo} fetchRoomInfo={fetchRoomInfo} />
                <CreateTask visibility={taskDivVisibility} setVisibility={setTaskDivVisibility} roomInfo={roomInfo} fetchTask={fetchTask} />
                <CreateDiv visibility={createDivVisibility} setVisibility={setCreateDivVisibility} user={userInfo} setUser={setUserInfo} currFile={currFile} />
                <div className='bg-primaryBackground w-full flex gap-2 justify-center '>
                    <div className='w-9/12 shadow-primaryBoxShadow m-2 p-4 rounded-md h-screen overflow-scroll scrollbar-none'>
                        <div className='bg-secondaryBackground p-4 rounded-md m-2'>
                            <div className='flex w-full justify-between'>
                                <h2 className='text-white text-3xl font-bold'>Files</h2>
                                <div className='flex gap-2'>
                                    <button className='bg-purple-600 text-white p-1 px-3 rounded-lg flex items-center gap-1' onClick={handleCreate} >  Create <FaFileCirclePlus /> </button>
                                    <button className={` p-1 px-3 rounded-lg flex items-center gap-1 ${downloadBtn === 'disable' ? 'bg-purple-400 text-gray-400' : 'bg-purple-600 text-white'}`} disabled={downloadBtn === 'disable'} onClick={handleDownload}>Download</button>

                                </div>

                            </div>
                            <div className='text-white flex items-center'>
                                <span
                                    onClick={() => handlePath('/')}
                                    style={{ cursor: 'pointer', marginRight: '5px' }}
                                >
                                    <VscRootFolderOpened className='text-yellow-600' />
                                </span>
                                {filePath && filePath === '/' ? '/' :

                                    filePath.split('/').map((path, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handlePath(path)}
                                            style={{ cursor: 'pointer', marginRight: '5px' }}
                                        >
                                            {path !== '' && `/ ${path}`}
                                        </span>
                                    ))}
                            </div>
                            <div className='flex flex-wrap gap-1 my-2 flex-col'>
                                {roomFiles[0] ?
                                    roomFiles.map((file, index) =>
                                        <div key={index} onClick={() => { handleOpenFile(file) }}>
                                            <RoomFiles fileInfo={file} />
                                        </div>)
                                    : <div className='w-full h-full flex justify-center items-center text-gray-500 m-4'>
                                        No files
                                    </div>}
                            </div>
                        </div>
                        <div className='bg-secondaryBackground p-4 rounded-md m-2'>
                            <div className='flex w-full justify-between'>
                                <h2 className='text-white text-3xl font-bold'>Tasks</h2>
                                <button
                                    className='bg-primaryBlue text-white p-1 px-3 rounded-lg flex items-center gap-1'
                                    type='button'
                                    onClick={() => { setTaskDivVisibility('visible') }}
                                >Create Task <FaPencilRuler /></button>
                            </div>
                            <div className='flex flex-wrap gap-3 my-2'>
                                {taskInfo && taskInfo.userTask ? taskInfo.userTask.map((task, index) =>
                                    <div key={index}>
                                        <TaskInfo taskInfo={task} taskUpdated={taskUpdated} setTaskUpdated={setTaskUpdated} />
                                    </div>
                                ) : <div>No Task</div>}
                            </div>
                        </div>
                    </div>
                    <div className="w-3/12 shadow-primaryBoxShadow h-screen relative top-0 right-0 m-2 p-4 rounded-md flex flex-col">
                        <h2 className='text-white text-2xl font-bold flex items-center h-fit w-full justify-between'> <span className='text-yellow-600'><FaRegBell /></span> </h2>
                        <div className='py-2 h-full w-full overflow-scroll scrollbar-none flex flex-col gap-2'>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function RoomUsers({ roomInfo, admin, user, fetchRoomInfo }) {
    const [showRqst, setShowRqst] = useState('hidden')
    const [reqstTab, setReqstTab] = useState('hidden')


    const { id1, id2 } = useParams()

    useEffect(() => {
        if (admin.length > 0 && user._id === admin[0].userId._id) {
            setReqstTab('visible');
        }
    }, [admin, user]);

    const handleReject = async (userId) => {
        try {
            const response = await rejectPermission({ userId, roomId: id1 })
            await fetchRoomInfo();
        } catch (error) {
            console.log(error)
        }
    }
    const handleAccept = async (userId) => {
        try {
            const response = await acceptPermission({ userId, roomId: id1 })
            triggerEvent({
                channel: `${id2}`,
                event: 'reqstAccecpted',
                message: 'reqstAccecpted',
            })

            await fetchRoomInfo();
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className='bg-primaryBackground justify-between flex h-fit p-2'>
                <div className='w-2/12 text-white flex gap-1 items-center relative'>
                    Users
                    <div className={`relative w-4 cursor-pointer ${reqstTab}`} onClick={() => setShowRqst('visible')}>
                        <FaUser className='text-white' />
                        {roomInfo.reqsts.length >= 1 &&
                            <div className='bg-red-500 text-white rounded-full text-[10px] font-bold h-[14px] w-[14px] flex items-center justify-center p-1 absolute -top-1 -right-2'>{roomInfo.reqsts.length}</div>
                        }
                    </div>
                    <div className={`absolute top-7 flex flex-col gap-1 max-h-4/5 overflow-scroll scrollbar-none bg-secondaryBackground w-10/12 h-fit rounded-md p-2 pt-3 ${showRqst}`}>
                        <button className='flex justify-end w-full' onClick={() => setShowRqst('hidden')}><IoCloseCircle className='text-white text-xl' /></button>
                        <div className='bg-primaryBackground'>
                            {roomInfo.reqsts && roomInfo.reqsts.map((rqst) => (
                                <div className='flex w-full bg-primaryBackground h-[50px] p-1 rounded-md text-white'>
                                    <div className='text-sm mx-2 w-[70%] h-[50px] overflow-hidden'>{rqst.user.name}</div>
                                    <button className='text-sm mx-2 text-primaryGreen bg-green-100 border-primaryGreen rounded-md text-[10px] px-1' onClick={() => handleAccept(rqst.user._id)}>Accept</button>
                                    <button className='text-sm mx-2 text-primaryGreen bg-green-100 border-primaryGreen rounded-md text-[10px] px-1' onClick={() => handleReject(rqst.user._id)}>Reject</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex gap-2 w-6/12'>
                    {
                        roomInfo.users.map((user) => (
                            <div className='flex text-white max-w-5/12 overflow-clip'>
                                <span className='bg-white rounded-full h-[25px] w-[25px] mr-2'></span>
                                {user.userId.userName}
                            </div>
                        ))
                    }
                </div>
                <div className='w-2/12 flex justify-center gap-3 items-center'>
                    <div className='text-pink-500 text-xl flex flex-col items-center cursor-pointer'>
                        <Link to={`/room/${id1}/meeting/${id2}`}>
                            <FaVideo />
                            <span className='text-sm text-white'>Room Meet</span>
                        </Link>
                    </div>
                    {/* <div className='text-pink-500 text-xl flex flex-col items-center cursor-pointer'>
                        <LuScreenShare />
                        <span className='text-sm text-white'>Screen Share</span>
                    </div> */}
                </div>
            </div>
        </>
    )
}

function CreateDiv({ visibility, setVisibility, user, setUser, currFile }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { id1, id2 } = useParams()


    return (
        <div className={`fixed w-[400px] h-fit top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 p-4 bg-black text-white z-50 rounded-md ${visibility}`}>
            <button className='w-full flex justify-end' onClick={() => setVisibility('hidden')}> <IoCloseCircle className='text-white text-xl' /></button>
            <div className='text-xl font-bold text-gray-300'>Create New</div>
            <form onSubmit={handleSubmit(async (data) => {
                //create file

                const create = await createRoomFile({
                    name: data.inputField,
                    type: data.selectField,
                    parentId: currFile ? currFile._id : null,
                    roomId: id1,
                    path: currFile ? currFile.path == '/' ? `${currFile.path}${currFile.name}` : `${currFile.path}/${currFile.name}` : '/'
                })
                //update user
                const user = await getUserInfo()
                setVisibility('hidden')
                setUser(user)
            })}>
                <div className='flex flex-col justify-evenly h-[200px]'>
                    <input className='bg-black text-white border-b-primaryGreen border-b-2 outline-none'
                        name='name'
                        {...register('inputField',
                            { required: 'This field is required' })}
                        type="text"
                        placeholder='Name' />
                    {errors.inputField && <p className='text-red-500 text-sm'>{errors.inputField.message}</p>}

                    <select className='bg-black text-white border-b-primaryGreen border-b-2 outline-none'
                        name="type"
                        {...register('selectField', {
                            validate: value => value != '#' || 'Please select a valid type'
                        })}
                        id="creatOption"
                        required>
                        <option value="#">Type</option>
                        <option value="code">Code Editor</option>
                        <option value="text">Text Editor</option>
                        <option value="folder">Folder</option>
                    </select>
                    {errors.selectField && <p className='text-red-500 text-sm'>{errors.selectField.message}</p>}
                </div>
                <div className='w-full flex justify-end'>
                    <button className={` p-2 rounded-md bg-purple-600`} type='submit'>Create</button>

                </div>
            </form>
        </div>
    )
}

function RoomFiles({ fileInfo }) {
    return (
        <div className='cursor-pointer'>
            <div className='bg-black rounded-md w-full h-[40px] flex justify-center items-center px-3 overflow-clip'>
                <span className='text-primaryBlue text-xl font-bolder mr-2'>{fileInfo.type == 'code' ? <FaCode /> : fileInfo.type == 'text' ? <MdOutlineTextFields className='text-white' /> : <FaFolder className='text-yellow-500' />}</span>
                <div className='text-white overflow-clip text-lg w-full'>{fileInfo.name}</div>
                <div className='flex justify-between items-center'>\
                    <span className='text-white text-xl font-bolder mr-2'><FaEdit /></span>
                    <span className='text-red-500 text-xl font-bolder mr-2'><MdDelete /></span>
                </div>
            </div>
        </div>
    )
}




export default RoomPage