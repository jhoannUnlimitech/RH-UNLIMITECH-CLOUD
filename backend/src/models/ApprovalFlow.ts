import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Tipo de aprobador en el flujo
 */
export enum ApproverType {
  ROLE = 'role',   // Aprobador por rol (ej: "Tech Lead")
  USER = 'user'    // Aprobador específico (ej: "Juan Pérez - CEO")
}

/**
 * Nivel de aprobación en el flujo
 */
export interface IApprovalLevel {
  order: number;                      // Orden del nivel (1, 2, 3, ...)
  name: string;                       // Nombre descriptivo (ej: "Tech Lead")
  approverType: ApproverType;         // Tipo de aprobador
  approverRoleId?: Types.ObjectId;    // ID del rol (si tipo es 'role')
  approverUserId?: Types.ObjectId;    // ID del usuario (si tipo es 'user')
  required: boolean;                  // Si es obligatorio
  autoApprove: boolean;               // Si se auto-aprueba (para casos especiales)
}

/**
 * Flujo de aprobación configurado para una división
 */
export interface IApprovalFlow extends Document {
  divisionId: Types.ObjectId;         // División a la que pertenece
  name: string;                       // Nombre del flujo
  description: string;                // Descripción
  levels: IApprovalLevel[];           // Niveles de aprobación ordenados
  active: boolean;                    // Si está activo
  isDefault: boolean;                 // Si es el flujo por defecto
  
  // Soft delete
  deleted: boolean;
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalLevelSchema = new Schema<IApprovalLevel>({
  order: {
    type: Number,
    required: true,
    min: 1
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  approverType: {
    type: String,
    enum: Object.values(ApproverType),
    required: true
  },
  approverRoleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: function(this: IApprovalLevel) {
      return this.approverType === ApproverType.ROLE;
    }
  },
  approverUserId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: function(this: IApprovalLevel) {
      return this.approverType === ApproverType.USER;
    }
  },
  required: {
    type: Boolean,
    default: true
  },
  autoApprove: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const ApprovalFlowSchema = new Schema<IApprovalFlow>({
  divisionId: {
    type: Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  levels: {
    type: [ApprovalLevelSchema],
    required: true,
    validate: {
      validator: function(levels: IApprovalLevel[]) {
        // Validar que los niveles estén ordenados correctamente
        if (levels.length === 0) return false;
        
        const orders = levels.map(l => l.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
          if (orders[i] !== i + 1) return false;
        }
        return true;
      },
      message: 'Los niveles deben estar ordenados secuencialmente comenzando en 1'
    }
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices compuestos
ApprovalFlowSchema.index({ divisionId: 1, active: 1, deleted: 1 });
ApprovalFlowSchema.index({ isDefault: 1, deleted: 1 });

// Validar que solo haya un flujo activo por división
ApprovalFlowSchema.pre('save', async function() {
  if (this.isNew || this.isModified('active')) {
    if (this.active && !this.deleted) {
      const existingFlow = await this.model('ApprovalFlow').findOne({
        divisionId: this.divisionId,
        active: true,
        deleted: false,
        _id: { $ne: this._id }
      });
      
      if (existingFlow) {
        // Desactivar el flujo anterior
        await this.model('ApprovalFlow').updateOne(
          { _id: existingFlow._id },
          { active: false }
        );
      }
    }
  }
});

// Métodos estáticos útiles
ApprovalFlowSchema.statics.getActiveFlowByDivision = async function(divisionId: Types.ObjectId) {
  return await this.findOne({
    divisionId,
    active: true,
    deleted: false
  }).populate('levels.approverRoleId', 'name')
    .populate('levels.approverUserId', 'name email');
};

ApprovalFlowSchema.statics.getDefaultFlow = async function() {
  return await this.findOne({
    isDefault: true,
    active: true,
    deleted: false
  });
};

export default mongoose.model<IApprovalFlow>('ApprovalFlow', ApprovalFlowSchema);
