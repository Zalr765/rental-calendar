const MS_IN_HOUR = 1000 * 60 * 60;
const MS_IN_MINUTE = 1000 * 60;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const useResize = (
	items: Ref<any[]>,
	cellWidth: Ref<number>,
	props: any,
	stuff: Ref<any>,
	addColumn: any,
) => {
	const { showError } = useAppToast()
	const resizingSrcIndex = ref<number | null>(null)

	// prev-state
	let resizeStartX = 0
	let prevStartMs  = 0
	let prevWidth    = 0
	let prevEndMs    = 0
	let baseEndMs    = 0
	let prevLeft     = 0
	let accumHours   = 0

	const getRange = () => {
		const start = new Date(props.range.start)
		const end = new Date(props.range.end)

		const extraOffset = props.hiddenDays ?? 0
		const isSingleDay = end.getTime() - start.getTime() < MS_IN_DAY * 1.1

		end.setTime(end.getTime() +1 + extraOffset * (isSingleDay ? MS_IN_HOUR : MS_IN_DAY))

		return { start, end }
	}

	const cleanup = () => {
		resizingSrcIndex.value = null
		window.removeEventListener("mousemove", onResizeMove)
		window.removeEventListener("mouseup", onResizeUp)
	}

	const onResizeDown = (e: MouseEvent, viewIndex: number) => {
			e.preventDefault()
			e.stopPropagation()

			const view = items.value[viewIndex]
			if (!view)
				return

			const src = stuff.value?.dates?.[view.srcIndex]
			if (!src)
				return

			resizingSrcIndex.value = view.srcIndex

			resizeStartX = e.clientX
			prevStartMs  = new Date(src.start).getTime()
			prevWidth    = view.width
			prevEndMs    = new Date(src.end).getTime()
			prevLeft     = view.left ?? 0

			const rangeEndMs = new Date(props.extraRange.end).getTime() + 1
			accumHours = 0
			baseEndMs  = Math.min(prevEndMs, rangeEndMs)

			window.addEventListener("mousemove", onResizeMove)
			window.addEventListener("mouseup", onResizeUp)
	}

	const onResizeMove = (e: MouseEvent) => {
		if (resizingSrcIndex.value === null)
			return
		const src = stuff.value?.dates?.[resizingSrcIndex.value]
		if (!src)
			return

		const rangeStartMs  = new Date(props.range.start).getTime()
		const rangeEndMs    = new Date(props.extraRange.end).getTime() + 1
		// const rangeDuration = rangeEndMs - rangeStartMs
		// const isSingleDay   = rangeDuration < MS_IN_DAY * 1.1
		const rangeDuration = new Date(props.range.end).getTime() + 1 - new Date(props.range.start).getTime()
		const isSingleDay = rangeDuration < MS_IN_DAY * 1.1

		const stepMs   = isSingleDay ? 10 * MS_IN_MINUTE : MS_IN_HOUR
		const unitPx   = isSingleDay ? cellWidth.value / 6 : cellWidth.value / 24
		if (!unitPx)
			return

		const stepsMoved = Math.round((e.clientX - resizeStartX) / unitPx)
		if (stepsMoved === accumHours)
			return

		const startMs = new Date(src.start).getTime()
		let newEndMs  = baseEndMs + stepsMoved * stepMs

		const MIN_BLOCK_MS = MS_IN_HOUR
		const minEndMs = Math.max(startMs + MIN_BLOCK_MS, rangeStartMs + MIN_BLOCK_MS)

		if (newEndMs < minEndMs) {
			if (startMs < rangeStartMs)
				newEndMs = minEndMs
			else {
				const deltaMs = minEndMs - newEndMs
				const newStartMs = Math.max(rangeStartMs, startMs - deltaMs)
				newEndMs  = new Date(src.end).getTime()
				src.start = new Date(newStartMs).toISOString()
			}
		}
		if (newEndMs > rangeEndMs) {
			if (isSingleDay) {
				const end = new Date(rangeEndMs)
				end.setDate(end.getDate() + 1)
				end.setHours(0, 0, 0, 0)
				newEndMs = end.getTime()
			}
			else
				newEndMs = rangeEndMs
		}

		src.end = new Date(newEndMs).toISOString();
		accumHours = stepsMoved;

		if (newEndMs >= new Date(getRange().end).getTime())
			addColumn()
		if(newEndMs >= new Date(props.range.end).getTime() + 1)
		{
			const container = document.querySelector('.rental-calendar-table .flex-1') as HTMLElement | null
			if (container)
				container.scrollLeft += 1000
		}
	}

	const onResizeUp = () => {
			if (resizingSrcIndex.value !== null) {
				const src = stuff.value?.dates?.[resizingSrcIndex.value]
				if (src) {
					if (hasOverlap(stuff.value?.dates, new Date(src.start), new Date(src.end), src)) {
						src.start = new Date(prevStartMs).toISOString();
						src.end   = new Date(prevEndMs).toISOString();
						(src as any).width = prevWidth;
						(src as any).left  = prevLeft;
						showError();
					}
				}
			}
			cleanup()
	}

	return { onResizeDown }
}
