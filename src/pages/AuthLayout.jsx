import { HiOutlineSparkles } from 'react-icons/hi2'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas px-4 py-10 dark:bg-[#0b1020]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-[100px]" />
        <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-her/16 blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-grad-brand text-white shadow-glow">
            <HiOutlineSparkles className="text-2xl" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Together</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="surface p-6 sm:p-8">
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          <div className="mt-5">{children}</div>
        </div>

        {footer && <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>}
      </div>
    </div>
  )
}
