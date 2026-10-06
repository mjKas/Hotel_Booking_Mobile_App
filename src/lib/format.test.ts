import {
  addDays,
  formatDate,
  formatDateTime,
  formatMoney,
  nightsBetween,
  todayISO,
  toISODate,
} from './format';

describe('money formatting', () => {
  it('formats values in the hotel currency by default', () => {
    expect(formatMoney(264)).toBe('£264.00');
    expect(formatMoney(0)).toBe('£0.00');
    expect(formatMoney(1234.5)).toBe('£1,234.50');
  });

  it('honours an explicit currency override', () => {
    // en-GB disambiguates non-local currencies, hence "US$" rather than "$".
    expect(formatMoney(264, 'USD')).toBe('US$264.00');
  });

  it('rounds to two decimal places rather than truncating', () => {
    expect(formatMoney(19.999)).toBe('£20.00');
  });
});

describe('date display', () => {
  it('renders an ISO date in the hotel locale', () => {
    expect(formatDate('2026-08-08')).toBe('08 Aug 2026');
  });

  it('accepts a full ISO date-time and shows only the date part', () => {
    expect(formatDate('2026-08-08T14:30:00Z')).toBe('08 Aug 2026');
  });

  it('returns the raw input when the date cannot be parsed', () => {
    // The API occasionally returns nulls as empty strings; the screen should
    // show whatever came back rather than "Invalid Date".
    expect(formatDate('not-a-date')).toBe('not-a-date');
    expect(formatDate('')).toBe('');
  });

  it('renders a date-time with the clock time appended', () => {
    expect(formatDateTime('2026-08-08T14:30:00')).toBe('08 Aug 2026, 14:30');
  });

  it('returns the raw input when a date-time cannot be parsed', () => {
    expect(formatDateTime('nonsense')).toBe('nonsense');
  });
});

describe('ISO date helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 22, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports today in the yyyy-mm-dd form the API expects', () => {
    expect(todayISO()).toBe('2026-08-22');
  });

  it('zero-pads single digit months and days', () => {
    expect(toISODate(new Date(2027, 0, 3, 12, 0, 0))).toBe('2027-01-03');
    expect(toISODate(new Date(2026, 10, 9, 12, 0, 0))).toBe('2026-11-09');
  });

  it('uses local calendar fields rather than UTC', () => {
    // A late-evening local time must not roll forward to the next UTC day.
    expect(toISODate(new Date(2026, 7, 22, 23, 30, 0))).toBe('2026-08-22');
  });
});

describe('addDays', () => {
  it('moves forward across a month boundary', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('moves forward across a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('moves backwards with a negative offset', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('handles a leap day correctly', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('returns the same date when adding zero days', () => {
    expect(addDays('2026-08-22', 0)).toBe('2026-08-22');
  });
});

describe('nightsBetween', () => {
  it('counts whole nights between two stay dates', () => {
    expect(nightsBetween('2026-03-28', '2026-03-31')).toBe(3);
    expect(nightsBetween('2026-08-22', '2026-08-23')).toBe(1);
  });

  it('counts a same-day check-in and check-out as zero nights', () => {
    expect(nightsBetween('2026-08-22', '2026-08-22')).toBe(0);
  });

  it('never returns a negative stay when the dates are reversed', () => {
    expect(nightsBetween('2026-08-23', '2026-08-22')).toBe(0);
  });

  it('returns zero rather than NaN for unparseable dates', () => {
    // A NaN night count would propagate into the price total and render as
    // "£NaN" on the booking screen.
    expect(nightsBetween('not-a-date', '2026-08-22')).toBe(0);
    expect(nightsBetween('2026-08-22', 'not-a-date')).toBe(0);
  });

  it('counts a stay spanning a British Summer Time change as whole nights', () => {
    // 29 March 2026 is the BST transition: that day is only 23 hours long, so
    // a naive millisecond division would report 2.96 nights.
    expect(nightsBetween('2026-03-28', '2026-03-30')).toBe(2);
  });

  it('counts a long multi-month stay', () => {
    expect(nightsBetween('2026-08-22', '2026-10-22')).toBe(61);
  });
});
