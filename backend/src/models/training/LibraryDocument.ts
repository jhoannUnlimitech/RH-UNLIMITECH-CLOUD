import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * LibraryDocument — Documentos de la Biblioteca documental.
 *
 * Cada documento pertenece a una categoría y puede contener:
 * - Contenido escrito (Markdown) — type: 'article'
 * - Link externo — type: 'link'
 * - Archivo adjunto (PDF) — type: 'file'
 * - Combinación — type: 'mixed'
 *
 * El contenido siempre se almacena como Markdown (eficiente para IA).
 * El versionado se maneja en LibraryDocumentVersion (snapshot por edición).
 */

export type DocumentType = 'article' | 'link' | 'file' | 'mixed';
export type DocumentVisibility = 'all' | 'specific_roles' | 'specific_divisions';

export interface ILibraryDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;        // ref: LibraryCategory
  type: DocumentType;

  // Contenido (según type)
  content?: string;                // Markdown (article/mixed)
  externalLink?: string;           // URL externa (link/mixed)
  fileUrl?: string;                // URL del archivo subido (file/mixed)
  fileName?: string;               // Nombre original del archivo
  fileMimeType?: string;           // MIME type

  // Metadata
  author: Types.ObjectId;          // ref: Employee — creador
  version: number;                 // Se incrementa en cada edición
  tags: string[];                  // Tags para búsqueda

  // Visibilidad
  visibility: DocumentVisibility;
  visibleToRoles?: Types.ObjectId[];      // ref: Role[] (si specific_roles)
  visibleToDivisions?: Types.ObjectId[];  // ref: Division[] (si specific_divisions)

  // Asociación con Training (opcional, se usa cuando Course exista)
  linkedCourse?: Types.ObjectId;   // ref: Course
  linkedLevel?: Types.ObjectId;    // ref: Level

  // Estado
  published: boolean;
  publishedAt?: Date;
  featured: boolean;               // Destacado en la biblioteca
  order: number;                   // Orden dentro de su categoría
  viewCount: number;               // Contador de vistas

  // Soft delete
  deleted: boolean;
  deletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Métodos
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

const LibraryDocumentSchema = new Schema<ILibraryDocument>({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'LibraryCategory',
    required: [true, 'La categoría es requerida'],
    index: true
  },
  type: {
    type: String,
    enum: ['article', 'link', 'file', 'mixed'],
    required: [true, 'El tipo de documento es requerido'],
    default: 'article'
  },

  // Contenido
  content: {
    type: String,
    default: ''
  },
  externalLink: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'El link debe ser una URL válida (http/https)']
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true,
    maxlength: [255, 'El nombre del archivo no puede exceder 255 caracteres']
  },
  fileMimeType: {
    type: String,
    trim: true
  },

  // Metadata
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El autor es requerido']
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Cada tag no puede exceder 50 caracteres']
  }],

  // Visibilidad
  visibility: {
    type: String,
    enum: ['all', 'specific_roles', 'specific_divisions'],
    default: 'all'
  },
  visibleToRoles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  visibleToDivisions: [{
    type: Schema.Types.ObjectId,
    ref: 'Division'
  }],

  // Asociación Training (refs opcionales, se populan cuando los modelos existan)
  linkedCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  linkedLevel: {
    type: Schema.Types.ObjectId,
    ref: 'Level'
  },

  // Estado
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Soft delete
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// --- Índices ---
LibraryDocumentSchema.index({ category: 1, order: 1, published: 1 });
LibraryDocumentSchema.index({ tags: 1 });
LibraryDocumentSchema.index({ author: 1 });
LibraryDocumentSchema.index({ published: 1, featured: 1 });
LibraryDocumentSchema.index({ linkedCourse: 1 });
LibraryDocumentSchema.index({ deleted: 1 });
// Slug unique solo para documentos no eliminados (partial index)
LibraryDocumentSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deleted: { $ne: true } } });
// Índice de texto para búsqueda por título y tags
LibraryDocumentSchema.index({ title: 'text', tags: 'text' });

// --- Pre-validate: generar slug antes de validación ---
LibraryDocumentSchema.pre('validate', async function () {
  // Generar slug si es nuevo o el título cambió
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Asegurar unicidad del slug (excluyendo soft-deleted)
    const existing = await mongoose.model('LibraryDocument').findOne({
      slug: this.slug,
      _id: { $ne: this._id },
      deleted: { $ne: true },
    });
    if (existing) {
      this.slug = `${this.slug}-${Date.now().toString(36).slice(-4)}`;
    }
  }
});

// --- Pre-save: manejar publishedAt ---
LibraryDocumentSchema.pre('save', function () {
  // Setear publishedAt al publicar por primera vez
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// --- Plugin soft delete ---
LibraryDocumentSchema.plugin(softDeletePlugin);

export const LibraryDocument = mongoose.model<ILibraryDocument>('LibraryDocument', LibraryDocumentSchema);
