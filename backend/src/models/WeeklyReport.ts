import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Reporte semanal de productividad
 * Período: Jueves a Miércoles
 */
export interface IWeeklyReport extends Document {
  employeeId: Types.ObjectId;
  weekStart: Date;
  weekEnd: Date;
  type: 'qa' | 'developer';

  qa_metrics?: {
    commits_qa: number;
    acs_validated: number;
    acs_automated: number;
    acs_pending: number;
    automation_rate: number;
  };

  dev_metrics?: {
    gross_insertions: number;
    deletions: number;
    self_churn: number;
    net_insertions: number;
    uip_per_day: number;
    commits: number;
    working_days: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const WeeklyReportSchema = new Schema<IWeeklyReport>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  type: { type: String, enum: ['qa', 'developer'], required: true },

  qa_metrics: {
    commits_qa: Number,
    acs_validated: Number,
    acs_automated: Number,
    acs_pending: Number,
    automation_rate: Number,
  },

  dev_metrics: {
    gross_insertions: Number,
    deletions: Number,
    self_churn: Number,
    net_insertions: Number,
    uip_per_day: Number,
    commits: Number,
    working_days: Number,
  },
}, { timestamps: true });

WeeklyReportSchema.index({ employeeId: 1, weekStart: -1 });

export const WeeklyReport = mongoose.model<IWeeklyReport>('WeeklyReport', WeeklyReportSchema);
