import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { employeesStore } from '../../stores/views';

const EmployeesByStatus: React.FC = observer(() => {
  useEffect(() => {
    employeesStore.fetchEmployees();
  }, []);

  const employees = Array.isArray(employeesStore.employees) ? employeesStore.employees : [];
  const totalEmployees = employeesStore.pagination?.total || employees.length;

  const stats = useMemo(() => {
    const active = employees.filter(emp => emp.status === 'active').length;
    const inactive = employees.filter(emp => emp.status === 'inactive').length;
    const activePercentage = totalEmployees > 0 ? (active / totalEmployees) * 100 : 0;
    const inactivePercentage = totalEmployees > 0 ? (inactive / totalEmployees) * 100 : 0;

    return {
      active,
      inactive,
      activePercentage,
      inactivePercentage,
    };
  }, [employees, totalEmployees]);

  if (employeesStore.isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded dark:bg-gray-800 animate-pulse"></div>
          <div className="h-24 bg-gray-100 rounded dark:bg-gray-800 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Estado de Empleados
      </h4>

      <div className="space-y-6">
        {/* Empleados Activos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Activos
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.active}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({stats.activePercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.activePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Empleados Inactivos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d92d20' }}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Inactivos
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.inactive}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({stats.inactivePercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: '#d92d20',
                width: `${stats.inactivePercentage}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total de Empleados
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalEmployees}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EmployeesByStatus;
