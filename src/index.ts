import 'dotenv/config';
import cron from 'node-cron';
import { sendEmail } from './emailService.js';
import { fetchAvailableApartments } from './apiService.js';

const RESORT_MAP: Record<string, string> = {
  '2': 'Ustronie',
  '8': 'Mielno',
  '5': 'Niechorze',
  '7': 'Kołobrzeg',
  '6': 'Rowy',
  '1': 'Pobierowo'
};

const RESORT_IDS = Object.keys(RESORT_MAP);
const YEAR = 2026;

const MAIN_EMAIL = process.env.EMAIL_TO || '';
const ADMIN_EMAIL = 'marcin.obiedz@gmail.com';
const ALERT_RECIPIENTS = [MAIN_EMAIL, ADMIN_EMAIL];

const DATE_RANGES = Array.from({ length: 10 }, (_, i) => {
  const startDay = i + 1;
  const endDay = startDay + 5;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    from: `${YEAR}-09-${pad(startDay)}`,
    to: `${YEAR}-09-${pad(endDay)}`
  };
});

let currentTaskId = 0;

async function performTask() {
  const myTaskId = ++currentTaskId;
  const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
  
  console.log(`[${timestamp}] [Task ${myTaskId}] Triggered.`);

  try {
    const delayMinutes = Math.floor(Math.random() * 3) + 1;
    console.log(`[${timestamp}] [Task ${myTaskId}] Waiting ${delayMinutes} min before starting...`);
    
    // Czekanie z możliwością przerwania
    for (let i = 0; i < delayMinutes * 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (myTaskId !== currentTaskId) {
        console.log(`[Task ${myTaskId}] CANCELED (new task started).`);
        return;
      }
    }

    const actualTimestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    console.log(`[${actualTimestamp}] [Task ${myTaskId}] Starting API checks...`);
    
    for (const resortId of RESORT_IDS) {
      for (const range of DATE_RANGES) {
        if (myTaskId !== currentTaskId) {
          console.log(`[Task ${myTaskId}] CANCELED during loop.`);
          return;
        }

        try {
          const requestDelay = Math.floor(Math.random() * 2000) + 4000;
          for (let j = 0; j < requestDelay / 1000; j++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (myTaskId !== currentTaskId) return;
          }

          const response = await fetchAvailableApartments(resortId, range.from, range.to, '');
          
          if (Array.isArray(response)) {
            const available = response.filter(apt => 
              apt.is_available === true && 
              apt.benefit_is_available === false && 
              apt.has_garden_fixed === true &&
              (apt.accommodation_type_id === 1 || apt.accommodation_type_id === 4)
            );
            
            if (available.length > 0) {
              const resortName = RESORT_MAP[resortId] || `Resort ${resortId}`;
              const msg = `${resortName} (${range.from} - ${range.to}): FOUND ${available.length} GARDEN apartments!`;
              console.log(`[Task ${myTaskId}] ${msg}`);
              
              if (process.env.SHOULD_SEND_EMAIL === 'true') {
                await sendEmail(`GARDEN Alert: ${resortName}`, msg, ALERT_RECIPIENTS);
              }
            }
          } else if (response && 'error' in response) {
            console.error(`[Task ${myTaskId}] API Error:`, response.error);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[Task ${myTaskId}] Error:`, message);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Task ${myTaskId}] Fatal Error:`, message);
    await sendEmail(`FATAL ERROR: Reservation Bot`, `Task ${myTaskId} failed: ${message}`, ADMIN_EMAIL);
  } finally {
    if (myTaskId === currentTaskId) {
      console.log(`[Task ${myTaskId}] Finished successfully.`);
    }
  }
}

cron.schedule('*/15 8-22 * * *', () => {
  performTask();
}, {
  timezone: "Europe/Warsaw"
});

console.log('Service started. Monitoring active daily between 08:00 and 22:45 every 15 minutes.');
