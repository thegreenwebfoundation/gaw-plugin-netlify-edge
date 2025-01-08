# Grid-aware Websites - Netlify Edge Plugin

This plugin provides some useful functions that can be used when setting up the [`@greenweb/grid-aware websites`](/thegreenwebfoundation/grid-aware-websites/README.md) library using [Netlify Edge Functions](https://docs.netlify.com/platform/primitives/#edge-functions).

After you have installed the `@greenweb/grid-aware-websites` package ([see steps](/thegreenwebfoundation/grid-aware-websites/README.md)), you can use this plugin to:

- Fetch the location of a user that is exposed by the Netlify Edge platform.

## Fetching request country (`getLocation()`)

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

> [!NOTE]
> Using latitude and longitude values is not yet supported in the `@greenweb/grid-aware-websites` package.

## Using this with the Grid-aware Websites library

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
