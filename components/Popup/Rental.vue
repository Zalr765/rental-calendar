<script setup lang="ts">
import type { RadioGroupItem, FormSubmitEvent, FormError } from '@nuxt/ui'
import { vMaska } from 'maska/vue'

// Props
const props = defineProps<{
	data: any,
	stuff: any,
	item: any,
	action: string | null,
}>()

// Models
const isSuccess = defineModel('isSuccess');

// Const
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MIN_DIMENSIONS = { width: 200, height: 200 }
const MAX_DIMENSIONS = { width: 4096, height: 4096 }

// Func
const createObjectUrl = (file: File) => URL.createObjectURL(file);
const checkImageDimensions = (file: File) => {
	return new Promise<boolean>((resolve) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			const img = new Image()
			img.onload = () => {
				const valid =
					img.width >= MIN_DIMENSIONS.width &&
					img.height >= MIN_DIMENSIONS.height &&
					img.width <= MAX_DIMENSIONS.width &&
					img.height <= MAX_DIMENSIONS.height
				resolve(valid)
			}
			img.src = e.target?.result as string
		}
		reader.readAsDataURL(file)
	})
}

const handleDateInput = (key: 'startDate' | 'endDate', value: string) => {
	state[key] = roundToNext10Minutes(value)
}

// Emits
const emit = defineEmits<{
	(e: 'closePopup'): void
	(e: 'delete', payload: { stuffName: string; item: any }): void
}>()

const { showError, showSuccess } = useAppToast();

// Options
const stuffOptions = computed(() =>
	(props.data || []).map((d: any) => ({
		label: d.stuff.title,
		value: d.stuff.name
	}))
)

const statusOptions: RadioGroupItem[] = [
	{ label: 'Предоплата', value: 'prepaid' },
	{ label: 'Аванс', value: 'advance' },
	{ label: 'Оплачен', value: 'paid' }
]

const clientOptions: RadioGroupItem[] = [
	{ label: 'Клиент 1', value: 'client1' },
	{ label: 'Клиент 2', value: 'client2' },
	{ label: 'Клиент 3', value: 'client3' },
]

// Form state
const state = reactive({
	channel: props.item?.channel ?? '',
	name: props.item?.name ?? '',
	client: props.item?.client ?? '',
	phone: props.item?.phone ?? '+7',
	secondaryContact: props.item?.secondaryContact ?? '',
	address: props.item?.address ?? '',
	delivery: props.item?.delivery ?? '',
	discount: props.item?.discount ?? '',
	deposit: props.item?.deposit ?? '',
	pic: props.item?.pic ?? '',
	kitNotes: props.item?.kitNotes ?? '',
	stuff: props.stuff?.name ?? '',
	status: props.item?.status ?? 'prepaid',
	startDate: toLocalDateTime(props.item?.start ?? ''),
	endDate: toLocalDateTime(props.item?.end ?? '')
})

// Form ref
const formRef = ref<any>(null)

const validate = (state: any): FormError[] => {
	const errors: FormError[] = []

	if (!state.channel)
		errors.push({ name: 'channel', message: 'Укажите канал продаж' })
	if (!state.name)
		errors.push({ name: 'name', message: 'Введите наименование объекта' })
	if (!state.client)
		errors.push({ name: 'client', message: 'Выберите клиента' })
	if (!state.phone || state.phone.length < 18)
		errors.push({ name: 'phone', message: 'Введите корректный телефон' })
	if (!state.address)
		errors.push({ name: 'address', message: 'Введите адрес' })
	if (!state.stuff)
		errors.push({ name: 'stuff', message: 'Выберите товар' })


	if (state.startDate && state.endDate) {
		const start = new Date(state.startDate)
		const end = new Date(state.endDate)
		if (end <= start)
			errors.push({ name: 'endDate', message: 'Неверная дата' })
	}

	if (state.pic) {
		const file = state.pic
		if (file.size > MAX_FILE_SIZE)
			errors.push({ name: 'pic', message: 'Максимум 2MB' })
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
			errors.push({ name: 'pic', message: 'Недопустимый формат.' })
	}

	return errors
}


const onPicChange = async (file: File | null) => {
	state.pic = file;
	if (!file)
		return;

	const valid = await checkImageDimensions(file);
	if (!valid && formRef.value) {
		formRef.value.setErrors([
		{
			name: 'pic',
			message: `Размер изображения должен быть от ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} до ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}`,
		},
		]);
	}
	else {
		formRef.value?.validate();
	}
};

// Actions
const cancel = () => {
		emit('closePopup')
}

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
		if (exclude && d === exclude)
			return false
		const dStart = new Date(d.start).getTime()
		const dEnd = new Date(d.end).getTime()
		return !(endMs <= dStart || startMs >= dEnd)
	})
}

const save = (e: FormSubmitEvent<typeof state>) => {
	if (!props.item) return

	const oldStuff = props.stuff
	const newStuff = props.data.find((d: any) => d.stuff.name === e.data.stuff)
	if (!newStuff)
		return

	// Проверка пересечений
	if (hasOverlap(newStuff.stuff.dates, e.data.startDate, e.data.endDate, props.item)) {
		showError('Нельзя забронировать выбранный товар на эту дату')
		return
	}
	else
	{
		isSuccess.value = true;
		showSuccess('Объект успешно забронирован!')
	}

	if (oldStuff?.name !== newStuff.stuff.name) {
		const idx = oldStuff.dates.indexOf(props.item)
		if (idx !== -1) oldStuff.dates.splice(idx, 1)

		newStuff.stuff.dates.push({
			...props.item,
			...e.data,
			start: e.data.startDate,
			end: e.data.endDate
		})
	}
	else {
		Object.assign(props.item, {
			...e.data,
			start: e.data.startDate,
			end: e.data.endDate
		})
	}

	emit('closePopup')
}
</script>

