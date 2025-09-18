export default defineAppConfig({
	ui: {
		colors: {
			primary: 'blue',
		},

		button: {
			base: 'rounded-none box-border select-none',
			sizes: {
				fixed: 'h-12 px-4 text-base',
      		},
			compoundVariants: [
				{
					color: 'primary',
					variant: 'outline',
					class: 'hover:bg-primary-400 hover:text-primary-50 cursor-pointer',
				},
				{
					color: 'primary',
					variant: 'solid',
					class: 'hover:bg-primary-400 hover:text-primary-50',
				}
			],
			defaultVariants: {
				color: 'primary',
				variant: 'outline',
				size: 'md',
			}
		},

		table: {
			slots: {
				th: 'text-center',
				td: 'box-border border border-gray-200 border-collapse',
			}
		},
	}
})
