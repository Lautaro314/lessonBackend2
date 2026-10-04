const mongoose = require("mongoose");
const config = require("./env.config");

const connectDB = async () => {
    const uri = config.mongodbUri;

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        });
        console.log("Mongo DB conectado!!");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const db = mongoose.connection;

db.on("connected", () => {
    console.log("Conexión exitosa!");
});

db.on("error", (err) => {
    console.error("Error en mongo:", err.message);
});

db.on("disconnected", () => {
    if (mongoose.connection.readyState === 0) {
        console.warn("Mongo desconectado.");
    }
});

// ===============================
// MOCK DE SEQUELIZE
// ===============================

const sequelize = {
    sync: async () => {
        console.log("Base de datos (Sequelize Mock) sincronizada");
        return { alter: true };
    },

    define: (modelName, attributes) => {
        console.log(`Definiendo modelo mock para Sequelize: ${modelName}`);

        const storage = [];

        const Model = {
            findAll: async () => {
                return storage;
            },

            create: async (data) => {
                const item = {
                    id: storage.length + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ...data
                };

                storage.push(item);
                return item;
            },

            findByPk: async (id) => {
                const numericId = Number(id);

                const item = storage.find(i => i.id === numericId);

                if (!item) {
                    return null;
                }

                return {
                    ...item,

                    update: async (newData) => {
                        Object.assign(item, newData);
                        item.updatedAt = new Date();
                        return item;
                    },

                    destroy: async () => {
                        const index = storage.findIndex(i => i.id === numericId);

                        if (index !== -1) {
                            storage.splice(index, 1);
                        }

                        return true;
                    }
                };
            }
        };

        return Model;
    }
};

module.exports = {
    connectDB,
    sequelize
};
