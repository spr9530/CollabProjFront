export const addTodo = (data) => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return reject({ error: 'Please Login first' });
        }
        try {
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/todo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                return reject({ error: errorData });
            }

            const responseData = await response.json();
            resolve({ data: responseData });

        } catch (error) {
            reject({ error });
        }
    });
};

export const getTodo = () => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return reject({ error: 'Please Login first' });
        }
        try {
            const response = await fetch('https://collab-project-indol.vercel.app/app/v1/todo/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                return reject({ error: errorData });
            }

            const responseData = await response.json();
            resolve(responseData);

        } catch (error) {
            reject({ error });
        }
    });
};

export const deleteTodo = (todoId) => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return reject({ error: 'Please Login first' });
        }
        try {
            const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/todo/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                return reject({ error: errorData });
            }

            const responseData = await response.json();
            resolve(responseData);

        } catch (error) {
            reject({ error });
        }
    });
};

export const updateTodo = (data, id) => {
    return new Promise(async (resolve, reject) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return reject({ error: 'Please Login first' });
        }
        try {
            const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/todo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                return reject({ error: errorData });
            }

            const responseData = await response.json();
            resolve(responseData);

        } catch (error) {
            reject({ error });
        }
    });
};

