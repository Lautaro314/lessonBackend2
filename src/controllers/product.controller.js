const { fork } = require("child_process");
const path = require("path");

const processProducts = async (req, res) => {

    try {

        const child = fork(
            path.join(__dirname, "../workers/product.worker.js")
        );

        child.send({
            products: [
                {
                    name: "Remera",
                    price: 1000
                },
                {
                    name: "Pantalón",
                    price: 2000
                }
            ]
        });

        child.on("message", (response) => {

            if (!response.success) {
                return res.status(500).json({
                    message: response.error
                });
            }

            res.json({
                message: "Productos procesados correctamente",
                products: response.products
            });
        });

        child.on("error", (error) => {

            console.error(error);

            res.status(500).json({
                message: "Error en el worker"
            });
        });

        child.on("exit", (code) => {
            console.log(`Worker finalizado con código ${code}`);
        });

    } catch (error) {

        res.status(500).json({
            message: "Error del servidor"
        });
    }
};

module.exports = { processProducts };