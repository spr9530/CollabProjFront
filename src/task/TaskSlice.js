import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createRoomTask, deleteUserTask, getAllTask, getUserAllTasks, getUsersTask, updateTask } from './TaskApi';

const initialState = {
    taskInfo: null,
    error: null,
    loading: null,
}

const getAllTaskAsync = createAsyncThunk(
    'task/getAllTaskAsync',
    async(id) => {
        const response = await getUserAllTasks(id);
        console.log(response)
        return response; 
    }
)

const createTaskAsync = createAsyncThunk(
    'task/createTaskAsync', 
    async(data)=>{
        const response = await createRoomTask(data);
        return response;
    }
)

const getCurrUserTaskAsync = createAsyncThunk(
    'task/getCurrUserTaskAsync',
    async(info)=>{
        const response = await getUsersTask(info);
        return response;
    }
)

const updateTaskAsync = createAsyncThunk(
    'task/updateTaskAsync',
    async(info)=>{
        const response = await updateTask(info);
        return response;
    }
)

const deleteTaskAsync = createAsyncThunk(
    'task/deleteTaskAsync',
    async(id)=>{
        const response = await deleteUserTask(id);
        return response;
    }
)

const taskSlice = createSlice({
    name:'task',
    initialState,
    extraReducers: (builder)=>{
        builder
        .addCase(getAllTaskAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllTaskAsync.fulfilled, (state,action) => {
            state.loading = false;
            state.taskInfo = action.payload;
        })
        .addCase(getAllTaskAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(getCurrUserTaskAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getCurrUserTaskAsync.fulfilled, (state,action) => {
            state.loading = false;
            state.taskInfo = action.payload;
        })
        .addCase(getCurrUserTaskAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(createTaskAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createTaskAsync.fulfilled, (state,action) => {
            state.loading = false;
            state.taskInfo = action.payload;
        })
        .addCase(createTaskAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(updateTaskAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateTaskAsync.fulfilled, (state,action) => {
            state.loading = false;
            state.taskInfo = action.payload;
        })
        .addCase(updateTaskAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(deleteTaskAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteTaskAsync.fulfilled, (state,action) => {
            state.loading = false;
            state.taskInfo = action.payload;
        })
        .addCase(deleteTaskAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
    }

})

export const selectUserTasks = (state) =>  state.task.taskInfo;
export {getAllTaskAsync, getCurrUserTaskAsync, createTaskAsync, updateTaskAsync, deleteTaskAsync};

export default taskSlice.reducer;