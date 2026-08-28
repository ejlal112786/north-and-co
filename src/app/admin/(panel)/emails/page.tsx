import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function EmailsPage() {
  await requireAdmin("emails");
  const [emails, contacts] = await Promise.all([
    prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return (
    <div>
      <h1 className="font-serif text-4xl">Messages</h1>
      <p className="mt-2 text-sm text-muted">
        If SMTP is not configured, transactional emails are stored here as “logged” rather than sent. That is intentional.
      </p>
      <h2 className="mt-8 font-serif text-2xl">Transactional</h2>
      <ul className="mt-3 text-sm">
        {emails.map((e) => (
          <li key={e.id} className="border-b border-line py-2">
            <strong>{e.status}</strong> · {e.type} · {e.to} · {e.subject} · {formatDate(e.createdAt)}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-serif text-2xl">Contact form</h2>
      <ul className="mt-3 text-sm">
        {contacts.map((c) => (
          <li key={c.id} className="border-b border-line py-2">
            {c.name} · {c.email}
            <div className="text-muted">{c.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
