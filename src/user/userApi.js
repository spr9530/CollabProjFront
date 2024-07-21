import('dotenv').config

export const checkUser = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/checkUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })

            const data = await response.json()
            resolve({ data });
        } catch (error) {
            reject({ error });
        }
    })
}

export const checkUserName = (userName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const check = await fetch(`https://collab-project-indol.vercel.app/app/v1/user/usernames?userName=${userName}`)

            const unique = await check.json()

            resolve(unique);
        }
        catch (error) {
            console.error('Error checking username:', error);
            reject(false);
        }
    })
}

export const generateUserOtp = async (email) => {
    try {
        const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate OTP');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating OTP:', error.message);
        throw new Error('Failed to generate OTP');
    }
};

export const verifyUserOtp = async ({ otp, email }) => {
    try {
        const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/otp/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const error = new Error('Failed to verify OTP');
            error.response = response;
            throw error;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export const addUser = async (data) => {
    try {
        const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            return new Error(errorResponse.message || 'Failed to add user');
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error adding user:', error.message);
        return new Error('Failed to add user');
    }
};

export const userLogginApi = (userCredentials) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/logginUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userCredentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                reject({ error: errorData });
            } else {
                const data = await response.json();
                resolve({ data });
            }
        } catch (error) {
            reject({ error: 'Internal server error' });
        }
    });
}

export const getUserInfo = async () => {
    const token = localStorage.getItem('token')
    try {
        if (!token) {
            throw new Error('Please Login First')
        }
        const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/getUserInfo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })

        const { userInfo } = await response.json();
        return userInfo
    } catch (error) {
        console.log({ error })
        return ({ error })
    }
}


export const getLoggedUser = () => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token');

        if (!token) {
            return reject({ error: 'Please Login first' });
        }

        try {
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/getUserInfo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const error = await response.json();
                reject(error);
            }

            const data = await response.json();
            resolve({ data });
        } catch (error) {
            reject(error);
        }
    });
};



export const updateUserApi = async (rooms) => {
    const token = localStorage.getItem('token')
    try {
        const updateUser = await fetch('https://collab-project-indol.vercel.app/app/v1/user/updateUser', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rooms
            })
        })
        const data = await updateUser.json()
        return (data)
    } catch (error) {
        console.log(error)
    }
}

export const updateUserRoom = (rooms) => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token');

        if (!token) {
            return reject({ error: 'Please Login first' });
        }

        try {
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/user/updateUser', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rooms })
            });

            if (!response.ok) {
                const error = await response.json();
                return reject(error);
            }

            const data = await response.json();
            resolve({data});
        } catch (error) {
            reject(error);
        }
    });
};





