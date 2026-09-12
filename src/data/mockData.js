// Демо-данные MVP. Даты считаются от «сегодня», чтобы прототип всегда выглядел живым.

const today = new Date()

const iso = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const shift = (days) => {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return iso(d)
}

// День в текущем месяце (1..28), чтобы календарь всегда был наполнен
const dayOfMonth = (day) => iso(new Date(today.getFullYear(), today.getMonth(), day))

export const TODAY = iso(today)

export const users = {
  he: {
    id: 'he',
    name: 'Артём',
    short: 'Вы',
    initials: 'А',
    role: 'him',
    emoji: '🧑‍💻',
  },
  she: {
    id: 'she',
    name: 'Катя',
    short: 'Она',
    initials: 'К',
    role: 'her',
    emoji: '💃',
  },
  both: {
    id: 'both',
    name: 'Вы оба',
    short: 'Общее',
    initials: '∞',
    role: 'both',
    emoji: '💞',
  },
}

export const daysTogether = 847

export const tasks = [
  { id: 1, title: 'Купить продукты на неделю', assigned: 'both', status: 'todo', dueDate: shift(0), color: 'green', note: 'Список в заметках' },
  { id: 2, title: 'Помыть машину', assigned: 'he', status: 'in-progress', dueDate: shift(0), color: 'blue', note: '' },
  { id: 3, title: 'Записаться к врачу', assigned: 'she', status: 'todo', dueDate: shift(0), color: 'pink', note: 'Терапевт, до обеда' },
  { id: 4, title: 'Забрать посылку с почты', assigned: 'he', status: 'todo', dueDate: shift(0), color: 'blue', note: '' },
  { id: 5, title: 'Полить цветы', assigned: 'she', status: 'done', dueDate: shift(0), color: 'pink', note: '' },
  { id: 6, title: 'Собрать чемоданы к поездке', assigned: 'both', status: 'in-progress', dueDate: shift(4), color: 'green', note: 'Паспорта, зарядки' },
  { id: 7, title: 'Заказать доставку ужина', assigned: 'he', status: 'done', dueDate: shift(-1), color: 'blue', note: '' },
  { id: 8, title: 'Выбрать краску для спальни', assigned: 'both', status: 'todo', dueDate: shift(9), color: 'green', note: 'Тёплый беж vs олива' },
  { id: 9, title: 'Записать нас на танцы', assigned: 'she', status: 'in-progress', dueDate: shift(2), color: 'pink', note: 'Пробное занятие' },
  { id: 10, title: 'Оплатить коммунальные', assigned: 'both', status: 'done', dueDate: shift(-3), color: 'green', note: '' },
]

export const events = [
  { id: 1, date: dayOfMonth(3), title: 'Свидание в скай-баре', participants: 'both', color: 'green', time: '20:00', place: 'City Sky Bar' },
  { id: 2, date: shift(5), title: 'День рождения Кати', participants: 'she', color: 'pink', time: '18:00', place: 'Дома' },
  { id: 3, date: shift(12), title: 'День первой встречи 🎉', participants: 'both', color: 'green', time: 'весь день', place: 'Тот самый парк' },
  { id: 4, date: dayOfMonth(12), title: 'Футбол с друзьями', participants: 'he', color: 'blue', time: '19:30', place: 'Арена №3' },
  { id: 5, date: dayOfMonth(15), title: 'Ужин с родителями', participants: 'both', color: 'green', time: '17:00', place: 'У мамы' },
  { id: 6, date: dayOfMonth(18), title: 'Йога-класс', participants: 'she', color: 'pink', time: '09:00', place: 'Студия Prana' },
  { id: 7, date: dayOfMonth(21), title: 'Кино: новинка недели', participants: 'both', color: 'green', time: '21:15', place: 'Kinolab' },
  { id: 8, date: dayOfMonth(24), title: 'Стрижка', participants: 'he', color: 'blue', time: '13:00', place: 'Barber Loft' },
  { id: 9, date: dayOfMonth(26), title: 'Поход в горы', participants: 'both', color: 'green', time: '07:00', place: 'Трек «Орлиный»' },
  { id: 10, date: dayOfMonth(28), title: 'Маникюр', participants: 'she', color: 'pink', time: '11:00', place: 'Nail Room' },
  { id: 11, date: shift(0), title: 'Вечер без телефонов', participants: 'both', color: 'green', time: '21:00', place: 'Дома' },
]

