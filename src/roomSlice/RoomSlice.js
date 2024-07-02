import { addRoomData, getRoomData, updateRoomUsers } from './RoomApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


const addRoomDataAsync = createAsyncThunk(
    'room/addRoomData',
    async(data) =>{
        const response = await addRoomData(data)
        return response.data;
    }
  );

  const createRoomAsync = createAsyncThunk(
    'room/createRoom',
    async(info) => {
        const response = await createRoomApi(info)
        console.log(response)
        return response.data;
    }
  )

  const getRoomDataAsync = createAsyncThunk(
    'room/getRoomInfo',
    async(roomCode) => {
        const response = await getRoomData(roomCode)
        return response.data;
    }
  )

  const updateRoomUsersAsync = createAsyncThunk(
    'room/updateRoomUsers',
    async(data)=>{
        const response = updateRoomUsers(data);
        return response.data
    }
  )

const initialState = {
    roomInfo:null,
    allRooms:null,
    loading: false,
    error: null
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(addRoomDataAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addRoomDataAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.roomInfo = action.payload
            })
            .addCase(addRoomDataAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    builder
            .addCase(getRoomDataAsync.pending,(state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoomDataAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.roomInfo = action.payload
            })
            .addCase(getRoomDataAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                
            });
    builder
            .addCase(updateRoomUsersAsync.pending,(state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRoomUsersAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.roomInfo = action.payload
            })
            .addCase(updateRoomUsersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                
            });
    }
});


export const { setRoomTextEditor, setRoomWhiteBoard, setRoomCodeEditor } = roomSlice.actions;

export const selectRoomInfo = (state) => state.room.roomInfo;

export { addRoomDataAsync, createRoomAsync, getRoomDataAsync,updateRoomUsersAsync }; 

export default roomSlice.reducer;