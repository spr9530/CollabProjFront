import React from 'react'
import { FaHome } from "react-icons/fa";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BiSolidLogInCircle } from "react-icons/bi";

function Navbar() {
  return (
    <>
    <div className='h-[50px] w-full relative p-5 bg-secondaryBackground'>
        <div className='w-full h-full flex justify-between items-center'>
            <div>
                <p className='text-white'>Logo</p>
            </div>
            <div className='h-full'>
                <ul className='h-full w-full flex gap-3 items-center text-white'>
                    <li className='cursor-pointer font-semibold flex gap-1 h-full items-center'><span><FaHome /></span>Home </li>
                    <li className='cursor-pointer font-semibold flex gap-1 h-full items-center'><span><IoPersonCircleSharp /></span> Profile</li>
                    <li className='cursor-pointer font-semibold '><button className='flex gap-1 h-full items-center'> <span><BiSolidLogInCircle /></span> Log In</button></li>
                </ul>
            </div>
        </div>
    </div>
    </>
  )
}

export default Navbar