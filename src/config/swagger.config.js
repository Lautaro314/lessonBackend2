// src/config/swagger.config.js
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ShipNow API - Documentación Oficial",
      version: "1.0.0",
      description: "API backend para la gestión de envíos, pedidos y usuarios, desarrollada con Node.js, Express y MongoDB.",
      contact: {
        name: "Lautaro Frioni",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Servidor Local de Desarrollo",
      },
    ],
    tags: [
      { name: "Users", description: "Operaciones relacionadas con los usuarios del sistema" },
      { name: "Orders", description: "Gestión de pedidos de compra y armado" },
      { name: "Deliveries", description: "Control y seguimiento de entregas logísticas" },
      { name: "Mocks", description: "Generación de datos de prueba y seeding de MongoDB" },
      { name: "Logger", description: "Herramienta interna de validación de niveles de log" },
    ],
    components: {
      schemas: {
        // --- SCHEMAS DE ERROR Y RESPUESTAS ---
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "fail" },
            error: { type: "string", example: "Argumento inválido o faltante" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            payload: { type: "object" },
          },
        },

        // --- SCHEMAS DE NEGOCIO ---
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "650c1234567890abcdef1234" },
            first_name: { type: "string", example: "Juan" },
            last_name: { type: "string", example: "Pérez" },
            email: { type: "string", example: "juan.perez@example.com" },
            role: { type: "string", enum: ["USER", "ADMIN", "DELIVERY"], example: "USER" },
            isDeleted: { type: "boolean", example: false },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            product_name: { type: "string", example: "Licensed Wooden Cheese" },
            quantity: { type: "number", example: 2 },
            price: { type: "number", example: 1500.50 },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "650c567890abcdef12345678" },
            user: { type: "string", example: "650c1234567890abcdef1234" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            total: { type: "number", example: 3001.00 },
            status: { type: "string", enum: ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"], example: "PENDING" },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], example: "MEDIUM" },
            shipping_address: { type: "string", example: "Av. Siempre Viva 742" },
            isDeleted: { type: "boolean", example: false },
          },
        },
        Delivery: {
          type: "object",
          properties: {
            _id: { type: "string", example: "650c99998888777766665555" },
            order: { type: "string", example: "650c567890abcdef12345678" },
            delivery_driver: { type: "string", example: "650c1234567890abcdef9999" },
            tracking_code: { type: "string", example: "TRK-987654321" },
            status: { type: "string", example: "PENDING" },
            isDeleted: { type: "boolean", example: false },
          },
        },
      },
    },
    paths: {
      // --- ENDPOINTS DE USUARIOS ---
      "/api/v1/users": {
        get: {
          summary: "Obtener usuarios",
          tags: ["Users"],
          responses: {
            "200": {
              description: "Listado de usuarios",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: { type: "array", items: { $ref: "#/components/schemas/User" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Crear usuario",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["first_name", "last_name", "email", "password"],
                  properties: {
                    first_name: { type: "string", example: "Juan" },
                    last_name: { type: "string", example: "Pérez" },
                    email: { type: "string", example: "juan.perez@example.com" },
                    password: { type: "string", example: "secret123" },
                    role: { type: "string", enum: ["USER", "ADMIN", "DELIVERY"], example: "USER" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Usuario creado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "400": {
              description: "Datos inválidos o faltantes",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/v1/users/{id}": {
        get: {
          summary: "Obtener usuario por ID",
          tags: ["Users"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Usuario encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "404": {
              description: "Usuario inexistente",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      // --- ENDPOINTS DE PEDIDOS ---
      "/api/v1/orders": {
        get: {
          summary: "Obtener pedidos",
          tags: ["Orders"],
          responses: {
            "200": {
              description: "Listado de pedidos",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Crear pedido",
          tags: ["Orders"],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } },
          },
          responses: {
            "201": {
              description: "Pedido creado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "400": {
              description: "Datos incompletos (sin items)",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/v1/orders/{id}": {
        get: {
          summary: "Obtener pedido por ID",
          tags: ["Orders"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Pedido encontrado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "404": {
              description: "Pedido inexistente",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
        put: {
          summary: "Actualizar pedido / estado",
          tags: ["Orders"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Pedido actualizado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "400": {
              description: "Estado inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Pedido inexistente",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      // --- ENDPOINTS DE MOCKS ---
      "/api/v1/mocks/users": {
        get: {
          summary: "Obtener usuarios simulados",
          description: "Genera una cantidad específica de usuarios simulados usando Faker sin guardarlos en la base de datos.",
          tags: ["Mocks"],
          parameters: [
            {
              name: "qty",
              in: "query",
              description: "Cantidad de usuarios a simular (debe ser mayor a 0)",
              required: true,
              schema: { type: "integer", example: 3 },
            },
          ],
          responses: {
            "200": {
              description: "Usuarios generados exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Cantidad inválida o parámetro no numérico",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/mocks/orders": {
        get: {
          summary: "Obtener pedidos simulados",
          description: "Genera una lista de pedidos falsos utilizando Faker sin persistencia en MongoDB.",
          tags: ["Mocks"],
          parameters: [
            {
              name: "qty",
              in: "query",
              description: "Cantidad de pedidos a simular",
              required: true,
              schema: { type: "integer", example: 2 },
            },
          ],
          responses: {
            "200": {
              description: "Pedidos generados con éxito",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Order" },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Argumento inválido o faltante",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/mocks/seed": {
        post: {
          summary: "Carga masiva / Seeding de datos dependientes",
          description: "Genera masivamente usuarios, pedidos y entregas en cadena, relacionándolos correctamente y guardándolos en MongoDB.",
          tags: ["Mocks"],
          parameters: [
            {
              name: "qty",
              in: "query",
              description: "Cantidad de elementos base para el seeding",
              required: true,
              schema: { type: "integer", example: 5 },
            },
          ],
          responses: {
            "201": {
              description: "Datos insertados exitosamente en la base de datos",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      insertados: { type: "integer", example: 15 },
                      detalle: {
                        type: "object",
                        properties: {
                          usuarios: { type: "integer", example: 5 },
                          pedidos: { type: "integer", example: 5 },
                          entregas: { type: "integer", example: 5 },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Cantidad inválida",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Error interno de base de datos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      // --- ENDPOINT DEL LOGGER ---
      "/api/v1/test/loggerTest": {
        get: {
          summary: "Prueba de niveles de log (Winston)",
          description: "Herramienta interna de validación para disparar eventos en todos los niveles de severidad (debug, http, info, warning, error, fatal) y verificar la persistencia.",
          tags: ["Logger"],
          responses: {
            "200": {
              description: "Logs generados correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      message: { type: "string", example: "Logs de prueba generados correctamente en todos los niveles." },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // No requiere escaneo externo de archivos si definimos las rutas aquí o se pueden expandir
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpecs;