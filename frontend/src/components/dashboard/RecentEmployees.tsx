import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { employeesStore } from '../../stores/views';
import { Link } from 'react-router';
import Badge from '../ui/badge/Badge';
import { getCountryName } from '../../utils/countries';

const RecentEmployees: React.FC = observer(() => {
  useEffect(() => {
    employeesStore.fetchEmployees({ limit: 5, page: 1 });
  }, []);

  const employees = Array.isArray(employeesStore.employees) ? employeesStore.employees : [];
  const recentEmployees = useMemo(() => employees.slice(0, 5), [employees]);

  if (employeesStore.isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
          Empleados Recientes
        </h4>
        <Link
          to="/employees"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
        >
          Ver todos
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="space-y-4">
        {recentEmployees.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay empleados registrados
          </p>
        ) : (
          recentEmployees.map((employee) => (
            <div
              key={employee._id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-shrink-0">
                {employee.photo ? (
                  <img
                    src={employee.photo}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white truncate">
                    {employee.name}
                  </h5>
                  <Badge color={employee.status === 'active' ? 'success' : 'error'} size="sm">
                    {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {employee.role?.name || 'Sin rol'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {employee.division?.name || 'Sin división'}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getCountryName(employee.nationality)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default RecentEmployees;
