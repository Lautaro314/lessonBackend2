const names = ["Lautaro", "Mauro", "Nicolas", "Juan", "María"];
const surnames = ["Nelson", "Carmelo", "Blinckquer", "Gómez", "Pérez"];

const generateMockUser = () => {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];

    return {
        id: Math.floor(Math.random() * 100000),
        name: randomName,
        surname: randomSurname,
        email: `${randomName.toLowerCase()}.${randomSurname.toLowerCase()}@test.com`
    };
};

const generateMockUsers = (quantity = 10) => {
    return Array.from({ length: quantity }, () => generateMockUser());
};

module.exports = {
    generateMockUsers
};