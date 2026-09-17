import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const envFile = path.join(root, '.env')
if (!fs.existsSync(envFile)) fs.copyFileSync(path.join(root, '.env.example'), envFile)
dotenv.config({ path: envFile })

if (process.env.NODE_ENV === 'production') {
  console.error('Seed запрещён при NODE_ENV=production — он стирает базу.')
  process.exit(1)
}

fs.mkdirSync(path.join(root, 'data'), { recursive: true })

const { sequelize } = await import('../config/database.js')
const { User, Couple, Task, Event, Wish, Activity, TimeCapsule, BudgetItem, BudgetCategory } = await import('../models/index.js')
const { DEFAULT_BUDGET_CATEGORIES } = await import('../models/BudgetItem.js')
const { stringifyCapsuleContent } = await import('../models/TimeCapsule.js')
const { addDays, dayOfMonth } = await import('../utils/dates.js')

await sequelize.sync({ force: true })

const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD || 'together123', 10)

const artem = await User.create({
  email: 'artem@together.app',
  passwordHash,
  name: 'Артём',
  avatarColor: 'blue',
})
const katya = await User.create({
  email: 'katya@together.app',
  passwordHash,
  name: 'Катя',
  avatarColor: 'pink',
})

const start = new Date()
start.setDate(start.getDate() - 847)

const couple = await Couple.create({
  user1Id: artem.id,
  user2Id: katya.id,
  coupleName: 'Артём & Катя',
  startDate: start.toISOString().slice(0, 10),
  inviteCode: 'TOGETHER1',
  inviteCodeAt: new Date(),
  partnerJoinedAt: new Date(),
})

const tasks = [
  { title: 'Купить продукты на неделю', assignedTo: null, status: 'todo', color: 'green', dueDate: addDays(0), description: 'Список в заметках' },
  { title: 'Помыть машину', assignedTo: artem.id, status: 'in_progress', color: 'blue', dueDate: addDays(0) },
  { title: 'Записаться к врачу', assignedTo: katya.id, status: 'todo', color: 'pink', dueDate: addDays(0), description: 'Терапевт, до обеда' },
  { title: 'Забрать посылку с почты', assignedTo: artem.id, status: 'todo', color: 'blue', dueDate: addDays(0) },
  { title: 'Полить цветы', assignedTo: katya.id, status: 'done', color: 'pink', dueDate: addDays(0) },
  { title: 'Собрать чемоданы к поездке', assignedTo: null, status: 'in_progress', color: 'green', dueDate: addDays(4), description: 'Паспорта, зарядки' },
  { title: 'Заказать доставку ужина', assignedTo: artem.id, status: 'done', color: 'blue', dueDate: addDays(-1) },
  { title: 'Выбрать краску для спальни', assignedTo: null, status: 'todo', color: 'green', dueDate: addDays(9), description: 'Тёплый беж vs олива' },
  { title: 'Записать нас на танцы', assignedTo: katya.id, status: 'in_progress', color: 'pink', dueDate: addDays(2), description: 'Пробное занятие' },
  { title: 'Оплатить коммунальные', assignedTo: null, status: 'done', color: 'green', dueDate: addDays(-3) },
]

await Task.bulkCreate(tasks.map((t) => ({ ...t, coupleId: couple.id })))

const events = [
  { title: 'Свидание в скай-баре', eventDate: dayOfMonth(3), eventTime: '20:00', place: 'City Sky Bar', participants: 'both', color: 'green' },
  { title: 'День рождения Кати', eventDate: addDays(5), eventTime: '18:00', place: 'Дома', participants: 'she', color: 'pink' },
  { title: 'День первой встречи 🎉', eventDate: addDays(12), eventTime: 'весь день', place: 'Тот самый парк', participants: 'both', color: 'green' },
  { title: 'Футбол с друзьями', eventDate: dayOfMonth(12), eventTime: '19:30', place: 'Арена №3', participants: 'he', color: 'blue' },
  { title: 'Ужин с родителями', eventDate: dayOfMonth(15), eventTime: '17:00', place: 'У мамы', participants: 'both', color: 'green' },
  { title: 'Йога-класс', eventDate: dayOfMonth(18), eventTime: '09:00', place: 'Студия Prana', participants: 'she', color: 'pink' },
  { title: 'Кино: новинка недели', eventDate: dayOfMonth(21), eventTime: '21:15', place: 'Kinolab', participants: 'both', color: 'green' },
  { title: 'Стрижка', eventDate: dayOfMonth(24), eventTime: '13:00', place: 'Barber Loft', participants: 'he', color: 'blue' },
  { title: 'Поход в горы', eventDate: dayOfMonth(26), eventTime: '07:00', place: 'Трек «Орлиный»', participants: 'both', color: 'green' },
  { title: 'Маникюр', eventDate: dayOfMonth(28), eventTime: '11:00', place: 'Nail Room', participants: 'she', color: 'pink' },
  { title: 'Вечер без телефонов', eventDate: addDays(0), eventTime: '21:00', place: 'Дома', participants: 'both', color: 'green' },
]

await Event.bulkCreate(events.map((e) => ({ ...e, coupleId: couple.id })))

