// src/index.ts
import { writeFile } from "fs";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
var sitemapPlugin = ({
  routerFile,
  routes,
  outfile,
  filter,
  appUrl
}) => ({
  name: "vite-sitemap-router",
  apply: "build",
  writeBundle: async function(outputOptions, bundle) {
    if (!global.window) {
      GlobalRegistrator.register();
    }
    let resolvedRoutes = [];
    const wd = process.cwd();
    if (!routerFile?.startsWith(wd)) {
      routerFile = `${wd}/${routerFile}`;
    }
    const outDir = `${outputOptions.dir || "dist"}/`;
    const filePath = outfile || outDir + "sitemap.xml";
    let routerFileData;
    try {
      if (routes) {
        resolvedRoutes = routes;
      } else if (routerFile) {
        try {
          for (const [fileName, chunkInfo] of Object.entries(bundle)) {
            if (chunkInfo.type === "chunk") {
              const targetModule = chunkInfo.modules[routerFile];
              if (targetModule) {
                this.debug({
                  message: "Found router file in chunk " + outDir + fileName
                });
                const out = await import(outDir + fileName);
                for (const value of Object.values(out)) {
                  if (value?.getRoutes && value?.install) {
                    routerFileData = value;
                    break;
                  }
                }
                break;
              }
            }
          }
          this.debug({
            message: `Loading router file: ${routerFile}`
          });
          if (routerFileData) {
            resolvedRoutes = routerFileData.getRoutes();
          } else {
            throw new Error(
              "No data found in router file; is it exported correctly?"
            );
          }
        } catch (error) {
          this.error({ message: "Error loading router file: " + error });
        }
      }
      const getRoutesList = (routes2, host, filter2) => {
        return Array.from(
          new Set(
            routes2.reduce((dest, route) => {
              if (filter2 && !filter2(route)) {
                return dest;
              }
              if (!host && route.path.trim() === "") return dest;
              let path = `${host || ""}${route.path}`;
              if (route.path !== "*" && route.path !== "/:catchAll(.*)") {
                if (path.endsWith("/")) {
                  path = path.slice(0, -1);
                }
                dest.push(path);
              }
              if (route.children) {
                dest.push(...getRoutesList(route.children, `${path}/`));
              }
              return dest;
            }, [])
          )
        ).sort((a, b) => a.localeCompare(b));
      };
      const getRoutesXML = () => {
        const list = getRoutesList(resolvedRoutes, appUrl, filter).map(
          (route) => `
  <url>
    <loc>${route}</loc>
  </url>`
        ).join("\r\n");
        return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${list}
  </urlset>`;
      };
      const xmlOutput = getRoutesXML();
      writeFile(filePath, xmlOutput, (err) => {
        if (err) {
          this.error({ message: "Error writing sitemap file:" + err });
        }
      });
    } catch (error) {
      this.error({ message: "Error generating sitemap: " + error });
    } finally {
      await GlobalRegistrator.unregister();
    }
  }
});
export {
  sitemapPlugin
};
//# sourceMappingURL=index.js.map