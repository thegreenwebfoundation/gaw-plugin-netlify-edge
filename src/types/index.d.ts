import { Context } from "@netlify/edge-functions";

export type netlifyContext = Context;

export type locationResponse = {
  country?: string;
  lat?: number;
  lon?: number;
  status: "success" | "error";
};

export type locationOptions = {
  mode?: "country" | "latlon";
};
