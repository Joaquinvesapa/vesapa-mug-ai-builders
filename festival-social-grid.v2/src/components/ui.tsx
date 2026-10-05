import type { ComponentProps, ReactNode } from "react";

const buttonVariants = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-700 focus-visible:outline-violet-600",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 focus-visible:outline-neutral-400",
} as const;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        className="h-12 rounded-xl border border-neutral-300 bg-white px-4 text-base outline-none transition-shadow placeholder:text-neutral-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        {...props}
      />
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
}

/** Centered card used by the access screens (login and welcome). */
export function CardPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </header>
        {children}
      </div>
    </main>
  );
}
