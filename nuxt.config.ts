export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/ui', '@pinia/nuxt'],
	css: ['@/assets/styles/index.css'],

	runtimeConfig: {
		public: {
			defaultLocale: 'ru-RU'
		}
	},

	// Legacy
	alias: {
		'@legacy': '/legacy',
	},
	vite: {
		resolve: {
			alias: {
				'@legacy': '/legacy',
			},
		},
	},
	typescript: {
		strict: false,
	},
})
