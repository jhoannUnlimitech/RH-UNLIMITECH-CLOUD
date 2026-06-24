import mongoose from 'mongoose';
import { Employee } from '../models/Employee';

const countEmployees = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/rh_management');
    console.log('Conectado a MongoDB');

    const count = await Employee.countDocuments();
    console.log(`\n✓ Total de empleados en la base de datos: ${count}\n`);

    const employees = await Employee.find({}, 'name email status').limit(15);
    console.log('Lista de empleados:');
    employees.forEach((emp: any, i: number) => {
      console.log(`${i + 1}. ${emp.name} - ${emp.email} - ${emp.status}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

countEmployees();
