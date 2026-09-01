import { config } from './config';

/** Money in the hotel's currency, e.g. £264.00. */
export function formatMoney(
  value: number,
  currency: string = config.currency,
): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/** "08 Aug 2026" from an ISO date or date-time. */
export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(config.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(config.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** yyyy-mm-dd for today, in local time - the format the API expects. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);

  return toISODate(date);
}

export function nightsBetween(
  checkIn: string,
  checkOut: string,
): number {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 0;
  }

  return Math.max(0, Math.round((end - start) / 86_400_000));
}
