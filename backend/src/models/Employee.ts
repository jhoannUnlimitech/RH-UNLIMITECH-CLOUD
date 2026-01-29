import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions, softDeletePlugin } from './base/BaseModel';
import bcrypt from 'bcrypt';

export interface IEmployee extends IBaseModel {
  photo?: string; // Base64 string
  name: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  division: mongoose.Types.ObjectId;
  birthDate: Date;
  nationalId: string;
  phone: string;
  nationality: string;
  managerId?: mongoose.Types.ObjectId;  // Jefe de división (para gestión organizacional)
  techLeadId?: mongoose.Types.ObjectId; // Jefe inmediato (para aprobaciones CSW)
  forcePasswordChange: boolean; // Forzar cambio de contraseña en primer login
  deleted: boolean;
  deletedAt?: Date;
  
  // Métodos
  comparePassword(candidatePassword: string): Promise<boolean>;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

const EmployeeSchema = new Schema<IEmployee>({
  photo: { 
    type: String,
    validate: {
      validator: function(v: string) {
        // Validar que sea base64 válido o esté vacío
        if (!v) return true;
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
      },
      message: 'La foto debe ser una cadena base64 válida con formato: data:image/[tipo];base64,...'
    }
  },
  name: { 
    type: String, 
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en queries por defecto
  },
  role: { 
    type: Schema.Types.ObjectId, 
    ref: 'Role', 
    required: [true, 'El rol es requerido']
  },
  division: { 
    type: Schema.Types.ObjectId, 
    ref: 'Division', 
    required: [true, 'La división es requerida']
  },
  birthDate: { 
    type: Date, 
    required: [true, 'La fecha de nacimiento es requerida']
  },
  nationalId: { 
    type: String, 
    required: [true, 'El número de identificación es requerido'],
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  nationality: { 
    type: String, 
    required: [true, 'La nacionalidad es requerida'],
    trim: true
  },
  managerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee'
  },
  techLeadId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee'
  },
  forcePasswordChange: {
    type: Boolean,
    default: true // Por defecto, forzar cambio de contraseña en primer login
  },
  deleted: { 
    type: Boolean, 
    default: false,
    select: false
  },
  deletedAt: { 
    type: Date,
    select: false
  }
}, baseSchemaOptions);

// Índices
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ nationalId: 1 }, { unique: true });
EmployeeSchema.index({ deleted: 1 });
EmployeeSchema.index({ role: 1 });
EmployeeSchema.index({ division: 1 });

// Hash password antes de guardar
EmployeeSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
EmployeeSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Aplicar plugin de soft delete
EmployeeSchema.plugin(softDeletePlugin);

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
