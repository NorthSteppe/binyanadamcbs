import { HDate, HebrewCalendar, flags } from "@hebcal/core";

/**
 * Get the Hebrew date string for a given Gregorian date
 */
export function getHebrewDate(date: Date): string {
  const hd = new HDate(date);
  return hd.renderGematriya();
}

/**
 * Get the Hebrew day number (gematriya) for a given Gregorian date
 */
export function getHebrewDay(date: Date): string {
  const hd = new HDate(date);
  return hd.renderGematriya(true).split(" ")[0]; // Just the day
}

export interface HolidayInfo {
  name: string;
  hebrewName?: string;
  type: "jewish" | "bank";
  emoji: string;
  isYomTov?: boolean;
}

/**
 * Get Jewish holidays for a given Gregorian date
 */
export function getJewishHolidays(date: Date): HolidayInfo[] {
  const hd = new HDate(date);
  const events = HebrewCalendar.getHolidaysOnDate(hd) || [];
  
  return events
    .filter((ev) => {
      const f = ev.getFlags();
      // Include major/minor holidays, Shabbat is handled separately
      return !(f & flags.SHABBAT_MEVARCHIM) && !(f & flags.DAILY_LEARNING);
    })
    .map((ev) => {
      const f = ev.getFlags();
      const isYomTov = !!(f & flags.CHAG);
      let emoji = "✡️";
      if (isYomTov) emoji = "🕎";
      if (f & flags.MINOR_FAST || f & flags.MAJOR_FAST) emoji = "🕯️";
      if (ev.getDesc().includes("Chanukah")) emoji = "🕎";
      if (ev.getDesc().includes("Purim")) emoji = "🎭";
      if (ev.getDesc().includes("Pesach")) emoji = "🍷";
      if (ev.getDesc().includes("Sukkot")) emoji = "🌿";
      if (ev.getDesc().includes("Rosh Hashana")) emoji = "🍎";
      if (ev.getDesc().includes("Yom Kippur")) emoji = "📖";
      if (ev.getDesc().includes("Shavuot")) emoji = "📜";
      if (ev.getDesc().includes("Tu B")) emoji = "🌳";
      if (ev.getDesc().includes("Lag B")) emoji = "🔥";
      if (ev.getDesc().includes("Tish'a")) emoji = "😢";
      if (ev.getDesc().includes("Simchat")) emoji = "🎉";
      if (ev.getDesc().includes("Shmini")) emoji = "🎉";

      return {
        name: ev.render("en"),
        hebrewName: ev.render("he"),
        type: "jewish" as const,
        emoji,
        isYomTov,
      };
    });
}

/**
 * UK Bank Holidays for a given year (static list — covers common fixed + calculated dates)
 * In production you'd fetch from gov.uk API but for reliability we hardcode the rules.
 */
export function getUKBankHolidays(year: number): Map<string, HolidayInfo> {
  const holidays = new Map<string, HolidayInfo>();

  const add = (m: number, d: number, name: string) => {
    const key = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    holidays.set(key, { name, type: "bank", emoji: "🇬🇧" });
  };

  // New Year's Day (1 Jan, or next Monday if weekend)
  let nyd = new Date(year, 0, 1);
  if (nyd.getDay() === 0) nyd = new Date(year, 0, 2);
  if (nyd.getDay() === 6) nyd = new Date(year, 0, 3);
  add(nyd.getMonth() + 1, nyd.getDate(), "New Year's Day");

  // Easter-based holidays (Good Friday, Easter Monday)
  const easter = computeEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  add(goodFriday.getMonth() + 1, goodFriday.getDate(), "Good Friday");
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  add(easterMonday.getMonth() + 1, easterMonday.getDate(), "Easter Monday");

  // Early May bank holiday (first Monday in May)
  const earlyMay = nthWeekday(year, 4, 1, 1);
  add(5, earlyMay, "Early May Bank Holiday");

  // Spring bank holiday (last Monday in May)
  const springBh = lastWeekday(year, 4, 1);
  add(5, springBh, "Spring Bank Holiday");

  // Summer bank holiday (last Monday in August)
  const summerBh = lastWeekday(year, 7, 1);
  add(8, summerBh, "Summer Bank Holiday");

  // Christmas Day (25 Dec, substitute if weekend)
  let xmas = new Date(year, 11, 25);
  if (xmas.getDay() === 0) xmas = new Date(year, 11, 27);
  if (xmas.getDay() === 6) xmas = new Date(year, 11, 27);
  add(xmas.getMonth() + 1, xmas.getDate(), "Christmas Day");

  // Boxing Day (26 Dec, substitute if weekend)
  let boxing = new Date(year, 11, 26);
  if (boxing.getDay() === 0) boxing = new Date(year, 11, 28);
  if (boxing.getDay() === 6) boxing = new Date(year, 11, 28);
  add(boxing.getMonth() + 1, boxing.getDate(), "Boxing Day");

  return holidays;
}

/** Nth weekday of a month (0-indexed month, 1=Monday, 0=Sunday) */
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) {
      count++;
      if (count === n) return d;
    }
  }
  return 1;
}

/** Last weekday of a month */
function lastWeekday(year: number, month: number, weekday: number): number {
  let last = 1;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) last = d;
  }
  return last;
}

/** Compute Easter Sunday using the Anonymous Gregorian algorithm */
function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Get all holidays (Jewish + UK Bank) for a specific date
 */
export function getAllHolidays(date: Date): HolidayInfo[] {
  const jewish = getJewishHolidays(date);
  const bankHolidays = getUKBankHolidays(date.getFullYear());
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const bank = bankHolidays.get(key);
  if (bank) jewish.push(bank);
  return jewish;
}
