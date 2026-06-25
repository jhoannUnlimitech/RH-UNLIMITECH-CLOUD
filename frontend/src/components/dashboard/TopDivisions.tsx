import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { divisionsStore, employeesStore } from '../../stores/views';
import { Link } from 'react-router';

const DivisionsList: React.FC = observer(() => {
  useEffect(() => {
    divisionsStore.fetchDivisions();
    employeesStore.fetchEmployees();
  }, []);

  const divisions = Array.isArray(divisionsStore.divisions) ? divisionsStore.divisions : [];
  const employees = Array.isArray(employeesStore.employees) ? employeesStore.employees : [];

  const divisionsWithStats = useMemo(() => {
    return divisions.slice(0, 5).map(division => {
      const divisionEmployees = employees.filter(emp => emp.division?._id === division._id);
      const activeCount = divisionEmployees.filter(emp => emp.status === 'active').length;
      return {
        ...division,
        employeeCount: divisionEmployees.length,
        activeCount,
      };
    });
  }, [divisions, employees]);

  if (divisionsStore.isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded dark:bg-gray-800 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
          Divisiones Principales
        </h4>
        <Link
          to="/divisions"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
        >
          Ver todas
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="space-y-3">
        {divisionsWithStats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay divisiones registradas
          </p>
        ) : (
          divisionsWithStats.map((division) => (
            <Link
              key={division._id}
              to={`/divisions`}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 dark:border-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-500/5 transition-all"
            >
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {division.name}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  {division.description}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                    {division.employeeCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {division.activeCount} activos
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
});

export default DivisionsList;
