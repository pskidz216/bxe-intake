import { useState, useEffect } from 'react';
import { APPLICATION_LIFETIME_DAYS } from '../utils/constants';

export function useDeadline(expiresAt) {
  const [daysLeft, setDaysLeft] = useState(null);
  const [hoursLeft, setHoursLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    function calc() {
      const now = new Date();
      const exp = new Date(expiresAt);
      const diffMs = exp - now;

      if (diffMs <= 0) {
        setDaysLeft(0);
        setHoursLeft(0);
        setIsExpired(true);
        return;
      }

      setDaysLeft(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      setHoursLeft(Math.floor(diffMs / (1000 * 60 * 60)));
      setIsExpired(false);
    }

    calc();
    const interval = setInterval(calc, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Color coding
  let color = '#16A34A'; // green
  let urgency = 'normal';
  if (daysLeft !== null) {
    if (daysLeft <= 0) { color = '#DC2626'; urgency = 'expired'; }
    else if (daysLeft <= 5) { color = '#DC2626'; urgency = 'critical'; }
    else if (daysLeft <= 10) { color = '#E8871E'; urgency = 'warning'; }
    else if (daysLeft <= 20) { color = '#D97706'; urgency = 'caution'; }
  }

  return { daysLeft, hoursLeft, isExpired, color, urgency };
}
