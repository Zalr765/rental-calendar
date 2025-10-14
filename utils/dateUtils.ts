// Обнулить часы-минуты
const startOfDay = (date: Date) => {
	const d = new Date(date)
	d.setHours(0, 0, 0, 0)
	return d
}

// Конец дня
const endOfDay = (date: Date) => {
	const d = new Date(date)
	d.setHours(23, 59, 59, 999)
	return d
}

export const getDateRange = (date: Date = new Date(), rangeType:  'day' | 'week' | 'week2' | 'month' = 'week') => {
	switch (rangeType) {
		case 'day':
			return getDayRange(date);
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

const getDayRange = (date: Date) => ({
	start: startOfDay(date),
	end: endOfDay(date)
});

const getWeekRange = (date: Date) => {
	const day = date.getDay();
	const monday = startOfDay(new Date(date));
	monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

  	return { start: startOfDay(monday), end: endOfDay(sunday) };
};

const getTwoWeeksRange = (date: Date) => {
	const { start: monday } = getWeekRange(date);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 13);

  return { start: startOfDay(monday), end: endOfDay(sunday) };
};

const getMonthRange = (date: Date) => {
	const firstDay = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
	const lastDay = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

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
		rangeType: 'day' | 'week' | 'week2' | 'month' = 'week',
	) => {
	const { start, end } = getDateRange(date, rangeType);
	const startFormatted = formatToLocalizedDate(start);
	const endFormatted = formatToLocalizedDate(end);

	if (rangeType === 'day') {
		const dayOfWeek = start.toLocaleDateString('ru-RU', { weekday: 'short' });
		const shortDayName = dayOfWeek.replace('.', '').toLowerCase();
		return `${shortDayName} ${startFormatted}`;
	}
	return `${startFormatted} - ${endFormatted}`;
};

export const getDateRangeObjects = (
		date: Date = new Date(),
		rangeType: 'day' | 'week' | 'week2' | 'month' = 'week'
	) => {
		return getDateRange(date, rangeType);
};


export const getDaysInRange = (
	start: Date,
	end: Date,
	rangeType: 'day' | 'hour' = 'day'
): Date[] => {
	const result: Date[] = [];
	const current = new Date(start);

	if (rangeType === 'hour') {
		while (current <= end) {
			result.push(new Date(current));
			current.setHours(current.getHours() + 1);
		}
	}
	else {
		while (current <= end) {
			result.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}
	}

	return result;
};


export const getDaysAndHoursBetweenDates = (start: Date, end: Date): string => {
	const diffMs = Math.abs(new Date(end).getTime() - new Date(start).getTime());
	const totalHours = diffMs / (1000 * 60 * 60);

	const fullDays = Math.floor(totalHours / 24);
	const remainingHours = Math.round((totalHours % 24) * 10) / 10;
	return formatDaysHours(fullDays, remainingHours);
}

const formatDaysHours = (days: number, hours: number): string => {
	if (days === 0 && hours === 0)
		return '0 часов';
	if (days === 0)
		return `${hours} ${getHoursWord(hours)}`;
	if (hours === 0)
		return `${days} ${getDaysWord(days)}`;

	return `${days} ${getDaysWord(days)}, ${hours} ${getHoursWord(hours)}`;
}

const getDaysWord = (days: number): string => {
	if (days % 10 === 1 && days % 100 !== 11)
		return 'день';
	if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100))
		return 'дня';
	return 'дней';
}

const getHoursWord = (hours: number): string => {
	const intHours = Math.floor(hours);

	if (intHours % 10 === 1 && intHours % 100 !== 11)
		return 'час';
	if ([2, 3, 4].includes(intHours % 10) && ![12, 13, 14].includes(intHours % 100))
		return 'часа';
	return 'часов';
}

// Форматирование дня для заголовка таблицы: "Пон (15)"
export const formatTimeForHeader = (date: Date, mode: 'day' | 'hour' = 'day'): string => {

	if (mode === 'hour') {
		return date.toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			hour12: false,
		})
	}

	const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
	const day = date.getDate();
	return `${capitalizeFirstLetter(weekday)}\n${day}`;
};

export const toLocalDateTime = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export const formatForDatetimeLocal = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const roundToNext10Minutes = (dateStr: string)=> {
	if (!dateStr) return ''
	const date = new Date(dateStr)
	if (isNaN(date.getTime())) return dateStr

	const minutes = date.getMinutes()
	const rounded = Math.ceil(minutes / 10) * 10

	if (rounded === 60) {
		date.setHours(date.getHours() + 1)
		date.setMinutes(0)
	}
	else
		date.setMinutes(rounded)

	date.setSeconds(0)
	date.setMilliseconds(0)
	return formatForDatetimeLocal(date)
}

const capitalizeFirstLetter = (s: string) =>
	s.charAt(0).toUpperCase() + s.slice(1);