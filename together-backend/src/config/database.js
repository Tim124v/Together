import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DataTypes, Sequelize } from 'sequelize'

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
  const syncMode = process.env.DB_SYNC || 'sync'
  if (syncMode !== 'off') {
    if (syncMode === 'alter') await sequelize.sync({ alter: true })
    else await sequelize.sync()
  }
  await ensureCoupleColumns()
  await ensureUserColumns()
}

async function ensureCoupleColumns() {
  const qi = sequelize.getQueryInterface()
  let desc
  try {
    desc = await qi.describeTable('couples')
  } catch {
    return
  }
  const add = async (name, spec) => {
    if (!desc[name]) await qi.addColumn('couples', name, spec)
  }
  await add('invite_code_at', { type: DataTypes.DATE, allowNull: true })
  await add('previous_invite_code', { type: DataTypes.STRING(16), allowNull: true })
  await add('partner_joined_at', { type: DataTypes.DATE, allowNull: true })
}

async function ensureUserColumns() {
  const qi = sequelize.getQueryInterface()
  let desc
  try {
    desc = await qi.describeTable('users')
  } catch {
    return
  }
  const add = async (name, spec) => {
    if (!desc[name]) await qi.addColumn('users', name, spec)
  }
  await add('language', { type: DataTypes.STRING(8), allowNull: true })
  await add('currency', { type: DataTypes.STRING(8), allowNull: true })
  await add('country', { type: DataTypes.STRING(8), allowNull: true })
}
