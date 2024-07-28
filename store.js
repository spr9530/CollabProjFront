import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './src/roomSlice/RoomSlice';
import userReducer from './src/user/userSlice';
import taskReducer from './src/task/TaskSlice';
import todoReducer from './src/todo/todoSlice'
const store = configureStore({
    reducer: {
        room: roomReducer,
        user: userReducer,
        task: taskReducer,
        todo: todoReducer,
    }
});

export default store;
