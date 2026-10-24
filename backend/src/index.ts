import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.log(
    `[yourcar-api] Running on http://localhost:${config.port} (${config.nodeEnv})`
  );
});
