<script setup lang="ts">
const props = defineProps({
	image: { type: String, required: true },
	title: { type: String, required: true },
	price: { type: [String, Number], required: true }
})

</script>

<template>
	<div class="rental-calendar-item">
		<img :src="props.image" :alt="props.title" />
		<h3>{{ props.title }}</h3>
		<p>{{ props.price }}</p>
	</div>
</template>

<style lang="scss">
.rental-calendar-item
{
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 14px;
	white-space: nowrap;
	user-select: none;
	img
	{
		margin-bottom: 7px;
		width: 80px;
		height: 48px;
	}
	h3
	{
		color: black;
		font-weight: 500;
	}
}
</style>