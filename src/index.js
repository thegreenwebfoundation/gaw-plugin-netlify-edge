

/* This plugin will:

- Get the user country data from the request & return that to be used by the grid-aware-websites plugin

Secondary features:

- Allow developers to opt-in to using Blobs to save Electricity Maps responses for a specific duration.
- Allow developers to opt-in to using Blobs to save the HTML response for a specified duration. Here be dragons though.
- ✅ Allow lat lon to be returned instead of the country code.

How much should this plugin do? Should it do error handling for requests?
*/

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
    const lat = context.geo?.latitude;
    const lon = context.geo?.longitude;

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

export { getLocation };
