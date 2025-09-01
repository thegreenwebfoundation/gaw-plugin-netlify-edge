import { GridIntensity } from "@greenweb/grid-aware-websites";
// @ts-ignore
import { HTMLRewriter } from "@worker-tools/html-rewriter";

/**
 * Type definitions
 * @typedef {import('./types').netlifyContext} netlifyContext The incoming request object.
 * @typedef {import('./types').locationOptions} locationOptions Additional options for the function.
 * @typedef {import('./types').locationResponse} locationResponse The location of the user.
 */

/**
 * Get the location of the user from the request object.
 * @param {netlifyContext} context The incoming request object.
 * @param {locationOptions} [options] Additional options for the function.
 * @returns {locationResponse} The location of the user.
 * @example
 * const location = getLocation(request);
 * location = { country: "DE" }
 */

const getLocation = (context, options) => {
  const mode = options?.mode || "country";

  const country = context.geo?.country?.code;

  if (mode === "latlon") {
    const lat = context.geo?.latitude.toString();
    const lon = context.geo?.longitude.toString();

    if (!lat || !lon) {
      if (country) {
        return {
          status: "error",
        };
      }

      return {
        status: "success",
        country,
      };
    }

    return {
      status: "success",
      lat,
      lon,
    };
  }

  if (!country) {
    return {
      status: "error",
    };
  }

  return {
    status: "success",
    country,
  };
};

/**
 *
 * @param {Request} request The incoming request object.
 * @param {netlifyContext} context The incoming request object.
 * @param {Object} [config={}] - Configuration options for GAW behavior.
 * @param {string[]} [config.contentType=['text/html']] - Content types to process.
 * @param {string[]} [config.ignoreRoutes=[]] - Routes to exclude from GAW processing.
 * @param {string} [config.ignoreGawCookie='gaw'] - Cookie name to disable GAW for specific users.
 * @param {boolean} [config.userOptIn=false] - Allows developers to specify if whether users are required to opt-in to the grid-aware website experience on their site.
 * @param {"latlon"|"country"} [config.locationType='latlon'] - Type of location data to use.
 * @param {Object} [config.htmlChanges=null] - An object to capture the different HTML changes that are applied at each different grid intesity level.
 * @param {Object} [config.htmlChanges.low=null] - Custom HTMLRewriter for page modification at low grid intensity level.
 * @param {Object} [config.htmlChanges.moderate=null] - Custom HTMLRewriter for page modification at moderate grid intensity level.
 * @param {Object} [config.htmlChanges.high=null] - Custom HTMLRewriter for page modification at high grid intensity level.
 * @param {null|'low'|'moderate'|'high'} [config.defaultView=null] - Default view for the grid-aware website experience.
 * @param {string} [config.gawDataApiKey=''] - API key for the data source.
 * @param {Object} [config.infoBar={}] - Configuration for the info bar element.
 * @param {string} [config.infoBar.target=''] - Target element for the info bar.
 * @param {string} [config.infoBar.version='latest'] - Version of the info bar to use.
 * @param {string} [config.infoBar.learnMoreLink='#'] - Link to learn more about the info bar.
 * @param {string} [config.infoBar.popoverText=''] - Provide a custom string of text to be used in the info bar popover element.
 * @param {string} [config.infoBar.customViews=''] - Custom views for the grid-aware website experience.
 * @param {"none"|"full"|"headers"|"logs"} [config.debug="none"] - Activates debug mode which outputs logs and returns additional response headers.
 * @param {boolean} [config.dev=false] - Whether to enable development mode.
 * @param {Object} [config.devConfig=null] - Configuration for development mode.
 * @param {string} [config.devConfig.hostname=''] - Hostname for development mode.
 * @param {string} [config.devConfig.port=''] - Port for development mode.
 * @param {string} [config.devConfig.protocol=''] - Protocol for development mode.
 * @returns {Promise<Response>} A modified or unmodified response based on grid data and configuration.
 * @example
 * // Basic usage in a Netlify Edge Function
 * export default async (request, context) => {
 *     return auto(request, context, {
 *         gawDataApiKey: 'your-api-key'
 *     });
 * };
 */
