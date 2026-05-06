/**
 * 사용자 프로필 이미지/아바타 컴포넌트
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} [props.profileImg]
 * @param {'sm' | 'md' | 'lg'} [props.size]
 * @param {'square' | 'soft' | 'round'} [props.radius]
 * @param {'default' | 'compact'} [props.variant]
 * @param {boolean} [props.pendingInvite]
 * @param {string} [props.className]
 */
export default function UserProfileImg({
  name,
  profileImg,
  size = 'lg',
  radius = 'square',
  variant = 'default',
  pendingInvite = false,
  className = '',
}) {
  const sizeMap = {
    lg: 'h-12 w-12 text-sm',
    md: 'h-9 w-9 text-xs',
    sm: 'h-7 w-7 text-[10px]',
  };
  const radiusMap = {
    square: 'rounded-xl',
    soft: 'rounded-2xl',
    round: 'rounded-full',
  };
  const variantMap = {
    default: 'border-2 shadow-sm',
    compact: 'border shadow-none',
  };

  const hasValidProfileImg = typeof profileImg === 'string' && profileImg.trim().length > 0;
  if (hasValidProfileImg && !pendingInvite) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden border-white ${variantMap[variant]} ${sizeMap[size]} ${radiusMap[radius]} ${className}`}
      >
        <img src={profileImg} alt={name || 'user'} className="h-full w-full object-cover" />
      </div>
    );
  }

  const initial = name?.slice(0, 1)?.toUpperCase() || '?';
  const colorClass = pendingInvite
    ? 'bg-gray-100 text-gray-400 border-gray-200'
    : 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-50';

  return (
    <div
      className={`flex items-center justify-center font-bold ${variantMap[variant]} ${sizeMap[size]} ${radiusMap[radius]} ${colorClass} ${className}`}
    >
      {initial}
    </div>
  );
}
