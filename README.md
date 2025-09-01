# Grid-aware Websites - Netlify Edge Plugin

> [!WARNING]
> This branch includes features under active development that are not yet stable.

This plugin provides some useful functions that can be used when setting up the [`@greenweb/grid-aware websites`](/thegreenwebfoundation/grid-aware-websites/README.md) library using [Netlify Edge Functions](https://docs.netlify.com/platform/primitives/#edge-functions).

## Quickstart

The easiest way to use this plugin is by utilising the `gridAwareAuto` functionality that it provides. As a minimum, you would need to have the below code in your Netlify Edge Function.


> [!IMPORTANT]
> To use this function you also need to have a valid [Electricity Maps API](https://portal.electricitymaps.com/) key with access to the [Carbon Aware Websites API](https://portal.electricitymaps.com/developer-hub/api/reference#latest-carbon-intensity-level). This function currently uses that API as the source of grid intensity data. The Carbon Aware Websites API is currently only available under a paid plan, but we are in conversation with Electricity Maps on ways to make this data available in some kind of free version. You can track the progress and express your interest in this API [in this issue](https://github.com/thegreenwebfoundation/grid-aware-websites/issues/21).

```js
import gridAwareAuto from "https://esm.sh/@greenweb/gaw-plugin-netlify-edge@next";

export default async (request, context) => {
  return gridAwareAuto(request, context);
};
```

This code will:

1. Get the request location.
2. Fetch the current relative grid intensity using the [Electricity Maps API](https://portal.electricitymaps.com/).
3. Return the page to the user.

The `gridAwareAuto` function also accepts an options object as the fourth parameter. This allows for some configuration to be made to the implementation. Accepted options values are:

| Option                  | Type         |  Required/optional              | Default         | Possible values                                                                         | Description                                                                                                           |
| ----------------------- | ------------ | -------------- | --------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `gawDataApiKey`         | String       |  Required              | `''`            | "xyz123"                                                                                | API key for the Electricity Maps                                                                                           |
| `locationType`          | String       |  Optional             | `'latlon'`      | "latlon", "country"                                                                     | Type of location data to use                                                                                          |
| `contentType`           | String[]     |  Optional              | `['text/html']` | Example: ['text/html', 'text/css']                                                      | Defines the content types that should be processed                                                                    |
| `ignoreRoutes`          | String[]     |  Optional              | `[]`            | Example: ['/wp-admin', '/assets/js']                                                    | A list of routes where grid-aware code should not be applied                                                          |
| `ignoreGawCookie`       | String       |  Optional              | `'gaw-ignore'`  | "gaw-ignore"                                                                            | A cookie that when present will result in grid-aware code being skipped                                               |
| `userOptIn`             | Boolean      |  Optional              | `false`         | true, false                                                                             | Allows developers to specify if users are required to opt-in to the grid-aware website experience                     |
| `htmlChanges`           | Object       |  Optional              | {}              | {"low": HTMLRewriter, "moderate": HTMLRewriter, "high": HTMLRewriter}                   | An object to capture the different HTML changes that are applied at each different grid intesity level                |
| `htmlChanges.low`       | HTMLRewriter |  Optional              | null            | Custom HTMLRewriter for page modification at low grid intensity level                   |
| `htmlChanges.moderate`  | HTMLRewriter |  Optional              | null            | Custom HTMLRewriter for page modification at moderate grid intensity level              |
| `htmlChanges.high`      | HTMLRewriter |   Optional             | null            | Custom HTMLRewriter for page modification at high grid intensity level                  |
| `infoBar`               | Object       |   Optional             | `{}`            | `{target: "", version: "latest", learnMoreLink: "#", popoverText: "", customViews: ""}` | Configuration for the info bar element                                                                                |
| `infoBar.target`        | String       |   Optional             | `''`            | Example: "header", "#info-container"                                                    | Target element for the info bar                                                                                       |
| `infoBar.version`       | String       |   Optional             | `'latest'`      | "latest", "1.0.0"                                                                       | Version of the info bar to use                                                                                        |
| `infoBar.learnMoreLink` | String       |   Optional             | `'#'`           | Example: "https://example.com/learn-more"                                               | Link to learn more about the info bar                                                                                 |
| `infoBar.popoverText`   | String       |   Optional             | `''`            | Example: "This website adapts based on carbon intensity"                                | Provide a custom string of text to be used in the info bar popover element                                            |
| `infoBar.customViews`   | String       |   Optional             | `''`            | Example: "custom-low,custom-moderate,custom-high"                                       | Custom views for the grid-aware website experience                                                                    |
| `defaultView`           | String/null  |   Optional             | `null`          | null, "low", "moderate", "high"                                                         | Default view for the grid-aware website experience                                                                    |
| `dev`                   | Boolean      |   Optional             | `false`         | true, false                                                                             | Whether to enable development mode                                                                                    |
| `devConfig`             | Object       |    Optional            | `{}`            | `{hostname: "", port: "", protocol: ""}`                                                | Configuration for development mode                                                                                    |
| `devConfig.hostname`    | String       |   Optional             | `''`            | Example: "localhost"                                                                    | Hostname for development mode                                                                                         |
| `devConfig.port`        | String       |    Optional            | `''`            | Example: "8080"                                                                         | Port for development mode                                                                                             |
| `devConfig.protocol`    | String       |    Optional            | `''`            | Example: "http"                                                                         | Protocol for development mode                                                                                         |
| `debug`                 | String       |    Optional            | `"none"`        | "none", "full", "headers", "logs"                                                       | Activates debug mode which outputs logs and returns additional response headers                                       |


> [!NOTE]
> The ability to cache responses or API requests using Netlify Blobs is currently not available in this function.

The following example will run on all HTML pages, but will skip any routes (URLs) that include the `/company/` or `/profile/` strings. It will use Electricity Maps as the data source, and uses an API key which has been set as an environment secret. IF grid-aware changes need to be applied to the page, a `data-grid-aware=true` attribute will be set on the HTML element.

```js
import gridAwareAuto from "https://esm.sh/@greenweb/gaw-plugin-netlify-edge@next";

export default async (request, context) => {
    return gridAwareAuto(request, env, ctx, {
      // Ignore these routes
      ignoreRoutes: ["/company/", "/profile/"],
      // Use this API key that has been saved as a secret
      gawDataApiKey: env.EMAPS_API_KEY,
      // Configure the grid-aware info bar
      infoBar: {
        target: "#gaw-info-bar",
        learnMoreLink:
          "https://www.thegreenwebfoundation.org/tools/grid-aware-websites/",
        version: "latest",
        popoverText:
          "This website adapts based on your local electricity grid's carbon intensity",
      },
      // Require users to opt-in to grid-aware experience
      userOptIn: false,
      // Set a default view (null means it will be based on actual grid intensity)
      defaultView: null,
      // Make these changes to the web page using HTMLRewriter when the grid intensity is high.
      // All other states (low, moderate) will return the page as normal - no changes applied.
      htmlChanges: {
        high: new HTMLRewriter().on("html", {
          element(element) {
            element.setAttribute("data-grid-aware", "true");
          },
        }),
      },
    });
};
```

---

## Advanced

After you have installed the `@greenweb/grid-aware-websites` package ([see steps](/thegreenwebfoundation/grid-aware-websites/README.md)), you can use this plugin to:

- Fetch the location of a user that is exposed by the Netlify Edge platform.

### Fetching request country (`getLocation()`)

The code below is a simplified demonstation of how to use this plugin to fetch the request location, and then use it with the `gridAwarePower` function.

The code below shows the

```js
import { getLocation } from "https://esm.sh/@greenweb/gaw-plugin-netlify-edge@latest";

export default async (request, context) => {
  // Use the getLocation function to check for the user's country in the request object
  const location = getLocation(context);

  // If there's an error, process the request as normal
  if (location.status === "error") {
      return new Response('There was an error');
  }

  // Otherwise we can get the "country" variable
  const { country } = location;
  return new Response(`The country is ${country}.`)
}
```

### Fetch request latlon

By default, the `getLocation()` function returns the `geo.country.code` value. However, it can also be used to return the `geo.latitude` and `geo.longitude` values if desired.

```js
import { getLocation } from "https://esm.sh/@greenweb/gaw-plugin-netlify-edge@latest";

export default async (request, context) => {
  // Use the getLocation function to check for the user's latlon in the request object
  const location = getLocation(context, {
    mode: "latlon"
  });

  // If there's an error, process the request as normal
  if (location.status === "error") {
      return new Response('There was an error');
  }

  // Otherwise we can get the "country" variable
  const { lat, lon } = location;
  return new Response(`The country is ${JSON.stringify({lat, lon})}.`)
}
```

### Using this with the Grid-aware Websites library

The code below shows a simple implementation of this plugin alongside the Grid-aware Websites core library in a Netlify Edge Function.

```js
import { gridAwarePower } from "https://esm.sh/@greenweb/grid-aware-websites@latest";
import { getLocation } from "https://esm.sh/@greenweb/gaw-plugin-netlify-edge@latest";

const apiKey = "you_api_key"; // Set your own Electricity Maps API key here.

export default async (request, context) => {
  // Use the getLocation function to check for the user's country in the request object
  const location = getLocation(context);

  // If there's an error, process the request as normal
  if (location.status === "error") {
      return new Response('There was an error');
  }

  // Otherwise we can get the "country" variable
  const { country } = location;

  // Use the Grid-aware Websites library to fetch data for Taiwan, and check if grid-aware website changes should be applied.
    const gridData = await gridAwarePower(country, apiKey);

    // If we get an error, we can check for that and return nothing.
    if (gridData.status === "error") {
        return new Response('There was an error')
    }

    // If we've got data back using the Grid-aware Websites library, let's return that to the browser
    return new Response(gridData)
}
```
