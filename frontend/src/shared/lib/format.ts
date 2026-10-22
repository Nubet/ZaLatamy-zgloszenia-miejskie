const dateFormat = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
});
export function formatDate(value: string) {
    return dateFormat.format(new Date(value));
}
