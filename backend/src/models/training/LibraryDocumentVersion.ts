import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * LibraryDocumentVersion — Historial de versiones de documentos.
 *
 * Cada edición de un LibraryDocument crea un snapshot aquí.
 * TTL de 1 año: las versiones antiguas se eliminan automáticamente
 * por MongoDB (el documento actual siempre vive en LibraryDocument.content).
 */

export interface ILibraryDocumentVersion extends Document {
  document: Types.ObjectId;        // ref: LibraryDocument
  version: number;                 // Número de versión
  content: string;                 // Snapshot del contenido Markdown
  editedBy: Types.ObjectId;        // ref: Employee — quién editó
  changeNote?: string;             // Nota del cambio (opcional)
  createdAt: Date;
}

const LibraryDocumentVersionSchema = new Schema<ILibraryDocumentVersion>({
  document: {
    type: Schema.Types.ObjectId,
    ref: 'LibraryDocument',
    required: [true, 'El documento es requerido'],
    index: true
  },
  version: {
    type: Number,
    required: [true, 'La versión es requerida'],
    min: 1
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido']
  },
  editedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El editor es requerido']
  },
  changeNote: {
    type: String,
    trim: true,
    maxlength: [200, 'La nota del cambio no puede exceder 200 caracteres']
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Solo createdAt (inmutable)
  toJSON: {
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// --- Índices ---
// Historial de un documento, más reciente primero
LibraryDocumentVersionSchema.index({ document: 1, version: -1 });
// TTL: eliminar versiones después de 1 año (365 días)
LibraryDocumentVersionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const LibraryDocumentVersion = mongoose.model<ILibraryDocumentVersion>(
  'LibraryDocumentVersion',
  LibraryDocumentVersionSchema
);
