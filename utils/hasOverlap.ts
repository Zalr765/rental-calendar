interface Interval {
	start: string | Date;
	end?: string | Date;
}

export const hasOverlap = (
	array: Interval[],
	start: Date,
	end: Date,
	excludeItem?: Interval
): boolean => {
	return array.some((d) => {
		if (excludeItem && d.start === excludeItem.start && d.end === excludeItem.end)
			return false;

		const dStart = d.start instanceof Date ? d.start : new Date(d.start);
		const dEnd = d.end instanceof Date ? d.end : new Date(d.end || d.start);

		return !(end <= dStart || start >= dEnd);
	});
}
