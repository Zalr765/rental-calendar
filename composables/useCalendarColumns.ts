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
	closePopup: () => void
) => {
	const isSingleDay = start.toDateString() === end.toDateString()

	const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
	let extraDays = 0

	if (isSingleDay)
		extraDays = 0.5
	else if (rangeDays <= 7)
		extraDays = 4
	else if (rangeDays <= 31)
		extraDays = 15
	else
		extraDays = Math.ceil(rangeDays * 2);

	// расширяем диапазон справа
	// const extendedEnd = new Date(end.getTime() + extraDays * 24 * 60 * 60 * 1000)


	const days = getDaysInRange(start, end, isSingleDay ? 'hour' : 'day')

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
					td: 'h-[120px] py-[10px] px-[0]	',
				},
			},
		},
		...days.map((day, i) => {
			const isHidden = i >= rangeDays;

			return {
				accessorKey: `day${i}`,
				header: formatTimeForHeader(day, isSingleDay ? 'hour' : 'day'),
				cell: ({ row }: { row: Row<CalendarRow> }) =>
					i === 0
						? h(dragResize, {
								range: { start, end },
								row,
								tableLength,
								dragging: currentDrag,
								onDragstart: dragStart,
								onDragenter: dragEnter,
								onDragend: dragEnd,
								onOpenPopup: openPopup,
								onclosePopup: closePopup,
						  })
						: ' ',
				meta: {
					class: {
						th: `
							text-[12px] text-center box-border px-[0]
							${days.length === 14
								? 'w-[71.4px] whitespace-normal'
								: days.length > 14
								? 'w-[33.3px] whitespace-pre'
								: 'w-[142.2px] whitespace-normal'}
						`,
						// th: `
						// 	text-[12px] text-center box-border px-[0]
						// 	${days.length === 14
						// 		? 'w-[71.4px] whitespace-normal'
						// 		: days.length > 14
						// 		? 'w-[33.3px] whitespace-pre'
						// 		: 'w-[142.2px] whitespace-normal'}
						// 	// ${isHidden ? 'opacity-30 bg-[#fafafa]' : ''}
						// `,
						td: `
							${(i + 1) % 7 === 6 || (i + 1) % 7 === 0 ? 'bg-[#f9f9f9]' : ''}
						`,
						// td: `
						// 	p-0 ${isHidden ? 'opacity-30 bg-[#fafafa]' : ''}
						// 	${(i + 1) % 7 === 6 || (i + 1) % 7 === 0 ? 'bg-[#f9f9f9]' : ''}
						// `,
					},
				},
			}
		}),
	]

	return columns
}
