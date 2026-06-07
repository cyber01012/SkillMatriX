
export function getCurrentUser(): { username: string; isLoggedIn: boolean } {
  if (typeof window === 'undefined') {
    return { username: 'guest', isLoggedIn: false };
  }
  const username = localStorage.getItem('username') || 'guest';
  return { username, isLoggedIn: username !== 'guest' };
}
