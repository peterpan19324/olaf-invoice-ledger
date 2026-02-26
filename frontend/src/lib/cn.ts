export const cn = (...inputs: (string | false | null | undefined | 0)[]): string =>
  inputs.filter(Boolean).join(' ')
