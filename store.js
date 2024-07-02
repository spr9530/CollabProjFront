import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './src/roomSlice/RoomSlice';
import userReducer from './src/user/userSlice'

const store = configureStore({
    reducer: {
        room: roomReducer,
        user: userReducer,
    }
});

export default store;