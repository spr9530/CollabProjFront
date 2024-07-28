import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllTask, getUserAllTasks } from './TaskApi';

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
    }
})

export const getUserAllTask = (state) =>  state.task.taskInfo;
export {getAllTaskAsync};

export default taskSlice.reducer;