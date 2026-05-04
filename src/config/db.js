const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongo DB conectado!!");
    } catch (error) {
        console.error("Error al hacer la conexión", error)
        process.exit(1)
    }
}

//Eventos
const db = mongoose.connection;

db.on("connected", () => {
    console.log("Conexión exitósa!")
})

db.on("error", (err) => {
    console.log("Error en mongo:", err)
})

db.on("disconnected", () => {
    console.warn("Mongo desconectado, intentando reconectar...");
})

module.exports = connectDB;

//"mongodb+srv://lautaro:Lauta2399@commercecluster.3i4man4.mongodb.net/sesionesDB"


