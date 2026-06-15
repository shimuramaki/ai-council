"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CouncilResultView } from "@/components/CouncilResultView";
import type { CouncilResponse } from "@/lib/history";

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<CouncilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/history/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "履歴の取得に失敗しました");
          return;
        }
        setRecord(data);
      } catch {
        setError("通信エラーが起きました。");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) load();
  }, [params.id]);

  return (
    <main className="wrap">
      <AppHeader active="history" />

      <div className="history-back">
        <Link href="/history">← 履歴一覧に戻る</Link>
      </div>

      {loading && <p className="history-status">読み込み中…</p>}
      {error && <div className="banner error">{error}</div>}
      {record && (
        <CouncilResultView result={record} createdAt={record.created_at} />
      )}
    </main>
  );
}
