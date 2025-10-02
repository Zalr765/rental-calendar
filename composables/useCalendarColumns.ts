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
	const days = getDaysInRange(start, end)

	const columns: TableColumn<CalendarRow>[] = [
		{
			accessorKey: 'stuff',
			header: ' ', // нужно оставить пробел иначе ошибка гидратации
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
		...days.map((day, i) => ({
			accessorKey: `day${i}`,
			header: formatDayForHeader(day),
			cell: ({ row }: { row: Row<CalendarRow> }) =>
				i === 0
					? h(dragResize, {
						range: { start, end },
						row,
						tableLength: tableLength,
						dragging: currentDrag,
						onDragstart: dragStart,
						onDragenter: dragEnter,
						onDragend: dragEnd,
						onOpenPopup: openPopup,
						onclosePopup: closePopup,
					})
					: ' ', // иначе ошибка гидратации
			meta: {
				class: {
					th: `text-[12px] text-center box-border px-[0] ${
						days.length === 14
							? 'w-[71.4px] whitespace-normal'
							: days.length > 14
								? 'w-[33.3px] whitespace-pre'
								: 'w-[150px] whitespace-normal'
					}`,
					td: `p-0 ${
						(i + 1) % 7 === 6 || (i + 1) % 7 === 0 ? 'bg-[#f9f9f9]' : ''
					}`,
				},
			},
		})),
	]

	return columns
}