import { Schema, model, Document, Types } from 'mongoose';

/**
 * Tipos de acciones en el historial CSW
 */
export enum CSWHistoryAction {
  CREATED = 'created',
  EDITED = 'edited',
  TECH_LEAD_APPROVED = 'tech_lead_approved',
  TECH_LEAD_REJECTED = 'tech_lead_rejected',
  ARCHITECT_APPROVED = 'technical_architect_approved',
  ARCHITECT_REJECTED = 'technical_architect_rejected',
  SOLUTION_ARCHITECT_APPROVED = 'solution_architect_approved',
  SOLUTION_ARCHITECT_REJECTED = 'solution_architect_rejected',
  HR_APPROVED = 'hr_approved',
  HR_REJECTED = 'hr_rejected',
  DELETED = 'deleted'
}

/**
 * Historial inmutable de acciones en solicitudes CSW
 * Registra cada aprobación, rechazo y edición
 */
export interface ICSWHistory extends Document {
  csw_request: Types.ObjectId;     // Referencia a la solicitud CSW
  action_type: CSWHistoryAction;    // Tipo de acción realizada
  
  // Usuario que realizó la acción
  user: Types.ObjectId;
  user_name: string;               // Desnormalizado para historial
  user_role: string;               // Rol del usuario en ese momento
  
  // Detalles de la acción
  comment?: string;                 // Comentario (máx 250 caracteres)
  previous_status?: string;         // Estado anterior
  new_status?: string;              // Nuevo estado
  
  // Metadata
  createdAt: Date;
}

const CSWHistorySchema = new Schema<ICSWHistory>({
  csw_request: {
    type: Schema.Types.ObjectId,
    ref: 'CSW',
    required: true
  },
  
  action_type: {
    type: String,
    enum: Object.values(CSWHistoryAction),
    required: true
  },
  
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  
  user_name: {
    type: String,
    required: true
  },
  
  user_role: {
    type: String,
    required: true
  },
  
  comment: {
    type: String,
    trim: true,
    maxlength: [250, 'El comentario no puede exceder 250 caracteres']
  },
  
  previous_status: String,
  new_status: String
}, {
  timestamps: { createdAt: true, updatedAt: false } // Solo createdAt, no updatedAt (inmutable)
});

// Índices para consultas eficientes
CSWHistorySchema.index({ csw_request: 1, createdAt: -1 });
CSWHistorySchema.index({ user: 1 });
CSWHistorySchema.index({ action_type: 1 });

// Prevenir actualizaciones - el historial es inmutable
CSWHistorySchema.pre('save', function(next) {
  if (!this.isNew) {
    throw new Error('Los registros de historial no pueden ser modificados');
  }
  next();
});

export const CSWHistory = model<ICSWHistory>('CSWHistory', CSWHistorySchema);
