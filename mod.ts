export interface RefreshInit {
  /**
   * Debounce timeout for browser refresh on file change. Default `30`ms.
   */
  debounce?: number;
  /**
   * Array of file system events to ignore. Default `["any", "access"]`.
   */
  ignoreKinds?: string[];
  /**
   * One or more paths, which can be files or directories, for watching file
   * system events. Default `./`
   */
  paths?: string | string[];
  /**
   * For directories, will watch the specified directory and all sub
   * directories when set to true. Default `true`.
   */
  recursive?: boolean;
  /**
   * An abort signal to stop the watching of files.
   */
  signal?: AbortSignal;
}

const DEFAULT_DEBOUNCE_TIMEOUT = 30;
const DEFAULT_IGNORE_KINDS = ["any", "access"];
const DEFAULT_PATHS = "./";
const DEFAULT_RECURSIVE = true;

const sockets: Set<WebSocket> = new Set();

async function watch(
  {
    debounce = DEFAULT_DEBOUNCE_TIMEOUT,
    ignoreKinds = DEFAULT_IGNORE_KINDS,
    paths = DEFAULT_PATHS,
    recursive = DEFAULT_RECURSIVE,
    signal,
  }: RefreshInit = {
    debounce: DEFAULT_DEBOUNCE_TIMEOUT,
    ignoreKinds: DEFAULT_IGNORE_KINDS,
    paths: DEFAULT_PATHS,
    recursive: DEFAULT_RECURSIVE,
  },
) {
  const watcher = Deno.watchFs(paths, { recursive });

  function close() {
    try {
      watcher.close();
      sockets.forEach((socket) => socket.close());
      sockets.clear();
    } catch {
      // ignore
    }
  }

  let queued = false;

  function send() {
    if (signal?.aborted) {
      close();

      return;
    }

    queued = false;

    sockets.forEach((socket) => {
      try {
        socket.send("");
      } catch {
        // ignore
      }
    });
  }

  for await (const { kind } of watcher) {
    if (signal?.aborted) {
      close();

      break;
    } else if (ignoreKinds.includes(kind)) {
      continue;
    }

    if (!queued) {
      queued = true;
      setTimeout(send, debounce);
    }
  }
}

const RE_REFRESH_WS = /\/_r$/;

const isRefreshWs = (url: string) => RE_REFRESH_WS.test(url);

/**
 * Constructs a refresh middleware for reloading the browser on file changes.
 *
 * ```ts
 * import { serve } from "https://deno.land/std/http/server.ts";
 * import { refresh } from "https://deno.land/x/refresh/mod.ts";
 *
 * const middleware = refresh();
 *
 * serve((req: Request) => {
 *  const res = middleware(req);
 *
 *  if (res) return res;
 *
 *  return new Response("Hello Deno!");
 * });
 * ```
 *
 * @param {RefreshInit} refreshInit optional configuration for browser refresh middleware.
 */
export function refresh(
  refreshInit?: RefreshInit,
): (req: Request) => Response | null {
  watch(refreshInit);

  return function refreshMiddleware(req: Request): Response | null {
    if (isRefreshWs(req.url) && !refreshInit?.signal?.aborted) {
      const upgrade = Deno.upgradeWebSocket(req);

      upgrade.socket.onclose = () => {
        sockets.delete(upgrade.socket);
      };

      sockets.add(upgrade.socket);

      return upgrade.response;
    }

    return null;
  };
}
