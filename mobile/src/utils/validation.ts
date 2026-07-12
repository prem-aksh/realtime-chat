export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 32;
export const MESSAGE_MAX_LENGTH = 2000;

export const validateUsername = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length < USERNAME_MIN_LENGTH) return `Name must be at least ${USERNAME_MIN_LENGTH} characters.`;
  if (trimmed.length > USERNAME_MAX_LENGTH) return `Name must be ${USERNAME_MAX_LENGTH} characters or fewer.`;
  return null;
};

export const validateMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "Message cannot be blank.";
  if (trimmed.length > MESSAGE_MAX_LENGTH) return `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  return null;
};
