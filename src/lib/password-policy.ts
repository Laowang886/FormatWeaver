export const MIN_PASSWORD_LENGTH = 8;

const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9]/;

export type PasswordRequirement = {
  id: "minLength" | "specialCharacter";
  label: string;
  isMet: boolean;
};

export function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  return [
    {
      id: "minLength",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      isMet: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      id: "specialCharacter",
      label: "At least one special character",
      isMet: SPECIAL_CHARACTER_PATTERN.test(password),
    },
  ];
}

export function validatePassword(password: string): string | null {
  const unmetRequirement = getPasswordRequirements(password).find(
    (requirement) => !requirement.isMet,
  );

  return unmetRequirement
    ? `Password must include: ${unmetRequirement.label.toLowerCase()}.`
    : null;
}
