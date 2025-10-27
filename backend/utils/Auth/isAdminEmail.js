module.exports = function isAdminEmail(email) {
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
  const adminDomains = process.env.ADMIN_DOMAINS ? process.env.ADMIN_DOMAINS.split(',').map(d => d.trim().toLowerCase()) : [];
  const lower = email.toLowerCase();
  if (adminEmails.includes(lower)) return true;
  const domain = lower.split('@')[1];
  if (domain && adminDomains.includes(domain)) return true;
  return false;
};
//ADMIN_EMAILS can be a@x.com,b@x.com. ADMIN_DOMAINS can be company.com to make all @company.com admins.