import apifyConfig from '@apify/eslint-config';

// eslint-disable-next-line import/no-default-export
export default [
    { ignores: ['**/dist'] }, // Ignores need to happen first
    ...(Array.isArray(apifyConfig) ? apifyConfig : [apifyConfig]),
    {
        languageOptions: {
            sourceType: 'module',

            parserOptions: {
                project: 'tsconfig.eslint.json',
            },
        },
    },
];
