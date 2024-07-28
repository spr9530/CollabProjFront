import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addTodo, deleteTodo, getTodo, updateTodo } from "./todoApi";

const initialState = {
    tasks: null,
    error: null,
    loading: null,
}

export const addTodoAsync = createAsyncThunk(
    'todo/addTodoAsync',
    async(data) => {
        const response = await addTodo(data);
        console.log(response.data)
        return response.data
    }
)

export const getTodoAsync = createAsyncThunk(
    'todo/getTodoAsync',
    async() =>{
        const response = await getTodo();
        return response;
    }
)

export const deleteTodoAsync = createAsyncThunk(
    'todo/deleteTodoAsync',
    async(id) => {
        const response = await deleteTodo(id)
        return response;
    }
)

export const updateTodoAsync = createAsyncThunk(
    'todo/updateTodoAsync',
    async({newData:data, id}) =>{
        console.log(id)
        const response = await updateTodo(data, id);
        return response;
    }
)

const todoSlice = createSlice({
    name:'todo',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(addTodoAsync.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        .addCase(addTodoAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
            state.error = false;
        })
        .addCase(addTodoAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(getTodoAsync.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        .addCase(getTodoAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
            state.error = false;
        })
        .addCase(getTodoAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(deleteTodoAsync.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        .addCase(deleteTodoAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
            state.error = false;
        })
        .addCase(deleteTodoAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(updateTodoAsync.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        .addCase(updateTodoAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
            state.error = false;
        })
        .addCase(updateTodoAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    }
})



export const getTodoTasks = (state) => state.todo.tasks;
export default todoSlice.reducer;