process.on("message", (msg) => {

    console.log("Proceso hijo iniciado");

    let total = 0;

    for (let i = 0; i < 5e9; i++) {
        total += i;
    }

    process.send({
        message: "Tarea completada",
        result: total
    });

    process.exit();
});