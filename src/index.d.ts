/**
 * The incoming request object.
 */
export type netlifyContext = import("./types").netlifyContext;
/**
 * Additional options for the function.
 */
export type locationOptions = import("./types").locationOptions;
/**
 * The location of the user.
 */
export type locationResponse = import("./types").locationResponse;
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
export function getLocation(context: netlifyContext, options?: locationOptions): locationResponse;
//# sourceMappingURL=index.d.ts.map