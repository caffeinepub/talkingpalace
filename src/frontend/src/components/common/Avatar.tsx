import type { UserProfile } from '../../backend';

interface AvatarProps {
  user: UserProfile | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ user, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  };

  const imageUrl = user?.profilePicture
    ? user.profilePicture.getDirectURL()
    : '/assets/generated/default-avatar.dim_512x512.png';

  return (
    <img
      src={imageUrl}
      alt={user?.displayName || 'User'}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  );
}
