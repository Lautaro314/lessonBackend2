const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URL;

    if (!uri) {
        console.error("Falta MONGO_URL en el archivo .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        });
        console.log("Mongo DB conectado!!");
    } catch (error) {

        console.error(error);
        /*
        console.error("\nNo se pudo conectar a MongoDB Atlas.\n");

        if (error.name === "MongooseServerSelectionError") {
            console.error("Causa habitual: tu IP no está permitida en Atlas.");
            console.error("Solución:");
            console.error("  1. Entrá a https://cloud.mongodb.com");
            console.error("  2. Network Access → Add IP Address");
            console.error("  3. Elegí 'Add Current IP Address' (o 0.0.0.0/0 solo para desarrollo)");
            console.error("  4. Esperá 1–2 minutos y volvé a ejecutar: node src/app.js\n");
        } else {
            console.error(error.message);
        }

        process.exit(1);
        */
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

// Mock Sequelize to avoid native binary compilation issues (sqlite3) on Windows/Proxy environments
const sequelize = {
    sync: async () => {
        console.log("Base de datos (Sequelize Mock) sincronizada");
        return { alter: true };
    },
    define: (modelName, attributes) => {
        console.log(`Definiendo modelo mock para Sequelize: ${modelName}`);
        
        // Simple in-memory storage for this model
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
                return storage.find(item => item.id === numericId) || null;
            }
        };
        
        return Model;
    }
};

module.exports = { connectDB, sequelize };
