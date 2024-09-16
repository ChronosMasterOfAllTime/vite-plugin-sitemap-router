# Web Plugins

This directory contains the source code for various web plugins used in our project. Below is a brief overview of the structure and contents of this directory.

## Directory Structure

- `src/`: Contains the source code for the plugins.

## Excluded Directories

- `dist/`: This directory is used for the distribution files and is not included in the source control.
- `node_modules/`: This directory contains the dependencies and is not included in the source control.

## Getting Started

To get started with the development of these plugins, follow the steps below:

1. **Install Dependencies**:
```sh
    npm install
```

2. **Build the Plugins**:
```sh
    npm run build
```

3. **Run Lint**:
```sh
    npm run lint
```

## Usage
    This is intended to be used in the `vite.config.(ts|js)` file. The following is an example of how to use the plugin:

### By direct route definition
```ts
    import { defineConfig } from 'vite';
    import { sitemapPlugin } from './web/plugins';

    export default defineConfig({
        plugins: [
            sitemapPlugin({
                appUrl: 'https://example.com',
                routes: [
                    {
                        path: '/about',
                        name: 'about',
                    }
                    {
                        path: '/contact',
                        name: 'contact',
                        children: [
                            {
                                path: '',
                                name: 'contact.chat'
                            },
                            {
                                path: 'email',
                                name: 'contact.email'
                            }
                        ]
                    },
                ],
            }),
        ]
       // ...other vite config below...
    });
```

### By router file

```ts 
    import { defineConfig } from 'vite';
    import { sitemapPlugin } from './web/plugins';

    export default defineConfig({
        plugins: [
            sitemapPlugin({
                appUrl: 'https://example.com',
                routerFile: 'src/router/index.ts', // this contains your exported router used in your entrypoint in main.ts
            }),
        ]
       // ...other vite config below...
    });
```

### Options

Please see the options below for the sitemap plugin:

```ts
/**
 * Plugin options for the sitemap plugin.
 */
interface PluginOptions {
  /**
   * The path to the router file.
   */
  routerFile?: string
  /**
   * The array of route records. This takes precedence over the router file.
   */
  routes?: Array<RouteRecord>
  /**
   * A function to filter routes.
   * @param route - The route to be filtered.
   * @returns Whether the route should be included or not.
   */
  filter?: (route?: RouteInput) => boolean
  /**
   * The URL of the application.
   */
  appUrl?: string
  /**
   * The path of the output file.
   * @default (build.outDir || 'dist/') + 'sitemap.xml'
   */
  outfile?: string
}
```

## Contributing

We welcome contributions! Please read our [contributing guidelines](../CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.**
