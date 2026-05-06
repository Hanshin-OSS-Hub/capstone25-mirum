/**
 * className 결합 유틸
 * @param {...(string | false | null | undefined)} inputs
 */
export const cn = (...inputs) => inputs.filter(Boolean).join(' ');
