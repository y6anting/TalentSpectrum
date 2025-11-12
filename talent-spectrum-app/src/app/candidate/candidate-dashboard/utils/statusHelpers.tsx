import { Badge } from "@/app/components/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const getStatusIcon = (status: string) => {
  const statusMap: Record<string, React.ReactElement> = {
    Applied: <Clock className="h-5 w-5 text-blue-600" />,
    "Under Review": <AlertCircle className="h-5 w-5 text-yellow-600" />,
    Interviewing: <CheckCircle className="h-5 w-5 text-green-600" />,
    Rejected: <XCircle className="h-5 w-5 text-red-600" />,
  };
  return statusMap[status] || <Clock className="h-5 w-5 text-gray-600" />;
};

export const getStatusBadge = (status: string) => {
  const statusStyles: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
  > = {
    Applied: {
      variant: "secondary",
      className: "bg-blue-100 text-blue-800",
    },
    "Under Review": {
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800",
    },
    Interviewing: {
      variant: "secondary",
      className: "bg-green-100 text-green-800",
    },
    Rejected: {
      variant: "secondary",
      className: "bg-red-100 text-red-800",
    },
  };

  const style = statusStyles[status] || {
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge variant={style.variant} className={style.className}>
      {status}
    </Badge>
  );
};
