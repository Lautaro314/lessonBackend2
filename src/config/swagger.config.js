// src/config/swagger.config.js
const swaggerJSDoc = require("swagger-jsdoc");
const config = require("./env.config.js");

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
        url: config.publicUrl,
        description: `API ShipNow (${config.mode})`,
      },
    ],
    tags: [
      { name: "Users", description: "Operaciones relacionadas con los usuarios del sistema" },
      { name: "Orders", description: "Gestión de pedidos de compra y armado" },
      { name: "Deliveries", description: "Control y seguimiento de entregas logísticas" },
      { name: "Mocks", description: "Generación de datos de prueba y seeding de MongoDB" },
      { name: "Logger", description: "Herramienta interna de validación de niveles de log" },
      { name: "Uploads", description: "Carga de archivos, documentos y comprobantes" },
      { name: "Health", description: "Health check simple de la API" },
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
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer", example: 42 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            totalPages: { type: "integer", example: 3 },
            hasNext: { type: "boolean", example: true },
            hasPrev: { type: "boolean", example: false },
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
        FileMetadata: {
          type: "object",
          description: "Metadatos del archivo persistidos en la base (no el archivo en sí).",
          properties: {
            original_name: { type: "string", example: "dni-frente.jpg" },
            filename: { type: "string", example: "1719000000000-a1b2c3d4e5f6a7b8.jpg" },
            path: { type: "string", example: "users/1719000000000-a1b2c3d4e5f6a7b8.jpg" },
            mimetype: { type: "string", example: "image/jpeg" },
            size: { type: "number", example: 204800 },
            document_type: { type: "string", example: "DNI" },
            uploaded_at: { type: "string", format: "date-time", example: "2026-06-01T12:00:00.000Z" },
          },
        },
      },
      parameters: {
        Page: {
          name: "page",
          in: "query",
          description: "Número de página (desde 1)",
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        Limit: {
          name: "limit",
          in: "query",
          description: "Cantidad de resultados por página (máximo 100)",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    paths: {
      // --- ENDPOINTS DE USUARIOS ---
      "/api/v1/users": {
        get: {
          summary: "Obtener usuarios (paginado)",
          description: "Devuelve como máximo 20 usuarios por página (limit máximo 100). Filtros permitidos: email y role.",
          tags: ["Users"],
          parameters: [
            { $ref: "#/components/parameters/Page" },
            { $ref: "#/components/parameters/Limit" },
            { name: "email", in: "query", schema: { type: "string" } },
            { name: "role", in: "query", schema: { type: "string", enum: ["USER", "ADMIN", "DELIVERY"] } },
          ],
          responses: {
            "200": {
              description: "Listado paginado de usuarios",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: { type: "array", items: { $ref: "#/components/schemas/User" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Paginación o filtro inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
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
      // --- CARGA DE DOCUMENTOS DE USUARIO ---
      "/api/v1/users/{id}/documents": {
        post: {
          summary: "Subir documento de usuario",
          description:
            "Recibe un archivo (multipart/form-data), lo valida, lo guarda en la carpeta correspondiente y registra sus metadatos en la entidad usuario. Si el tipo de documento es LICENSE se guarda en uploads/licenses; el resto en uploads/users.",
          tags: ["Uploads"],
          parameters: [
            { name: "id", in: "path", required: true, description: "ID del usuario", schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["document", "document_type"],
                  properties: {
                    document: {
                      type: "string",
                      format: "binary",
                      description: "Archivo a subir (JPEG, PNG, WEBP o PDF, máx. 5MB)",
                    },
                    document_type: {
                      type: "string",
                      enum: ["DNI", "LICENSE", "PASSPORT", "PROOF_OF_ADDRESS"],
                      description: "Tipo de documento",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Documento cargado y metadatos registrados",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "400": {
              description: "Archivo faltante, tipo inválido, tamaño superado o tipo de documento inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
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
          summary: "Obtener pedidos (paginado)",
          description: "Devuelve como máximo 20 pedidos por página (limit máximo 100). Filtros permitidos: user, status y priority.",
          tags: ["Orders"],
          parameters: [
            { $ref: "#/components/parameters/Page" },
            { $ref: "#/components/parameters/Limit" },
            { name: "user", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"] } },
            { name: "priority", in: "query", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] } },
          ],
          responses: {
            "200": {
              description: "Listado paginado de pedidos",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Paginación o filtro inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
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
      // --- CARGA DE COMPROBANTES DE PEDIDO ---
      "/api/v1/orders/{id}/receipts": {
        post: {
          summary: "Subir comprobante de pedido",
          description:
            "Recibe un archivo (multipart/form-data), valida que el pedido exista, lo guarda en uploads/receipts y registra sus metadatos en la entidad pedido.",
          tags: ["Uploads"],
          parameters: [
            { name: "id", in: "path", required: true, description: "ID del pedido", schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["receipt"],
                  properties: {
                    receipt: {
                      type: "string",
                      format: "binary",
                      description: "Comprobante a subir (JPEG, PNG, WEBP o PDF, máx. 5MB)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Comprobante cargado y asociado al pedido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
            },
            "400": {
              description: "Archivo faltante, tipo inválido, tamaño superado o campo inesperado",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Pedido inexistente",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      // --- ENDPOINTS DE ENTREGAS ---
      "/api/v1/deliveries": {
        get: {
          summary: "Obtener entregas (paginado)",
          description: "Devuelve como máximo 20 entregas por página (limit máximo 100). Filtros permitidos: order, delivery_driver y status.",
          tags: ["Deliveries"],
          parameters: [
            { $ref: "#/components/parameters/Page" },
            { $ref: "#/components/parameters/Limit" },
            { name: "order", in: "query", schema: { type: "string" } },
            { name: "delivery_driver", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"] } },
          ],
          responses: {
            "200": {
              description: "Listado paginado de entregas",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      payload: { type: "array", items: { $ref: "#/components/schemas/Delivery" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Paginación o filtro inválido",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      // --- HEALTH CHECK ---
      "/health": {
        get: {
          summary: "Health check de la API",
          description: "Estado mínimo del proceso: sin secretos, pid, memoria ni datos de base.",
          tags: ["Health"],
          responses: {
            "200": {
              description: "API activa",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      environment: { type: "string", example: "production" },
                      uptime: { type: "number", example: 12.345 },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
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
              description: "Cantidad de usuarios a simular (1 a 100, por defecto 10)",
              required: false,
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
              description: "Cantidad de pedidos a simular (1 a 100, por defecto 10)",
              required: false,
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
              description: "Cantidad de elementos base para el seeding (1 a 100, por defecto 10)",
              required: false,
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