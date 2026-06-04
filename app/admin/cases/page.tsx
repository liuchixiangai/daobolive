"use client";

import Link from "next/link";

export default function CasesPage() {
  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <p style={{ color: "#64748b" }}>管理所有导播案例</p>
        <Link href="/cases/new" className="btn btn-primary">
          创建导播案例
        </Link>
      </div>
      <div className="card">
        <p style={{ color: "#64748b", textAlign: "center", padding: "48px 0" }}>
          暂无案例，点击上方按钮创建第一个导播案例。
        </p>
      </div>
    </div>
  );
}
