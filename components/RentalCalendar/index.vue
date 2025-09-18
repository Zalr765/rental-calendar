<script setup>
const activeTab = ref('week');

const range = ref(getDateRangeObjects(new Date, 'week'));
</script>

<template>
	<div class="rental-calendar">
		<rental-calendar-header v-model:range="range" v-model:activeTab="activeTab"/>
		<rental-calendar-table :range="range"/>
	</div>
</template>

<style lang="scss">
.rental-calendar
{
	margin-top: 15vh;
	width: 100%;
	background-color: white;
	border: 5px solid lightgrey;
}
</style>