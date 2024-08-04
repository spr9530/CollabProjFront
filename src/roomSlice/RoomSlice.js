import { addRoomData, createRoomApi, createRoomFile, deleteRoom, deleteRoomFiles, getRoomData, getRoomInfo, updateRoomFiles, updateRoomUsers } from './RoomApi';

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
        return response.roomInfo;
    }
  )

  const getRoomDataAsync = createAsyncThunk(
    'room/getRoomInfo',
    async(roomCode) => {
        const response = await getRoomData(roomCode)
        return response.data;
    }
  )

  const getCurrRoomAsync = createAsyncThunk(
    'room/getCurrRoomAsync',
    async(id)=>{
        const response = await getRoomInfo(id);
        return response.roomInfo;
    }
  )

  const updateRoomUsersAsync = createAsyncThunk(
    'room/updateRoomUsers',
    async(data)=>{
        const response = updateRoomUsers(data);
        return response.data
    }
  )

  const deleteRoomAsync = createAsyncThunk(
    'room/deleteRoom',
    async(room)=>{
        const response = await deleteRoom(room);
        return response.data;
    }
  )

  const createRoomFileAsync = createAsyncThunk(
    'room/createRoomFileAsync',
    async(data)=>{
        const response = await createRoomFile(data);
        return response;
    }
  )

  const deleteRoomFileAsync = createAsyncThunk(
    'room/deleteRoomFileAsync',
    async(info)=>{
        const response = await deleteRoomFiles(info);
        return response.roomInfo;
    }
  )

  const updateRoomFileAsync = createAsyncThunk(
    'room/updateRoomFileAsync',
    async(info) => {
        const response = await updateRoomFiles(info);
        return response.roomInfo;
    }
  )

const initialState = {
    roomInfo:null,
    roomFiles:null,
    currRoom:null,
    newRoom: null,
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
            builder
            .addCase(deleteRoomAsync.pending,(state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRoomAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.roomInfo = action.payload;
                console.log(state.roomInfo);
            }) 
            .addCase(deleteRoomAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createRoomAsync.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(createRoomAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.roomInfo = action.payload;
                state.newRoom = action.payload;
            }) 
            .addCase(createRoomAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createRoomFileAsync.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(createRoomFileAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.currRoom = action.payload;
                state.roomFiles = action.payload.roomFiles;
            }) 
            .addCase(createRoomFileAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(getCurrRoomAsync.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrRoomAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.currRoom = action.payload;
                state.roomFiles = action.payload.roomFiles;
            }) 
            .addCase(getCurrRoomAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteRoomFileAsync.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRoomFileAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.currRoom = action.payload;
                state.roomFiles = action.payload.roomFiles;
            }) 
            .addCase(deleteRoomFileAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateRoomFileAsync.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRoomFileAsync.fulfilled,(state, action)=>{
                state.loading = false;
                state.currRoom = action.payload;
                state.roomFiles = action.payload.roomFiles;
            }) 
            .addCase(updateRoomFileAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
});


export const { setRoomTextEditor, setRoomWhiteBoard, setRoomCodeEditor } = roomSlice.actions;

export const selectRoomInfo = (state) => state.room.roomInfo;
export const selectNewRoom  = (state) => state.room.newRoom;
export const selectCurrRoom = (state) => state.room.currRoom;
export const selectCurrRoomFiles = (state) => state.room.roomFiles;

export { addRoomDataAsync, createRoomAsync, getRoomDataAsync,updateRoomUsersAsync, deleteRoomAsync, createRoomFileAsync,getCurrRoomAsync,
    deleteRoomFileAsync, updateRoomFileAsync
 }; 

export default roomSlice.reducer;