export const wishes = [
  { id: 1, title: 'Поездка в Бали', description: 'Две недели океана, серфинг и рисовые террасы', category: 'travel', dueDate: shift(120), priority: 'high', assigned: 'both', progress: 40 },
  { id: 2, title: 'Новая кофемашина', description: 'Рожковая, чтобы утро начиналось правильно', category: 'shopping', dueDate: shift(35), priority: 'med', assigned: 'he', progress: 65 },
  { id: 3, title: 'Ремонт спальни', description: 'Тёплые тона, новый шкаф и мягкий свет', category: 'home', dueDate: shift(90), priority: 'high', assigned: 'both', progress: 20 },
  { id: 4, title: 'Английский до B2', description: '3 занятия в неделю + сериалы без субтитров', category: 'growth', dueDate: shift(200), priority: 'med', assigned: 'she', progress: 55 },
  { id: 5, title: 'Уикенд в Тбилиси', description: 'Вино, хинкали и старый город', category: 'travel', dueDate: shift(60), priority: 'low', assigned: 'both', progress: 10 },
  { id: 6, title: 'Велосипеды для двоих', description: 'Чтобы кататься по набережной по утрам', category: 'shopping', dueDate: shift(45), priority: 'med', assigned: 'both', progress: 30 },
  { id: 7, title: 'Балкон-оранжерея', description: 'Гирлянды, кресло и много зелени', category: 'home', dueDate: shift(70), priority: 'low', assigned: 'she', progress: 75 },
  { id: 8, title: 'Пробежать полумарафон', description: 'Вместе, в одной футболке с надписью Together', category: 'growth', dueDate: shift(150), priority: 'high', assigned: 'both', progress: 45 },
]

export const activities = [
  { id: 1, user: 'she', text: 'завершила задачу «Полить цветы»', time: '12 минут назад', icon: 'check' },
  { id: 2, user: 'he', text: 'добавил событие «Вечер без телефонов»', time: '1 час назад', icon: 'calendar' },
  { id: 3, user: 'both', text: 'обновили прогресс мечты «Поездка в Бали» до 40%', time: '3 часа назад', icon: 'heart' },
  { id: 4, user: 'he', text: 'взял в работу «Помыть машину»', time: 'вчера, 19:40', icon: 'task' },
  { id: 5, user: 'she', text: 'создала мечту «Балкон-оранжерея»', time: 'вчера, 15:02', icon: 'star' },
]

export const anniversaries = [
  { id: 1, title: 'День первой встречи', date: shift(12), emoji: '🎉', note: '3 года вместе' },
  { id: 2, title: 'День рождения Кати', date: shift(5), emoji: '🎂', note: 'Подарок уже спрятан' },
  { id: 3, title: 'Годовщина свадьбы', date: shift(64), emoji: '💍', note: 'Бронируем ресторан' },
  { id: 4, title: 'Первая поездка вдвоём', date: shift(112), emoji: '✈️', note: 'Тот самый Крит' },
]

export const wishCategories = [
  { id: 'travel', label: 'Путешествия', emoji: '✈️' },
  { id: 'shopping', label: 'Покупки', emoji: '🛍️' },
  { id: 'home', label: 'Дом / Ремонт', emoji: '🏠' },
  { id: 'growth', label: 'Саморазвитие', emoji: '🎯' },
]

export const taskColumns = [
  { id: 'todo', label: 'To Do', hint: 'Ждут своей очереди' },
  { id: 'in-progress', label: 'In Progress', hint: 'В работе прямо сейчас' },
  { id: 'done', label: 'Done', hint: 'Сделано, можно гордиться' },
]
