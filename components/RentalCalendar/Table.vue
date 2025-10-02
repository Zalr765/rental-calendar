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

function normalizeDate(date: string | Date | undefined | null) {
  if (!date) return null

  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return null

  // убираем секунды и миллисекунды, оставляем YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16)
}


const onDelete = ({ stuffName, item }: { stuffName: string; item: any }) => {
  const target = data.value.find((d: any) => d.stuff.name === stuffName)
  if (!target) return

  const idx = target.stuff.dates.findIndex(
    (d: any) =>
      normalizeDate(d.start) === normalizeDate(item.start) &&
      normalizeDate(d.end) === normalizeDate(item.end)
  )

  if (idx !== -1) {
    target.stuff.dates.splice(idx, 1)
    console.log(`Удалена бронь у ${stuffName}:`, normalizeDate(item.start), normalizeDate(item.end))
  } else {
    console.warn("Не нашли элемент для удаления", item)
  }
}


// Drag & Drop
const { currentDrag, onDragStart, onDragEnter, onDragEnd } = useRentalDrag(data);

// Popup
const rentalPopup = useRentalPopup();

// Table columns
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
		rentalPopup.closePopup
	)
);
</script>

<template>
	<div class="rental-calendar-table">
		<UTable
			class="flex-1 max-h-[410px] border-collapse z-10"
			sticky
			:data="data"
			:columns="columns"
		/>
		<UModal
			v-model:open="rentalPopup.open.value"
			title="Rental popup"
			description="Детали выбранной аренды"
			:ui="{ content: 'w-fit' }"
		>
			<template #content>
				<PopupRental
					:data="data"
					:stuff="rentalPopup.stuff.value"
					:item="rentalPopup.item.value"
					:action="rentalPopup.actionType.value"
					@delete="onDelete"
					@closePopup="rentalPopup.closePopup"
				/>
			</template>
			<template #footer>
				dsads
			</template>
		</UModal>
	</div>
</template>
