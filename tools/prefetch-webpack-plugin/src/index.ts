import webpack from 'webpack';
import PeerHtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { getHtmlWebpackPlugin } from './hack';

/**
 * 1. 如何保证 script 的位置的正确性
 * 2. react-refresh 会注入很多东西 保证热更新
 * 3. 别的文件可能会 import prefetch，导致 executeTask 执行多次
 */

interface IPrefetchWebpackPluginOptions {
  entryName: string;
  entryPath: string;
  inline?: boolean;
  HtmlWebpackPlugin?: typeof PeerHtmlWebpackPlugin;
}

export class PrefetchWebpackPlugin {
  options: IPrefetchWebpackPluginOptions;
  fileBuildName: string;
  constructor(options: IPrefetchWebpackPluginOptions) {
    this.options = options;
  }
  apply(compiler: webpack.Compiler) {
    const {
      inline,
      entryName,
      entryPath,
      HtmlWebpackPlugin: SpecificHtmlWebpackPlugin,
    } = this.options;

    /**
     * add a new entry point
     */
    new compiler.webpack.EntryPlugin(
      compiler.context,
      entryPath,
      entryName
    ).apply(compiler);

    const HtmlWebpackPlugin =
      SpecificHtmlWebpackPlugin ||
      // PeerHtmlWebpackPlugin ||
      getHtmlWebpackPlugin(compiler);

    if (!HtmlWebpackPlugin) {
      throw new Error(
        'PrefetchWebpackPlugin: Cant found HtmlWebpackPlugin, make sure you import it'
      );
    }

    if (HtmlWebpackPlugin === PeerHtmlWebpackPlugin) {
      console.warn(
        'PrefetchWebpackPlugin: make sure “HtmlWebpackPlugin” is a single instance'
      );
    }

    compiler.hooks.thisCompilation.tap(
      'PrefetchWebpackPlugin::find-build-file',
      (compilation) => {
        /**
         * find the build file
         */
        HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tap(
          'PrefetchWebpackPlugin::find-build-file',
          (data) => {
            const anchorPath = entryPath.startsWith('.')
              ? entryPath.slice(1)
              : entryPath;

            compilation.modules.forEach((module) => {
              // @ts-ignore
              const filePath = module.resource as string;

              if (filePath?.endsWith(anchorPath)) {
                module.getChunks().forEach((chunk) => {
                  chunk.files.forEach((filename) => {
                    /**
                     * @TODO 多个chunks
                     */
                    if (filename.startsWith(entryName)) {
                      this.fileBuildName = filename;
                    }
                  });
                });
              }
            });

            return data;
          }
        );
        /**
         * make sure the script is front
         */
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
          'PrefetchWebpackPlugin::sort',
          (data) => {
            const anchorScript = data.assetTags.scripts.find((script) =>
              script.attributes.src.toString().endsWith(this.fileBuildName)
            );

            if (anchorScript) {
              data.assetTags.scripts = [
                anchorScript,
                ...data.assetTags.scripts.filter(
                  (script) =>
                    !script.attributes.src
                      .toString()
                      .endsWith(this.fileBuildName)
                ),
              ];
            }

            return data;
          }
        );
        /**
         * inline
         * https://github1s.com/icelam/html-inline-script-webpack-plugin/blob/develop/src/HtmlInlineScriptPlugin.ts#L153
         */
        if (inline) {
          HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
            'PrefetchWebpackPlugin::inline',
            (data) => {
              data.assetTags.scripts = data.assetTags.scripts.map((tag) => {
                const tagName = tag.attributes.src.toString();

                if (tagName.endsWith(this.fileBuildName)) {
                  const asset = compilation.assets[this.fileBuildName];

                  if (!asset) {
                    return tag;
                  }

                  delete compilation.assets[this.fileBuildName];

                  const { src, ...attributesWithoutSrc } = tag.attributes;

                  return {
                    tagName: 'script',
                    innerHTML: asset.source() as string,
                    voidTag: false,
                    attributes: attributesWithoutSrc,
                    meta: { plugin: 'PrefetchWebpackPlugin' },
                  };
                }
                return tag;
              });

              return data;
            }
          );
        }
      }
    );
  }

  getPublicPath(
    compilation: webpack.Compilation,
    htmlFileName: string,
    customPublicPath: string
  ): string {
    const webpackPublicPath = compilation.getAssetPath(
      compilation.outputOptions.publicPath as string,
      { hash: compilation.hash }
    );
    // Webpack 5 introduced "auto" as default value
    const isPublicPathDefined = webpackPublicPath !== 'auto';

    let publicPath = '';

    if (customPublicPath !== 'auto') {
      // If the html-webpack-plugin options contain a custom public path uset it
      publicPath = customPublicPath;
    } else if (isPublicPathDefined) {
      // If a hard coded public path exists in webpack config use it
      publicPath = webpackPublicPath;
    } else if (compilation.options.output.path) {
      // If no public path for webpack and html-webpack-plugin was set get a relative url path
      publicPath = path
        .relative(
          path.resolve(
            compilation.options.output.path,
            path.dirname(htmlFileName)
          ),
          compilation.options.output.path
        )
        .split(path.sep)
        .join('/');
    }

    if (publicPath && !publicPath.endsWith('/')) {
      publicPath += '/';
    }

    return publicPath;
  }
}
