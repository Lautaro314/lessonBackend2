const users = [];

const getUsers = async () => {
    return users;
}

const getUserById = async (id) => {
    return users.find(user => user.id === id);
}

const createUser = async (userData) => {
    const newUser = {
        id: users.length + 1,
        ...userData
    };
    users.push(newUser);
    return newUser;
}

const updateUser = async (id, userData) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
    }
    users[userIndex] = { ...users[userIndex], ...userData };
    return users[userIndex];
};

const deleteUser = async (id) => {
    const userIndex = users.findIndex(user => user.id === id);
    if(userIndex === -1) {
        throw new Error('Usuario no encontrado');
    }
    return users.splice(userIndex, 1)[0];
}

module.exports = {getUsers , getUserById , createUser , updateUser , deleteUser}

