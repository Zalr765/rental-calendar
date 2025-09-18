export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/ui'],
	css: ['@/assets/styles/index.css'],

	runtimeConfig: {
		public: {
			defaultLocale: 'ru-RU'
		}
	}
})
