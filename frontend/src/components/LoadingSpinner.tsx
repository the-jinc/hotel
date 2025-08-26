import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullPage = false,
  className = '',
}) {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  const colorClasses = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    light: 'text-gray-300',
    dark: 'text-gray-800',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const spinner = (
    <ArrowPathIcon
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          {spinner}
          <span className="mt-2 text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return spinner;
}