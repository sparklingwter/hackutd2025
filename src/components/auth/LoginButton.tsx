'use client';

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="button login inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
    >
      Log In
    </a>
  );
}
