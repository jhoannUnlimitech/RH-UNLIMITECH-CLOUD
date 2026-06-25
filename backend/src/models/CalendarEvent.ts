import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;          // Hora inicio "09:00"
  endTime?: string;            // Hora fin "10:00"
  color: 'primary' | 'success' | 'warning' | 'danger';
  type: 'meeting' | 'holiday' | 'reminder' | 'deadline' | 'training' | 'other';
  allDay: boolean;
  link?: string;               // URL del evento (meet, zoom, docs, etc)
  createdBy: Types.ObjectId;
  notifyBefore?: number;       // Minutos antes para notificar (0 = no notificar)
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
  title: { type: String, required: [true, 'El título es requerido'], trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 500 },
  startDate: { type: Date, required: [true, 'La fecha de inicio es requerida'] },
  endDate: { type: Date, required: [true, 'La fecha de fin es requerida'] },
  startTime: { type: String, trim: true },
  endTime: { type: String, trim: true },
  color: { type: String, enum: ['primary', 'success', 'warning', 'danger'], default: 'primary' },
  type: { type: String, enum: ['meeting', 'holiday', 'reminder', 'deadline', 'training', 'other'], default: 'other' },
  allDay: { type: Boolean, default: true },
  link: { type: String, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  notifyBefore: { type: Number, default: 0 },
}, { timestamps: true });

CalendarEventSchema.index({ startDate: 1, endDate: 1 });
CalendarEventSchema.index({ type: 1 });
CalendarEventSchema.index({ createdBy: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
