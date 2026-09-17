import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const envFile = path.join(root, '.env')
if (fs.existsSync(envFile)) dotenv.config({ path: envFile })
else dotenv.config()

const { sequelize } = await import('../config/database.js')
const { User, Couple } = await import('../models/index.js')

await sequelize.sync()

const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD || 'together123', 10)

const [artem] = await User.findOrCreate({
  where: { email: 'artem@together.app' },
  defaults: { passwordHash, name: 'Артём', avatarColor: 'blue' },
})
const [katya] = await User.findOrCreate({
  where: { email: 'katya@together.app' },
  defaults: { passwordHash, name: 'Катя', avatarColor: 'pink' },
})

const start = new Date()
start.setDate(start.getDate() - 847)

let couple = await Couple.findOne({ where: { inviteCode: 'TOGETHER1' } })
if (!couple) {
  couple = await Couple.create({
    user1Id: artem.id,
    user2Id: katya.id,
    coupleName: 'Артём & Катя',
    startDate: start.toISOString().slice(0, 10),
    inviteCode: 'TOGETHER1',
  })
}

console.log('Демо-аккаунты готовы (база не стиралась).')
console.log('  Артём  artem@together.app  / together123')
console.log('  Катя   katya@together.app  / together123')
console.log(`  Пара   ${couple.id}  invite=${couple.inviteCode}`)

await sequelize.close()
