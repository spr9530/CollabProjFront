import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RoomPage from './Pages/RoomPage.jsx';
import CreateRoom from './Pages/CreateRoom.jsx';
import io from 'socket.io-client';
import store from '../store.js'
import { Provider } from 'react-redux';
import Login from './user/Login.jsx';
import Temp from './components/Temp.jsx';
import PermissionPage from './Pages/PermissionPage.jsx';
import EditorPage from './Pages/EditorPage.jsx';
import HomePage from './Pages/HomePage.jsx';
import SignUp from './user/SignUp.jsx';
import MeetingPage from './Pages/MeetingPage.jsx';
import Pusher from 'pusher-js';


  const pusher = new Pusher('0a8370d6d5a42543bf95', {
      cluster: 'ap2'
  });
  


// const socket = io('http://localhost:5000');


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage pusher={pusher} />,
  },
  {
    path:"/login",
    element: <Login/>
  },
  {
    path:"/signUp",
    element: <SignUp/>
  },
  {
    path: "/creatRoom",
    element: <CreateRoom/>,
  },
  {
    path: "/room/:id1/:id2",
    element: <RoomPage pusher={pusher}/>,
  },
  {
    path: "/askPermission",
    element:<PermissionPage/>
  },
  {
    path: "/room/:id1/:id2/:id3",
    element:<EditorPage pusher={pusher}/>
  },
  {
    path: "/room/:roomId/:roomCode/meeting",
    element:<MeetingPage pusher={pusher}/>
  },
  {
    path: "/room/temp",
    element:<Temp />
  },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
     <RouterProvider router={router} />
  </Provider>,
)
