<script setup lang="ts">
// Props
const props = defineProps<{ range: { start: Date; end: Date } }>();

// Components
const RentalCalendarItem = resolveComponent('RentalCalendarItem');
const UiDragResize = resolveComponent('UiDragResize');

// Mock table data
const data = ref([
	{
		stuff: {
			name: 'Car',
			title: 'Dodge Caliber1',
			price: '129.99',
			image: 'https://dhtmlx.com/docs/products/demoApps/car-rental-html5-js-php/demo/content/dodge_caliber.png',
			dates: [
				{ start: '2025-09-21T00:00:00', end: '2025-09-22T12:00:00', name: 'New Rent', status: 'reservation' },
				{ start: '2025-09-24T00:00:00', end: '2025-09-28T12:00:00', name: 'New Rent', status: 'reservation' }
			]
		},
		mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
	},
	{
		stuff: {
			name: 'Car2',
			title: 'Dodge Caliber2',
			price: '129.99',
			image: 'https://dhtmlx.com/docs/products/demoApps/car-rental-html5-js-php/demo/content/dodge_caliber.png',
			dates: []
		},
		mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
	},
	{
		stuff: {
			name: 'Car3',
			title: 'Dodge Caliber3',
			price: '129.99',
			image: 'https://dhtmlx.com/docs/products/demoApps/car-rental-html5-js-php/demo/content/dodge_caliber.png',
			dates: []
		},
		mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
	},
	{
		stuff: {
			name: 'Car4',
			title: 'Dodge Caliber4',
			price: '129.99',
			image: 'https://dhtmlx.com/docs/products/demoApps/car-rental-html5-js-php/demo/content/dodge_caliber.png',
			dates: []
		},
		mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
	},
	{
		stuff: {
			name: 'Car5',
			title: 'Dodge Caliber5',
			price: '129.99',
			image: 'https://dhtmlx.com/docs/products/demoApps/car-rental-html5-js-php/demo/content/dodge_caliber.png',
			dates: []
		},
		mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
	},
]);

const normalizeDate = (date: string | Date | undefined | null) => {
	if (!date)
		return null

	const d = typeof date === "string" ? new Date(date) : date
	if (isNaN(d.getTime()))
		return null

	return d.toISOString().slice(0, 16)
}


const onDelete = ({ stuffName, item }: { stuffName: string; item: any }) => {
	const target = data.value.find((d: any) => d.stuff.name === stuffName)

	if (!target)
		return

	const idx = target.stuff.dates.findIndex( (d: any) =>
		normalizeDate(d.start) === normalizeDate(item.start) &&
		normalizeDate(d.end) === normalizeDate(item.end)
	)

	if (idx !== -1)
		target.stuff.dates.splice(idx, 1)
}


// Drag & Drop
const { currentDrag, onDragStart, onDragEnter, onDragEnd } = useRentalDrag(data);

// Popup
const rentalPopup = useRentalPopup();
const afterClose = ()=> {
	if (rentalPopup.actionType.value === 'create')
		onDelete({ stuffName: rentalPopup.stuff.value.name, item: rentalPopup.item.value })}

// Column
const visibleHiddenCount = ref(0);
watch(
	() => props.range,
	() => {
		visibleHiddenCount.value = 0
	},
	{ deep: true }
)

const showNextHiddenDay = (extraCount : number)=> {
	visibleHiddenCount.value += extraCount
}


const columns = computed(() =>
	useCalendarColumns(
		props.range.start,
		props.range.end,
		data.value.length,
		RentalCalendarItem,
		UiDragResize,
		currentDrag,
		onDragStart,
		onDragEnter,
		onDragEnd,
		rentalPopup.openPopup,
		rentalPopup.closePopup,
		showNextHiddenDay,
		visibleHiddenCount,
	)
);
</script>

<template>
	<div class="rental-calendar-table">
		<UTable
			ref="tableWrapper"
			class="flex-1 max-h-[527px] border-collapse z-10"
			sticky
			:data="data"
			:columns="columns"
		/>
		<UModal
			v-model:open="rentalPopup.open.value"
			title="Rental popup"
			description="Детали выбранной аренды"
			:ui="{ content: 'w-[570px] max-w-full' }"
			@after:leave="afterClose"
		>
			<template #content>
				<PopupRental
					:data="data"
					:stuff="rentalPopup.stuff.value"
					:item="rentalPopup.item.value"
					:action="rentalPopup.actionType.value"
					@delete="onDelete"
					@closePopup="()=> rentalPopup.open.value = false"
				/>
			</template>
			<template #footer>
				dsads
			</template>
		</UModal>
	</div>
</template>
