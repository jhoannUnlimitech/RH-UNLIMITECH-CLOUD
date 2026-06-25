import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color: 'primary' | 'success' | 'warning' | 'danger';
  type: 'meeting' | 'holiday' | 'reminder' | 'deadline' | 'other';
  allDay: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
  title: { type: String, required: [true, 'El título es requerido'], trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 500 },
  startDate: { type: Date, required: [true, 'La fecha de inicio es requerida'] },
  endDate: { type: Date, required: [true, 'La fecha de fin es requerida'] },
  color: { type: String, enum: ['primary', 'success', 'warning', 'danger'], default: 'primary' },
  type: { type: String, enum: ['meeting', 'holiday', 'reminder', 'deadline', 'other'], default: 'other' },
  allDay: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
}, { timestamps: true });

CalendarEventSchema.index({ startDate: 1, endDate: 1 });
CalendarEventSchema.index({ type: 1 });
CalendarEventSchema.index({ createdBy: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
