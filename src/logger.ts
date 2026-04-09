export const logInfo = (value: string) => {
    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    console.log(`[${timestamp}] ${value}`);
}