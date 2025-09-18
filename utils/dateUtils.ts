export const getDateRange = (date: Date = new Date(), rangeType: 'week' | 'week2' | 'month' = 'week') => {
	switch (rangeType) {
		case 'week':
			return getWeekRange(date);
		case 'week2':
			return getTwoWeeksRange(date);
		case 'month':
			return getMonthRange(date);
		default:
			return getWeekRange(date);
	}
};

const getWeekRange = (date: Date) => {
	const day = date.getDay();
	const monday = new Date(date);
	monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	return { start: monday, end: sunday };
	};

const getTwoWeeksRange = (date: Date) => {
	const { start: monday } = getWeekRange(date);
	const tuesday = new Date(monday);
	tuesday.setDate(monday.getDate() + 13);

	return { start: monday, end: tuesday };
};

const getMonthRange = (date: Date) => {
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	return { start: firstDay, end: lastDay };
};

export const formatToLocalizedDate = (date: Date,) => {
	const day = date.getDate();
	const month = date.toLocaleDateString('ru-RU', { month: 'short' });
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
};

export const getFormattedDateRange = (
	date: Date = new Date(),
		rangeType: 'week' | 'week2' | 'month' = 'week',
	) => {
	const { start, end } = getDateRange(date, rangeType);
	const startFormatted = formatToLocalizedDate(start);
	const endFormatted = formatToLocalizedDate(end);
	return `${startFormatted} - ${endFormatted}`;
};

export const getDateRangeObjects = (
		date: Date = new Date(),
		rangeType: 'week' | 'week2' | 'month' = 'week'
	) => {
		return getDateRange(date, rangeType);
};


export const getDaysInRange = (start: Date, end: Date): Date[] => {
	const days: Date[] = [];
	const current = new Date(start);

	while (current <= end) {
		days.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return days;
};

// Форматирование дня для заголовка таблицы: "Пон (15)"
export const formatDayForHeader = (date: Date): string => {
	const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
	const day = date.getDate();
	return `${capitalizeFirstLetter(weekday)}\n${day}`;
};

const capitalizeFirstLetter = (s: string) =>
	s.charAt(0).toUpperCase() + s.slice(1);