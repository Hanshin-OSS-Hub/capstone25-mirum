export default function FileTypeIcon({ type, className = 'h-8 w-8' }) {
  if (type === 'folder') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M3 7.5C3 6.67 3.67 6 4.5 6H9l1.5 2H19.5C20.33 8 21 8.67 21 9.5V17.5C21 18.33 20.33 19 19.5 19H4.5C3.67 19 3 18.33 3 17.5V7.5Z"
          fill="#5B74F1"
        />
      </svg>
    );
  }

  if (type === 'ppt') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 3H14L19 8V21H7V3Z" stroke="#F97316" strokeWidth="1.8" fill="white" />
        <path d="M14 3V8H19" stroke="#F97316" strokeWidth="1.8" />
        <rect x="9" y="11" width="8" height="5" rx="1" stroke="#F97316" strokeWidth="1.6" />
        <path d="M10.5 14.5L12.3 12.7L13.7 14.1L15.5 12.3" stroke="#F97316" strokeWidth="1.4" />
      </svg>
    );
  }

  if (type === 'excel') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 3H14L19 8V21H7V3Z" stroke="#53B95A" strokeWidth="1.8" fill="white" />
        <path d="M14 3V8H19" stroke="#53B95A" strokeWidth="1.8" />
        <path d="M10 11L14 16M14 11L10 16" stroke="#53B95A" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === 'pdf') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 3H14L19 8V21H7V3Z" stroke="#EF4444" strokeWidth="1.8" fill="white" />
        <path d="M14 3V8H19" stroke="#EF4444" strokeWidth="1.8" />
        <path d="M10 16V11H12.3C13.3 11 14 11.6 14 12.5C14 13.4 13.3 14 12.3 14H10" stroke="#EF4444" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'doc') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 3H14L19 8V21H7V3Z" stroke="#4F6EF7" strokeWidth="1.8" fill="white" />
        <path d="M14 3V8H19" stroke="#4F6EF7" strokeWidth="1.8" />
        <path d="M10 11H16M10 14H16M10 17H14" stroke="#4F6EF7" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'image') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="5" y="6" width="14" height="12" rx="2" stroke="#22C55E" strokeWidth="1.8" fill="white" />
        <circle cx="10" cy="10" r="1.3" fill="#22C55E" />
        <path d="M7.5 16L11 12.5L13.5 15L16.5 12L18.5 16" stroke="#22C55E" strokeWidth="1.6" />
      </svg>
    );
  }

  if (type === 'video') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="5" y="7" width="10" height="10" rx="2" stroke="#EC4899" strokeWidth="1.8" fill="white" />
        <path d="M12 12L9.5 10.5V13.5L12 12Z" fill="#EC4899" />
        <path d="M15 10L19 8.5V15.5L15 14" stroke="#EC4899" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 3H14L19 8V21H7V3Z" stroke="#6B7280" strokeWidth="1.8" fill="white" />
      <path d="M14 3V8H19" stroke="#6B7280" strokeWidth="1.8" />
    </svg>
  );
}
