import { GuardianApiAdapter } from "./adapters/GuardianApiAdapter";
import { RedisCacheAdapter } from "./adapters/RedisCacheAdapter";
import { createApp } from "./app";
import { loadEnv } from "./config/env";

const env = loadEnv();

const articleRepo = new GuardianApiAdapter();
const cacheService = new RedisCacheAdapter();

const app = createApp(articleRepo, cacheService);

app.listen(env.PORT, () => {
  console.log(`BFF listening on port ${env.PORT}`);
});
