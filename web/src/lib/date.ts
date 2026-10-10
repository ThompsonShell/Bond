const WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

/** Today's date as an Uzbek label (weekday, day-month), e.g. "Dushanba, 5-oktabr", in the app timezone. */
export function formatToday(date = new Date(), timeZone = 'Asia/Tashkent'): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', day: 'numeric', month: 'numeric' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return `${WEEKDAYS[wd]}, ${Number(get('day'))}-${MONTHS[Number(get('month')) - 1]}`;
}
