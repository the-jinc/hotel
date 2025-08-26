import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default function StatCard({ title, value, icon: Icon, trend, change, color }) {
  const colorVariants = {
    indigo: 'bg-indigo-100 text-indigo-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorVariants[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? (
                    <ArrowUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                  )}
                  <span className="sr-only">{trend === 'up' ? 'Increased' : 'Decreased'} by</span>
                  {change}
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}