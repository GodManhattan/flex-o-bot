// utils/validation.ts
export const validatePIN = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }
  return { isValid: true, message: "" };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};
// Rate limiting for PIN attempts
export class PINAttemptLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> =
    new Map();
  private readonly maxAttempts = 3;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return false;

    if (attempt.count >= this.maxAttempts) {
      const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
      if (timeSinceLastAttempt < this.lockoutDuration) {
        return true;
      } else {
        // Reset attempts after lockout period
        this.attempts.delete(identifier);
        return false;
      }
    }
    return false;
  }

  recordAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.attempts.delete(identifier);
      return;
    }

    const current = this.attempts.get(identifier) || {
      count: 0,
      lastAttempt: 0,
    };
    this.attempts.set(identifier, {
      count: current.count + 1,
      lastAttempt: Date.now(),
    });
  }

  getRemainingLockoutTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt || attempt.count < this.maxAttempts) return 0;

    const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
    return Math.max(0, this.lockoutDuration - timeSinceLastAttempt);
  }
}
