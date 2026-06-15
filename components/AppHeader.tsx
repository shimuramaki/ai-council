import Link from "next/link";

type Props = {
  active?: "home" | "history";
};

export function AppHeader({ active = "home" }: Props) {
  return (
    <header className="top">
      <div className="top-row">
        <div className="brand">
          <span className="dot" />
          <Link href="/">AI Council</Link>
        </div>
        <nav className="nav">
          <Link href="/" className={"nav-link" + (active === "home" ? " active" : "")}>
            質問する
          </Link>
          <Link href="/history" className={"nav-link" + (active === "history" ? " active" : "")}>
            履歴
          </Link>
        </nav>
      </div>
      <p className="tagline">3つのAIに同時に聞き、Claudeが結論をまとめる</p>
    </header>
  );
}
