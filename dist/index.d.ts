import { Plugin } from 'vite';
import { RouteRecord, RouteRecordRaw } from 'vue-router';

type RouteInput = Pick<RouteRecordRaw, 'path' | 'children'>;
/**
 * Plugin options for the sitemap plugin.
 */
interface PluginOptions {
    /**
     * The path to the router file.
     */
    routerFile?: string;
    /**
     * The array of route records. This takes precedence over the router file.
     */
    routes?: Array<RouteRecord>;
    /**
     * A function to filter routes.
     * @param route - The route to be filtered.
     * @returns Whether the route should be included or not.
     */
    filter?: (route?: RouteInput) => boolean;
    /**
     * The URL of the application.
     */
    appUrl?: string;
    /**
     * The path of the output file.
     * @default (build.outDir || 'dist/') + 'sitemap.xml'
     */
    outfile?: string;
}
declare const sitemapPlugin: ({ routerFile, routes, outfile, filter, appUrl }: PluginOptions) => Plugin;

export { sitemapPlugin };
