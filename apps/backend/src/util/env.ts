function readFromEnv(name: string) {
  const value = process.env[name];

  if (!value) throw new Error(`Env variables ${name} is missing`);

  return value;
}

export const env = {
  port: Number(readFromEnv("PORT")),
  redisUrl: readFromEnv("REDIS_URL"),
  adminApiKey: readFromEnv("ADMIN_API_KEY"),
};
