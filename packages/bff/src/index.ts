import { GuardianApiAdapter } from "./adapters/GuardianApiAdapter";
import { MockArticleRepository } from "./adapters/MockArticleRepository";
import { RedisCacheAdapter } from "./adapters/RedisCacheAdapter";
import { createApp } from "./app";
import { loadEnv } from "./config/env";

const env = loadEnv();

const articleRepo = env.MOCK_GUARDIAN_API
  ? new MockArticleRepository()
  : new GuardianApiAdapter();
const cacheService = new RedisCacheAdapter();

const app = createApp(articleRepo, cacheService);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`BFF listening on port ${env.PORT}`);
});
