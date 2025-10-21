<template>
	<button class="g-btn">
		{{title}}
	</button>
</template>
<script setup>

const props = defineProps({
    title:
    {
        type: String,
        required: true     }
})

</script>
<style lang="scss">
.g-btn
{
    background-color: #4561EC;
    color: #fff;
    border-radius: 6px;
    font-size: 13px;
    line-height: 30px;
    font-weight: 700;
    padding: 0 30px;
    text-align: center;
    cursor: pointer;
    transition: all ease .4s;
    border: 0;
    &.dis
    {
        opacity: .4;
    }
}
</style>
