<script setup>
// Date
const date = ref(new Date());
const range = defineModel('range');

// Tabs
const activeTab = defineModel('activeTab');

const tabs = [
	{
		title: 'НЕДЕЛЯ',
		value: 'week',
	},
	{
		title: '2 НЕДЕЛИ',
		value: 'week2',
	},
	{
		title: 'МЕСЯЦ',
		value: 'month',
	},
];

const setActiveTab = (tab) => activeTab.value = tab.value;
</script>

<template>
	<div class="rental-calendar-header">
		<UButton @click="date = new Date()">
			Today
		</UButton>
		<UiWeekPicker
			v-model:rangeDates="range"
			:date="date"
			:range="activeTab"
		/>
		<div class="rental-calendar-header__tabs">
			<UButton
				:key="tab"
				v-for="tab in tabs"
				active-variant="solid"
				:active="tab.value === activeTab"
				@click="setActiveTab(tab)"
			>
				{{ tab.title }}
			</UButton>
		</div>
	</div>
</template>

<style lang="scss">
.rental-calendar-header
{
	display: flex;
	justify-content: space-between;
	padding: 10px 10px 5px 10px;
}

.rental-calendar-header__tabs
{
	display: flex;

	button
	{
		width: 90px;
		justify-content: center;
		margin-right: -1px;
	}
}
</style>