
export const useCalendarColumns = (
		start: any,
		end: any,
		component: any
	) => {

		const days = getDaysInRange(start, end);

		const columns = [
			{
				accessorKey: 'stuff',
				header: ' ',
				cell: ({ row }: any) => h(component, { row }),
				meta: {
					class: {
						th: 'min-w-[155px] w-[155px]',
						td: 'h-[120px] py-[10px] px-[0]',
					}
				},
			},
				...days.map((day, i) => ({
					accessorKey: `day${i}`,
					header: formatDayForHeader(day),
					cell: ({ row }: any) => row.getValue(`day${i}`),
					meta: {
						class: {
							th: `text-[12px] w-auto text-center box-border px-[0] ${days.length > 14? 'whitespace-pre w-[33.3px]': 'whitespace-normal'}`,
							td: 'p-0',
						},
					},
				})),
		]
	return columns
}


