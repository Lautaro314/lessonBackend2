// src/models/schemas/file-metadata.schema.js
// Solo se guardan METADATOS del archivo en la base, nunca el archivo en sí.
const { Schema } = require("mongoose");

const fileMetadataSchema = new Schema(
  {
    original_name: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    document_type: { type: String, default: null },
    uploaded_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

module.exports = fileMetadataSchema;
