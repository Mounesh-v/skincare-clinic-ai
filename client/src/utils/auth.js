export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getInitial = () => {
  const user = getUser();
  if (!user?.name) return "?";

  return user.name.charAt(0).toUpperCase();
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};
