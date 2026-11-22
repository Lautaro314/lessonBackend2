// src/constants/index.js

const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
  DELIVERY: "DELIVERY", // Repartidor
});

const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: "AVAILABLE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
});

const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
});

const ORDER_PRIORITY = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
});

// Tipos de documento aceptados para los archivos de usuario
const USER_DOCUMENT_TYPES = Object.freeze({
  DNI: "DNI",
  LICENSE: "LICENSE",
  PASSPORT: "PASSPORT",
  PROOF_OF_ADDRESS: "PROOF_OF_ADDRESS",
});

// MIME types permitidos para la carga de archivos
const ALLOWED_FILE_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

// Tamaño máximo permitido por archivo (5 MB)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Tope de generación/seed de datos simulados por request
const MAX_MOCK_ITEMS = 100;

module.exports = {
  ROLES,
  PRODUCT_STATUS,
  ORDER_STATUS,
  ORDER_PRIORITY,
  USER_DOCUMENT_TYPES,
  ALLOWED_FILE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_MOCK_ITEMS,
};