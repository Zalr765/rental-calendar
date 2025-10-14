export const formattedFileName = (name: string): string => {
	const dotIndex = name.lastIndexOf('.')
	if (dotIndex === -1)
		return name

	const base = name.slice(0, dotIndex)
	const ext = name.slice(dotIndex)

	if (base.length > 20) {
		return base.slice(0, 12) + '…' + ext
	}

	return base + ext
}
