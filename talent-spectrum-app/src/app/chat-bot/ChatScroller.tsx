export default function ChatScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {children}
    </div>
  );
}
