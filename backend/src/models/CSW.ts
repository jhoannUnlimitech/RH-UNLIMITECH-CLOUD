import mongoose, { Document, Schema, Types, Model } from 'mongoose';

/**
 * Estado general de la solicitud CSW
 */
export enum CSWStatus {
  PENDING = 'pending',       // Pendiente de aprobación
  APPROVED = 'approved',     // Aprobado por todos
  REJECTED = 'rejected',     // Rechazado por algún nivel
  CANCELLED = 'cancelled'    // Cancelado por el solicitante
}

/**
 * Estado de aprobación de un nivel específico
 */
export enum ApprovalStatus {
  PENDING = 'pending',       // Esperando aprobación
  APPROVED = 'approved',     // Aprobado
  REJECTED = 'rejected'      // Rechazado
}

/**
 * Nivel de aprobación en la cadena
 */
export interface IApproval {
  level: number;                      // Nivel de aprobación (1, 2, 3, ...)
  name: string;                       // Nombre del nivel (ej: "Tech Lead")
  approverId: Types.ObjectId;         // Usuario que debe aprobar
  approverName: string;               // Nombre del aprobador (desnormalizado)
  approverPosition: string;           // Cargo del aprobador
  status: ApprovalStatus;             // Estado de esta aprobación
  approvedAt?: Date;                  // Fecha de aprobación/rechazo
  comments?: string;                  // Comentarios (máx 200 palabras ≈ 1500 caracteres)
}

/**
 * Entrada del historial de acciones
 */
export interface ICSWHistory {
  action: string;                     // 'created', 'edited', 'approved', 'rejected', 'cancelled'
  performedBy: Types.ObjectId;        // Usuario que realizó la acción
  performedByName: string;            // Nombre del usuario (desnormalizado)
  performedAt: Date;                  // Fecha y hora de la acción
  level?: number;                     // Nivel de aprobación (si aplica)
  previousStatus?: string;            // Estado anterior
  newStatus?: string;                 // Nuevo estado
  comments?: string;                  // Comentarios de la acción (máx 200 palabras ≈ 1500 caracteres)
}

/**
 * Solicitud CSW (Canal de Solicitudes de Trabajo)
 */
export interface ICSW extends Document {
  // Campos de la solicitud (máx 200 palabras ≈ 1500 caracteres cada uno)
  situation: string;                  // ¿Qué sucede?
  information: string;                // ¿Qué datos tienes?
  solution: string;                   // ¿Cómo se resuelve?
  
  // Información del solicitante (desnormalizada para historial)
  requester: Types.ObjectId;
  requesterName: string;
  requesterPosition: string;
  requesterDivision: Types.ObjectId;
  
  // Categoría de la solicitud
  category: Types.ObjectId;
  
  // Flujo de aprobación usado
  approvalFlowId: Types.ObjectId;
  
  // Cadena de aprobación (copia del flujo para este CSW)
  approvalChain: IApproval[];
  
  // Estado general
  status: CSWStatus;
  currentLevel: number;               // Nivel actual esperando aprobación
  
  // Historial completo de acciones
  history: ICSWHistory[];
  
  // Soft delete
  deleted: boolean;
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos
  initializeApprovalChain(): Promise<ICSW>;
  approveAtLevel(approverId: Types.ObjectId, level: number, comments?: string): Promise<ICSW>;
  rejectAtLevel(approverId: Types.ObjectId, level: number, comments: string): Promise<ICSW>;
  cancel(requesterId: Types.ObjectId, comments?: string): Promise<ICSW>;
  resetApprovals(editorId: Types.ObjectId, editorName: string): Promise<ICSW>;
  addToHistory(action: string, performedBy: Types.ObjectId, performedByName: string, details?: Partial<ICSWHistory>): void;
}

const ApprovalSchema = new Schema<IApproval>({
  level: {
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
  approverId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  approverName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  approverPosition: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.PENDING
  },
  approvedAt: {
    type: Date
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 1500  // 200 palabras ≈ 1500 caracteres
  }
}, { _id: false });

const HistorySchema = new Schema<ICSWHistory>({
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  performedByName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  performedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  level: {
    type: Number
  },
  previousStatus: {
    type: String,
    trim: true
  },
  newStatus: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 1500  // 200 palabras ≈ 1500 caracteres
  }
}, { _id: false });

