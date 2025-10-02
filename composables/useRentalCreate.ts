const MS_IN_DAY  = 1000 * 60 * 60 * 24
const MS_IN_HOUR = 1000 * 60 * 60

export const useRentalCreate = (
	cellWidth: Ref<number>,
	props: any,
	stuff: Ref<any>,
	openPopup: any,
) => {
	const { showError } = useAppToast()
	const creating = ref(false)

	let createStartX = 0
	let createAnchorDate: Date | null = null
	let newItemIndex: number | null = null

	// === helpers ===
	const reset = () => {
		creating.value   = false
		newItemIndex     = null
		createAnchorDate = null
		window.removeEventListener('mousemove', onContainerMove)
		window.removeEventListener('mouseup', onContainerUp)
	}

	const calcLeft = (date: Date) =>
		((date.getTime() - new Date(props.range.start).getTime()) / MS_IN_DAY) * cellWidth.value

	// === handlers ===
	const onContainerDown = (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest('.ui-drag-resize__item'))
			return

		createStartX = e.clientX
		const rangeStart = new Date(props.range.start)

		const offsetDays  = (e.offsetX / cellWidth.value) * MS_IN_DAY
		createAnchorDate  = new Date(rangeStart.getTime() + offsetDays)
		createAnchorDate.setMinutes(0, 0, 0)

		const rangeEnd = new Date(props.range.end)
		if (createAnchorDate < rangeStart || createAnchorDate > rangeEnd)
			return

		creating.value = true
		window.addEventListener('mousemove', onContainerMove)
		window.addEventListener('mouseup', onContainerUp)
	}

	const onContainerMove = (e: MouseEvent) => {
		if (!creating.value || !createAnchorDate) return

		const deltaPx    = e.clientX - createStartX
		const hoursMoved = Math.round(deltaPx / (cellWidth.value / 24))
		if (hoursMoved === 0) return

		if (newItemIndex === null) {
			stuff.value?.dates?.push({
				start: createAnchorDate,
				end: new Date(createAnchorDate.getTime() + MS_IN_HOUR),
				name: 'New Rent',
				status: 'reservation',
			})
			newItemIndex = stuff.value?.dates.length - 1
		}

		const item = stuff.value?.dates[newItemIndex!]
		const rangeEnd  = new Date(props.range.end).getTime()
		const rangeStart= new Date(props.range.start).getTime()

		if (hoursMoved > 0) {
			item.end = new Date(createAnchorDate.getTime() + hoursMoved * MS_IN_HOUR)
			if (item.end.getTime() > rangeEnd) item.end = new Date(rangeEnd)
		}
		else {
			item.start = new Date(createAnchorDate.getTime() + hoursMoved * MS_IN_HOUR)
			if (item.start.getTime() < rangeStart)
				item.start = new Date(rangeStart)
		}
	}

	const onContainerUp = () => {
		if (creating.value && newItemIndex !== null) {
			const item = stuff.value?.dates[newItemIndex]

			if (hasOverlap(stuff.value?.dates, item.start, item.end, item)) {
				stuff.value?.dates.splice(newItemIndex, 1)
				showError()
			}
			else {
				// финализируем — переводим в строки
				item.start = new Date(item.start).toISOString()
				item.end   = new Date(item.end).toISOString()
			}
		}
		reset()
	}

	const onContainerDblClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest('.ui-drag-resize__item'))
			return

		const rangeStart = new Date(props.range.start)
		const rangeEnd   = new Date(props.range.end)

		const dayIndex = Math.floor(e.offsetX / cellWidth.value)
		const dayStart = new Date(rangeStart.getTime() + dayIndex * MS_IN_DAY)
		const dayEnd   = new Date(dayStart.getTime() + MS_IN_DAY)

		if (dayStart < rangeStart || dayEnd > rangeEnd) return

		const newItem = {
			start: dayStart.toISOString(),
			end: dayEnd.toISOString(),
			name: 'New Rent',
			status: 'reservation',
			open: true,
		}

		if (hasOverlap(stuff.value?.dates, new Date(newItem.start), new Date(newItem.end), newItem))
			return showError()

		stuff.value?.dates?.push(newItem);
		const item = stuff.value?.dates[stuff.value?.dates.length -1];
		openPopup({ item: item, stuff: stuff.value, action: 'create' })
	}

	return { onContainerDown, onContainerUp, onContainerMove, onContainerDblClick }
}
