const ROW_HEIGHT = 119
const MS_IN_DAY  = 1000 * 60 * 60 * 24
const MS_IN_HOUR = 1000 * 60 * 60


export const useDrag = (
	items: Ref<any[]>,
	cellWidth: Ref<number>,
	props: any,
	emit: any,
	stuff: Ref<any>
) => {
	const draggingIndex = ref<number | null>(null)
	const containerRef  = ref<HTMLDivElement | null>(null)
	const { showError } = useAppToast()

	let origStartISO: string | null = null;
	let origEndISO: string | null   = null;
	let startLeft: number			= 0;
	let startX: number				= 0;

	const getScrollContainer = (): HTMLElement | null => {
		return document.querySelector('.rental-calendar-table .flex-1') as HTMLElement | null
	}
	const autoScrollX = (newLeft: number, viewWidth: number) => {
		const container = getScrollContainer()
		if (!container) return

		const visibleLeft = container.scrollLeft
		const visibleRight = visibleLeft + container.clientWidth

		const elementLeft = newLeft
		const elementRight = newLeft + viewWidth


		if (elementRight > visibleRight - 50)
			container.scrollLeft += cellWidth.value
		else if (elementLeft < visibleLeft + 50)
			container.scrollLeft -= cellWidth.value
	}

	const getRange = () => {
		const start = new Date(props.range.start)
		const end = new Date(props.range.end)

		const extraOffset = props.hiddenDays ?? 0
		const isSingleDay = end.getTime() - start.getTime() < MS_IN_DAY * 1.1

		end.setTime(end.getTime() +1 + extraOffset * (isSingleDay ? MS_IN_HOUR : MS_IN_DAY))

		return { start, end }
	}

	const onMouseDown = (e: MouseEvent, viewIndex: number) => {
		const view = items.value[viewIndex];
		const item = stuff.value.dates[view.srcIndex];

		if (!view)
			return

		if (e.detail === 2) {
			emit('openPopup', { item: item, stuff: stuff.value, action: 'edit' })
			return
		}

		const src = stuff.value?.dates?.[view.srcIndex]
		if (!src)
			return

		const { start, end } = getRange();

		if (new Date(src.start) < start || new Date(src.end).getTime() > new Date(end).getTime() +1) {
			showError()
			return
		}

		draggingIndex.value = viewIndex;
		startLeft			= view.left;
		startX 				= e.clientX;

		origStartISO = src.start;
		origEndISO   = src.end;

		src.__zIndex = 10
		src.__open   = false

		emit('dragstart', {
			currentRowIndex: props.row?.index,
			sourceRowIndex:  props.row?.index,
			itemIndex:       view.srcIndex,
		})

		window.addEventListener('pointermove', onMouseMove)
		window.addEventListener('pointerup', onMouseUp)
	}

	const onMouseMove = (e: PointerEvent) => {
			if (draggingIndex.value === null)
				return

			const view = items.value[draggingIndex.value];
			if (!view || !containerRef.value)
				return;

			const src = stuff.value?.dates?.[view.srcIndex];
			if (!src)
				return;

			const { start, end } = getRange();

			const deltaX = e.clientX - startX;

			const rangeDuration = end.getTime() - start.getTime();
			const isSingleDay   = rangeDuration < MS_IN_DAY * 1.1;

			const totalCells = rangeDuration / (isSingleDay ? MS_IN_HOUR : MS_IN_DAY);
			const maxLeft = totalCells * cellWidth.value - view.width;

			const newLeft = Math.min(Math.max(startLeft + deltaX, 0), maxLeft);
			autoScrollX(newLeft, view.width)

			const origStart = origStartISO ? new Date(origStartISO) : new Date(src.start);
			const duration = new Date(src.end).getTime() - new Date(src.start).getTime();
			let newStart: Date;

			if (isSingleDay) {
				const hoursFromStart = (newLeft - startLeft) / cellWidth.value;
				const minutesOffset = hoursFromStart * 60;
				const snappedMinutes = Math.round(minutesOffset / 10) * 10;
				newStart = new Date(origStart.getTime() + snappedMinutes * 60 * 1000);
			}
			else {
				const daysFromStart = (newLeft - startLeft) / cellWidth.value;
				const hoursOffset = Math.round(daysFromStart * 24);
				newStart = new Date(origStart.getTime() + hoursOffset * MS_IN_HOUR);
				newStart.setMinutes(origStart.getMinutes(), origStart.getSeconds(), origStart.getMilliseconds());
			}

			let newEnd = new Date(newStart.getTime() + duration);
			if (newEnd >= end)
				newEnd.setHours(0, 0, 0, 0);

			src.start = newStart.toISOString();
			src.end = newEnd.toISOString();

			// --- движение по Y ---
			const rect = containerRef.value.getBoundingClientRect();
			const relativeY = e.clientY - rect.top + containerRef.value.scrollTop;
			let rowIndex = Math.floor(relativeY / ROW_HEIGHT);

			const sourceRowIndex = props.dragging?.value?.sourceRowIndex ?? 0;
			const currentRowIndex = props.dragging?.value?.currentRowIndex ?? 0;

			const minTop = (0 - sourceRowIndex) * (ROW_HEIGHT + 1) + 40;
			const maxTop = (props.tableLength - 1 - sourceRowIndex) * (ROW_HEIGHT + 1) + 40;

			let newTop = rowIndex * ROW_HEIGHT + 40 + (currentRowIndex - sourceRowIndex);
			if (newTop < minTop)
				newTop = minTop;
			if (newTop > maxTop)
				newTop = maxTop;

			src.__top = newTop;
			src.__rowIndex = rowIndex;
	};

	const onMouseUp = () => {
		if (draggingIndex.value !== null) {
			const view = items.value[draggingIndex.value]
			const src = stuff.value?.dates?.[view?.srcIndex ?? -1]
			if (src) {
				delete src.__top
				delete src.__zIndex
				delete src.__open
			}
		}
		draggingIndex.value = null
		window.removeEventListener('pointermove', onMouseMove)
		window.removeEventListener('pointerup', onMouseUp)
		emit('dragend')
	}

	const onContainerEnter = (e: MouseEvent) => {
		if (!props.dragging?.value)
			return

		const elAtPoint  = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
		const isOverItem = !!(elAtPoint && elAtPoint.closest('.ui-drag-resize__item'))
		if (!isOverItem)
			emit('dragenter', props.row?.index)
	}

	return { containerRef, draggingIndex, onMouseDown, onContainerEnter }
}
