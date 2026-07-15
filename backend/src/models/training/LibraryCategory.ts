import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * LibraryCategory — Categorías jerárquicas de la Biblioteca documental.
 *
 * Estructura de árbol recursivo (parent → self). Las categorías del sistema
 * (isSystem: true) se crean en el seed y no pueden eliminarse.
 * Ejemplos: Cursos, Políticas, Whitepapers, Docs IA, Manuales.
 */

export interface ILibraryCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;                   // Emoji o nombre de ícono
  color?: string;                  // Color hex identificador
  parent?: Types.ObjectId;         // ref: LibraryCategory (null = raíz)
  order: number;                   // Orden entre hermanos
  depth: number;                   // 0 = raíz, 1 = sub, 2 = sub-sub
  isSystem: boolean;               // true = no eliminable (categoría base)
  documentsCount: number;          // Cantidad de docs en esta categoría
  active: boolean;
  createdBy: Types.ObjectId;       // ref: Employee

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

const LibraryCategorySchema = new Schema<ILibraryCategory>({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [250, 'La descripción no puede exceder 250 caracteres']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [20, 'El ícono no puede exceder 20 caracteres']
  },
  color: {
    type: String,
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser hexadecimal válido']
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'LibraryCategory',
    default: null
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  depth: {
    type: Number,
    default: 0,
    min: 0,
    max: 5 // Máximo 5 niveles de profundidad
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  documentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El creador es requerido']
  },
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
LibraryCategorySchema.index({ slug: 1 }, { unique: true });
LibraryCategorySchema.index({ parent: 1, order: 1 });
LibraryCategorySchema.index({ depth: 1, active: 1 });
LibraryCategorySchema.index({ deleted: 1 });

// --- Pre-save: generar slug y calcular depth ---
LibraryCategorySchema.pre('save', async function () {
  // Generar slug si es nuevo o el nombre cambió
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Asegurar unicidad del slug
    const existing = await mongoose.model('LibraryCategory').findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });
    if (existing) {
      this.slug = `${this.slug}-${Date.now().toString(36).slice(-4)}`;
    }
  }

  // Calcular depth basado en parent
  if (this.isNew || this.isModified('parent')) {
    if (!this.parent) {
      this.depth = 0;
    } else {
      const parentDoc = await mongoose.model('LibraryCategory').findById(this.parent);
      this.depth = parentDoc ? parentDoc.depth + 1 : 0;
    }
  }
});

// --- Pre-delete validation: no eliminar categorías del sistema ---
LibraryCategorySchema.pre('save', function () {
  if (this.isSystem && this.deleted) {
    throw new Error('No se puede eliminar una categoría del sistema');
  }
});

// --- Plugin soft delete ---
LibraryCategorySchema.plugin(softDeletePlugin);

export const LibraryCategory = mongoose.model<ILibraryCategory>('LibraryCategory', LibraryCategorySchema);
