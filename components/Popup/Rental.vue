<script setup lang="ts">
import type { RadioGroupItem, FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  data: any,
  stuff: any,
  item: any,
  action: string
}>()

const emit = defineEmits<{
  (e: 'closePopup'): void
  (e: 'delete', payload: { stuffName: string; item: any }): void
}>()
const { showError } = useAppToast()

// Опции выбора
const stuffOptions = computed(() =>
  (props.data || []).map(d => ({
    label: d.stuff.title,
    value: d.stuff.name
  }))
)

const statusOptions: RadioGroupItem[] = [
  { label: 'Reservation', value: 'reservation' },
  { label: 'Prepaid', value: 'prepaid' },
  { label: '100% payment', value: 'full' }
]

// Состояние формы
const state = reactive({
  name: props.item?.name ?? '',
  stuff: props.stuff?.name ?? '',
  status: props.item?.status ?? 'reservation',
  startDate: props.item?.start ?? '',
  endDate: props.item?.end ?? ''
})

// Actions
const cancel = () => emit('closePopup')

const del = () => {
  if (props.stuff && props.item) {
    emit('delete', { stuffName: props.stuff.name, item: props.item })
    emit('closePopup')
  }
}

const hasOverlap = (dates: any[], start: string, end: string, exclude?: any) => {
	const startMs = new Date(start).getTime()
	const endMs = new Date(end).getTime()
	return dates.some(d => {
		if (exclude && d === exclude) return false
		const dStart = new Date(d.start).getTime()
		const dEnd = new Date(d.end).getTime()
		return !(endMs <= dStart || startMs >= dEnd)
	})
}

const save = (e: FormSubmitEvent<typeof state>) => {
	if (!props.item)
		return

	const { name, status, stuff, startDate, endDate } = e.data
	const oldStuff = props.stuff
	const newStuff = props.data.find((d: any) => d.stuff.name === stuff)

	if (!newStuff)
		return

	// проверка пересечений
	if (hasOverlap(newStuff.stuff.dates, startDate, endDate, props.item)) {
		showError('Нельзя забронировать выбранный товар на эту дату')
		return
	}

	// если выбрали другой stuff → переносим
	if (oldStuff?.name !== newStuff.stuff.name) {
		const idx = oldStuff.dates.indexOf(props.item)
		if (idx !== -1)
			oldStuff.dates.splice(idx, 1)

		// добавить в новый
		newStuff.stuff.dates.push({
			...props.item,
			name,
			status,
			start: startDate,
			end: endDate
		})
	} else {
		// иначе просто обновляем
		props.item.name = name
		props.item.status = status
		props.item.start = startDate
		props.item.end = endDate
	}

	emit('closePopup')
}
</script>


<template>
	<UForm
		:state="state"
		@submit="save"
		class="popup-rental"
	>
		<!-- Name -->
		<UFormField class="flex items-center justify-between" label="Наименование" name="name">
			<UInput class="w-[200px]" v-model="state.name" />
		</UFormField>

		<!-- Stuff -->
		<UFormField class="flex items-center justify-between" label="Товар" name="stuff">
			<USelect class="w-[200px]" v-model="state.stuff" :items="stuffOptions" />
		</UFormField>

		<!-- Status -->
		<UFormField class="flex items-center justify-between" label="Статус" name="status">
			<URadioGroup class="w-[200px]" v-model="state.status" :items="statusOptions" />
		</UFormField>

		<!-- Даты -->
		<UFormField class="flex items-center justify-between" label="Дата начала" name="startDate">
			<UInput type="datetime-local" class="w-[200px]" v-model="state.startDate" />
		</UFormField>

		<UFormField class="flex items-center justify-between" label="Дата окончания" name="endDate">
			<UInput type="time" class="w-[200px]" v-model="state.endDate" />
		</UFormField>

		<div class="flex justify-between mt-6">
			<UButton @click="del" color="neutral" label="Удалить" />
			<div class="flex gap-2">
				<UButton @click="cancel" color="neutral" label="Отмена" />
				<UButton type="submit" label="Сохранить" />
			</div>
		</div>
	</UForm>
</template>

<style lang="scss">
.popup-rental
{
	height: auto;
	width: 400px;
	padding: 30px 26px 20px 26px;
	background-color: white;
	display: flex;
	flex-direction: column;
	gap: 16px;
	}
</style>
