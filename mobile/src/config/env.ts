const requiredUrl = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`${name} is not configured. Copy mobile/.env.example to mobile/.env and set it.`);
  return value.replace(/\/$/, "");
};

export const mobileConfig = {
  apiUrl: requiredUrl(process.env.EXPO_PUBLIC_API_URL, "EXPO_PUBLIC_API_URL"),
  socketUrl: requiredUrl(process.env.EXPO_PUBLIC_SOCKET_URL, "EXPO_PUBLIC_SOCKET_URL")
};
