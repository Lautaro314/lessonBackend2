process.on("message", (data) => {

    console.log("Worker iniciado");

    try {

        // simulamos procesamiento pesado
        const processedProducts = data.products.map(product => ({
            ...product,
            processed: true,
            priceWithIVA: product.price * 1.21
        }));

        // enviamos respuesta al proceso principal
        process.send({
            success: true,
            products: processedProducts
        });

    } catch (error) {

        process.send({
            success: false,
            error: "Error procesando productos"
        });
    }
});