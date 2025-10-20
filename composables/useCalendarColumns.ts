// Types
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

interface StuffDate {
	start: string | Date
	end: string | Date
}

interface Stuff {
	image: string
	title: string
	price: string | number
	dates: StuffDate[]
}

interface CalendarRow {
	stuff: Stuff
}

export const useCalendarColumns = (
	start: Date,
	end: Date,
	tableLength: number,
	rentalCalendarItem: any,
	dragResize: any,
	currentDrag: Ref<object | null>,
	dragStart: (payload: any) => void,
	dragEnter: (rowIndex: number) => void,
	dragEnd: () => void,
	openPopup: (payload?: any) => void,
	closePopup: () => void,
	addDay: (extraCount: number) => void,
	visibleHiddenCount: Ref<number>,
) => {
	const isSingleDay = start.toDateString() === end.toDateString()

	const rangeCount = isSingleDay
		? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
		: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

	let extraCount = 0
	if (isSingleDay)
		extraCount = 24
	else if (rangeCount <= 7)
		extraCount = 4
	else if (rangeCount <= 31)
		extraCount = 15
	else
		extraCount = Math.ceil(rangeCount * 2)

	const extendedEnd = new Date(
		end.getTime() + extraCount * (isSingleDay ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
	)

	const days = getDaysInRange(start, extendedEnd, isSingleDay ? 'hour' : 'day')

	const addColumn = () => {
		if(extraCount > visibleHiddenCount?.value)
			addDay(extraCount)
	}

	const columns: TableColumn<CalendarRow>[] = [
		{
			accessorKey: 'stuff',
			header: ' ',
			cell: ({ row }) => {
				const stuff = row.getValue('stuff') as Stuff
				return h(rentalCalendarItem, {
					image: stuff.image,
					title: stuff.title,
					price: stuff.price,
				})
			},
			meta: {
				class: {
					th: 'min-w-[155px] w-[155px]',
					td: 'h-[120px] py-[10px] px-[0]',
				},
			},
		},
		...days.map((day, i) => {
			const isHidden = i >= rangeCount
			const hiddenIndex = i - rangeCount
			const shouldHide = isHidden && hiddenIndex >= (visibleHiddenCount?.value ?? 0)

			return {
				accessorKey: `day${i}`,
				header: formatTimeForHeader(day, isSingleDay ? 'hour' : 'day'),
				cell: ({ row }: { row: Row<CalendarRow> }) =>
					i === 0
						? h(dragResize, {
								range: { start, end },
								extraRange: { start, end: extendedEnd },
								row,
								tableLength,
								dragging: currentDrag,
								hiddenDays: visibleHiddenCount?.value,
								onDragstart: dragStart,
								onDragenter: dragEnter,
								onDragend: dragEnd,
								onOpenPopup: openPopup,
								onclosePopup: closePopup,
								onAddDay: addColumn,
						  })
						: ' ',
				meta: {
					class: {
						th: `
							text-[12px] text-center box-border px-[0]
							${days.length === 14
								? 'w-[71.4px] whitespace-normal'
								: days.length > 14
								? 'min-w-[31px] whitespace-pre'
								: 'min-w-[142.77px] whitespace-normal'}
							${shouldHide ? 'w-0 p-0 m-0 overflow-hidden hidden' : ''}
						`,
						td: `
							p-0
							${(i + 1) % 7 === 6 || (i + 1) % 7 === 0 ? 'bg-[#f9f9f9]' : ''}
							${shouldHide ? 'w-0 p-0 m-0 overflow-hidden hidden' : ''}
						`,
					},
				},
			}
		}),
	]

	return columns
}
