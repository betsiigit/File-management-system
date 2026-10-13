
type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 md:px-8">
      <div>
        <p className="text-sm text-slate-500">
          Office File Management / {title}
        </p>
        <h2 className="mt-1 text-xl font-bold text-[#092c45]">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">Office Administrator</p>
          <p className="text-xs text-slate-500">Administrator</p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dce8ef] font-bold text-[#092c45]"
          aria-label="Administrator profile"
        >
          A
        </div>
      </div>
    </header>
  );
}
