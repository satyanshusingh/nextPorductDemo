import '../src/styles.css';

export const metadata = {
  title: 'Helpdesk | Team workspace',
  description: 'Manage customers, support tickets, and team workflows.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
