import { Document } from 'mongoose';

/**
 * Interface base para todos los modelos
 * Incluye timestamps automáticos y soft delete
 */
export interface IBaseModel extends Document {
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  deletedAt?: Date;
}

/**
 * Opciones base del schema para todos los modelos
 */
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      // Mantener _id como está (MongoDB estándar)
      // Solo eliminar __v
      delete ret.__v;
      return ret;
    }
  }
};

/**
 * Plugin para soft delete
 * Agrega métodos .softDelete() y .restore() a los modelos
 */
export const softDeletePlugin = (schema: any) => {
  // Filtrar automáticamente registros eliminados en queries
  schema.pre(/^find/, function(this: any) {
    if (!this.getOptions().includeDeleted) {
      this.where({ deleted: { $ne: true } });
    }
  });

  // Método para soft delete
  schema.methods.softDelete = async function() {
    this.deleted = true;
    this.deletedAt = new Date();
    return await this.save();
  };

  // Método para restaurar
  schema.methods.restore = async function() {
    this.deleted = false;
    this.deletedAt = undefined;
    return await this.save();
  };
};
