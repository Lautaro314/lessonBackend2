const mockService = require('../services/mocks.service');

const generateMockOrders = async (req, res) => {
    try {
        const mockOrders = await mockService.generateMockOrder();
        res.status(200).json({status:200, message: "Órdenes de prueba generadas exitosamente", data: mockOrders});
    } catch (error) {
        res.status(500).json({status:500, message: "Error al generar órdenes de prueba" , error: error.message});
    }
}

const generateUsers = async (req , res) => {
    try {
        const mockUsers = await mockService.generateUsers();
        res.status(200).json({status:200, message:"Creación de datos falsos de usuarios exitósa!", data:mockUsers})
    } catch (error) {
        res.status(500).json({status:500, message: "Error al crear datos de usuarios", error:error.message})
    }
}

const generateData = async (req, res) => {
    try {
        const data = await mockService.generateData();
        res.status(200).json({status:200, message:"Generación de datos de usuarios y ordenes exitósa!", data:data})
    } catch (error) {
        res.status(500).json({status:500, message:"Error al generar los datos", error:error.message})
    }
}


module.exports = {generateMockOrders, generateUsers , generateData}