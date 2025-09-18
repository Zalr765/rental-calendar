<script setup lang="ts">
// Types
export type Range = 'week' | 'week2' | 'month'

// Props
const props = defineProps<{
	range?: Range,
	date: Date,
}>();

// Date
const selectedRange = defineModel('rangeDates');
const localDate = ref(new Date(props.date));

const changeDate = (direction: 'prev' | 'next') => {
	const newDate = new Date(localDate.value);

	switch (props.range) {
		case 'week':
			newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
			break;
		case 'week2':
			newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
			break;
		case 'month':
			newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
			break;
		default:
			newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
	}
	localDate.value = newDate;
	selectedRange.value = getDateRangeObjects(localDate.value, props.range)
};

// Watchers
watch(() => props.date, (newDate) => {
	localDate.value = new Date(newDate);
	selectedRange.value = getDateRangeObjects(localDate.value, props.range);
});

watch([localDate, () => props.range], ([newDate, newRange]) => {
	selectedRange.value = getDateRangeObjects(newDate, newRange);
}, { immediate: true });
</script>

<template>
	<div class="ui-week-picker">
		<icons-arrow @click="changeDate('prev')" />
		<span>
			{{ getFormattedDateRange(localDate, range) }}
		</span>
		<icons-arrow @click="changeDate('next')" />
	</div>
</template>

<style lang="scss">
.ui-week-picker
{
	display: flex;
	align-items: center;
	gap: 12px;
	width: 345px;

	svg
	{
		cursor: pointer;
		flex-shrink: 0;
		transition: opacity 0.2s ease;

		&:hover { opacity: 0.7 }
	}

  	svg:first-child {  transform: scale(-1, 1) }

	span
	{
		display: inline-block;
		flex: 1;
		font-size: 20px;
		text-align: center;
		user-select: none;
		font-variant-numeric: tabular-nums;
	}
}
</style>