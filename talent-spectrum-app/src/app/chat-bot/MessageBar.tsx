import { Send } from "lucide-react";

interface MessageBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
}

export default function MessageBar({
  value,
  onChange,
  onSend,
  disabled = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 focus-within:border-[#635bff] transition-colors">
      <input
        type="text"
        placeholder="Ask our AI about neurodivergent talent..."
        value={value}
        onChange={onChange}
        className={`flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className={`flex items-center gap-2 border rounded-full px-4 py-2 transition ${
          disabled
            ? "border-gray-300 text-gray-400 cursor-not-allowed"
            : "border-[#635bff] text-[#635bff] hover:bg-purple-50 cursor-pointer"
        }`}
      >
        <Send className="w-5 h-5" />
        {disabled ? "..." : "Send"}
      </button>
    </div>
  );
}
