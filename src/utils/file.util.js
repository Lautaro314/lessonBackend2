// src/utils/file.util.js
const path = require("path");
const fs = require("fs");

// Construye los metadatos que se persisten en la base (nunca el archivo).
const buildFileMetadata = (file, documentType = null) => ({
  original_name: file.originalname,
  filename: file.filename,
  path: path
    .join(path.basename(file.destination), file.filename)
    .split(path.sep)
    .join("/"),
  mimetype: file.mimetype,
  size: file.size,
  document_type: documentType,
  uploaded_at: new Date(),
});

// Elimina del disco un archivo ya subido (evita archivos huérfanos).
const removeUploadedFile = (file) => {
  if (file && file.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      // Si el archivo ya no existe, no hacemos nada.
    }
  }
};

module.exports = { buildFileMetadata, removeUploadedFile };
