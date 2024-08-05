import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoCloseCircle } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTaskAsync, updateTaskAsync } from '../task/TaskSlice';
import { useParams } from 'react-router-dom';
import { getUser } from '../user/userSlice';

function TaskInfo({ taskInfo, taskUpdated, setTaskUpdated }) {
    const [showTask, setShowTask] = useState('hidden');
    const [deletTaskBtn, setDeleteTaskBtn] = useState(false);
    const [taskCompletion, setTaskCompletion] = useState({ width: '0%', color: 'bg-primaryGreen' });
    const [loadingDelete, setLoadingDelete] = useState(false);
    const dispatch = useDispatch();
    const { id1 } = useParams();
    const userInfo = useSelector(getUser);

    useEffect(() => {
        const calculateTaskCompletion = () => {
            const taskDone = taskInfo.taskStep.filter((task) => task.done === true);
            const totalTask = taskInfo.taskStep.length;
            const completionPercentage = Math.floor((taskDone.length / totalTask) * 100);
            if (isNaN(completionPercentage) || !isFinite(completionPercentage)) {
                setTaskCompletion({ width: '0%', color: 'bg-primaryGreen' });
            } else {
                let color = 'bg-primaryGreen';
                if (completionPercentage < 50) {
                    color = 'bg-red-400';
                } else if (completionPercentage < 100) {
                    color = 'bg-yellow-400';
                } else {
                    color = 'bg-green-400';
                }
                setTaskCompletion({ width: `${completionPercentage}%`, color });
            }
            if (completionPercentage === 100) {
                setDeleteTaskBtn(true);
            } else {
                setDeleteTaskBtn(false);
            }
        };
        if (taskInfo.done) {
            setTaskCompletion({ width: '100%', color: 'bg-primaryGreen' });
            setDeleteTaskBtn(true);
        } else calculateTaskCompletion();
    }, [taskInfo]);

    const handleDeleteTask = async (id) => {
        setLoadingDelete(true);
        await dispatch(deleteTaskAsync({ taskId: id, id1, id2: userInfo._id }));
        setLoadingDelete(false);
        setTaskUpdated(true);
    };

    return (
        <>
            <ViewTask taskInfo={taskInfo} taskUpdated={taskUpdated} setTaskUpdated={setTaskUpdated} visibility={showTask} setVisibility={setShowTask} />
            <div className='h-[150px] w-full rounded-md bg-primaryBackground p-2 cursor-pointer'>
                <div className='flex flex-col justify-between h-full p-2'>
                    <div>
                        <h3 className='text-white text-md font-semibold'>{taskInfo.taskName}</h3>
                    </div>
                    <div className='w-full'>
                        <p className='text-gray-400 w-full overflow-x-clip'>{taskInfo.taskDate}</p>
                    </div>
                    <div className='w-full'>
                        <div className='w-full h-2 bg-secondaryBackground rounded-md my-2'>
                            <div className={`h-full rounded-md ${taskCompletion.color}`} style={{ width: taskCompletion.width }}></div>
                        </div>
                    </div>
                    <div className='text-secondaryText text-sm w-full flex justify-between'>
                        <button className='bg-purple-700 text-white p-1 px-3 rounded-lg group hover:scale-105' onClick={() => { setShowTask('visible') }}>View</button>
                        {deletTaskBtn &&
                            <button className='bg-red-400 text-white p-1 px-3 rounded-lg group hover:scale-105' onClick={() => { handleDeleteTask(taskInfo._id) }} disabled={loadingDelete}>
                                {loadingDelete ? 'Deleting...' : 'Delete'}
                            </button>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

function ViewTask({ taskInfo, taskUpdated, setTaskUpdated, visibility, setVisibility }) {
    const { register, handleSubmit } = useForm();
    const [editMode, setEditMode] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const dispatch = useDispatch();
    const { id1 } = useParams();
    const userInfo = useSelector(getUser);

    const handleUpdateTask = async (data) => {
        setLoadingSave(true);
        let taskStep = taskInfo.taskStep.map((step, index) => {
            return {
                ...step,
                done: data[`taskStep-${index}`] ? true : false
            };
        });
        await dispatch(updateTaskAsync({ taskId: taskInfo._id, data: { ...taskInfo, taskStep: taskStep }, id1, id2: userInfo._id }));
        setLoadingSave(false);
        setTaskUpdated(true);
        if (editMode) setEditMode(false);
    };

    const markTaskDone = async (taskInfo, done) => {
        await dispatch(updateTaskAsync({ taskId: taskInfo._id, data: { ...taskInfo, done: done }, id1, id2: userInfo._id }));
    }

    useEffect(() => {
        if (taskUpdated) {
            setTaskUpdated(false);
        }
    }, [taskUpdated]);

    const handleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <div className={`absolute w-[80vh] h-screen flex flex-col justify-center items-center top-0 left-0 ${visibility} z-20`} >
            <div className={`fixed left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 bg-black rounded-md w-7/12 h-[fit] max-h-[98vh] flex flex-col items-center p-3 overflow-scroll scrollbar-none`}>
                <button className='w-full flex justify-end' onClick={() => setVisibility('hidden')}> <IoCloseCircle className='text-white text-xl' /></button>
                <div className='w-full'>
                    <div className='flex w-full gap-2'>
                        <div className='flex w-full flex-col gap-2'>
                            <div className='text-white'>Task Name</div>
                            <input type="text" disabled value={taskInfo.taskName} />
                        </div>
                        <div className='flex w-full flex-col gap-2'>
                            <div className='text-white'>Due Date</div>
                            <input type="text" disabled value={taskInfo.taskDate} />
                        </div>
                    </div>
                    <div className='w-full'>
                        <div className='text-white'>Description</div>
                        <input type="text" className='w-full' disabled value={taskInfo.taskDescription} />
                    </div>
                </div>
                <div className='w-full my-2'>
                    {taskInfo.taskStep && taskInfo.taskStep[0] ? <form onSubmit={handleSubmit((data) => {
                        handleUpdateTask(data);
                    })} className='w-full'>
                        <div className='w-full flex justify-between items-center'>
                            <div className='text-white'>Steps</div>
                            <div className='flex gap-2'>
                                {taskInfo.taskStep && !editMode && <button type='button' className='p-1 rounded-md bg-red-400' onClick={handleEditMode}>Edit</button>}
                                {taskInfo.taskStep && <button type='submit' className='p-1 rounded-md bg-primaryGreen' disabled={loadingSave}>
                                    {loadingSave ? 'Saving...' : 'Save'}
                                </button>}
                            </div>
                        </div>
                        {taskInfo.taskStep.map((step, index) => (
                            <div key={index} className='bg-secondaryBackground rounded-md border-purple-500 border my-2 p-2'>
                                <div className='text-white justify-between flex'>
                                    <span>{index + 1}</span>
                                    <div className='w-10/12 overflow-x-clip'>{step.taskName}</div>
                                    {!editMode ? (
                                        step.done ? (
                                            <>Done</>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                name={`taskStep-${index}`}
                                                {...register(`taskStep-${index}`)}
                                                id={`taskStep-${index}`}
                                            />
                                        )
                                    ) : (
                                        <input
                                            type="checkbox"
                                            name={`taskStep-${index}`}
                                            defaultChecked={step.done}
                                            {...register(`taskStep-${index}`)}
                                            id={`taskStep-${index}`}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </form> :
                        <>
                            <div className='text-white font-bold text-center'>No steps</div>
                            {
                                taskInfo.done ?
                                    <button onClick={() => markTaskDone(taskInfo, false)} className='p-1 rounded-md text-white font-semibold bg-red-500'>Undone</button>
                                    :
                                    <button onClick={() => markTaskDone(taskInfo, true)} className='p-1 rounded-md text-white font-semibold bg-primaryGreen'>Done</button>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

export default TaskInfo;
