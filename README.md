# refresh

Simple browser reload on file change middleware for your Deno web applications.

## Usage

To use `refresh` middleware, just add a few extra lines to your Deno server
implementation:

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { refresh } from "https://deno.land/x/refresh/mod.ts";

// Create refresh middleware
const middleware = refresh();

serve((req) => {
  // In your server handler, just add into the middleware stack!
  const res = middleware(req);

  if (res) return res;

  return new Response("Hello Deno!");
});
```

And add a single `refresh/client.js` script tag anywhere to your HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Example Refresh App</title>
  </head>
  <body>
    <script src="https://deno.land/x/refresh/client.js"></script>
    <h1>Hello Deno!</h1>
  </body>
</html>
```

And you'll get instant browser refresh on every file change for your project 🚀 🚀

## Example

Run the example by cloning this repo locally and executing:

```bash
deno run --allow-net --allow-read ./example/server.ts
```

Open one or more browser tabs on `http://localhost:8000/` and start editing the
`index.html` to see live reloading of all the tabs in the browser.

## Documentation

See [Deno Docs](https://doc.deno.land/https://deno.land/x/refresh/mod.ts).

## License

[MIT License](LICENSE).
