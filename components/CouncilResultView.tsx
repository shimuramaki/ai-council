import { CouncilResult } from "@/components/CouncilResult";
import type { CouncilResponse } from "@/lib/history";

type Props = {
  result: CouncilResponse;
  createdAt?: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CouncilResultView({ result, createdAt }: Props) {
  return (
    <>
      {createdAt && <p className="history-date">保存日時: {formatDate(createdAt)}</p>}
      <CouncilResult result={result} />
    </>
  );
}
