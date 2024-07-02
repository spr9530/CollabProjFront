export const createRoomTask = async (task) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/createTask`, {
      method: 'POST', // Use POST for creating new resources
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
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

export const getUsersTask = ({id1, id2}) => {
  return new Promise(async(resolve, reject) => {
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

export const updateTaskStep = ({ id, taskStep }) => {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem('token');

    try {

      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/updateTaskStep/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
          taskStep
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

export const deleteUserTask = (id) => {
  return new Promise(async(resolve, reject) => {
    const token = localStorage.getItem('token');

    try {

      const response = await fetch(`https://collab-project-indol.vercel.app/app/v1/task/deleteTask/${id}`, {
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

