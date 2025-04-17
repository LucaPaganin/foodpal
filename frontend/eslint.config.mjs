import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default tseslint.config(
  {
    extends: [
      ...tseslint.configs.recommended,
    ],
    rules: {
      // Allow @ts-ignore, @ts-nocheck comments to silence TypeScript errors
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      // Suppress react-specific TypeScript errors
      "@typescript-eslint/no-misused-promises": "off",
      // Add other rules you want to customize
    }
  },
  // Add other configurations as needed
);