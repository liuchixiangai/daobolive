"use client";

import { useEffect, useState } from "react";

export default function AdminsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setRole(data.admin?.role))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>加载中...</div>;
  }

  if (role !== "SUPER_ADMIN") {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <div className="alert alert-error">无权限访问</div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="card">
        <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>
          管理员管理将在后续阶段实现。
        </p>
      </div>
    </div>
  );
}
