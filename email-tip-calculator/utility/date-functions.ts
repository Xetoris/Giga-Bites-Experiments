function getRelativePreviousDate(relativeTo: Date, daysAgo: number): Date {
    if (!relativeTo) {
        throw new Error('Invalid date object given.');
    }

    if (daysAgo < 1) {
        throw new Error('Invalid value for `daysAgo`. Must be a value greater than 0.');
    }

    const anchorDate = new Date(relativeTo.getTime());
    anchorDate.setDate(anchorDate.getDate() - daysAgo);

    return anchorDate;
}

function getRelativeFutureDate(relativeTo: Date, daysAhead: number): Date {
    if (!relativeTo) {
        throw new Error('Invalid date object given.');
    }

    if (daysAhead < 1) {
        throw new Error('Invalid value for `daysAhead`. Must be a value greater than 0.');
    }

    const anchorDate = new Date(relativeTo.getTime());
    anchorDate.setDate(anchorDate.getDate() + daysAhead);

    return anchorDate;
}

function getQueryFormattedString(toFormat: Date): string {
    if (!toFormat) {
        throw new Error('Invalid date object given.');
    }

    let day = toFormat.getDate();
    let month = toFormat.getMonth() + 1;
    let year = toFormat.getFullYear();

    return `${year}/${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}`
}

export {
    getRelativeFutureDate,
    getRelativePreviousDate,
    getQueryFormattedString
}