<template>
	<UForm
		ref="formRef"
		class="popup-rental"
		:state="state"
		:validate="validate"
		@submit="save"
	>
		<!-- Channel -->
		<UFormField class="flex items-center justify-between" label="Канал продаж" name="channel">
			<UInput class="w-[200px]" v-model="state.channel" />
		</UFormField>

		<!-- Name -->
		<UFormField class="flex items-center justify-between" label="Наименование объекта" name="name">
			<UInput class="w-[200px]" v-model="state.name" />
		</UFormField>

		<!-- Stuff -->
		<UFormField class="flex items-center justify-between" label="Наименование товара" name="stuff">
			<USelect class="w-[200px]" v-model="state.stuff" :items="stuffOptions" />
		</UFormField>

		<!-- Client -->
		<UFormField class="flex items-center justify-between" label="Имя клиента" name="client">
			<USelect class="w-[200px]" v-model="state.client" :items="clientOptions" />
		</UFormField>

		<!-- Phone -->
		<UFormField class="flex items-center justify-between" label="Teлефон" name="phone">
			<UInput v-maska="'+7 (###) ###-##-##'" placeholder="+7 (###) ###-##-##" class="w-[200px]" v-model="state.phone" />
		</UFormField>

		<!-- Secondary contact -->
		<UFormField class="flex items-center justify-between" label="Доп контакты" name="secondaryContact">
			<UInput placeholder="Доп контакты" class="w-[200px]" v-model="state.secondaryContact" />
		</UFormField>

		<!-- Address -->
		<UFormField class="flex items-center justify-between" label="Адрес" name="address">
			<UInput placeholder="Адрес" class="w-[200px]" v-model="state.address" />
		</UFormField>

		<!-- Delivery -->
		<UFormField class="flex items-center justify-between" label="Стоимость доставки" name="delivery">
			<UInput placeholder="Стоимость доставки" class="w-[200px]" v-model="state.delivery" />
		</UFormField>

		<!-- Discount -->
		<UFormField class="flex items-center justify-between" label="Скидка" name="discount">
			<UInput placeholder="Cкидка" class="w-[200px]" v-model="state.discount" />
		</UFormField>

		<!-- Status -->
		<UFormField class="flex items-center justify-between" label="Выбрать тип оплаты" name="status">
			<URadioGroup class="w-[200px]" v-model="state.status" :items="statusOptions" />
		</UFormField>

		<!-- Deposit -->
		<UFormField class="flex items-center justify-between" label="Залог" name="deposit">
			<UInput placeholder="Залог" class="w-[200px]" v-model="state.deposit" />
		</UFormField>

		<!-- Pic -->
		<UFormField
			class="flex items-center justify-between"
			label="Фото состояния"
			name="pic"
			@update:model-value="onPicChange"
		>
			  <UFileUpload
					v-model="state.pic"
					v-slot="{ open, removeFile }"
					class="w-[200px]"
				>
				<div class="flex gap-2">
					<UTooltip :delay-duration="0" text="Размер не должен превышать 2MB">
						<UButton
							:label="state.pic ? 'Изменить' : 'Загрзить'"
							color="neutral"
							variant="outline"
							class="w-[200px] justify-center"
							@click="open()"
						/>
					</UTooltip>
					<UAvatar
						class="rounded-[2px]"
						size="lg"
						:src="state.pic ? createObjectUrl(state.pic) : undefined"
						icon="i-lucide-image"
					/>
				</div>
				<p v-if="state.pic" class="text-xs text-muted mt-1.5">
					<span class="mr-1.5">{{ formattedFileName(state.pic.name) }}</span>
						<UButton
							label="Удалить"
							color="error"
							variant="link"
							size="xs"
							class="p-0"
							@click="removeFile()"
						/>
				</p>
			  </UFileUpload>
		</UFormField>

		<!-- Kit Notes -->
		<UFormField
			class="flex items-center justify-between"
			label="Заметки о комплекте"
			name="kitNotes"
		>
			<UTextarea v-model="state.kitNotes" autoresize class="w-[200px]" />
		</UFormField>

		<!-- Даты -->
		<UFormField
			class="flex items-center justify-between"
			label="Дата начала"
			name="startDate"
		>
			<UInput
				v-model="state.startDate"
				@update:model-value="handleDateInput('startDate', $event)"
				type="datetime-local"
				step="3600" class="w-[200px]"
			/>
		</UFormField>

		<UFormField
			class="flex items-center justify-between"
			label="Дата окончания"
			name="endDate"
		>
			<UInput
				v-model="state.endDate"
				@update:model-value="handleDateInput('endDate', $event)"
				type="datetime-local"
				step="3600"
				class="w-[200px] flex flex-col justify-end"
			/>
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
	width: 100%;
	overflow: auto;
	padding: 30px 26px 20px 26px;
	background-color: white;
	display: flex;
	flex-direction: column;
	gap: 10px;
}
</style>
