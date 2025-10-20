<script setup lang="ts">
// Props
const props = defineProps({
	range: {
		type: Object,
		default: () => ({ start: '', end: '' }),
	},
	extraRange: {
		type: Object,
		default: () => ({ start: '', end: '' }),
	},
	hiddenDays: {
		type: Number,
		required: false,
		default: 0,
	},
	row: {
		type: Object,
	},
	dragging: {
		required: false,
	},
	tableLength: {
		type: Number,
		default: 0,
	}
})

// Varobales
const MS_IN_HOUR = 1000 * 60 * 60
const MS_IN_DAY  = 1000 * 60 * 60 * 24

const stuff = computed(() => props.row?.getValue('stuff'))

const containerWidth = 1000

const cellWidth = computed(() => {
	if (!props.range?.start || !props.range?.end)
		return containerWidth / 31

	const isSingleDay = new Date(props.range.start).toDateString() === new Date(props.range.end).toDateString();
	if(isSingleDay)
		return 40.27

	const start = new Date(props.range.start);
	const end   = new Date(props.range.end);

	const daysCount = Math.floor((end.getTime() - start.getTime()) / MS_IN_DAY) + 1

	return containerWidth / daysCount
})


const items = computed(() => {
	if (!stuff.value)
		return []
	const rangeStart = new Date(new Date(props.extraRange.start).getTime() + 1)
	const rangeEnd   = new Date(props.extraRange.end)

	return (stuff.value.dates || []).map((date: any, srcIndex: number) => {
		const dateStart   = new Date(date.start);
		const dateEnd     = new Date(date.end || date.start);
		const isSingleDay = new Date(props.extraRange.start).toDateString() === new Date(props.range.end).toDateString();


		if (dateEnd < rangeStart || dateStart > rangeEnd)
			return null

		const unit = isSingleDay ? MS_IN_HOUR : MS_IN_DAY

		const startTime = Math.max(dateStart.getTime(), rangeStart.getTime())
		const endTime   = Math.min(dateEnd.getTime(), rangeEnd.getTime())

		const left = ((startTime - rangeStart.getTime()) / unit) * cellWidth.value;

		let width  = ((endTime - startTime) / unit) * cellWidth.value;

		if (width < 2)
			width = 2

		return {
			srcIndex,
			left,
			width,
			start: dateStart,
			end: dateEnd,
			zIndex: date.__zIndex ?? 0,
			open: date.__open ?? false,
			rowIndex: props.row?.index,
			top: typeof date.__top === 'number' ? date.__top : 40,
		}
	}).filter(Boolean)
})

const todayLineLeft = computed(() => {
	if (!props.range?.start || !props.range?.end)
		return null

	const rangeStart = new Date(props.range.start)
	const rangeEnd = new Date(props.range.end)
	const today = new Date();

	today.setSeconds(0);
	today.setMilliseconds(0);


	// Проверяем, входит ли сегодня в диапазон
	if (today < rangeStart || today > rangeEnd)
		return null

	const rangeDuration = rangeEnd.getTime() - rangeStart.getTime()
	const isSingleDay = rangeDuration < MS_IN_DAY * 1.1

	const offsetMs = today.getTime() - rangeStart.getTime()
	const unit = isSingleDay ? MS_IN_HOUR : MS_IN_DAY
	const left = (offsetMs / unit) * cellWidth.value

	return left
})

// emits
const emit = defineEmits<{
	(e: 'dragstart', payload: { sourceRowIndex: number; currentRowIndex: number; itemIndex: number }): void
	(e: 'dragenter', payload: number): void
	(e: 'dragend', payload: number): void
	(e: 'openPopup', payload?: any): void
	(e: 'closePopup'): void
	(e: 'addDay'): void
}>()

// --- DRAG ---
const { containerRef, onMouseDown, onContainerEnter } = useDrag(items, cellWidth, props, emit, stuff)

// --- RESIZE ---
const { onResizeDown } = useResize(items,cellWidth, props, stuff, () => emit('addDay'))

