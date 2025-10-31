import { RefreshCw } from "lucide-react";

export default function RefreshButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 right-3 text-gray-400 hover:text-[#635bff] transition"
    >
      <RefreshCw className="w-4 h-4" />
    </button>
  );
}
