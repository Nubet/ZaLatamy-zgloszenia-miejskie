const date = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Warsaw',
});
export function formatDate(value: string) {
  return date.format(new Date(value));
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Operacja nie powiodła się. Spróbuj ponownie.';
}
