interface DateItem {
	start: string;
	end?: string;
}

interface Stuff {
	name: string;
	title: string;
	price: string;
	image: string;
	dates: DateItem[];
}

interface Row {
	stuff: Stuff;
	mon: string;
	tue: string;
	wed: string;
	thu: string;
	fri: string;
	sat: string;
	sun: string;
}

interface DragPayload {
	sourceRowIndex: number;
	itemIndex: number;
}

interface CurrentDrag {
	originalStart: string;
	originalEnd?: string;
	movingItem: DateItem;
	sourceRowIndex: number;
	itemIndex: number;
	currentRowIndex: number;
}

export const useRentalDrag = (data: { value: Row[] }) => {
	const { showError } = useAppToast();
	const currentDrag = ref<CurrentDrag | null>(null);

	const onDragStart = (payload: DragPayload) => {
		const row = data.value[payload.sourceRowIndex];
		if (!row)
			return;

		const item = row.stuff.dates[payload.itemIndex];
		if (!item)
			return;

		currentDrag.value = {
			originalStart: item.start,
			originalEnd: item.end,
			movingItem: item,
			...payload,
			currentRowIndex: payload.sourceRowIndex,
		};
	};

	const onDragEnter = (rowIndex: number) => {
		if (!currentDrag.value)
			return;
		currentDrag.value.currentRowIndex = rowIndex;
	};

	const onDragEnd = () => {
		const drag = currentDrag.value;
		if (!drag)
			return;

		const sourceRow = data.value[drag.sourceRowIndex];
		const targetRow = data.value[drag.currentRowIndex];
		if (!sourceRow || !targetRow)
			return;

		const movingItem = sourceRow.stuff.dates[drag.itemIndex];
		if (!movingItem)
			return;

		const startDate = new Date(movingItem.start);
		const endDate = new Date(movingItem.end || movingItem.start);

		if (hasOverlap(targetRow.stuff.dates, startDate, endDate, movingItem)) {
			showError();
			movingItem.start = drag.originalStart;
			movingItem.end = drag.originalEnd;
			currentDrag.value = null;
			return;
		}

		// Клонируем массив для реактивности
		const clonedData = JSON.parse(JSON.stringify(data.value));

		const sourceDates = clonedData[drag.sourceRowIndex]?.stuff.dates;
		const targetDates = clonedData[drag.currentRowIndex]?.stuff.dates;
		if (!sourceDates || !targetDates)
			return;

		sourceDates.splice(drag.itemIndex, 1);
		targetDates.push(movingItem);

		data.value = clonedData;
		currentDrag.value = null;
	};

	return { currentDrag, onDragStart, onDragEnter, onDragEnd };
};
