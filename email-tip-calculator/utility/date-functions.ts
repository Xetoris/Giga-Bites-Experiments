/**
 * Retrieves a date X number of days in the past.
 *
 * @remarks
 * 	Must provide a positive, non-zero value for the amount of days to move.
 *
 * @param relativeTo - An anchor date to start the calculation from.
 * @param daysAgo - The number of days to calculate days ago.
 *
 * @throws {@link Error}
 * Thrown if an undefined or null date is provided or day count is less than 1.
 */
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

/**
 * Retrieves a date X number of days in the future.
 *
 * @remarks
 * 	Must provide a positive, non-zero value for the amount of days to move.
 *
 * @param relativeTo - An anchor date to start the calculation from.
 * @param daysAhead - The number of days to calculate in the future.
 *
 * @throws {@link Error}
 * Thrown if an undefined or null date is provided or day count is less than 1.
 */
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

/**
 * Converts the date to a query format appropriate for GMail's query format.
 *
 * @param toFormat - The date to convert.
 *
 * @throws {@link Error}
 * Throw if date is undefined or null.
 */
function getQueryFormattedString(toFormat: Date): string {
	if (!toFormat) {
		throw new Error('Invalid date object given.');
	}

	const day = toFormat.getDate();
	const month = toFormat.getMonth() + 1;
	const year = toFormat.getFullYear();

	return `${year}/${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}`;
}

export {
	getRelativeFutureDate,
	getRelativePreviousDate,
	getQueryFormattedString
};
