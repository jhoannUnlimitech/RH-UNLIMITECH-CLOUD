import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('./src/scripts/db-export.json', 'utf-8'));

console.log('=== ROLES ===');
for (const r of data.roles) {
  const perms = (r.permissions || []).map((p: any) => `${p.resource}:${p.action}`);
  console.log(`  ${r.name}: [${perms.join(', ')}]`);
}

console.log('\n=== DIVISIONS ===');
for (const d of data.divisions) {
  console.log(`  ${d.name} (manager: ${d.managerId || 'none'})`);
}

console.log('\n=== EMPLOYEES ===');
for (const e of data.employees) {
  console.log(`  ${e.name} (${e.email}) role:${e.role} div:${e.division} status:${e.status} approve_csw:${e.approve_csw}`);
}

console.log('\n=== BADGES ===');
for (const b of data.badges) {
  console.log(`  ${b.name} | icon:${b.icon} shape:${b.shape} color:${b.color} active:${b.active}`);
}

console.log('\n=== LEVELS ===');
for (const l of data.levels) {
  console.log(`  ${l.name} | order:${l.order} badge:${l.badge} exam:${l.exam || 'none'} active:${l.active}`);
}

console.log('\n=== COURSES ===');
for (const c of data.courses) {
  console.log(`  ${c.name} | level:${c.level} hours:${c.estimatedHours} order:${c.order} active:${c.active}`);
}

console.log('\n=== EXAMS ===');
for (const e of data.exams) {
  console.log(`  ${e.title} | level:${e.level} pass:${e.passingScore}% attempts:${e.maxAttempts} questions:${e.questions?.length || 0}`);
}

console.log('\n=== CALENDAR EVENTS ===');
for (const ev of data.calendarEvents) {
  console.log(`  ${ev.title} | type:${ev.type} date:${ev.startDate?.split('T')[0]}`);
}
