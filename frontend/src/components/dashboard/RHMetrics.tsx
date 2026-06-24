import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { employeesStore, divisionsStore } from '../../stores/views';
import Badge from '../../components/ui/badge/Badge';

const RHMetrics: React.FC = observer(() => {
  useEffect(() => {
    employeesStore.fetchEmployees();
    divisionsStore.fetchDivisions();
  }, []);

  const employees = Array.isArray(employeesStore.employees) ? employeesStore.employees : [];
  const divisions = Array.isArray(divisionsStore.divisions) ? divisionsStore.divisions : [];
  
  const totalEmployees = employeesStore.pagination?.total || employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
  const totalDivisions = divisions.length;

  const metrics = [
    {
      id: 1,
      title: 'Total Empleados',
      value: totalEmployees.toString(),
      change: `${activeEmployees} activos`,
      direction: 'neutral',
      comparisonText: `${inactiveEmployees} inactivos`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Empleados Activos',
      value: activeEmployees.toString(),
      change: `${((activeEmployees / totalEmployees) * 100).toFixed(1)}%`,
      direction: 'up',
      comparisonText: 'del total',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Divisiones',
      value: totalDivisions.toString(),
      change: `${Math.ceil(totalEmployees / totalDivisions || 0)} prom`,
      direction: 'neutral',
      comparisonText: 'empleados por división',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Empleados Inactivos',
      value: inactiveEmployees.toString(),
      change: `${((inactiveEmployees / totalEmployees) * 100).toFixed(1)}%`,
      direction: 'down',
      comparisonText: 'del total',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  ];

  if (employeesStore.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {metrics.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-theme-sm dark:text-gray-400">
              {item.title}
            </p>
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {item.icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {item.value}
              </h4>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                color={
                  item.direction === 'up'
                    ? 'success'
                    : item.direction === 'down'
                    ? 'error'
                    : 'info'
                }
              >
                <span className="text-xs font-medium">{item.change}</span>
              </Badge>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.comparisonText}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default RHMetrics;
