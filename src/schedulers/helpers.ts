export function getBlackFriday(): number {
    const date = new Date(new Date().getFullYear(), 11, 0);

    while (date.getDay() !== 5) {
        date.setDate(date.getDate() - 1);
    }

    return date.getDate();
}

export function getCyberMondayDate(): string {
    const year = new Date().getFullYear();
    const fridayDate = getBlackFriday();
    const date = new Date(year, 10, fridayDate);

    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
    }

    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0].replaceAll('-', '/');
}
