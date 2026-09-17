export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me-32chars',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me-32chars',
  accessExpires: process.env.JWT_ACCESS_EXPIRES || '24h',
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
}
