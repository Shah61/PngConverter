import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: number;
  total?: string;
  icon?: React.ReactNode;
}

export const StatCard = ({ title, value, trend, total, icon }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {total && <span className="text-gray-400 ml-1 text-sm">/ {total}</span>}
          </div>
          {trend !== undefined && (
            <div className={`mt-2 flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="flex items-center">
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-gray-400 ml-2 text-xs">from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-indigo-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}; 