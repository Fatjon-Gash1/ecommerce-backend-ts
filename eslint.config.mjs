import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },

    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },

    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: '@typescript-eslint/parser',
        },
    },

    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
