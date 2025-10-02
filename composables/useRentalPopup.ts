export interface RentalPopupOptions {
	stuff?: any
	item?: any
	action?: string
}

export const useRentalPopup = (modelValue?: Ref<boolean>) => {
	const open = modelValue ?? ref(false)
	const stuff = ref<any | null>(null)
	const item = ref<any | null>(null)
	const actionType = ref<string | null>(null)

	const openPopup = (options?: RentalPopupOptions) => {
		stuff.value = options?.stuff ?? null
		item.value = options?.item ?? null
		actionType.value = options?.action ?? null
		open.value = true
	}

	const closePopup = () => {
		open.value = false
		stuff.value = null
		item.value = null
		actionType.value = null
	}

	return { open, stuff, item, actionType, openPopup, closePopup }
	}
