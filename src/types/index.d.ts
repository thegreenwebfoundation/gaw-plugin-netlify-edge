import { Context, EdgeFunction } from "@netlify/edge-functions";

export type netlifyContext = Context;
export type netlifyEdge = EdgeFunction;

export type locationResponse = {
  country?: string;
  lat?: string;
  lon?: string;
  status: "success" | "error";
};

export type locationOptions = {
  mode?: "country" | "latlon";
};
