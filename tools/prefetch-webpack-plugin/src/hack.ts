// @ts-nocheck
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export const getHtmlWebpackPlugin = (
  compiler: webpack.Compiler
): typeof HtmlWebpackPlugin | undefined => {
  return compiler.options.plugins.find((p) => {
    return (
      typeof p.constructor.getHooks === 'function' &&
      typeof p.constructor.createHtmlTagObject === 'function' &&
      p.userOptions?.template.endsWith('html') &&
      p.version === 5 &&
      p.options?.template.endsWith('html')
    );
  })?.constructor;
};
