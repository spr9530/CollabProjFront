import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import { addUser, checkUserName, generateUserOtp, verifyUserOtp } from './userApi';

function SignUp() {
    const { register, handleSubmit, formState: { errors }, } = useForm();
    // onSubmit={handleSubmit()}

    const [otpDiv, setOtpDiv] = useState('hidden');
    const [otp, setOtp] = useState(null)
    const [otpError, setOtpError] = useState(null)
    const [signUpdate, setsignUpdate] = useState(null)
    const [regiError, setRegiError] = useState(null);

    const navigate = useNavigate();


    const checkUsernameExists = async (username) => {
        const response = await checkUserName(username);
        return response
    };

    const sendOtp = async (data) => {
        setsignUpdate(data)
        const getOtp = await generateUserOtp(data.email)
        if (!getOtp.error) {
            setOtpDiv('visible')
        }
        else console.log(getOtp)
    }

    const verifyOtp = async () => {
        const verify = await verifyUserOtp({ otp, email: signUpdate.email });
        if (verify.error) {
            setOtpError({ error: verify.error })
        }
        else {
            const register = await addUser(signUpdate);
            console.log(register)
            if (register.error) {
              setRegiError(register.error);
            } else {
              navigate('/login'); 
            }
        }
    }

    return (
        <>
            <div >
                <form onSubmit={handleSubmit((data) => sendOtp(data))}>
                    <div className="h-fit flex">
                        <div className="hidden lg:flex w-full lg:w-1/2 login_img_section justify-around items-center">
                            <div className=" bg-black opacity-20 inset-0 z-0">
                            </div>
                            <div className="w-full mx-auto px-20 flex-col items-center space-y-6">
                                <h1 className="text-white font-bold text-4xl font-sans">Simple App</h1>
                                <p className="text-white mt-1">The simplest app to use</p>
                                <div className="flex justify-center lg:justify-start mt-6">
                                    <a href="#" className="hover:bg-indigo-700 hover:text-white hover:-translate-y-1 transition-all duration-500 bg-white text-indigo-800 mt-4 px-4 py-2 rounded-2xl font-bold mb-2">Get Started</a>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full lg:w-1/2 justify-center items-center bg-white space-y-3">
                            <div className="w-full px-8 md:px-32 lg:px-24">
                                <h1 className="text-gray-800 font-bold text-2xl mb-1">Hello Again!</h1>
                                <p className="text-sm font-normal text-gray-600 mb-8">Welcome Back</p>
                                <div className="flex items-center border-2 mb-3 py-2 px-3 rounded-2xl ">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type="text"
                                        className="pl-2 w-full outline-none border-none"
                                        name='name'
                                        {...register("name")}
                                        placeholder='Name' />
                                </div>
                                <div className="flex items-center border-2 mb-3 py-2 px-3 rounded-2xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <input
                                        type="text"
                                        id='userName'
                                        className=" pl-2 w-full outline-none border-none"
                                        name='username'
                                        {...register('username', {
                                            required: 'Username is required',
                                            validate: async (value) => {
                                                const { isUnique } = await checkUsernameExists(value);
                                                console.log(isUnique)
                                                return isUnique || 'Username already exists';
                                            },
                                        })}

                                        placeholder='Username' />
                                    {errors.username && <p>{errors.username.message}</p>}
                                </div>
                                <div className="flex items-center border-2 mb-3 py-2 px-3 rounded-2xl ">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type="email"
                                        id='email'
                                        className="pl-2 w-full outline-none border-none"
                                        name='email'
                                        {...register("email")}
                                        placeholder='Email@xyz.com' />
                                </div>
                                <div className="flex items-center border-2 mb-3 py-2 px-3 rounded-2xl ">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type="password"
                                        id='password'
                                        className="pl-2 w-full outline-none border-none"
                                        name='password'
                                        {...register('password', {
                                            required: 'Password is required',
                                            pattern: {
                                                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                                                message:
                                                    'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character',
                                            },
                                        })}
                                        placeholder='Password' />
                                    {errors.password && <p>{errors.password.message}</p>}
                                </div>
                                <div className="flex items-center border-2 mb-3 py-2 px-3 rounded-2xl ">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type="password"
                                        className="pl-2 w-full outline-none border-none"
                                        name='confirmPassword'
                                        {...register('confirmPassword', {
                                            required: 'Confirm Password is required',
                                            validate: (value) => (
                                                value == password.value || `Passwords do not match`
                                            )
                                        })}
                                        placeholder='Confirm Password' />
                                    {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
                                </div>
                                <div className={`flex items-center border-2 mb-3 py-2 px-3 rounded-2xl ${otpDiv}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type="text"
                                        className="pl-2 w-full outline-none border-none"
                                        name='otp'
                                        onChange={(e) => {setOtp(e.target.value), setOtpError(null)} }
                                        placeholder='--- ---' />

                                    {otpError && <p>{otpError.error}</p>}
                                </div>

                                <button type={otpDiv === 'hidden' ? 'submit' : 'button'} className="block w-full bg-indigo-600 mt-5 py-2 rounded-2xl hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-500 text-white font-semibold mb-2" onClick={otpDiv === 'visible' ? verifyOtp : null} >{otpDiv === 'hidden' ? 'Continue' : 'SignUp'}</button>
                                <div className="flex justify-between mt-4">
                                    <Link to='/Login' className="text-sm ml-2 hover:text-blue-500 cursor-pointer hover:-translate-y-1 duration-500 transition-all">Already have an account? </Link>
                                </div>


                            </div>

                        </div>
                        {regiError && <p>{regiError}</p>}
                    </div>
                </form>
            </div>
        </>
    )
}

export default SignUp