import { Link } from "@/i18n/navigation";

export function SectionHeading({
  title,
  href,
  actionLabel,
}: {
  title: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {href && actionLabel ? (
        <Link
          href={href}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
