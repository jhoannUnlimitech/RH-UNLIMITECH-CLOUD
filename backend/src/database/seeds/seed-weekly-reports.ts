import mongoose from 'mongoose';
import { config } from '../../config/env';
import { WeeklyReport } from '../../models/WeeklyReport';
import { Employee } from '../../models/Employee';

/**
 * Seed de reportes semanales — 8 semanas para QA y Developers
 */
async function run() {
  await mongoose.connect(config.mongodb.uri);
  await WeeklyReport.deleteMany({});

  // Buscar empleados
  const jhoann = await Employee.findOne({ name: /Jhoann/i });
  const jair = await Employee.findOne({ name: /Jair/i });
  const wenser = await Employee.findOne({ name: /Wenser/i });
  const moises = await Employee.findOne({ name: /Moises/i });

  if (!jhoann) { console.log('❌ Empleados no encontrados'); process.exit(1); }

  // Generar fechas de 8 semanas (jueves a miércoles)
  const weeks: { start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const end = new Date(now);
    end.setDate(end.getDate() - (i * 7));
    // Ajustar al miércoles
    while (end.getDay() !== 3) end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // Jueves anterior
    weeks.push({ start, end });
  }
  weeks.reverse();

  // QA data (Jhoann)
  const qaData = [
    { commits_qa: 7, acs_validated: 110, acs_automated: 125, acs_pending: 19, automation_rate: 100 },
    { commits_qa: 8, acs_validated: 120, acs_automated: 135, acs_pending: 16, automation_rate: 100 },
    { commits_qa: 5, acs_validated: 85, acs_automated: 90, acs_pending: 25, automation_rate: 100 },
    { commits_qa: 10, acs_validated: 178, acs_automated: 195, acs_pending: 12, automation_rate: 100 },
    { commits_qa: 6, acs_validated: 98, acs_automated: 110, acs_pending: 22, automation_rate: 100 },
    { commits_qa: 8, acs_validated: 140, acs_automated: 160, acs_pending: 15, automation_rate: 100 },
    { commits_qa: 7, acs_validated: 132, acs_automated: 145, acs_pending: 18, automation_rate: 100 },
    { commits_qa: 9, acs_validated: 155, acs_automated: 181, acs_pending: 20, automation_rate: 100 },
  ];

  // QA data (Jair)
  const qaData2 = [
    { commits_qa: 5, acs_validated: 80, acs_automated: 95, acs_pending: 14, automation_rate: 100 },
    { commits_qa: 6, acs_validated: 95, acs_automated: 108, acs_pending: 11, automation_rate: 100 },
    { commits_qa: 4, acs_validated: 70, acs_automated: 78, acs_pending: 20, automation_rate: 100 },
    { commits_qa: 7, acs_validated: 130, acs_automated: 148, acs_pending: 9, automation_rate: 100 },
    { commits_qa: 5, acs_validated: 88, acs_automated: 100, acs_pending: 17, automation_rate: 100 },
    { commits_qa: 6, acs_validated: 105, acs_automated: 120, acs_pending: 12, automation_rate: 100 },
    { commits_qa: 5, acs_validated: 92, acs_automated: 105, acs_pending: 15, automation_rate: 100 },
    { commits_qa: 7, acs_validated: 118, acs_automated: 135, acs_pending: 13, automation_rate: 100 },
  ];

  // Dev data (Wenser - Designer/Frontend)
  const devData = [
    { gross_insertions: 1450, deletions: 350, self_churn: 140, net_insertions: 1310, uip_per_day: 262, commits: 18, working_days: 5 },
    { gross_insertions: 1680, deletions: 400, self_churn: 160, net_insertions: 1520, uip_per_day: 304, commits: 20, working_days: 5 },
    { gross_insertions: 1320, deletions: 310, self_churn: 130, net_insertions: 1190, uip_per_day: 238, commits: 16, working_days: 5 },
    { gross_insertions: 1750, deletions: 450, self_churn: 170, net_insertions: 1580, uip_per_day: 316, commits: 21, working_days: 5 },
    { gross_insertions: 980, deletions: 200, self_churn: 80, net_insertions: 900, uip_per_day: 225, commits: 12, working_days: 4 },
    { gross_insertions: 2100, deletions: 510, self_churn: 220, net_insertions: 1880, uip_per_day: 376, commits: 27, working_days: 5 },
    { gross_insertions: 1560, deletions: 380, self_churn: 150, net_insertions: 1410, uip_per_day: 282, commits: 19, working_days: 5 },
    { gross_insertions: 1890, deletions: 420, self_churn: 180, net_insertions: 1710, uip_per_day: 342, commits: 23, working_days: 5 },
  ];

  // Dev data (Moises - Architect)
  const devData2 = [
    { gross_insertions: 890, deletions: 200, self_churn: 70, net_insertions: 820, uip_per_day: 164, commits: 11, working_days: 5 },
    { gross_insertions: 1100, deletions: 280, self_churn: 90, net_insertions: 1010, uip_per_day: 202, commits: 14, working_days: 5 },
    { gross_insertions: 750, deletions: 180, self_churn: 60, net_insertions: 690, uip_per_day: 138, commits: 9, working_days: 5 },
    { gross_insertions: 1300, deletions: 320, self_churn: 110, net_insertions: 1190, uip_per_day: 238, commits: 16, working_days: 5 },
    { gross_insertions: 680, deletions: 150, self_churn: 50, net_insertions: 630, uip_per_day: 158, commits: 8, working_days: 4 },
    { gross_insertions: 1450, deletions: 350, self_churn: 130, net_insertions: 1320, uip_per_day: 264, commits: 18, working_days: 5 },
    { gross_insertions: 960, deletions: 230, self_churn: 80, net_insertions: 880, uip_per_day: 176, commits: 12, working_days: 5 },
    { gross_insertions: 1200, deletions: 300, self_churn: 100, net_insertions: 1100, uip_per_day: 220, commits: 15, working_days: 5 },
  ];

  let count = 0;

  for (let i = 0; i < 8; i++) {
    // Jhoann QA
    if (jhoann) {
      const r = new WeeklyReport({ employeeId: jhoann._id, weekStart: weeks[i].start, weekEnd: weeks[i].end, type: 'qa', qa_metrics: qaData[i] });
      await r.save(); count++;
    }
    // Jair QA
    if (jair) {
      const r = new WeeklyReport({ employeeId: jair._id, weekStart: weeks[i].start, weekEnd: weeks[i].end, type: 'qa', qa_metrics: qaData2[i] });
      await r.save(); count++;
    }
    // Wenser Dev
    if (wenser) {
      const r = new WeeklyReport({ employeeId: wenser._id, weekStart: weeks[i].start, weekEnd: weeks[i].end, type: 'developer', dev_metrics: devData[i] });
      await r.save(); count++;
    }
    // Moises Dev (architect also codes)
    if (moises) {
      const r = new WeeklyReport({ employeeId: moises._id, weekStart: weeks[i].start, weekEnd: weeks[i].end, type: 'developer', dev_metrics: devData2[i] });
      await r.save(); count++;
    }
  }

  console.log(`✅ ${count} reportes semanales creados (8 semanas × 4 empleados)`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
