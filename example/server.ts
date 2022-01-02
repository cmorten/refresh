import { serve } from "https://deno.land/std@0.119.0/http/server.ts";
import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.119.0/path/mod.ts";
import { refresh } from "../mod.ts";

const __dirname = fromFileUrl(dirname(import.meta.url));

const middleware = refresh();

serve(async (req: Request) => {
  const res = middleware(req);

  if (res) {
    return res;
  } else if (req.url.endsWith("client.js")) {
    const client = await Deno.readTextFile(join(__dirname, "../client.js"));

    return new Response(client, {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const index = await Deno.readTextFile(join(__dirname, "./index.html"));

  return new Response(index, { headers: { "Content-Type": "text/html" } });
});

console.log("Listening on http://localhost:8000");
