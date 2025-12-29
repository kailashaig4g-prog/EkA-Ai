import { Dashboard } from '../components/dashboard/Dashboard';
import { VehicleList } from '../components/vehicle/VehicleList';

export const VehiclesPage = () => {
  return (
    <Dashboard>
      <VehicleList />
    </Dashboard>
  );
};
