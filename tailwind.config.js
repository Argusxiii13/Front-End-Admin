/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [
		function ({ addComponents }) {
			addComponents({
				'.modal': {
					'@apply fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50': {},
					'& .modal-content': {
						'@apply bg-gray-800 rounded-lg p-6 w-11/12 shadow-lg border border-gray-700': {},
					},
					'& .modal-content-small': {
						'@apply bg-gray-800 rounded-lg p-6 w-7/12 shadow-lg border border-gray-700': {},
					},
					'& .modal-content-really-small': {
						'@apply bg-gray-800 rounded-lg p-6 w-3/12 shadow-lg border border-gray-700': {},
					},
					'& .modal-header': {	
						'@apply text-gray-100 text-2xl cursor-pointer': {},
					},
					'& .modal-title': {
						'@apply text-xl font-semibold text-gray-100 mb-9': {}, // Increased margin-bottom here
					},
					'& .modal-input': {
						'@apply bg-gray-700 text-white p-2 rounded-md border-none w-full': {},
					},
					'& .modal-button': {
						'@apply bg-blue-500 text-black rounded-md px-4 py-2 mt-4': {},
					},
					'& .modal-button-green': {
						'@apply bg-green-500 text-black rounded-md px-4 py-2 mt-4': {},
					},
					'& .modal-button-red': {
						'@apply bg-red-500 text-black rounded-md px-4 py-2 mt-4': {},
					},
					'& .modal-button-blue': {
						'@apply bg-blue-500 text-black rounded-md px-4 py-2 mt-4': {},
					},
					'& .modal-button-orange': {
						'@apply bg-orange-500 text-black rounded-md px-4 py-2 mt-4': {},
					},
					'& .modal-textarea': {
						'@apply bg-gray-700 text-white p-2 rounded-md border-none w-full resize-none': {}, // Prevent resizing
					},
					'& .dropdown-menu': {
						'@apply bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto': {}, // Make dropdown scrollable
					},
					'& .dropdown-button': {
						'@apply bg-blue-500 text-black rounded-md px-4 py-2': {},
					},
				},
			});
		},
	],
};