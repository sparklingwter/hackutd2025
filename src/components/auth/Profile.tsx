'use client';

import { useUser } from "@auth0/nextjs-auth0/client";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-text">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-card action-card text-center">
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name ?? 'User profile'}
          className="profile-picture mx-auto h-28 w-28 rounded-full object-cover"
        />
      )}
      <h2 className="profile-name mt-2 text-2xl font-semibold text-white">{user.name}</h2>
      <p className="profile-email text-gray-300">{user.email}</p>
    </div>
  );
}