const CSWSchema = new Schema<ICSW>({
  situation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1500  // 200 palabras ≈ 1500 caracteres
  },
  information: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1500  // 200 palabras ≈ 1500 caracteres
  },
  solution: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1500  // 200 palabras ≈ 1500 caracteres
  },
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  requesterName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  requesterPosition: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  requesterDivision: {
    type: Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
    index: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'CSWCategory',
    required: true,
    index: true
  },
  approvalFlowId: {
    type: Schema.Types.ObjectId,
    ref: 'ApprovalFlow',
    required: true
  },
  approvalChain: {
    type: [ApprovalSchema],
    default: []
  },
  status: {
    type: String,
    enum: Object.values(CSWStatus),
    default: CSWStatus.PENDING,
    index: true
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  history: {
    type: [HistorySchema],
    default: []
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
CSWSchema.index({ requester: 1, status: 1 });
CSWSchema.index({ status: 1, createdAt: -1 });
CSWSchema.index({ category: 1, status: 1 });
CSWSchema.index({ requesterDivision: 1, status: 1 });
CSWSchema.index({ 'approvalChain.approverId': 1, 'approvalChain.status': 1 });
CSWSchema.index({ deleted: 1, status: 1, createdAt: -1 });

/**
 * Inicializar la cadena de aprobación basada en el flujo de la división
 */
CSWSchema.methods.initializeApprovalChain = async function(): Promise<ICSW> {
  const ApprovalFlow = mongoose.model('ApprovalFlow');
  const Employee = mongoose.model('Employee');
  
  // Obtener el flujo activo de la división
  const flow = await ApprovalFlow.findOne({
    divisionId: this.requesterDivision,
    active: true,
    deleted: false
  }).populate('levels.approverRoleId', 'name')
    .populate('levels.approverUserId', 'name email');
  
  if (!flow) {
    throw new Error('No se encontró un flujo de aprobación activo para esta división');
  }
  
  this.approvalFlowId = flow._id;
  const approvalChain: IApproval[] = [];
  
  // Construir la cadena de aprobación
  for (const level of flow.levels) {
    let approver;
    
    if (level.approverType === 'role') {
      // Buscar empleado con ese rol en la misma división
      approver = await Employee.findOne({
        role: level.approverRoleId,
        division: this.requesterDivision,
        deleted: false
      }).populate('role', 'name');
      
      // Si no hay nadie con ese rol en la división, buscar en cualquier división
      if (!approver) {
        approver = await Employee.findOne({
          role: level.approverRoleId,
          deleted: false
        }).populate('role', 'name');
      }
    } else {
      // Usuario específico
      approver = await Employee.findById(level.approverUserId).populate('role', 'name');
    }
    
    if (!approver) {
      throw new Error(`No se encontró aprobador para el nivel ${level.order}: ${level.name}`);
    }
    
    approvalChain.push({
      level: level.order,
      name: level.name,
      approverId: approver._id,
      approverName: approver.name,
      approverPosition: (approver.role as any)?.name || 'Sin cargo',
      status: ApprovalStatus.PENDING
    });
  }
  
  this.approvalChain = approvalChain;
  this.currentLevel = 1;
  
  // Agregar al historial
  this.addToHistory('created', this.requester, this.requesterName, {
    newStatus: CSWStatus.PENDING,
    comments: 'Solicitud creada'
  });
  
  return await this.save();
};

/**
 * Aprobar en un nivel específico
 */
CSWSchema.methods.approveAtLevel = async function(
  approverId: Types.ObjectId,
  level: number,
  comments?: string
): Promise<ICSW> {
  // Validar que el CSW esté pendiente
  if (this.status !== CSWStatus.PENDING) {
    throw new Error('Solo se pueden aprobar solicitudes pendientes');
  }
  
  // Validar que sea el nivel actual
  if (level !== this.currentLevel) {
    throw new Error(`Solo se puede aprobar el nivel actual (${this.currentLevel})`);
  }
  
  // Buscar la aprobación en la cadena
  const approval = this.approvalChain.find((a: IApproval) => a.level === level);
  if (!approval) {
    throw new Error(`Nivel ${level} no encontrado en la cadena de aprobación`);
  }
  
  // Validar que el usuario sea el aprobador correcto
  if (!approval.approverId.equals(approverId)) {
    throw new Error('No tiene permisos para aprobar en este nivel');
  }
  
  // Validar que esté pendiente
  if (approval.status !== ApprovalStatus.PENDING) {
    throw new Error('Este nivel ya fue procesado');
  }
  
  // Aprobar
  approval.status = ApprovalStatus.APPROVED;
  approval.approvedAt = new Date();
  if (comments) {
    approval.comments = comments.substring(0, 1500);  // 200 palabras ≈ 1500 caracteres
  }
  
  // Agregar al historial
  this.addToHistory('approved', approverId, approval.approverName, {
    level,
    previousStatus: ApprovalStatus.PENDING,
    newStatus: ApprovalStatus.APPROVED,
    comments: approval.comments
  });
  
  // Verificar si es el último nivel
  const isLastLevel = level === this.approvalChain.length;
  
  if (isLastLevel) {
    // Todos aprobaron - cambiar status general a APPROVED
    this.status = CSWStatus.APPROVED;
    this.addToHistory('completed', approverId, approval.approverName, {
      previousStatus: CSWStatus.PENDING,
      newStatus: CSWStatus.APPROVED,
      comments: 'Todos los niveles aprobaron la solicitud'
    });
  } else {
    // Avanzar al siguiente nivel
    this.currentLevel = level + 1;
  }
  
  return await this.save();
};

/**
 * Rechazar en un nivel específico
 */
CSWSchema.methods.rejectAtLevel = async function(
  approverId: Types.ObjectId,
  level: number,
  comments: string
): Promise<ICSW> {
  // Validar que el CSW esté pendiente
  if (this.status !== CSWStatus.PENDING) {
    throw new Error('Solo se pueden rechazar solicitudes pendientes');
  }
  
  // Validar que sea el nivel actual
  if (level !== this.currentLevel) {
    throw new Error(`Solo se puede rechazar el nivel actual (${this.currentLevel})`);
  }
  
  // Validar que se proporcionen comentarios
  if (!comments || comments.trim().length === 0) {
    throw new Error('Los comentarios son obligatorios al rechazar');
  }
  
  // Buscar la aprobación en la cadena
  const approval = this.approvalChain.find((a: IApproval) => a.level === level);
  if (!approval) {
    throw new Error(`Nivel ${level} no encontrado en la cadena de aprobación`);
  }
  
  // Validar que el usuario sea el aprobador correcto
  if (!approval.approverId.equals(approverId)) {
    throw new Error('No tiene permisos para rechazar en este nivel');
  }
  
  // Validar que esté pendiente
  if (approval.status !== ApprovalStatus.PENDING) {
    throw new Error('Este nivel ya fue procesado');
  }
  
  // Rechazar
  approval.status = ApprovalStatus.REJECTED;
  approval.approvedAt = new Date();
  approval.comments = comments.substring(0, 1500);  // 200 palabras ≈ 1500 caracteres
  
  // Cambiar status general a REJECTED
  this.status = CSWStatus.REJECTED;
  
  // Agregar al historial
  this.addToHistory('rejected', approverId, approval.approverName, {
    level,
    previousStatus: CSWStatus.PENDING,
    newStatus: CSWStatus.REJECTED,
    comments: approval.comments
  });
  
  return await this.save();
};

/**
 * Cancelar la solicitud (solo el solicitante)
 */
CSWSchema.methods.cancel = async function(
  requesterId: Types.ObjectId,
  comments?: string
): Promise<ICSW> {
  // Validar que sea el solicitante
  if (!this.requester.equals(requesterId)) {
    throw new Error('Solo el solicitante puede cancelar la solicitud');
  }
  
  // Validar que no esté aprobada
  if (this.status === CSWStatus.APPROVED) {
    throw new Error('No se puede cancelar una solicitud ya aprobada');
  }
  
  const previousStatus = this.status;
  this.status = CSWStatus.CANCELLED;
  
  // Agregar al historial
  this.addToHistory('cancelled', requesterId, this.requesterName, {
    previousStatus,
    newStatus: CSWStatus.CANCELLED,
    comments: comments?.substring(0, 1500)
  });
  
  return await this.save();
};

/**
 * Resetear aprobaciones al editar (solo si está rechazado)
 */
CSWSchema.methods.resetApprovals = async function(
  editorId: Types.ObjectId,
  editorName: string
): Promise<ICSW> {
  // Solo se puede editar si está rechazado
  if (this.status !== CSWStatus.REJECTED) {
    throw new Error('Solo se pueden editar solicitudes rechazadas');
  }
  
  // Validar que sea el solicitante
  if (!this.requester.equals(editorId)) {
    throw new Error('Solo el solicitante puede editar la solicitud');
  }
  
  // Resetear todas las aprobaciones a PENDING
  this.approvalChain.forEach((approval: IApproval) => {
    approval.status = ApprovalStatus.PENDING;
    approval.approvedAt = undefined;
    approval.comments = undefined;
  });
  
  // Resetear estado y nivel
  const previousStatus = this.status;
  this.status = CSWStatus.PENDING;
  this.currentLevel = 1;
  
  // Agregar al historial
  this.addToHistory('edited', editorId, editorName, {
    previousStatus,
    newStatus: CSWStatus.PENDING,
    comments: 'Solicitud editada - todas las aprobaciones reseteadas'
  });
  
  return this;
};

/**
 * Agregar entrada al historial
 */
CSWSchema.methods.addToHistory = function(
  action: string,
  performedBy: Types.ObjectId,
  performedByName: string,
  details?: Partial<ICSWHistory>
): void {
  this.history.push({
    action,
    performedBy,
    performedByName,
    performedAt: new Date(),
    ...details
  });
};

export default mongoose.model<ICSW>('CSW', CSWSchema);
