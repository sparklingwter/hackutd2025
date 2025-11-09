'use client';

export default function LogoutButton() {
  return (
    <a
      href="/auth/logout"
      className="button logout inline-block rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
    >
      Log Out
    </a>
  );
}
