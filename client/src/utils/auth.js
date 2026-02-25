export const getUser = () => {
  try {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getInitial = () => {
  const user = getUser();
  if (!user?.name) return "?";
  return user.name.charAt(0).toUpperCase();
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("authToken");
};
