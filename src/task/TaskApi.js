export const createRoomTask = async ({ task, id1, id2 }) => {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return reject('No authentication token found. Please log in.');
    }

    try {
      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/createTask/${id1}/${id2}`, {
        method: 'POST', // Use POST for creating new resources
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return reject(errorData.message || response.statusText);
      }

      const data = await response.json();
      resolve(data);
    } catch (error) {
      reject('Failed to create task: ' + error.message);
    }
  });
};


export const getAllTask = (id) => {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/allTask/${id}`, {
        method: 'GET', // Use POST for creating new resources
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        reject({ error: errorData.message || response.statusText });
      } else {
        const data = await response.json();
        resolve(data);
      }
    } catch (error) {
      console.log(error);
      reject({ error: error.message });
    }
  })
}

export const getUsersTask = ({ id1, id2 }) => {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/userTask/${id1}/${id2}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        reject({ error: errorData.message || response.statusText });
      } else {
        const data = await response.json();
        resolve(data);
      }
    } catch (error) {
      console.log(error);
      reject({ error: error.message });
    }
  })
}

export const updateTask = ({ taskId, data, id1, id2 }) => {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem('token');
    console.log(data)
    try {

      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/updateTaskStep/${taskId}/${id1}/${id2}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
          {data}
        )
      })

      if (!response.ok) {
        const errorData = await response.json();

        reject({ error: errorData.message || response.statusText });
      } else {
        const data = await response.json();
        resolve(data);
      }

    } catch (error) {
      reject({ error: error.message })
    }
  })
}

export const deleteUserTask = ({ taskId, id1, id2 }) => {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem('token');

    try {

      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/deleteTask/${taskId}/${id1}/${id2}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {

        const errorData = await response.json();
        reject({ error: errorData.message || response.statusText });

      } else {

        const data = await response.json();
        resolve(data);

      }

    } catch (error) {
      reject({ error: error.message })
    }
  })
}

export const getUserAllTasks = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/allTask/user/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return reject(errorData);
      }

      const data = await response.json();
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};


