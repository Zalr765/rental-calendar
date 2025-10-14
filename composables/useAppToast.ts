export const useAppToast = () => {
	const toast = useToast()

	type ToastType = 'error' | 'success' | 'warning' | 'info'

	const showToast = (
		type: ToastType,
		message: string,
		title?: string
	) => {
		const titles: Record<ToastType, string> = {
			error: 'Ошибка',
			success: 'Успех',
			warning: 'Внимание',
			info: 'Информация',
		}

		toast.add({
			title: title ?? titles[type],
			description: message,
			color: type,
		})
	}

	return {
		showError: (msg = 'Товар уже арендован на эту дату', title?: string) =>
			showToast('error', msg, title),

		showSuccess: (msg: string, title?: string) =>
			showToast('success', msg, title),

		showWarning: (msg: string, title?: string) =>
			showToast('warning', msg, title),

		showInfo: (msg: string, title?: string) =>
			showToast('info', msg, title),
	}
}
