export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem('oudkraft-user');
  return saved ? JSON.parse(saved) : null;
};

export const saveUser = (user) => {
  window.localStorage.setItem('oudkraft-user', JSON.stringify(user));
  return user;
};

export const loginUser = ({ email, password }) => {
  const existingUser = getStoredUser();
  if (existingUser?.email === email && existingUser?.password === password) {
    return { success: true, user: existingUser };
  }
  return { success: false, error: 'Please use the mock account created during registration.' };
};

export const registerUser = (user) => {
  const nextUser = { ...user, id: crypto.randomUUID() };
  saveUser(nextUser);
  return { success: true, user: nextUser };
};

export const logoutUser = () => {
  window.localStorage.removeItem('oudkraft-user');
};
