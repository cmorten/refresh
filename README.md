# refresh

Simple browser reloading middleware on file change for your Deno web
applications.

## Usage

To use `refresh` middleware, add 5 lines to your Deno server implementation:

```ts
import { serve } from "https://deno.land/std/http/server.ts";

// Create refresh middleware
const middleware = refresh();

serve((req: Request) => {
  // In your server just add into the middleware stack!
  const refreshResponse = middleware(req);

  if (refreshResponse) {
    return refreshResponse;
  }

  return new Response("Hello Deno!");
});
```

And add a single script tag anywhere to your HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Example Refresh App</title>
  </head>
  <body>
    <script type="module" src="https://deno.land/x/refresh/client.js"></script>
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
