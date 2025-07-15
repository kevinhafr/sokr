// utils/validation.ts

export const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^.{8,}$/,
  deckName: /^.{3,30}$/,
};

export const validateEmail = (email: string): boolean => {
  return ValidationRules.email.test(email);
};

export const validateUsername = (username: string): boolean => {
  return ValidationRules.username.test(username);
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDeckName = (name: string): boolean => {
  return ValidationRules.deckName.test(name.trim());
};

export const validateDeckComposition = (deck: string[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (deck.length !== 8) {
    errors.push('Le deck doit contenir exactement 8 cartes');
  }
  
  // Vérifier les duplicatas
  const uniqueCards = new Set(deck);
  if (uniqueCards.size !== deck.length) {
    errors.push('Le deck contient des cartes en double');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};