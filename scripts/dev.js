import chokidar from "chokidar";
import { execa } from "execa";
import esbuild from "esbuild";
import express from 'express';

const startTW = () => {
  console.log("Starting Tiddlywiki");
  return execa("tiddlywiki", ["editions/demo", "--listen", "--verbose"], {
    preferLocal: true,
    stdout: "inherit",
    stderr: "inherit",
    env: {
      TIDDLYWIKI_PLUGIN_PATH: "./plugins",
    },
  });
};

const twWatcher = chokidar.watch("plugins", "editions");

let tw;
let eventRes;

twWatcher.on("ready", () => {
  tw = startTW();
  twWatcher.on("all", async (event, path) => {
    console.log(event, path);

    tw.kill("SIGTERM");
    try {
      await tw;
    } catch (e) {
      // ignore
    }

    tw = startTW();

    await execa("yarn", ["build-blog"], { stdout: "inherit", stderr: "inherit" });

    if (eventRes) {
      eventRes.write("event: change\n");
      eventRes.write(`data: ${event} ${path}\n\n`);
    }
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
