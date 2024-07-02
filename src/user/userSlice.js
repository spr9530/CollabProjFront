import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkUser, userLogginApi } from './userApi';

const initialState = {
    loggedInUser: [],
    loading: false,
    error: null
}

const userLogginAsync = createAsyncThunk(
    'user/userLoggin',
    async(userCredentials) =>{
        const response = await userLogginApi(userCredentials);
        localStorage.setItem('token', response.data.token);
        return response.data.user;
    }
)


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
        },
    },
    extraReducers:(builder) =>{
        builder.addCase(userLogginAsync.pending,(state)=>{
            state.loading = true;
            state.error = null;
        } )
        builder.addCase(userLogginAsync.fulfilled, (state, action)=>{
            state.loading = false;
            state.loggedInUser.push(action.payload);
            state.error = null;
        })
        builder.addCase(userLogginAsync.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.error.message;
        })
    }
})

export {userLogginAsync};

export const { setUserInfo } = userSlice.actions;

export const getUser = (state) => state.user.loggedInUser

export default userSlice.reducer