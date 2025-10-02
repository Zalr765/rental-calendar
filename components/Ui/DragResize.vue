<script setup lang="ts">
// Props
const props = defineProps({
	range: {
		type: Object,
		default: () => ({ start: '', end: '' }),
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
const MS_IN_DAY = 1000 * 60 * 60 * 24

const stuff = computed(() => props.row?.getValue('stuff'))

const cellWidth = computed(() => {
	if (!props.range?.start || !props.range?.end)
		return 33.3

	const start = new Date(props.range.start)
	const end = new Date(props.range.end)
	const days = (end.getTime() - start.getTime()) / MS_IN_DAY

	if (days <= 7)
		return 142.8
	if (days <= 14)
		return 71.4
	return 33.3
})


const items = computed(() => {
	if (!stuff.value)
		return []
	const rangeStart = new Date(new Date(props.range.start).getTime() + 1)
	const rangeEnd   = new Date(props.range.end)

	return (stuff.value.dates || []).map((date: any, srcIndex: number) => {
		const dateStart = new Date(date.start)
		const dateEnd   = new Date(date.end || date.start)

		if (dateEnd < rangeStart || dateStart > rangeEnd)
			return null

		const left = ((Math.max(dateStart.getTime(), rangeStart.getTime()) - rangeStart.getTime()) / MS_IN_DAY) * cellWidth.value
		let width  = ((Math.min(dateEnd.getTime(), rangeEnd.getTime()) - Math.max(dateStart.getTime(), rangeStart.getTime())) / MS_IN_DAY) * cellWidth.value
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

// emits
const emit = defineEmits<{
	(e: 'dragstart', payload: { sourceRowIndex: number; currentRowIndex: number; itemIndex: number }): void
	(e: 'dragenter', payload: number): void
	(e: 'dragend', payload: number): void
	(e: 'openPopup', payload?: any): void
	(e: 'closePopup'): void
}>()

// --- DRAG ---
const { containerRef, onMouseDown, onContainerEnter } = useDrag(items, cellWidth, props, emit, stuff)

// --- RESIZE ---
const { onResizeDown } = useResize(items,cellWidth, props, stuff)

// Creating
const { onContainerDown, onContainerUp, onContainerMove, onContainerDblClick } =
	useRentalCreate(cellWidth, props, stuff, (payload: any) => emit('openPopup', payload))

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
	>
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
	width: 1000px;
	top: 0;
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
</style>