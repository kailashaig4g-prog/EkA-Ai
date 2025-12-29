import { Dashboard } from '../components/dashboard/Dashboard';

export const DashboardPage = () => {
  return (
    <Dashboard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to EkA-Ai
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get instant answers about your vehicle maintenance and issues
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Vehicles
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your vehicles and track their maintenance history
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Service History
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Keep track of all maintenance and repair records
            </p>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};
