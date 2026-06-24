const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

const getDatabaseUrl = () => {
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.DATABASE_ENV === 'test';
  const candidates = isTestEnv
    ? [
        ['DATABASE_URL_TEST', process.env.DATABASE_URL_TEST],
        ['DATABASE_URL', process.env.DATABASE_URL],
        ['DATABASE_URL_POOLER', process.env.DATABASE_URL_POOLER],
        ['DATABASE_URL_DIRECT', process.env.DATABASE_URL_DIRECT],
      ]
    : [
        ['DATABASE_URL', process.env.DATABASE_URL],
        ['DATABASE_URL_POOLER', process.env.DATABASE_URL_POOLER],
        ['DATABASE_URL_DIRECT', process.env.DATABASE_URL_DIRECT],
      ];

  for (const [source, value] of candidates) {
    const url = normalize(value);
    if (url) {
      return { url, source };
    }
  }

  const envMode = isTestEnv ? 'test' : 'runtime';
  const helpText = isTestEnv
    ? 'Set DATABASE_URL_TEST for tests, or DATABASE_URL as a fallback.'
    : 'Set DATABASE_URL for local or production use. For Supabase, use DATABASE_URL_POOLER if the direct host is blocked, or DATABASE_URL_DIRECT for the direct connection.';

  throw new Error(
    `Database URL is missing for ${envMode}. ${helpText} ` +
      'If Supabase direct connections fail in your network, use the pooler URL with sslmode=require and uselibpqcompat=true.'
  );
};

module.exports = { getDatabaseUrl };
