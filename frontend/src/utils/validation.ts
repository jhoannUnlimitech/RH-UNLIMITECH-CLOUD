/**
 * Valida si un email tiene un formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Genera una contraseña aleatoria segura
 * @param length - Longitud de la contraseña (por defecto 12)
 */
export const generatePassword = (length: number = 12): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  
  // Asegurar al menos un carácter de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Completar el resto de la contraseña
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar la contraseña
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Evalúa la fortaleza de una contraseña
 * @returns "weak" | "medium" | "strong"
 */
export const getPasswordStrength = (password: string): "weak" | "medium" | "strong" => {
  if (password.length < 6) return "weak";
  
  let strength = 0;
  
  // Longitud
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Mayúsculas
  if (/[A-Z]/.test(password)) strength++;
  
  // Minúsculas
  if (/[a-z]/.test(password)) strength++;
  
  // Números
  if (/[0-9]/.test(password)) strength++;
  
  // Símbolos
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
};
