import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLoggedUser, updateUserRoom, userLogginApi } from './userApi';

const initialState = {
    loggedInUser: null,
    userRooms: null,
    loading: false,
    error: null
};

export const userLogginAsync = createAsyncThunk(
    'user/userLoggin',
    async (userCredentials) => {
        const response = await userLogginApi(userCredentials);
        localStorage.setItem('token', response.data.token);
        return response.data.user;
    }
);

export const getLoggedUserAsync = createAsyncThunk(
    'user/getLoggedUserAsync',
    async () => {
        const response = await getLoggedUser();
        return response.data.userInfo;
    }
);

export const updateUserAsync = createAsyncThunk(
    'user/updateUserAsync',
    async(rooms) => {
        const response = await updateUserRoom(rooms);
        console.log(response[0].rooms)
        return response[0].rooms;
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.loggedInUser = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(userLogginAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userLogginAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.loggedInUser = action.payload;
                state.error = null;
            })
            .addCase(userLogginAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(getLoggedUserAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLoggedUserAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.loggedInUser = action.payload;
                state.userRooms = state.loggedInUser.rooms
                state.error = null;
            })
            .addCase(getLoggedUserAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateUserAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.userRooms = action.payload;
                state.error = null;
            })
            .addCase(updateUserAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { setUserInfo } = userSlice.actions;

export const getUser = (state) => state.user.loggedInUser;
export const getUserRoom = (state) => state.user.userRooms;

export default userSlice.reducer;
