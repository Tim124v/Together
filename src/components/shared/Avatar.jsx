import { cx, ownerStyle } from '../../utils/helpers'
import { users } from '../../data/mockData'

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export default function Avatar({ owner = 'both', size = 'sm', ring = true, className }) {
  const style = ownerStyle(owner)
  const user = users[owner] ?? users.both

  return (
    <span
      title={user.name}
      className={cx(
        'grid shrink-0 place-items-center rounded-full font-bold text-white shadow-soft',
        style.gradient,
        SIZES[size],
        ring && cx('ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0b1020]', style.ring),
        className,
      )}
    >
      {owner === 'both' ? '💞' : user.initials}
    </span>
  )
}

export function AvatarPair({ size = 'sm' }) {
  return (
    <span className="flex items-center -space-x-2">
      <Avatar owner="he" size={size} ring={false} className="ring-2 ring-white dark:ring-[#0b1020]" />
      <Avatar owner="she" size={size} ring={false} className="ring-2 ring-white dark:ring-[#0b1020]" />
    </span>
  )
}