const wishes = [
  { title: 'Поездка в Бали', description: 'Две недели океана, серфинг и рисовые террасы', category: 'travel', priority: 'high', assignedTo: 'both', targetDate: addDays(120), progress: 40 },
  { title: 'Новая кофемашина', description: 'Рожковая, чтобы утро начиналось правильно', category: 'shopping', priority: 'medium', assignedTo: 'he', targetDate: addDays(35), progress: 65 },
  { title: 'Ремонт спальни', description: 'Тёплые тона, новый шкаф и мягкий свет', category: 'home', priority: 'high', assignedTo: 'both', targetDate: addDays(90), progress: 20 },
  { title: 'Английский до B2', description: '3 занятия в неделю + сериалы без субтитров', category: 'personal', priority: 'medium', assignedTo: 'she', targetDate: addDays(200), progress: 55 },
  { title: 'Уикенд в Тбилиси', description: 'Вино, хинкали и старый город', category: 'travel', priority: 'low', assignedTo: 'both', targetDate: addDays(60), progress: 10 },
  { title: 'Велосипеды для двоих', description: 'Чтобы кататься по набережной по утрам', category: 'shopping', priority: 'medium', assignedTo: 'both', targetDate: addDays(45), progress: 30 },
  { title: 'Балкон-оранжерея', description: 'Гирлянды, кресло и много зелени', category: 'home', priority: 'low', assignedTo: 'she', targetDate: addDays(70), progress: 75 },
  { title: 'Пробежать полумарафон', description: 'Вместе, в одной футболке с надписью Together', category: 'personal', priority: 'high', assignedTo: 'both', targetDate: addDays(150), progress: 45 },
]

await Wish.bulkCreate(wishes.map((w) => ({ ...w, coupleId: couple.id })))

await TimeCapsule.bulkCreate([
  {
    coupleId: couple.id,
    title: 'Наша первая поездка',
    description: 'Письмо себе из того лета, когда мы впервые уехали вдвоём.',
    createdBy: katya.id,
    createdDate: addDays(-180),
    openDate: null,
    isOpened: true,
    openedAt: new Date(),
    content: stringifyCapsuleContent({
      text: 'Помнишь рассвет на вокзале и кофе в бумажных стаканчиках? Это было начало всех наших путешествий.',
      tags: ['путешествия', 'лето'],
    }),
  },
  {
    coupleId: couple.id,
    title: 'Письмо через год',
    description: 'Закроем и откроем в годовщину.',
    createdBy: artem.id,
    createdDate: addDays(-20),
    openDate: addDays(40),
    isOpened: false,
    content: stringifyCapsuleContent({
      text: 'Если ты это читаешь — мы всё ещё вместе, и это лучший сюжет.',
      tags: ['годовщина'],
    }),
  },
  {
    coupleId: couple.id,
    title: 'Капсула на сегодня 🎉',
    description: 'Маленький сюрприз, который можно открыть прямо сейчас.',
    createdBy: katya.id,
    createdDate: addDays(-3),
    openDate: addDays(0),
    isOpened: false,
    content: stringifyCapsuleContent({
      text: 'Сюрприз: я горжусь нами. Давай вечером без телефонов — как в тот первый месяц.',
      tags: ['сегодня'],
    }),
  },
])

await BudgetCategory.bulkCreate(DEFAULT_BUDGET_CATEGORIES.map((cat) => ({ ...cat, coupleId: couple.id })))

await BudgetItem.bulkCreate([
  { coupleId: couple.id, userId: artem.id, category: 'groceries', description: 'Продукты на неделю', amount: 4200, paidBy: 'he', splitType: 'equal', hePercent: 50, shePercent: 50, createdDate: addDays(-2) },
  { coupleId: couple.id, userId: katya.id, category: 'entertainment', description: 'Обед в кафе', amount: 1860, paidBy: 'she', splitType: 'equal', hePercent: 50, shePercent: 50, createdDate: addDays(-1) },
  { coupleId: couple.id, userId: artem.id, category: 'transport', description: 'Такси из аэропорта', amount: 980, paidBy: 'he', splitType: 'equal', hePercent: 50, shePercent: 50, createdDate: addDays(-6) },
  { coupleId: couple.id, userId: katya.id, category: 'home', description: 'Новые шторы', amount: 3400, paidBy: 'she', splitType: 'custom', hePercent: 70, shePercent: 30, createdDate: addDays(-8) },
  { coupleId: couple.id, userId: artem.id, category: 'entertainment', description: 'Кино на двоих', amount: 1200, paidBy: 'both', splitType: 'equal', hePercent: 50, shePercent: 50, createdDate: addDays(-4) },
  { coupleId: couple.id, userId: katya.id, category: 'other', description: 'Подарок маме', amount: 2500, paidBy: 'she', splitType: 'equal', hePercent: 50, shePercent: 50, createdDate: addDays(-10) },
])

await Activity.bulkCreate([
  { coupleId: couple.id, userId: katya.id, action: 'task_completed', targetType: 'task' },
  { coupleId: couple.id, userId: artem.id, action: 'event_created', targetType: 'event' },
  { coupleId: couple.id, userId: katya.id, action: 'wish_created', targetType: 'wish' },
  { coupleId: couple.id, userId: katya.id, action: 'capsule_created', targetType: 'capsule' },
  { coupleId: couple.id, userId: artem.id, action: 'expense_created', targetType: 'expense' },
])

console.log('Seed готов.')
console.log('  Артём  artem@together.app  / together123')
console.log('  Катя   katya@together.app  / together123')
console.log(`  Пара   ${couple.id}  invite=${couple.inviteCode}`)
console.log('')
console.log('  ⚠  Seed пересоздаёт базу. Старые JWT больше не работают.')
console.log('     Откройте http://localhost:3000/login и войдите заново.')

await sequelize.close()
