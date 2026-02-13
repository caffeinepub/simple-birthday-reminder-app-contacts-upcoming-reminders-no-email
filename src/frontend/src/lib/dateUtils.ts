import type { Contact } from '../backend';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatBirthday(month: number, day: number, year?: bigint): string {
  const monthName = MONTH_NAMES[month - 1] || 'Unknown';
  if (year) {
    return `${monthName} ${day}, ${year}`;
  }
  return `${monthName} ${day}`;
}

export function getDaysUntilBirthday(contact: Contact): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let nextBirthday = new Date(currentYear, contact.birthMonth - 1, contact.birthDay);

  if (
    contact.birthMonth < currentMonth ||
    (contact.birthMonth === currentMonth && contact.birthDay < currentDay)
  ) {
    nextBirthday = new Date(currentYear + 1, contact.birthMonth - 1, contact.birthDay);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getNextOccurrence(contact: Contact): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let year = currentYear;
  if (
    contact.birthMonth < currentMonth ||
    (contact.birthMonth === currentMonth && contact.birthDay < currentDay)
  ) {
    year = currentYear + 1;
  }

  const monthName = MONTH_NAMES[contact.birthMonth - 1];
  return `${monthName} ${contact.birthDay}, ${year}`;
}

export function calculateAge(contact: Contact): number | null {
  if (!contact.birthYear) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - Number(contact.birthYear);

  // If birthday hasn't occurred yet this year, subtract 1
  if (
    contact.birthMonth > currentMonth ||
    (contact.birthMonth === currentMonth && contact.birthDay > currentDay)
  ) {
    age -= 1;
  }

  return age;
}

export function calculateAgeAtNextBirthday(contact: Contact): number | null {
  if (!contact.birthYear) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - Number(contact.birthYear);

  // If birthday hasn't occurred yet this year, they'll turn this age
  // If birthday has passed, they'll turn age + 1 next year
  if (
    contact.birthMonth < currentMonth ||
    (contact.birthMonth === currentMonth && contact.birthDay < currentDay)
  ) {
    age += 1;
  }

  return age;
}
