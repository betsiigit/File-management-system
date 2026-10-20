
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
    <div className="rounded-xl border border-[#ECEFF2] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#D6E2E8] hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#737B86]">
          {label}
        </p>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7F1F5] text-xl text-[#0A506E]">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-[#292D32]">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-[#9298A1]">
          {description}
        </p>
      )}
    </div>
  );
}
