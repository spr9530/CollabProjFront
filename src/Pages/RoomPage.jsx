import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaRegBell } from "react-icons/fa";
import { FaCode } from "react-icons/fa6";
import { MdOutlineTextFields } from "react-icons/md";
import { VscRootFolderOpened } from "react-icons/vsc";
import { FaUser } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";
import { FaFolder } from "react-icons/fa";
import { FaPencilRuler } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { SiFiles } from "react-icons/si";
import { IoChatbubbles } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { acceptPermission, createRoomFile, downloadFiles, getRoomFiles, getRoomInfo, rejectPermission, updateRoomUsers } from '../roomSlice/RoomApi';
import { useForm } from "react-hook-form";
import Navbar from '../components/Navbar';
import CreateTask from '../components/CreateTask';
import TaskInfo from '../components/TaskInfo';
import { triggerEvent } from '../socket/trigger';
import { getLoggedUserAsync, getUser } from '../user/userSlice';
import { createRoomFileAsync, deleteRoomFileAsync, getCurrRoomAsync, selectCurrRoom, selectCurrRoomFiles, updateRoomFileAsync } from '../roomSlice/RoomSlice';
import { getCurrUserTaskAsync, selectUserTasks } from '../task/TaskSlice';



function RoomPage({ pusher }) {
    let { id1, id2 } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector(getUser);
    const roomInfo = useSelector(selectCurrRoom)
    const allFiles = useSelector(selectCurrRoomFiles)
    const taskInfo = useSelector(selectUserTasks);
    const [loading, setLoading] = useState(true)
    const [admin, setAdmin] = useState([]);
    const [allowed, setAllowed] = useState(false);
    const [taskUpdated, setTaskUpdated] = useState(false);
    const [roomFiles, setRoomFiles] = useState([])
    const [currFile, setCurrFile] = useState(null)
    const [filePath, setFilePath] = useState('/')
    const [pathHistory, setPathHistory] = useState([])
    const [toggleView, setToggleView] = useState('file');
    const [toggleInnerView, setToggelInnerView] = useState('files')
    const [createDivVisibility, setCreateDivVisibility] = useState('hidden')
    const [taskDivVisibility, setTaskDivVisibility] = useState('hidden')
    const [downloadBtn, setDownloadBtn] = useState('enable');

    useEffect(() => {
        if (!userInfo) {
            dispatch(getLoggedUserAsync());
        }
    }, [userInfo]);

    useEffect(() => {
        if (userInfo) {
            dispatch(getCurrRoomAsync(id1));
            dispatch(getCurrUserTaskAsync({ id1, id2: userInfo._id }))
        }
    }, [userInfo]);

    useEffect(() => {
        if (allFiles) {
            setRoomFiles(() => (
                allFiles.filter((file) => file.parentId === (currFile != null ? currFile._id : null))
            ));
        }
    }, [allFiles])

    useEffect(() => {
        if (userInfo && roomInfo) {
            const userExists = roomInfo.users.some((user) => user.userId._id === userInfo._id);
            setAllowed(userExists);
            setLoading(false);
        }
    }, [roomInfo])

    useEffect(() => {
        const channel = pusher.subscribe(`${id1}`);
        const rqstChannel = pusher.subscribe(`${id2}`);
        channel.bind('userJoind', function (data) {
            if (admin && admin[0] && admin[0].userId._id === userInfo._id) {
                alert('Received data: ' + JSON.stringify(data));
            }
        });
        rqstChannel.bind('updateRequests', function (data) {
            if (admin[0].userId._id === userInfo._id) {
                dispatch(getCurrRoomAsync(id1));
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

    const handleCreate = () => {
        setCreateDivVisibility('visible');
    };

    const handleOpenFile = useCallback(async (fileInfo) => {
        if (fileInfo.type === 'folder') {
            setFilePath(fileInfo.path === '/' ? `/${fileInfo.name}` : `${fileInfo.path}/${fileInfo.name}`);
            setPathHistory([...pathHistory, fileInfo]);
            setCurrFile(fileInfo);
            setRoomFiles(() => (
                allFiles.filter((file) => file.parentId === fileInfo._id)
            ))
        } else {
            navigate(`/room/${roomInfo._id}/${id2}/${fileInfo._id}`);
        }
    }, [id1, navigate, pathHistory, roomInfo]);

    const handlePath = async (path) => {
        if (path === '/') {
            setRoomFiles(() => (
                allFiles.filter((file) => file.parentId === null)
            ));
            setPathHistory([]);
            setFilePath('/');
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

                <RoomUsers roomInfo={roomInfo} admin={admin} user={userInfo} setToggleView={setToggleView} toggleView={toggleView} />
                <CreateTask visibility={taskDivVisibility} setVisibility={setTaskDivVisibility} roomInfo={roomInfo} />
                <CreateDiv visibility={createDivVisibility} setVisibility={setCreateDivVisibility} currFile={currFile} />
                <div className='bg-primaryBackground w-full flex gap-2 justify-center '>
                    <div className={`w-full md:w-8/12 shadow-primaryBoxShadow m-2 p-1 md:p-4 rounded-md h-screen overflow-scroll scrollbar-none ${toggleView == 'file' ? '' : 'hidden'} md:block `}>
                        <div className={`bg-secondaryBackground w-full p-4 rounded-md m-2 ${toggleInnerView == 'files' ? '' : 'hidden'} md:block`}>
                            <div className='flex flex-col md:flex-row w-full justify-between'>
                                <div className='flex gap-2'>
                                    <h2 className='text-white text-2xl md:text-3xl font-bold border-b-2 border-white '>Files</h2>
                                    <h2 className='text-gray-500 text-2xl md:text-3xl font-bold md:hidden' onClick={() => setToggelInnerView('tasks')}>Tasks</h2>
                                </div>
                                <div className='flex gap-2 py-3 md:p-0'>
                                    <button className='bg-purple-600 text-white p-1 px-3 font-semibold rounded-lg flex items-center gap-1' onClick={handleCreate} >  Create <FaFileCirclePlus /> </button>
                                    <button className={` p-1 px-3 rounded-lg flex items-center font-semibold gap-1 ${downloadBtn === 'disable' ? 'bg-purple-400 text-gray-400' : 'bg-purple-600 text-white'}`} disabled={downloadBtn === 'disable'} onClick={handleDownload}>Download</button>
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
                                        <div key={index} >
                                            <RoomFiles fileInfo={file} openFn={handleOpenFile} />
                                        </div>)
                                    : <div className='w-full h-full flex justify-center items-center text-gray-500 m-4'>
                                        No files
                                    </div>}
                            </div>
                        </div>
                        <div className={`bg-secondaryBackground w-full p-4 rounded-md m-2 ${toggleInnerView == 'tasks' ? '' : 'hidden'} md:block `}>
                            <div className='flex flex-col md:flex-row w-full justify-between'>
                                <div className='flex gap-2'>
                                    <h2 className='text-gray-500 text-2xl md:text-3xl font-bold md:hidden ' onClick={() => setToggelInnerView('files')}>Files</h2>
                                    <h2 className='text-white text-2xl md:text-3xl font-bold border-b-2 border-white' >Tasks</h2>
                                </div>
                                <button
                                    className='bg-primaryBlue text-white w-fit font-semibold my-3 md:md-0 p-1 px-3 rounded-lg flex items-center gap-1'
                                    type='button'
                                    onClick={() => { setTaskDivVisibility('visible') }}
                                >Create Task <FaPencilRuler /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 my-2 w-full">
                                {taskInfo && taskInfo.userTask ? taskInfo.userTask.map((task, index) => (
                                    <div key={index}>
                                        <TaskInfo taskInfo={task} taskUpdated={taskUpdated} setTaskUpdated={setTaskUpdated} />
                                    </div>
                                )) : <div className='text-whte font-bold'>No Task</div>}
                            </div>
                        </div>
                    </div>
                    <div className={`w-full md:w-4/12 shadow-primaryBoxShadow h-screen relative top-0 right-0 m-2 p-4 rounded-md ${toggleView == 'chat' ? 'flex' : 'hidden'} ${toggleView == 'chat' ? 'md:flex flex-col' : 'hidden'} `}>
                        <h2 className='text-white text-2xl font-bold flex items-center h-fit w-full justify-between'> <span className='text-yellow-600'><FaRegBell /></span> </h2>
                        <div className='py-2 h-full w-full overflow-scroll scrollbar-none flex flex-col gap-2'>
                        </div>
                    </div>
                    <div className={`w-full md:w-4/12 shadow-primaryBoxShadow h-screen relative top-0 right-0 m-2 p-4 rounded-md ${toggleView == 'users' ? 'flex' : 'hidden'} ${toggleView == 'users' ? 'md:flex flex-col' : 'hidden'}`}>
                        <h2 className='text-white text-2xl font-bold flex items-center h-fit w-full justify-between'> <span className='text-pink-600'><FaUser /></span> </h2>
                        <div className='py-2 h-full w-full overflow-scroll scrollbar-none flex flex-col gap-2'>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function RoomUsers({ roomInfo, admin, user, setToggleView, toggleView }) {
    const [showRqst, setShowRqst] = useState('hidden')
    const [reqstTab, setReqstTab] = useState('hidden')
    const [showUsers, setShowUsers] = useState('hidden')
    const { id1, id2 } = useParams()
    const dispatch = useDispatch()

    useEffect(() => {
        if (admin.length > 0 && user._id === admin[0].userId._id) {
            setReqstTab('visible');
        }
    }, [admin, user]);

    const handleReject = async (userId) => {
        try {
            await rejectPermission({ userId, roomId: id1 })
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
            dispatch(getCurrRoomAsync(id1))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className='w-full bg-primaryBackground relative justify-between flex h-fit p-2'>
                <div className='w-full flex justify-center gap-3 items-center'>
                    <div className='relative text-xl flex flex-col items-center cursor-pointer'>
                        <div className={`relative text-pink-500 w-fit cursor-pointer pt-2 ${reqstTab}`} onClick={() => setShowRqst('visible')}>
                            <FaUser className='mx-auto' />
                            {roomInfo.reqsts.length >= 1 &&
                                <div className='bg-red-500 text-white rounded-full text-[10px] font-bold h-[14px] w-[14px] flex items-center justify-center p-1 absolute -top-1 -right-2'>{roomInfo.reqsts.length}</div>
                            }
                            <span className='text-sm text-white'>Request</span>
                        </div>
                        <div className={`absolute top-7 flex flex-col gap-1 max-h-4/5 overflow-scroll scrollbar-none bg-secondaryBackground w-[300px] h-fit rounded-md p-2 pt-3 ${showRqst}`}>
                            <button className='flex justify-end w-full' onClick={() => setShowRqst('hidden')}><IoCloseCircle className='text-white text-xl' /></button>
                            <div className='bg-primaryBackground rounded-md'>
                                {roomInfo.reqsts && roomInfo.reqsts.length > 0 ? roomInfo.reqsts.map((rqst) => (
                                    <div className='flex w-full bg-primaryBackground h-[50px] p-1 rounded-md text-white'>
                                        <div className='text-sm mx-2 w-[70%] h-[50px] overflow-hidden'>{rqst.user.name}</div>
                                        <button className='text-sm mx-2 text-primaryGreen bg-green-100 border-primaryGreen rounded-md text-[10px] px-1' onClick={() => handleAccept(rqst.user._id)}>Accept</button>
                                        <button className='text-sm mx-2 text-primaryGreen bg-green-100 border-primaryGreen rounded-md text-[10px] px-1' onClick={() => handleReject(rqst.user._id)}>Reject</button>
                                    </div>
                                ))
                                    :
                                    <div className='text-gray-500 text-center bg-transparent '>
                                        No Requests
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='text-pink-500 text-xl flex flex-col  items-center cursor-pointer pt-2'>
                        <Link to={`/room/${id1}/${id2}/meeting`}>
                            <FaVideo className='mx-auto' />
                            <span className='text-sm text-white'>Room Meet</span>
                        </Link>
                    </div>
                    <div className='text-pink-500 text-xl hidden md:flex flex-col  items-center cursor-pointer pt-2' onClick={() => toggleView == 'chat' ? setToggleView('users') : setToggleView('chat')}>
                        {toggleView == 'chat' || toggleView == 'file' ? <FaUser className='mx-auto' /> : <IoChatbubbles className='mx-auto' />}
                        {toggleView == 'chat' || toggleView == 'file' ? <span className='text-sm text-white'>Room Users</span> : <span className='text-sm text-white'>Room Chat</span>}
                    </div>
                    <div className='text-pink-500 text-xl flex flex-col md:hidden items-center cursor-pointer pt-2' onClick={() => setToggleView('chat')}>
                        <IoChatbubbles className='mx-auto' />
                        <span className='text-sm text-white'>Room Chat</span>
                    </div>
                    <div className='text-pink-500 text-xl flex flex-col md:hidden items-center cursor-pointer pt-2' onClick={() => setToggleView('users')}>
                        <FaUser className='mx-auto' />
                        <span className='text-sm text-white'>Room Users</span>
                    </div>
                    <div className='text-pink-500 text-xl flex flex-col md:hidden items-center cursor-pointer pt-2' onClick={() => setToggleView('file')}>
                        <SiFiles className='mx-auto' />
                        <span className='text-sm text-white'>Room Files</span>
                    </div>

                </div>
            </div>
        </>
    )
}

const CreateDiv = React.memo(({ visibility, setVisibility, currFile }) => {
    const { id1 } = useParams()
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const newData = {
                name: data.inputField,
                type: data.selectField,
                parentId: currFile ? currFile._id : null,
                roomId: id1,
                path: currFile ? currFile.path === '/' ? `${currFile.path}${currFile.name}` : `${currFile.path}/${currFile.name}` : '/'
            };
            await dispatch(createRoomFileAsync(newData));
            setVisibility('hidden');
            reset();
        } catch (error) {
            console.error("Error creating file:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed w-[400px] h-fit top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 p-4 bg-black text-white z-50 rounded-md ${visibility}`}>
            <button className='w-full flex justify-end' onClick={() => { setVisibility('hidden'), reset(); }}> <IoCloseCircle className='text-white text-xl' /></button>
            <div className='text-xl font-bold text-gray-300'>Create New</div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='flex flex-col justify-evenly h-[200px]'>
                    <input className='bg-black text-white border-b-primaryGreen border-b-2 outline-none'
                        name='name'
                        {...register('inputField', { required: 'This field is required' })}
                        type="text"
                        placeholder='Name' />
                    {errors.inputField && <p className='text-red-500 text-sm'>{errors.inputField.message}</p>}

                    <select className='bg-black text-white border-b-primaryGreen border-b-2 outline-none'
                        name="type"
                        {...register('selectField', {
                            validate: value => value !== '#' || 'Please select a valid type'
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
                    <button className={`p-2 rounded-md bg-purple-600`} type='submit' disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    )
})

function RoomFiles({ fileInfo, openFn }) {
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (info) => {
        setIsDeleting(true);
        try {
            await dispatch(deleteRoomFileAsync(info));
        } catch (error) {
            console.error('Error deleting file:', error);
        } finally {
            setIsDeleting(false);
        }
    };


    // last Update time to be added

    return (
        <div className={`cursor-pointer `}>
            <div className={`bg-black rounded-md w-full h-[40px] flex justify-center items-center overflow-clip `}>
                <div
                    className='flex w-10/12 items-center px-3'
                    onClick={() => openFn(fileInfo)}
                >
                    <span className='text-primaryBlue text-xl font-bolder mr-2'>
                        {fileInfo.type === 'code' ? <FaCode /> : fileInfo.type === 'text' ? <MdOutlineTextFields className='text-white' /> : <FaFolder className='text-yellow-500' />}
                    </span>
                    <input
                        className={`text-white overflow-clip text-lg w-full bg-transparent cursor-pointer border-none outline-none`}
                        value={fileInfo.name}
                        readOnly={true}
                    />
                </div>
                <div className='flex justify-between items-center ps-3'>

                    <span
                        className={`text-red-500 text-xl font-bolder mr-2  ${isDeleting ? 'opacity-50 text-red-700' : 'opacity-100'}`}
                        onClick={() => handleDelete({ id: fileInfo._id, roomId: fileInfo.roomId })}
                    >
                        <MdDelete />
                    </span>
                </div>
            </div>
        </div>
    );
}






export default RoomPage