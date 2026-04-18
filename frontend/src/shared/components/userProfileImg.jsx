const SIZE_MAP = {
  lg: 'h-12 w-12 text-sm',
  md: 'h-8 w-8 text-xs',
  sm: 'h-6 w-6 text-[10px]',
};

export default function UserProfileImg(props) {
  const { name, profileImg, size = 'lg', pendingInvite = false } = props;

  const hasValidProfileImg = typeof profileImg === 'string' && profileImg.trim().length > 0;

  if (hasValidProfileImg) {
    return (
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
        <img src={profileImg} alt={name || 'img'} className="h-full w-full object-cover" />
      </div>
    );
  }

  const sizeKey = ['lg', 'md', 'sm'].includes(size) ? size : 'lg';
  const sizeClass = SIZE_MAP[sizeKey];

  const initial = name?.slice(0, 1)?.toUpperCase() || '?';
  const color = 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white';
  const semantic = 'bg-[#d1d5db]';
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold ${sizeClass} ${pendingInvite ? semantic : color}`}
    >
      {initial}
    </div>
  );
}
