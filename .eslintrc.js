module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        requireConfigFile: false,
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
    ],
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    plugins: [
        'react',
    ],
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'linebreak-style': ['error', 'unix'],
        semi: ['error', 'always'],
        'dot-notation': ['error', { allowKeywords: true }],
        'quote-props': ['error', 'as-needed'], // Only use quotes around object properties where required
        quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }], // Prefer single quotes, allow template literals and escaping
        'padding-line-between-statements': ['error',                                              //  require or disallow padding lines between statements
            {blankLine: 'always', prev: '*', next: 'return'},
            {blankLine: 'any', prev: 'directive', next: 'directive'},
            {blankLine: 'always', prev: ['const', 'let', 'var'], next: '*'},
            {blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
            {blankLine: 'always', prev: ['import'], next: '*'},
            {blankLine: 'any', prev: ['import'], next: ['import']},
        ],
        'block-spacing': ['error', 'always'], // Ensure space inside of blocks after opening block and before closing block
        'brace-style': ['error', '1tbs', { allowSingleLine: true }], // Enforce brace style for control statements
        'comma-dangle': ['error', 'always-multiline'],

        'react/jsx-indent': ['error', 4], // Enforce 4 space indentation in JSX components
        'react/jsx-indent-props': ['error', 4], // Enforce 4 space indentation for props

    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
