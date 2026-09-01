import { apiClient } from '../api/apiClient';
import type { DashboardSummary } from '../types/domain';
import { mapDashboard, type WireDashboard } from './mappers';

export const reportService = {
  /** Occupancy, revenue and today's arrivals for the admin dashboard. */
  async dashboard(): Promise<DashboardSummary> {
    return mapDashboard(
      await apiClient.get<WireDashboard>('/reports/dashboard'),
    );
  },
};
