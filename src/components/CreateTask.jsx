import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form';
import { IoCloseCircle } from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import { createRoomTask } from '../task/TaskApi';

function CreateTask({ visibility, setVisibility, roomInfo, fetchTask }) {

    const { id1 } = useParams()
    const users = roomInfo.users
    const [steps, setSteps] = useState([]);
    const [addedUsers, setAddedUsers] = useState([])
    const [show, setShow] = useState('hidden')
    const [createError, setCreateError] = useState(null)
    const { register,
        handleSubmit,
        control, // used in maing array in form
        reset, // used in clearing that array
        formState: { errors } } = useForm();

    const { fields, append } = useFieldArray({
        control,
        name: 'steps'
    });



    useEffect(() => {
        setSteps([])
        clearSteps()
    }, [visibility])

    const addStep = () => {
        setSteps([...steps, { id: steps.length }])
    }

    //clearing steps array 
    const clearSteps = () => {
        reset({ steps: [] });
    };

    const handleOkClick = (e) => {
        e.stopPropagation(); // Prevent the parent div's onClick from being triggered
        setShow('hidden');
    };

    const handleUserAdd = (e) => {
        if (e.target.checked) {
            setAddedUsers([...addedUsers, e.target.value])
        }
        else {
            setAddedUsers(addedUsers.filter(user => user !== e.target.value));
        }
    }

    const createNewTask = async (data) => {
        let task = {
            taskName: data.taskName,
            taskDescription: data.taskDescription,
            taskStep: data.steps,
            taskRoom: id1,
            users: addedUsers,
            taskDate: data.taskDate
        }
        try {
            const response = await createRoomTask(task);
            await fetchTask()
            setVisibility('hidden');
        } catch (error) {
            console.error('Error creating task:', error);
            setCreateError('Error creating task')
        }        
    }

    const today = new Date().toISOString().split('T')[0];
    return (
        <div className={`absolute w-full h-screen flex flex-col justify-center items-center ${visibility}`}>
            <div className={`fixed left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 bg-black rounded-md w-7/12 h-[98vh] max-h-[98vh] flex flex-col items-center p-3 overflow-scroll scrollbar-none`}>
                <form className='w-full' onSubmit={handleSubmit((data) => {
                    createNewTask(data)
                })}>
                    <div className='text-xl text-white flex w-full justify-between mb-1'>
                        <div>New Task</div>
                        <div className='flex gap-2'>
                            <button className='bg-primaryGreen p-1 rounded-md' ypye='submit'>Create</button>
                            <button className='' onClick={() => setVisibility('hidden')}> <IoCloseCircle className='text-red-500 text-xl' /></button>
                        </div>
                    </div>

                    <div className='w-full flex gap-2'>
                        <div className='w-7/12 flex flex-col gap-1'>
                            <input className='bg-secondaryBackground p-2 rounded-md text-gray-300'
                                {...register('taskName', {
                                    required: 'Task name is required',
                                })}
                                type="text"
                                name="taskName"
                                placeholder='Task Name' />
                            {errors.taskName && <p className="text-red-500 text-[10px]">{errors.taskName.message}</p>}
                            <textarea className='bg-secondaryBackground p-2 rounded-md text-gray-300'
                                {...register('taskDescription', {
                                    required: 'Task description is required',
                                    minLength: {
                                        value: 4,
                                        message: 'Task description must be at least 4 characters long',
                                    },
                                })}
                                name="taskDescription"
                                id=""
                                placeholder='Task Description'>
                            </textarea>
                            {errors.taskDescription && <p className="text-red-500 text-[10px]">{errors.taskDescription.message}</p>}
                            <input
                                type="date"
                                className='bg-secondaryBackground p-2 rounded-md text-gray-300'
                                name="taskDate"
                                {...register('taskDate', {
                                    required: 'Due Date is required',
                                    validate: value => value >= today || 'Due date must be today or later'
                                })}
                                placeholder="Due Date"
                            />
                            {errors.taskDate&& <p className="text-red-500 text-[10px]">{errors.taskDate.message}</p>}

                        </div>
                        <div className='w-5/12 h-fit border-b-2 border-b-primaryBlue text-white'>
                            <div onClick={() => { setShow('visible') }}>Add user {show === 'visible' ? <button className='text-white mx-2' type='button' onClick={(e) => { handleOkClick(e) }}>ok</button> : null}</div>
                            <div className={`w-full h-[100px] overflow-scroll scrollbar-none ${show}`}>
                                {users.map((user, index) =>
                                    <div key={index} className='w-full text-white h-[25px] flex items-center' >
                                        <input className="mx-2" type="checkbox" value={user.userId._id} onChange={(e) => { handleUserAdd(e) }} id={index} />
                                        <label htmlFor={index}>{user.userId.userName}</label>
                                    </div>)}
                            </div>

                        </div>
                    </div>
                    {createError && <p className='text-red-600 text-center'>{createError}</p>}
                    <div className='w-full '>
                        <div className='flex flex-col w-full justify-evenly'>

                            <div className='flex w-full justify-evenly pb-2 my-2 border-b-2 border-b-primaryBlue'>
                                <h5 className='text-white' >Task Step</h5>
                                <button className='text-white' type='button' onClick={addStep}>Add</button>
                            </div>

                            <div className='w-full h-[250px] overflow-scroll scrollbar-none'>
                                {steps.map((step, index) =>
                                    <div className='w-full'>
                                        <div className=' w-full flex flex-col my-2 bg-secondaryBackground p-1 rounded-md'>
                                            <div className='text-gray-500 '>#{step.id + 1}</div>
                                            <input className='bg-transparent text-gray-300'
                                                {...register(`steps.${index}.taskName`, {
                                                    required: 'Step name is required',
                                                    minLength: {
                                                        value: 3,
                                                        message: 'Step name must be at least 3 characters long',
                                                    },
                                                })} type="text" placeholder='Step Name' />
                                            {errors.steps && errors.steps[index] && errors.steps[index].taskName && (
                                                <p className="text-red-500 text-[10px]">{errors.steps[index].taskName.message}</p>)}

                                            <textarea className='bg-transparent text-gray-300'
                                                {...register(`steps.${index}.taskDescription`, {
                                                    required: 'Step description is required',
                                                    minLength: {
                                                        value: 4,
                                                        message: 'Step description must be at least 4 characters long',
                                                    },

                                                })} id="" placeholder='Step Description'></textarea>
                                            {errors.steps && errors.steps[index] && errors.steps[index].taskDescription && (
                                                <p className="text-red-500 text-[10px]">{errors.steps[index].taskDescription.message}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </form>
            </div>

            
        </div>
    )
}

export default CreateTask