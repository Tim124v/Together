import { User } from './User.js'
import { Couple } from './Couple.js'
import { RefreshToken } from './RefreshToken.js'
import { Task } from './Task.js'
import { Event } from './Event.js'
import { Wish } from './Wish.js'
import { Activity } from './Activity.js'
import { TimeCapsule } from './TimeCapsule.js'
import { BudgetCategory, BudgetItem } from './BudgetItem.js'

User.hasMany(RefreshToken, { foreignKey: 'userId' })
RefreshToken.belongsTo(User, { foreignKey: 'userId' })

Couple.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' })
Couple.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' })

Couple.hasMany(Task, { foreignKey: 'coupleId' })
Task.belongsTo(Couple, { foreignKey: 'coupleId' })
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' })

Couple.hasMany(Event, { foreignKey: 'coupleId' })
Event.belongsTo(Couple, { foreignKey: 'coupleId' })

Couple.hasMany(Wish, { foreignKey: 'coupleId' })
Wish.belongsTo(Couple, { foreignKey: 'coupleId' })

Couple.hasMany(Activity, { foreignKey: 'coupleId' })
Activity.belongsTo(Couple, { foreignKey: 'coupleId' })
Activity.belongsTo(User, { foreignKey: 'userId' })

Couple.hasMany(TimeCapsule, { foreignKey: 'coupleId' })
TimeCapsule.belongsTo(Couple, { foreignKey: 'coupleId' })
TimeCapsule.belongsTo(User, { as: 'author', foreignKey: 'createdBy' })

Couple.hasMany(BudgetItem, { foreignKey: 'coupleId' })
BudgetItem.belongsTo(Couple, { foreignKey: 'coupleId' })
BudgetItem.belongsTo(User, { foreignKey: 'userId' })

Couple.hasMany(BudgetCategory, { foreignKey: 'coupleId' })
BudgetCategory.belongsTo(Couple, { foreignKey: 'coupleId' })

export {
  User,
  Couple,
  RefreshToken,
  Task,
  Event,
  Wish,
  Activity,
  TimeCapsule,
  BudgetItem,
  BudgetCategory,
}
