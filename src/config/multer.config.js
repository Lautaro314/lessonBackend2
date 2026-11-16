// src/config/multer.config.js
// Configuración centralizada de Multer: almacenamiento, nombrado, tipos aceptados,
// tamaño máximo y normalización de errores de carga.
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const logger = require("./logger.config.js");
const CustomError = require("../utils/errors/custom-error.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");
const {
  ALLOWED_FILE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  USER_DOCUMENT_TYPES,
} = require("../constants/index.js");

// Raíz de uploads configurable (en testing se apunta a una carpeta temporal).
const UPLOADS_ROOT =
  process.env.UPLOADS_DIR || path.join(__dirname, "../../uploads");

// Subcarpetas por tipo de archivo
const UPLOAD_FOLDERS = Object.freeze({
  USER_DOCUMENTS: "users",
  LICENSES: "licenses",
  RECEIPTS: "receipts",
});

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Creamos la estructura de carpetas al inicializar
Object.values(UPLOAD_FOLDERS).forEach((folder) => {
  ensureDir(path.join(UPLOADS_ROOT, folder));
});

// Genera un nombre único preservando la extensión original
const buildFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  return `${unique}${ext}`;
};

const buildStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const target =
        typeof folder === "function" ? folder(req) : folder;
      const dest = path.join(UPLOADS_ROOT, target);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (req, file, cb) => cb(null, buildFilename(file.originalname)),
  });

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_MIME_TYPES.includes(file.mimetype)) {
    logger.warning(
      `Intento de carga con tipo no permitido: ${file.mimetype} (${file.originalname})`
    );
    return cb(new CustomError(ERROR_TYPES.INVALID_FILE_TYPE));
  }
  cb(null, true);
};

// Convierte los errores de Multer a los errores del proyecto
const normalizeMulterError = (err) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new CustomError(ERROR_TYPES.FILE_TOO_LARGE);
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return new CustomError(ERROR_TYPES.UNEXPECTED_FIELD);
    }
    return new CustomError(ERROR_TYPES.INVALID_ARGUMENT);
  }
  return err;
};

// Fábrica de middlewares de carga. `folder` puede ser un string o una función(req).
const createUploader = (fieldName, folder) => {
  const upload = multer({
    storage: buildStorage(folder),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter,
  });

  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return next(normalizeMulterError(err));
      }
      next();
    });
  };
};

// Resuelve la carpeta del documento de usuario según el tipo enviado
const resolveUserDocumentFolder = (req) => {
  const documentType = (req.body?.document_type || "").toUpperCase();
  return documentType === USER_DOCUMENT_TYPES.LICENSE
    ? UPLOAD_FOLDERS.LICENSES
    : UPLOAD_FOLDERS.USER_DOCUMENTS;
};

// Middlewares listos para usar en los routers
const uploadUserDocument = createUploader("document", resolveUserDocumentFolder);
const uploadOrderReceipt = createUploader("receipt", UPLOAD_FOLDERS.RECEIPTS);

module.exports = {
  UPLOADS_ROOT,
  UPLOAD_FOLDERS,
  createUploader,
  uploadUserDocument,
  uploadOrderReceipt,
};
