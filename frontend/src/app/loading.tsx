export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loading...</p>
      </div>
    </div>
  );
}
