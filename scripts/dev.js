import chokidar from "chokidar";
import { execa } from "execa";
import esbuild from "esbuild";
import express from 'express';

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

const app = express()

app.use(express.static("./editions/demo/output/static"))
app.get("/blog-build", (req, res)=>{
      const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      };
      res.writeHead(200, headers);
      eventRes = res;

      return;
})
app.listen(9021, ()=>{
    console.log("static blog on 9021")
})
