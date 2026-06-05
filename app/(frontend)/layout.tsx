import Link from "next/link";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 前台导航 */}
      <header
        style={{
          background: "#1e293b",
          color: "#f1f5f9",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link
            href="/"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#ffffff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            导播星球
          </Link>
          <nav style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/"
              style={{
                color: "#f1f5f9",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              导播案例
            </Link>
            <Link
              href="/apply"
              style={{
                color: "#fbbf24",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              申请入驻
            </Link>
            <Link
              href="/tools"
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              导播工具
            </Link>
            <Link
              href="/community"
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              导播社群
            </Link>
          </nav>
        </div>
        <div>
          <Link
            href="/admin/login"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            后台管理
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* 底部 */}
      <footer
        style={{
          background: "#1e293b",
          color: "#64748b",
          textAlign: "center",
          padding: "24px",
          fontSize: "13px",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <Link href="/" style={{ color: "#94a3b8", margin: "0 8px", textDecoration: "none" }}>
            导播案例
          </Link>
          <Link href="/tools" style={{ color: "#94a3b8", margin: "0 8px", textDecoration: "none" }}>
            导播工具
          </Link>
          <Link href="/community" style={{ color: "#94a3b8", margin: "0 8px", textDecoration: "none" }}>
            导播社群
          </Link>
        </div>
        <div>导播星球 &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
