const MS_IN_HOUR = 1000 * 60 * 60;

export const useResize = (
	items: Ref<any[]>,
	cellWidth: Ref<number>,
	props: any,
	stuff: Ref<any>
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

			const rangeEndMs = new Date(props.range.end).getTime() + 1
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

		const rangeStartMs = new Date(props.range.start).getTime()
		const rangeEndMs   = new Date(props.range.end).getTime() + 1
		const hourPx	   = cellWidth.value / 24
		if (!hourPx)
			return

		const hoursMoved = Math.round((e.clientX - resizeStartX) / hourPx)
		if (hoursMoved === accumHours) return

		const startMs  = new Date(src.start).getTime()
		const minEndMs = Math.max(startMs + MS_IN_HOUR, rangeStartMs + MS_IN_HOUR)
		let newEndMs   = baseEndMs + hoursMoved * MS_IN_HOUR

		if (newEndMs < minEndMs) {
			if (startMs < rangeStartMs)
				newEndMs = minEndMs
			else {
				const deltaMs    = minEndMs - newEndMs
				const newStartMs = Math.max(rangeStartMs, startMs - deltaMs)

				newEndMs  = new Date(src.end).getTime()
				src.start = new Date(newStartMs).toISOString()
			}
		}

		if (newEndMs > rangeEndMs)
			newEndMs = rangeEndMs

		src.end = new Date(newEndMs).toISOString()
		accumHours = hoursMoved
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
