export default auto;
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
declare function auto(request: Request, context: netlifyContext, config?: {
    contentType?: string[];
    ignoreRoutes?: string[];
    ignoreGawCookie?: string;
    userOptIn?: boolean;
    locationType?: "latlon" | "country";
    htmlChanges?: {
        low?: any;
        moderate?: any;
        high?: any;
    };
    defaultView?: null | "low" | "moderate" | "high";
    gawDataApiKey?: string;
    infoBar?: {
        target?: string;
        version?: string;
        learnMoreLink?: string;
        popoverText?: string;
        customViews?: string;
    };
    debug?: "none" | "full" | "headers" | "logs";
    dev?: boolean;
    devConfig?: {
        hostname?: string;
        port?: string;
        protocol?: string;
    };
}): Promise<Response>;
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