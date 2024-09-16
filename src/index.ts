import { Plugin } from 'vite'
import { RouteRecord, RouteRecordRaw } from 'vue-router'
import { writeFile } from 'fs'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

type RouteInput = Pick<RouteRecordRaw, 'path' | 'children'>

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

export const sitemapPlugin = ({
  routerFile,
  routes,
  outfile,
  filter,
  appUrl
}: PluginOptions): Plugin => ({
  name: 'vite-sitemap-router',
  apply: 'build',
  writeBundle: async function (outputOptions, bundle) {
    // Mocking window object in Node.js
    if (!global.window) {
      GlobalRegistrator.register()
    }

    let resolvedRoutes: Array<RouteInput> = []

    const wd = process.cwd()
    if (!routerFile?.startsWith(wd)) {
      routerFile = `${wd}/${routerFile}`
    }

    const outDir = `${outputOptions.dir || 'dist'}/`
    const filePath = outfile || outDir + 'sitemap.xml'
    let routerFileData

    try {
      if (routes) {
        resolvedRoutes = routes
      } else if (routerFile) {
        try {
          for (const [fileName, chunkInfo] of Object.entries(bundle)) {
            if (chunkInfo.type === 'chunk') {
              const targetModule = chunkInfo.modules[routerFile]
              if (targetModule) {
                this.debug({
                  message: 'Found router file in chunk ' + outDir + fileName
                })

                const out = await import(outDir + fileName)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                for (const value of Object.values<any>(out)) {
                  if (value?.getRoutes && value?.install) {
                    routerFileData = value
                    break
                  }
                }
                break
              }
            }
          }

          this.debug({
            message: `Loading router file: ${routerFile}`
          })

          if (routerFileData) {
            resolvedRoutes = routerFileData.getRoutes()
          } else {
            throw new Error(
              'No data found in router file; is it exported correctly?'
            )
          }
        } catch (error) {
          this.error({ message: 'Error loading router file: ' + error })
        }
      }

      const getRoutesList = (
        routes: Readonly<Array<RouteInput>>,
        host?: string,
        filter?: PluginOptions['filter']
      ) => {
        return Array.from(
          new Set(
            routes.reduce<Array<string>>((dest, route) => {
              if (filter && !filter(route)) {
                return dest
              }

              if (!host && route.path.trim() === '') return dest

              let path = `${host || ''}${route.path}`

              if (route.path !== '*' && route.path !== '/:catchAll(.*)') {
                if (path.endsWith('/')) {
                  path = path.slice(0, -1)
                }
                dest.push(path)
              }

              if (route.children) {
                dest.push(...getRoutesList(route.children, `${path}/`))
              }

              return dest
            }, [])
          )
        ).sort((a, b) => a.localeCompare(b))
      }

      const getRoutesXML = () => {
        const list = getRoutesList(resolvedRoutes, appUrl, filter)
          .map(
            (route) => `
  <url>
    <loc>${route}</loc>
  </url>`
          )
          .join('\r\n')
        return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${list}
  </urlset>`
      }

      const xmlOutput = getRoutesXML()

      writeFile(filePath, xmlOutput, (err) => {
        if (err) {
          this.error({ message: 'Error writing sitemap file:' + err })
        }
      })
    } catch (error) {
      this.error({ message: 'Error generating sitemap: ' + error })
    } finally {
      await GlobalRegistrator.unregister()
    }
  }
})
