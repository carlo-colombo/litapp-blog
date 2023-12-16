import chokidar from "chokidar";
import { execa } from "execa";
import esbuild from "esbuild";
import { Server } from "@nubosoftware/node-static";
import http from "http";

const startTW = () => {
  console.log("Starting Tiddlywiki");
  return execa("tiddlywiki", ["editions/demo", "--listen", "--verbose"], {
    preferLocal: true,
    env: {
      TIDDLYWIKI_PLUGIN_PATH: "./plugins",
    },
  })
    .pipeStdout(process.stdout)
    .pipeStderr(process.stderr);
};

const twWatcher = chokidar.watch("plugins", "editions");

let tw;
let eventRes;

twWatcher.on("ready", () => {
  tw = startTW();
  twWatcher.on("all", async (event, path) => {
    console.log(event, path);

    tw.kill("SIGTERM", {
      forceKillAfterTimeout: 2000,
    });

    tw = startTW();

    await execa("yarn", ["build-blog"])
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr);

    eventRes.write("event: change\n");
    eventRes.write(`data: ${event} ${path}\n\n`);
  });
});

const fileServer = new Server("./editions/demo/output/static", {
  cache: false,
});

http
  .createServer((req, res) => {
    console.log("req", req.url);
    if (req.url == "/blog-build") {
      const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      };
      res.writeHead(200, headers);
      eventRes = res;

      return;
    }

    req
      .addListener("end", () => {
        fileServer.serve(req, res);
      })
      .resume();
  })
  .listen(9021);
