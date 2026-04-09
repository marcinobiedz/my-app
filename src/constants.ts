import 'dotenv/config';

export const RESORT_MAP: Record<string, string> = {
  '2': 'Ustronie',
  '8': 'Mielno',
  '5': 'Niechorze',
  '7': 'Kołobrzeg',
  '6': 'Rowy',
  '1': 'Pobierowo'
};

export const RESORT_IDS = Object.keys(RESORT_MAP);
const YEAR = 2026;

const MAIN_EMAIL = process.env.EMAIL_TO || '';
export const ADMIN_EMAIL = 'marcin.obiedz@gmail.com';
export const ALERT_RECIPIENTS = [MAIN_EMAIL, ADMIN_EMAIL];

export const DATE_RANGES = [
  { from: `${YEAR}-05-14`, to: `${YEAR}-05-20` },
  ...Array.from({ length: 10 }, (_, i) => {
    const startDay = i + 1;
    const endDay = startDay + 5;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      from: `${YEAR}-09-${pad(startDay)}`,
      to: `${YEAR}-09-${pad(endDay)}`
    };
  })
];