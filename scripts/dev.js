import chokidar from "chokidar";
import { execa } from "execa";
import esbuild from "esbuild";
import {Server} from "@nubosoftware/node-static"
import http from 'http'

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

const twWatcher = chokidar
    .watch("plugins", "editions")

let tw;

twWatcher.on("ready", () => {
  tw = startTW();
  twWatcher.on("all", async (event, path) => {
    console.log(event, path);

    tw.kill("SIGTERM", {
      forceKillAfterTimeout: 2000,
    });

    tw = startTW();
  });
});

const fileServer = new Server('./editions/demo/output', { cache: false })

http.createServer((req, res)=>{
    console.log(req.url)
    fileServer.serve(req, res)
}).listen(9021)
