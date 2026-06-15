"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import type { HistoryListItem } from "@/lib/history";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "履歴の取得に失敗しました");
          return;
        }
        setItems(data.items ?? []);
      } catch {
        setError("通信エラーが起きました。");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="wrap">
      <AppHeader active="history" />

      <section className="history-section">
        <h1 className="history-title">過去の質問</h1>
        <p className="history-sub">新しい順に表示しています。クリックすると詳細が見られます。</p>

        {loading && <p className="history-status">読み込み中…</p>}
        {error && <div className="banner error">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <p className="history-status">まだ履歴がありません。質問を送るとここに表示されます。</p>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="history-list">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/history/${item.id}`} className="history-item">
                  <span className="history-item-date">{formatDate(item.created_at)}</span>
                  <span className="history-item-question">{item.question}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
