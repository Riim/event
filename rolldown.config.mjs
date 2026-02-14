import { defineConfig } from 'rolldown';

const libName = 'event';

export default defineConfig(() => {
	return [
		['esm', 'js']
		// ['umd', 'umd.js']
	].map(([format, fileExt]) => ({
		input: `src/${libName}.ts`,

		output: {
			file: `dist/${libName}.${fileExt}`,
			format,
			name: libName
		}
	}));
});
