import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Sequelize } from 'sequelize'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')

const dialect = process.env.DATABASE_URL
  ? 'postgres'
  : (process.env.DB_DIALECT || 'sqlite').toLowerCase()

const isProd = process.env.NODE_ENV === 'production'
const ssl =
  dialect === 'postgres' && (isProd || process.env.PGSSL === 'true')
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {}

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: ssl,
    })
  : dialect === 'postgres'
    ? new Sequelize(
        process.env.PG_DATABASE || 'together',
        process.env.PG_USER || 'together',
        process.env.PG_PASSWORD || 'together',
        {
          host: process.env.PG_HOST || 'localhost',
          port: Number(process.env.PG_PORT || 5432),
          dialect: 'postgres',
          logging: false,
          dialectOptions: ssl,
        },
      )
    : new Sequelize({
        dialect: 'sqlite',
        storage: path.resolve(root, process.env.SQLITE_PATH || './data/together.sqlite'),
        logging: false,
      })

export async function connectDatabase() {
  await sequelize.authenticate()
  // SQLite и первый Postgres-деплой поднимают недостающие таблицы сами.
  // alter — только если явно DB_SYNC=alter.
  const syncMode = process.env.DB_SYNC || 'sync'
  if (syncMode === 'off') return
  if (syncMode === 'alter') await sequelize.sync({ alter: true })
  else await sequelize.sync()
}
