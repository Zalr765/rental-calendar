const MS_IN_DAY  = 1000 * 60 * 60 * 24
const MS_IN_HOUR = 1000 * 60 * 60
const MS_IN_MIN  = 1000 * 60

export const useRentalCreate = (
	cellWidth: Ref<number>,
	props: any,
	stuff: Ref<any>,
	openPopup: any,
	addColumn: any,
) => {
	const { showError } = useAppToast()
	const creating = ref(false)

	let createStartX = 0
	let createAnchorDate: Date | null = null
	let newItemIndex: number | null = null

	const reset = () => {
		creating.value   = false
		newItemIndex     = null
		createAnchorDate = null
		window.removeEventListener('mousemove', onContainerMove)
		window.removeEventListener('mouseup', onContainerUp)
	}


	const getRange = () => {
		const start = new Date(props.range.start)
		const end = new Date(props.range.end)

		const extraOffset = props.hiddenDays ?? 0
		const isSingleDay = end.getTime() - start.getTime() < MS_IN_DAY * 1.1

		end.setTime(end.getTime() +1 + extraOffset * (isSingleDay ? MS_IN_HOUR : MS_IN_DAY))

		return { start, end }
	}

	const onContainerDown = (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest('.ui-drag-resize__item'))
			return

		const rangeStart    = new Date(props.range.start)
		const rangeEnd      = new Date(props.extraRange.end)
		const rangeDuration = new Date(props.range.end).getTime() - new Date(props.range.start).getTime()
		const isSingleDay = rangeDuration < MS_IN_DAY * 1.1
		createStartX = e.clientX

		if (isSingleDay) {
			console.log(12321);

			const hourWidth = cellWidth.value;
			const hoursFromStart = Math.floor(e.offsetX / hourWidth);
			createAnchorDate = new Date(rangeStart)
			createAnchorDate.setHours(hoursFromStart, 0, 0, 0)

		}
		else {
			const offsetDays = (e.offsetX / cellWidth.value) * MS_IN_DAY
			createAnchorDate = new Date(rangeStart.getTime() + offsetDays)
			createAnchorDate.setMinutes(0, 0, 0)
		}

		if (!createAnchorDate || createAnchorDate < rangeStart || createAnchorDate > rangeEnd)
			return

		creating.value = true
		window.addEventListener('mousemove', onContainerMove)
		window.addEventListener('mouseup', onContainerUp)
	}

	const onContainerMove = (e: MouseEvent) => {
		if (!creating.value || !createAnchorDate)
			return

		const rangeStart = new Date(props.range.start)
		const rangeEnd   = new Date(props.extraRange.end)
		const rangeDuration = new Date(props.range.end).getTime() - new Date(props.range.start).getTime()
		const isSingleDay = rangeDuration < MS_IN_DAY * 1.1

		const deltaPx = e.clientX - createStartX

		// === вычисляем шаг и смещение ===
		const stepPx = isSingleDay ? cellWidth.value / 6 : cellWidth.value / 24;
		const stepMs = isSingleDay ? 10 * MS_IN_MIN : MS_IN_HOUR
		const stepsMoved = Math.round(deltaPx / stepPx)
		if (stepsMoved === 0)
			return

		if (newItemIndex === null) {
			stuff.value?.dates?.push({
				start: createAnchorDate,
				end: new Date(createAnchorDate.getTime() + MS_IN_HOUR),
				name: 'New Rent',
				channel: 'Новый канал',
				client: 'client1',
			})
			newItemIndex = stuff.value?.dates.length - 1
		}

		const item = stuff.value?.dates[newItemIndex!]
		if (!item)
			return

		if (stepsMoved > 0) {
			item.end = new Date(createAnchorDate.getTime() + stepsMoved * stepMs)
			if (item.end.getTime() - createAnchorDate.getTime() < MS_IN_HOUR)
				item.end = new Date(createAnchorDate.getTime() + MS_IN_HOUR)
			if (item.end > rangeEnd.getTime() + 1)
				item.end = new Date(rangeEnd)
		}
		else {
			item.start = new Date(createAnchorDate.getTime() + stepsMoved * stepMs)
			if (item.end.getTime() - item.start.getTime() < MS_IN_HOUR)
				item.start = new Date(item.end.getTime() - MS_IN_HOUR)
			if (item.start < rangeStart)
				item.start = new Date(rangeStart)
		}

		if (item.end >= new Date(getRange().end).getTime())
			addColumn()
	}

	const onContainerUp = () => {
		if (creating.value && newItemIndex !== null) {
			const item = stuff.value?.dates[newItemIndex]
			if (!item)
				return

			if (hasOverlap(stuff.value?.dates, item.start, item.end, item)) {
				stuff.value?.dates.splice(newItemIndex, 1)
				showError()
			}
			else {
				item.start = new Date(item.start).toISOString()
				item.end   = new Date(item.end).toISOString()
				openPopup({ item, stuff: stuff.value, action: 'create' })
			}
		}
		reset()
	}

	const onContainerDblClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest('.ui-drag-resize__item'))
			return

		const rangeStart = new Date(props.range.start)
		const rangeEnd   = new Date(props.range.end)
		const rangeDuration = rangeEnd.getTime() - rangeStart.getTime()
		const isSingleDay = rangeDuration < MS_IN_DAY * 1.1

		let start: Date, end: Date

		if (isSingleDay) {
			const hourWidth = cellWidth.value
			const hoursFromStart = Math.floor(e.offsetX / hourWidth)

			start = new Date(rangeStart)
			start.setHours(hoursFromStart, 0, 0, 0)
			end = new Date(start.getTime() + MS_IN_HOUR)
		}
		else {
			const dayIndex = Math.floor(e.offsetX / cellWidth.value)
			start = new Date(rangeStart.getTime() + dayIndex * MS_IN_DAY)
			end = new Date(start.getTime() + MS_IN_DAY)
		}

		// if (start < rangeStart || end > rangeEnd)
		// 	return

		const newItem = {
			start: start.toISOString(),
			end: end.toISOString(),
			name: 'Новая арендная плата',
			channel: 'Новый канал',
			client: 'client1',
			open: true,
		}

		if (hasOverlap(stuff.value?.dates, new Date(newItem.start), new Date(newItem.end), newItem))
			return showError()

		stuff.value?.dates?.push(newItem)
		const item = stuff.value?.dates[stuff.value?.dates.length - 1]
		openPopup({ item, stuff: stuff.value, action: 'create' })
	}

	return { onContainerDown, onContainerUp, onContainerMove, onContainerDblClick }
}
