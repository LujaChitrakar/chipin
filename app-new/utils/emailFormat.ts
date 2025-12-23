export function truncateEmail(email?: string) {
  if (!email) return 'No email';

  const [name, domain] = email.split('@');
  if (!domain) return email;

  const truncatedName =
    name.length > 8 ? `${name.slice(0, 8)}...` : name;

  return `${truncatedName}@${domain}`;
}