export const colorByRole = { he: 'blue', she: 'pink', both: 'green' }

export const normalizeStatus = (status) => {
  if (!status) return 'todo'
  if (status === 'in-progress') return 'in_progress'
  return status
}

export const publicStatus = (status) => (status === 'in_progress' ? 'in-progress' : status)

export const normalizePriority = (priority) => {
  if (priority === 'med') return 'medium'
  return priority || 'medium'
}

export const publicPriority = (priority) => (priority === 'medium' ? 'med' : priority)

export const normalizeCategory = (category) => {
  if (category === 'growth') return 'personal'
  return category || 'personal'
}

export const publicCategory = (category) => (category === 'personal' ? 'growth' : category)

export function roleOfUser(couple, userId) {
  if (!couple || !userId) return 'both'
  if (couple.user1Id === userId) return 'he'
  if (couple.user2Id === userId) return 'she'
  return 'both'
}

export function userIdByRole(couple, assigned) {
  if (!assigned || assigned === 'both') return null
  if (assigned === 'he') return couple.user1Id
  if (assigned === 'she') return couple.user2Id
  return assigned
}

export function assignedRole(couple, assignedTo) {
  if (!assignedTo) return 'both'
  return roleOfUser(couple, assignedTo)
}
