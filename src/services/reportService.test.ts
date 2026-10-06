import { apiClient } from '../api/apiClient';
import type { WireDashboard } from './mappers';
import { reportService } from './reportService';

jest.mock('../api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const api = apiClient as jest.Mocked<typeof apiClient>;

const wireDashboard: WireDashboard = {
  occupancy: {
    occupied: 12,
    available: 6,
    maintenance: 2,
    total_rooms: 20,
    occupancy_rate: 0.6,
  },
  revenue: {
    currency: 'GBP',
    monthly_revenue: 48200,
    previous_month_revenue: 41000,
    average_daily_rate: 176.5,
    by_month: [{ month: '2026-08', revenue: 48200 }],
  },
  total_users: 84,
  active_bookings: 19,
  arrivals_today: 4,
  departures_today: 3,
  recent_bookings: [],
};

describe('dashboard', () => {
  it('requests the admin dashboard report', async () => {
    api.get.mockResolvedValue(wireDashboard);

    await reportService.dashboard();

    expect(api.get).toHaveBeenCalledWith('/reports/dashboard');
  });

  it('returns the camelCase summary the dashboard screen renders', async () => {
    api.get.mockResolvedValue(wireDashboard);

    await expect(reportService.dashboard()).resolves.toEqual({
      occupancy: {
        occupied: 12,
        available: 6,
        maintenance: 2,
        totalRooms: 20,
        occupancyRate: 0.6,
      },
      revenue: {
        currency: 'GBP',
        monthlyRevenue: 48200,
        previousMonthRevenue: 41000,
        averageDailyRate: 176.5,
        byMonth: [{ month: '2026-08', revenue: 48200 }],
      },
      totalUsers: 84,
      activeBookings: 19,
      arrivalsToday: 4,
      departuresToday: 3,
      recentBookings: [],
    });
  });

  it('propagates a permission failure rather than rendering an empty dashboard', async () => {
    // A guest hitting the admin dashboard must see the error state, not a
    // screen full of zeroes.
    api.get.mockRejectedValue(new Error('Administrators only.'));

    await expect(reportService.dashboard()).rejects.toThrow('Administrators only.');
  });
});