// Creating
const { onContainerDown, onContainerUp, onContainerMove, onContainerDblClick } =
	useRentalCreate(cellWidth, props, stuff, (payload: any) => emit('openPopup', payload), () => emit('addDay'))

// formatter
const getDuration = (start: Date, end: Date) => {
	return getDaysAndHoursBetweenDates(start, end)
}

// tooltip anchor
const hoverIndex = ref<number | null>(null)
const anchor = ref({ x: 0, y: 0 })

// reference (если нужно, чтобы тултип шел за курсором)
const reference = computed(() => ({
	getBoundingClientRect: () => ({
		width: 0,
		height: 0,
		left: anchor.value.x,
		right: anchor.value.x,
		top: anchor.value.y,
		bottom: anchor.value.y,
		...anchor.value,
	} as DOMRect)
}))
</script>

<template>
	<div
		class="ui-drag-resize"
		ref="containerRef"
		@dblclick="onContainerDblClick"
		@mousedown="onContainerDown"
		@mouseenter="onContainerEnter"
	>		<div
			v-if="todayLineLeft !== null"
			class="ui-drag-resize__today-line"
			:style="{ left: todayLineLeft + 'px' }"
		/>
		<UTooltip
			v-for="(item, i) in items"
			:key="i"
			:open="hoverIndex === i"
			:content="{ side: 'bottom', sideOffset: 16, align: 'start', updatePositionStrategy: 'always' }"
			:delay-duration="1"
			:reference="reference"
			@pointerenter="(e: PointerEvent) => { hoverIndex = i; anchor.x = e.clientX; anchor.y = e.clientY }"
			@pointerleave="() => { hoverIndex = null }"
			@pointermove="(event: PointerEvent) => { anchor.x = event.clientX; anchor.y = event.clientY }"
		>
			<div
				@mousedown="(e) => onMouseDown(e, i)"
				class="ui-drag-resize__item"
				:style="{ left: item.left + 'px', width: item.width + 'px', zIndex: item.zIndex, top: item.top + 'px' }"
			>
				<span class="item-text">Арендован на {{ getDuration(item.start, item.end) }}</span>
				<span class="resize-handle" @mousedown.stop="(e) => onResizeDown(e, i)">
					<icons-three-dots />
				</span>
			</div>

			<template #content>
				<div class="ui-drag-resize__tooltip">
					<span>Арендован на {{ getDuration(item.start, item.end) }}</span>
					<span>Дата заезда: {{ item.start.toLocaleString() }}</span>
					<span>Дата выезда: {{ item.end.toLocaleString() }}</span>
				</div>
			</template>
		</UTooltip>
	</div>
</template>

<style lang="scss">
.ui-drag-resize
{
	position: absolute;
	height: 119px;
	width: 2000px;
	top: 0;
	left: 0;
	z-index: 1;
}
.ui-drag-resize__item
{
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: absolute;
	top: 40px;
	height: 40px;
	background-color: violet;
	overflow: hidden;
	border-radius: 4px;
	padding: 0 8px;
	color: #fff;
	font-size: 12px;
	cursor: grab;
	user-select: none;
	transition: none;

	&:active { cursor: grabbing }

	.item-text
	{
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		flex: 1 1 auto;
		min-width: 0;
		position: absolute;
		left: 8px;
		right: 28px;
		top: 50%;
		transform: translateY(-50%);
	}
}
.resize-handle
{
	position: absolute;
	right: 1px;
	z-index: 5;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 14px;
	height: 30px;
	cursor: e-resize;
	pointer-events: auto;

	svg { transform: scale(1.5) }
}
.ui-drag-resize__tooltip
{
	display: flex;
	flex-direction: column;
	background-color: rgba(0, 0, 0, 0.7);
	color: #fff;
	padding: 4px 8px;
	border-radius: 4px;
	box-sizing: border-box;
	pointer-events: none;
}

.ui-drag-resize__today-line
{
	position: absolute;
	top: 0;
	bottom: 0;
	width: 2px;
	background-color: red;
	opacity: 0.8;
	z-index: 10;
}
</style>
