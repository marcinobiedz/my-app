import 'dotenv/config';
import cron from 'node-cron';
import { sendEmail } from './emailService.js';
import { fetchAvailableApartments } from './apiService.js';
import { logInfo } from './logger.js';

// Importujemy nasze stałe
import { 
  RESORT_MAP, 
  RESORT_IDS, 
  DATE_RANGES, 
  ALERT_RECIPIENTS, 
  ADMIN_EMAIL 
} from './constants.js';

let isTaskRunning = false;

async function checkAvailabilityForRange(resortId: string, range: { from: string, to: string }) {
  const requestDelay = Math.floor(Math.random() * 2000) + 4000;
  await new Promise(resolve => setTimeout(resolve, requestDelay));

  const response = await fetchAvailableApartments(resortId, range.from, range.to, '');

  if (!Array.isArray(response)) {
    if (response && 'error' in response) console.error(`API Error:`, response.error);
    return;
  }

  const available = response.filter(apt =>
    apt.is_available === true &&
    apt.benefit_is_available === false &&
    apt.has_garden_fixed === true &&
    (apt.accommodation_type_id === 1 || apt.accommodation_type_id === 4)
  );

  if (available.length > 0) {
    const resortName = RESORT_MAP[resortId] || `Resort ${resortId}`;
    const msg = `${resortName} (${range.from} - ${range.to}): FOUND ${available.length} GARDEN apartments!`;
    logInfo(msg);

    if (process.env.SHOULD_SEND_EMAIL === 'true') {
      await sendEmail(`GARDEN Alert: ${resortName}`, msg, ALERT_RECIPIENTS);
    }
  }
}

async function performTask() {
  if (isTaskRunning) {
    logInfo("Task already running. Skipping.");
    return;
  }

  isTaskRunning = true;
  logInfo("Task triggered.");

  try {
    const delaySeconds = Math.floor(Math.random() * 120) + 60; // Losowo 60-180 sekund (1-3 minuty)
    logInfo(`Waiting ${delaySeconds} seconds before starting API checks...`);

    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));

    logInfo(`Starting API checks...`);

    for (const resortId of RESORT_IDS) {
      for (const range of DATE_RANGES) {
        try {
          await checkAvailabilityForRange(resortId, range);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error during check:`, message);
        }
      }
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Fatal Error:`, message);
    await sendEmail(`FATAL ERROR: Reservation Bot`, `Task failed: ${message}`, ADMIN_EMAIL);
  } finally {
    isTaskRunning = false;
    logInfo("Task finished.");
  }
}

cron.schedule('*/20 8-22 * * *', () => {
  performTask();
}, {
  timezone: "Europe/Warsaw"
});

logInfo('Service started. Monitoring active daily between 08:00 and 22:40 every 20 minutes.');