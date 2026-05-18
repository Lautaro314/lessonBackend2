const { fork } = require("child_process");

// RUTA BLOQUEANTE
const blockingTask = (req, res) => {

    let total = 0;

    for (let i = 0; i < 5e9; i++) {
        total += i;
    }

    res.json({
        message: "Tarea bloqueante terminada",
        result: total
    });
};


// RUTA DELEGADA
const delegatedTask = (req, res) => {

    const child = fork("./src/workers/heavyTask.js");

    child.send("start");

    child.on("message", (data) => {

        res.json({
            message: "Resultado desde proceso hijo",
            data
        });

    });
};

module.exports = { blockingTask, delegatedTask };