
type StatCardProps = {
  label: string;
  value: number;
  icon: string;
  description?: string;
};

export default function StatCard({
  label,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>

        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-xl text-amber-700">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold text-[#092c45]">{value}</p>

      {description && (
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
