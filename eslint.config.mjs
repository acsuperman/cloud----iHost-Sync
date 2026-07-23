import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // ── 分号 ──────────────────────────────
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'semi', requireLast: false },
      }],

      // ── 引号 ──────────────────────────────
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],

      // ── 缩进 ──────────────────────────────
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],

      // ── 逗号 ──────────────────────────────
      '@stylistic/comma-dangle': ['error', 'always-multiline'],

      // ── 空格 ──────────────────────────────
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-before-blocks': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],

      // ── 换行 ──────────────────────────────
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/padding-line-between-statements': ['error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],

      // ── 块内空格 ──────────────────────────
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],

      // ── TypeScript 专用 ────────────────────
      '@stylistic/type-annotation-spacing': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],
    },
  },
  {
    ignores: ['node_modules/', 'dist/'],
  },
);