async function auto(request, context, config = {}) {
  // Only run function on GET requests
  if (request.method !== "GET") {
    //@ts-ignore
    return fetch(request);
  }

  const debug = config?.debug || "none";
  let debugHeaders = {};

  try {
    const contentType = config?.contentType || ["text/html"];
    const ignoreRoutes = config?.ignoreRoutes || [];
    const ignoreGawCookie = config?.ignoreGawCookie || "gaw-ignore";
    const htmlChanges = config?.htmlChanges || {};
    const locationType = config.locationType || "latlon";
    const devMode = config.dev || false;
    const devConfig = config.devConfig || {};
    const userOptIn = config.userOptIn || false;
    const defaultView = config.defaultView || null;

    // We set this as an options object so that we can add keys to it later if we want to expand this function
    const gawOptions = {};
    gawOptions.apiKey = config?.gawDataApiKey || "";

    const infoBarOptions = {};
    infoBarOptions.target = config?.infoBar?.target || "";
    infoBarOptions.learnMoreLink = config?.infoBar?.learnMoreLink || "#";
    infoBarOptions.version = config?.infoBar?.version || "latest";
    infoBarOptions.popoverText = config?.infoBar?.popoverText || "";
    infoBarOptions.customViews = config?.infoBar?.customViews || "";

    let dev = null;
    if (devMode) {
      console.log("Dev mode enabled");
      const url = new URL(request.url);
      url.hostname = devConfig.hostname || "localhost";
      url.port = devConfig.port || "8080";
      url.protocol = devConfig.protocol || "http";
      // @ts-ignore
      dev = new Request(url.toString(), request.clone());
    }

    if (dev) {
      // @ts-ignore
      request = dev;
    }

    const url = request.url;

    // If the route we're working on is on the ignore list, bail out as well
    if (ignoreRoutes.some((route) => url.includes(route))) {
      // @ts-ignore
      return context.next();
    }

    //@ts-ignore
    const response = await context.next();

    const contentTypeHeader = response.headers.get("content-type");

    // Then check if the request content type is HTML.
    // If the content is not HTML, then return the response without any changes.
    if (!contentTypeHeader) {
      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-applied": "no-content-type" };
      }

      Object.keys(debugHeaders).forEach((key) => {
        response.headers.set(key, debugHeaders[key]);
      });
      return response;
    }

    // Check if the content type is in the list of content types to modify
    const isContentTypeValid = contentType.some((type) =>
      contentTypeHeader.toLowerCase().includes(type.toLowerCase()),
    );

    if (!isContentTypeValid) {
      if (debug === "full" || debug === "logs") {
        // If none of the content types match, return the response without changes.
        console.log(
          "Content type is not in the list, returning response as is",
          url,
          contentTypeHeader,
          contentType,
        );
      }

      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-applied": "skip-content-type" };
      }

      Object.keys(debugHeaders).forEach((key) => {
        response.headers.set(key, debugHeaders[key]);
      });

      return response;
    }

    let rewriter = null;

    // We use a cookie to allow us to manually disable the grid-aware feature.
    // This is useful for testing purposes. It can also be used to disable the feature for specific users.
    const requestCookies = request.headers.get("cookie");

    if (requestCookies && requestCookies.includes("gaw-manual-view")) {
      if (infoBarOptions.customViews.length > 0) {
        infoBarOptions.customViews.split(",").map((view) => {
          if (
            requestCookies.includes(
              `gaw-manual-view=${view.trim().toLowerCase()}`,
            )
          ) {
            rewriter = htmlChanges[view.trim().toLowerCase()];
          }
        });
      } else {
        if (requestCookies.includes("gaw-manual-view=low")) {
          rewriter = htmlChanges.low;
        } else if (requestCookies.includes("gaw-manual-view=moderate")) {
          rewriter = htmlChanges.moderate;
        } else if (requestCookies.includes("gaw-manual-view=high")) {
          rewriter = htmlChanges.high;
        }
      }

      if (infoBarOptions.target.length > 0) {
        rewriter.on("head", {
          element(element) {
            element.append(
              `<script type="module" src="https://esm.sh/@greenweb/gaw-info-bar@${infoBarOptions.version}"></script>`,
              { html: true },
            );
          },
        });

        rewriter.on(infoBarOptions.target, {
          element(element) {
            element.setInnerContent(
              `<gaw-info-bar ${infoBarOptions.customViews.length > 0 ? `data-views="${infoBarOptions.customViews}"` : ""} ${defaultView ? `data-default-view="${defaultView}"` : ""} data-learn-more-link=${infoBarOptions.learnMoreLink} ${infoBarOptions.popoverText.length > 0 ? `data-popover-text=${infoBarOptions.popoverText}` : ""}> </gaw-info-bar>`,
              { html: true },
            );
          },
        });
      }

      Object.keys(debugHeaders).forEach((key) => {
        response.headers.set(key, debugHeaders[key]);
      });

      return response;
    }

    if (userOptIn && !requestCookies?.includes("gaw-user-opt-in=true")) {
      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-applied": "user-opt-in" };
      }

      if (infoBarOptions.customViews.length > 0) {
        infoBarOptions.customViews.split(",").map((view) => {
          if (defaultView.toLowerCase() === view.trim().toLowerCase()) {
            rewriter = htmlChanges[view.trim().toLowerCase()];
          } else {
            //@ts-ignore
            rewriter = new HTMLRewriter();
          }
        });
      } else {
        if (defaultView === "low") {
          rewriter = htmlChanges.low;
        } else if (defaultView === "moderate") {
          rewriter = htmlChanges.moderate;
        } else if (defaultView === "high") {
          rewriter = htmlChanges.high;
        } else {
          //@ts-ignore
          rewriter = new HTMLRewriter();
        }
      }

      if (infoBarOptions.target.length > 0) {
        rewriter.on("head", {
          element(element) {
            element.append(
              `<script type="module" src="https://esm.sh/@greenweb/gaw-info-bar@${infoBarOptions.version}"></script>`,
              { html: true },
            );
          },
        });

        rewriter.on(infoBarOptions.target, {
          element(element) {
            element.setInnerContent(
              `<gaw-info-bar ${infoBarOptions.customViews.length > 0 ? `data-views="${infoBarOptions.customViews}"` : ""} ${defaultView ? `data-default-view="${defaultView}"` : ""} data-learn-more-link=${infoBarOptions.learnMoreLink} ${infoBarOptions.popoverText.length > 0 ? `data-popover-text=${infoBarOptions.popoverText}` : ""}> </gaw-info-bar>`,
              { html: true },
            );
          },
        });
      }

      Object.keys(debugHeaders).forEach((key) => {
        response.headers.set(key, debugHeaders[key]);
      });

      return response;
    }

    if (requestCookies && requestCookies.includes(ignoreGawCookie)) {
      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-applied": "skip-cookie" };
      }
      //@ts-ignore
      rewriter = new HTMLRewriter();

      if (infoBarOptions.target.length > 0) {
        rewriter.on("head", {
          element(element) {
            element.append(
              `<script type="module" src="https://esm.sh/@greenweb/gaw-info-bar@${infoBarOptions.version}"></script>`,
              { html: true },
            );
          },
        });

        rewriter.on(infoBarOptions.target, {
          element(element) {
            element.setInnerContent(
              `<gaw-info-bar ${infoBarOptions.customViews.length > 0 ? `data-views="${infoBarOptions.customViews}"` : ""} ${defaultView ? `data-default-view="${defaultView}"` : ""} data-learn-more-link=${infoBarOptions.learnMoreLink} ${infoBarOptions.popoverText.length > 0 ? `data-popover-text=${infoBarOptions.popoverText}` : ""} data-ignore-cookie=${ignoreGawCookie}> </gaw-info-bar>`,
              { html: true },
            );
          },
        });
      }

      Object.keys(debugHeaders).forEach((key) => {
        response.headers.set(key, debugHeaders[key]);
      });

      return response;
    }

    // Get the location of the user
    const location = await getLocation(context, {
      mode: locationType,
    });

    const { lat, lon, country } = location;

    // If the country data does not exist, then return the response without any changes.
    if (!country && (!lat || !lon)) {
      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-applied": "no-location-found" };
      }

      if (debug === "full" || debug === "logs") {
        console.log("No location found.");
      }

      Object.keys(debugHeaders).forEach((key) => {
        response.headers.set(key, debugHeaders[key]);
      });

      return response;
    }

    if (lat && lon) {
      if (debug === "full" || debug === "headers") {
        debugHeaders = {
          ...debugHeaders,
          "gaw-location": `lat: ${lat}, lon: ${lon}`,
        };
      }

      if (debug === "full" || debug === "logs") {
        console.log(`Location: lat: ${lat}, lon: ${lon}`);
      }
    } else {
      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-location": `${country}` };
      }

      if (debug === "full" || debug === "logs") {
        console.log(`Location: ${country}`);
      }
    }

    let gridData = {};

    if (!gridData?.status) {
      if (debug === "full" || debug === "logs") {
        console.log("Using data from API");
      }

      if (debug === "full" || debug === "headers") {
        debugHeaders = { ...debugHeaders, "gaw-data-source": "api" };
      }

      const options = {
        mode: "level",
        apiKey: Netlify.env.get("EMAPS_API_KEY") || gawOptions.apiKey,
      };

      const gridIntensity = new GridIntensity(options);
      if (lat && lon) {
        gridData = await gridIntensity.check({ lat, lon });
      } else {
        gridData = await gridIntensity.check(country);
      }

      // If there's an error getting data, return the web page without any modifications
      if (gridData && "status" in gridData && gridData.status === "error") {
        if (debug === "full" || debug === "headers") {
          debugHeaders = { ...debugHeaders, "gaw-applied": "error-grid-data" };
        }

        if (debug === "full" || debug === "logs") {
          console.log("Error getting grid data", gridData);
        }

        Object.keys(debugHeaders).forEach((key) => {
          response.headers.set(key, debugHeaders[key]);
        });

        return response;
      }
    }

    if (debug === "full" || debug === "headers") {
      debugHeaders = {
        ...debugHeaders,
        "gaw-applied": "auto",
        "gaw-grid-data": JSON.stringify(gridData),
        "gaw-location": JSON.stringify(location),
      };
    }

    if (debug === "full" || debug === "logs") {
      console.log(JSON.stringify(gridData));
    }

    if (gridData.level === "low" && htmlChanges.low) {
      rewriter = htmlChanges.low;

      if (infoBarOptions.target.length > 0) {
        rewriter.on("head", {
          element(element) {
            element.append(
              `<script type="module" src="https://esm.sh/@greenweb/gaw-info-bar@${infoBarOptions.version}"></script>`,
              { html: true },
            );
          },
        });

        rewriter.on(infoBarOptions.target, {
          element(element) {
            element.setInnerContent(
              `<gaw-info-bar ${infoBarOptions.customViews.length > 0 ? `data-views="${infoBarOptions.customViews}"` : ""} ${defaultView ? `data-default-view="${defaultView}"` : ""} data-learn-more-link=${infoBarOptions.learnMoreLink} ${infoBarOptions.popoverText.length > 0 ? `data-popover-text=${infoBarOptions.popoverText}` : ""} data-gaw-level="low" data-gaw-location="${gridData.region}" data-learn-more-link=${infoBarOptions.learnMoreLink}> </gaw-info-bar>`,
              { html: true },
            );
          },
        });
      }
    } else if (gridData.level === "moderate" && htmlChanges.moderate) {
      rewriter = htmlChanges.moderate;
      if (infoBarOptions.target.length > 0) {
        rewriter.on("head", {
          element(element) {
            element.append(
              `<script type="module" src="https://esm.sh/@greenweb/gaw-info-bar@${infoBarOptions.version}"></script>`,
              { html: true },
            );
          },
        });

        rewriter.on(infoBarOptions.target, {
          element(element) {
            element.setInnerContent(
              `<gaw-info-bar ${infoBarOptions.customViews.length > 0 ? `data-views="${infoBarOptions.customViews}"` : ""} ${defaultView ? `data-default-view="${defaultView}"` : ""} data-learn-more-link=${infoBarOptions.learnMoreLink} ${infoBarOptions.popoverText.length > 0 ? `data-popover-text=${infoBarOptions.popoverText}` : ""} data-gaw-level="moderate" data-gaw-location="${gridData.region}" data-learn-more-link=${infoBarOptions.learnMoreLink}> </gaw-info-bar>`,
              { html: true },
            );
          },
        });
      }
    } else if (gridData.level === "high" && htmlChanges.high) {
      rewriter = htmlChanges.high;

      if (infoBarOptions.target.length > 0) {
        rewriter.on("head", {
          element(element) {
            element.append(
              `<script type="module" src="https://esm.sh/@greenweb/gaw-info-bar@${infoBarOptions.version}"></script>`,
              { html: true },
            );
          },
        });

        rewriter.on(infoBarOptions.target, {
          element(element) {
            element.setInnerContent(
              `<gaw-info-bar ${infoBarOptions.customViews.length > 0 ? `data-views="${infoBarOptions.customViews}"` : ""} ${defaultView ? `data-default-view="${defaultView}"` : ""} data-learn-more-link=${infoBarOptions.learnMoreLink} ${infoBarOptions.popoverText.length > 0 ? `data-popover-text=${infoBarOptions.popoverText}` : ""} data-gaw-level="high" data-gaw-location="${gridData.region}" data-learn-more-link=${infoBarOptions.learnMoreLink}> </gaw-info-bar>`,
              { html: true },
            );
          },
        });
      }
    }

    if (rewriter) {
      if (debug === "full" || debug === "logs") {
        console.log("Using HTMLRewriter");
      }

      const gawResponse = rewriter.transform(response);
      Object.keys(debugHeaders).forEach((key) => {
        gawResponse.headers.set(key, debugHeaders[key]);
      });

      return gawResponse;
    }

    if (debug === "full" || debug === "headers") {
      debugHeaders = { ...debugHeaders, "gaw-applied": "no-grid-aware" };
    }

    // If the gridAware value is set to false, then return the response as is.
    return new Response(response.clone().body, {
      ...response,
      headers: {
        ...response.headers,
        "Content-Encoding": "gzip",
        ...debugHeaders,
      },
    });
  } catch (e) {
    console.log("Error in grid-aware auto function", e);
    // If there's an error getting data, return the web page without any modifications
    // console.log('Error getting grid data', e);
    if (debug === "full" || debug === "headers") {
      debugHeaders = {
        ...debugHeaders,
        "gaw-applied": "error-failed",
      };
    }

    // @ts-ignore
    const errorResponse = await request.next();
    Object.keys(debugHeaders).forEach((key) => {
      errorResponse.headers.set(key, debugHeaders[key]);
    });
    return errorResponse;
  }
}

export default auto;
export { getLocation };
