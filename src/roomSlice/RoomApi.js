
export const addRoomData = (data) => {
    return new Promise((resolve, reject) => {
        fetch('https://collab-project-indol.vercel.app/api/v1/room/saveData', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomData: data
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(response.json())
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
    });
};

export const createRoomCode = async () => {
    try {
        const response = await fetch('https://collab-project-indol.vercel.app/app/v1/room/createRoomCode', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.roomCode; 
    } catch (error) {
        console.error('Error creating room code:', error);
        return null; 
    }
};

export const createRoomApi = (info) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/room/createRoom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(
                    info
                )
            })
            const data = await response.json()

            resolve(data)
        } catch (error) {
            reject({ error })
        }
    })
}

export const getRoomData = (roomId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/${roomId}`)
            if (!response.ok) {
                reject({ error: await response.json() })
            }

            const data = await response.json();
            resolve(data);
        } catch (error) {
            reject({ error })
        }
    })
}

export const updateRoomUsers = ({ id2: id, users }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users })
            });

            const data = await response.json();
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

//fetching room 
export const getRoomInfo = async (roomCode) => {
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/${roomCode}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
        if (!response.ok) {
            return ({ error: 'erro in reponse' })
        }

        const data = await response.json();
        return (data);
    } catch (error) {
        return ({ error })
    }
}

export const createRoomFile = ({ name, type, parentId, roomId, path }) => {
    return new Promise(async (resolve, reject) => {
        try {

            const token = localStorage.getItem('token')
            const createFile = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/${roomId}/files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    type,
                    parentId,
                    roomId,
                    path,
                })
            })

            if (!createFile.ok) {
                throw new Error({ error: await response.json() })
            }

            const data = await createFile.json()
            resolve(data)

        } catch (error) {
            reject({ error: error.message })
        }
    })
}

export const getRoomFiles = async ({id1:roomId, parentId}) => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/${roomId}/files/${parentId}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                reject({ error: `Error fetching room files: ${response.statusText}` });
            }

            const files = await response.json();
            console.log(files)
            resolve({files})
        } catch (error) {
            reject({ error: error.message });
        }
    })
};

export const getEditor = async (id) => {
    try {
        console.log('called')
        const fetchEditor = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/getRoomEditor/${id}`)

        const data = await fetchEditor.json();

        return (data)

    } catch (error) {
        return ({ error })
    }
}

export const updateEditor = async ({ id3:id, roomData }) => {
    try {
        const update = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/updateRoomEditors/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomData
            })
        })

        const data = await update.json();

        return (data)


    } catch (error) {
        return ({ error })
    }
}

export const addNewVersion = async ({ id, version, data }) => {
    try {
        const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/updateRoomEditors/version/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version,
                data
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result; // Return the result or status as needed
    } catch (error) {
        console.error('Error adding new version:', error);
        throw error; // Rethrow the error if you want the caller to handle it
    }
};

export const roomPermission = async({roomCode, user})=>{
    const token = localStorage.getItem('token')
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/sendRqst/${roomCode}`,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body:JSON.stringify(user)
        })
        if (!response.ok) {
            return ({ error: 'erro in reponse' })
        }

        const data = await response.json();
        return (data);
    } catch (error) {
        return ({ error })
    }
}

export const rejectPermission = async({userId, roomId}) =>{
    const token = localStorage.getItem('token')
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room//rqst/${roomId}/reject`,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body:JSON.stringify({userId})
        })
        if (!response.ok) {
            return ({ error: 'erro in reponse' })
        }

        const data = await response.json();
        return (data);
    } catch (error) {
        return ({ error })
    }
}

export const acceptPermission = async({userId, roomId}) =>{
    const token = localStorage.getItem('token')
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room//rqst/${roomId}/accept`,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body:JSON.stringify({userId})
        })
        if (!response.ok) {
            return ({ error: 'erro in reponse' })
        }

        const data = await response.json();
        return (data);
    } catch (error) {
        return ({ error })
    }
}

export const downloadFiles = async ({ roomId }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/download/${roomId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            return { error: 'Error in response' };
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `room_${roomId}_structure.zip`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        return { success: true };
    } catch (error) {
        return { error };
    }
};

export const deleteRoom = ({roomId, roomCode}) =>{
    return new Promise(async(resolve, reject) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/room/${roomId}/${roomCode}`,{
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
            if (!response.ok) {
                reject({ error: await response.json() })
            }

            const data = await response.json();
            resolve(data);
        } catch (error) {
            reject({ error })
        }
    })
}