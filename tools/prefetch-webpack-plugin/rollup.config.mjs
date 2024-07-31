import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import clear from 'rollup-plugin-clear';
import dts from 'rollup-plugin-dts';
import url from 'rollup-plugin-url';

export default defineConfig([
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
      },
    ],
    plugins: [
      clear({ targets: ['dist'] }),
      resolve({
        exportConditions: ['node'],
      }),
      postcss(),
      commonjs({
        extensions: ['.ts'],
      }),
      json(),
      typescript(),
      babel(),
    ],
    watch: {
      include: './src/**',
    },
    external: ['html-webpack-plugin', 'webpack'],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'cjs',
    },
    external: ['html-webpack-plugin', 'webpack'],

    plugins: [
      url({
        exclude: ['**/*.ts', '**/*.tsx'],
        include: [
          '**/*.svg',
          '**/*.png',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.gif',
          '**/*.scss',
          '**/*.css',
        ],
      }),
      dts(),
    ],
  },
]);
