import { IntervalTypeValue, INTERVAL_TYPE } from '../../entities/recurring-invoice.entity';

export type CalculateNextRunInput = {
  intervalType: IntervalTypeValue;
  intervalCount: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOffset?: number;
  hour: number;
  fromDate: Date;
};

export const calculateNextRun = (input: CalculateNextRunInput): Date => {
  const { intervalType, intervalCount, dayOfWeek, dayOfMonth, hour, fromDate } =
    input;

  const next = new Date(fromDate);
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(hour);

  switch (intervalType) {
    case INTERVAL_TYPE.DAY:
      next.setUTCDate(next.getUTCDate() + intervalCount);
      break;

    case INTERVAL_TYPE.WEEK: {
      next.setUTCDate(next.getUTCDate() + 7 * intervalCount);
      if (dayOfWeek !== undefined) {
        const currentDay = next.getUTCDay();
        const diff = dayOfWeek - currentDay;
        next.setUTCDate(next.getUTCDate() + diff);
        if (next <= fromDate) {
          next.setUTCDate(next.getUTCDate() + 7);
        }
      }
      break;
    }

    case INTERVAL_TYPE.MONTH: {
      next.setUTCMonth(next.getUTCMonth() + intervalCount);
      if (dayOfMonth !== undefined) {
        if (dayOfMonth === 0) {
          next.setUTCMonth(next.getUTCMonth() + 1, 0);
        } else {
          const maxDay = new Date(
            Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
          ).getUTCDate();
          next.setUTCDate(Math.min(dayOfMonth, maxDay));
        }
      }
      break;
    }

    case INTERVAL_TYPE.YEAR: {
      next.setUTCFullYear(next.getUTCFullYear() + intervalCount);
      if (input.monthOffset !== undefined) {
        next.setUTCMonth(input.monthOffset);
      }
      if (dayOfMonth !== undefined) {
        if (dayOfMonth === 0) {
          next.setUTCMonth(next.getUTCMonth() + 1, 0);
        } else {
          const maxDay = new Date(
            Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
          ).getUTCDate();
          next.setUTCDate(Math.min(dayOfMonth, maxDay));
        }
      }
      break;
    }
  }

  if (next <= fromDate) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  return next;
};
