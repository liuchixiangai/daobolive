"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface CaseItem {
  id: string;
  caseNo: string;
  name: string;
  directorName: string;
  teamName: string | null;
  category: string | null;
  province: string | null;
  city: string | null;
  status: string;
  commitmentUploaded: boolean;
  wechatVerified: boolean;
  creator: { id: string; username: string };
  updatedAt: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "草稿", color: "#64748b", bg: "#f1f5f9" },
  PUBLISHED: { label: "已发布", color: "#16a34a", bg: "#f0fdf4" },
  UNPUBLISHED: { label: "已下架", color: "#dc2626", bg: "#fef2f2" },
  REJECTED: { label: "已拒绝", color: "#9333ea", bg: "#faf5ff" },
};

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/cases?${params.toString()}`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setCases(data.cases);
    } catch {
      setError("加载案例列表失败");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除案例「${name}」吗？此操作不可恢复。`)) return;

    try {
      const res = await fetch(`/api/admin/cases/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "删除失败");
        return;
      }
      fetchCases();
    } catch {
      alert("删除失败");
    }
  };

  const handleStatusChange = async (id: string, status: string, name: string) => {
    const confirmMsgs: Record<string, string> = {
      PUBLISHED: `确认发布「${name}」吗？`,
      UNPUBLISHED: `确认下架「${name}」吗？`,
      DRAFT: `确认恢复「${name}」为草稿吗？`,
    };
    const msg = confirmMsgs[status] || `确认执行此操作吗？`;
    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/cases/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "操作失败");
        return;
      }
      fetchCases();
    } catch {
      alert("操作失败");
    }
  };

  const handleCopyLink = (caseNo: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${caseNo}`).then(() => {
      alert("链接已复制");
    });
  };

  const renderActions = (c: CaseItem) => {
    const btns: React.ReactNode[] = [];

    // 编辑 — 所有状态
    btns.push(
      <Link key="edit" href={`/admin/cases/${c.id}`} className="btn btn-outline btn-sm">
        编辑
      </Link>
    );

    switch (c.status) {
      case "DRAFT":
        btns.push(
          <Link key="preview" href={`/admin/cases/${c.id}/preview`} className="btn btn-outline btn-sm" style={{ color: "#2563eb", borderColor: "#bfdbfe" }}>
            预览
          </Link>
        );
        btns.push(
          <button
            key="publish"
            className="btn btn-primary btn-sm"
            onClick={() => handleStatusChange(c.id, "PUBLISHED", c.name)}
          >
            发布
          </button>
        );
        break;

      case "PUBLISHED":
        btns.push(
          <Link key="open" href={`/p/${c.caseNo}`} target="_blank" className="btn btn-outline btn-sm" style={{ color: "#16a34a", borderColor: "#bbf7d0" }}>
            打开公开页
          </Link>
        );
        btns.push(
          <button
            key="copy"
            className="btn btn-outline btn-sm"
            onClick={() => handleCopyLink(c.caseNo)}
          >
            复制链接
          </button>
        );
        btns.push(
          <button
            key="unpublish"
            className="btn btn-outline btn-sm"
            style={{ color: "#dc2626", borderColor: "#fecaca" }}
            onClick={() => handleStatusChange(c.id, "UNPUBLISHED", c.name)}
          >
            下架
          </button>
        );
        break;

      case "UNPUBLISHED":
        btns.push(
          <button
            key="restore"
            className="btn btn-primary btn-sm"
            onClick={() => handleStatusChange(c.id, "PUBLISHED", c.name)}
          >
            恢复发布
          </button>
        );
        btns.push(
          <button
            key="copy"
            className="btn btn-outline btn-sm"
            onClick={() => handleCopyLink(c.caseNo)}
          >
            复制链接
          </button>
        );
        break;

      case "REJECTED":
        btns.push(
          <button
            key="restore"
            className="btn btn-outline btn-sm"
            onClick={() => handleStatusChange(c.id, "DRAFT", c.name)}
          >
            恢复为草稿
          </button>
        );
        break;
    }

    // 删除 — 所有状态
    btns.push(
      <button
        key="delete"
        className="btn btn-outline btn-sm"
        style={{ color: "#dc2626", borderColor: "#fecaca" }}
        onClick={() => handleDelete(c.id, c.name)}
      >
        删除
      </button>
    );

    return <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{btns}</div>;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-enter">
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className={`btn ${!statusFilter ? "btn-primary" : "btn-outline"} btn-sm`}
              onClick={() => setStatusFilter("")}
            >
              全部
            </button>
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <button
                key={key}
                className={`btn ${statusFilter === key ? "btn-primary" : "btn-outline"} btn-sm`}
                onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/admin/cases/new" className="btn btn-primary">
            创建导播案例
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
          加载中...
        </div>
      ) : cases.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
          <p style={{ marginBottom: "16px" }}>{statusFilter ? "该状态下暂无案例" : "暂无导播案例"}</p>
          <Link href="/admin/cases/new" className="btn btn-primary">
            创建第一个导播案例
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>案例编号</th>
                <th>案例名称</th>
                <th>导播姓名</th>
                <th>团队名称</th>
                <th>活动分类</th>
                <th>地区</th>
                <th>状态</th>
                <th>承诺书</th>
                <th>微信核验</th>
                <th>创建人</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.DRAFT;
                const location = [c.province, c.city].filter(Boolean).join(" ");
                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "13px" }}>
                      #{c.caseNo}
                    </td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.directorName}</td>
                    <td>{c.teamName || "-"}</td>
                    <td>{c.category || "-"}</td>
                    <td>{location || "-"}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: st.color,
                          background: st.bg,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <StatusBadge ok={c.commitmentUploaded} />
                    </td>
                    <td>
                      <StatusBadge ok={c.wechatVerified} />
                    </td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>
                      {c.creator.username}
                    </td>
                    <td style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatTime(c.updatedAt)}
                    </td>
                    <td>{renderActions(c)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span style={{ color: "#16a34a", fontSize: "13px" }}>已完成</span>
  ) : (
    <span style={{ color: "#94a3b8", fontSize: "13px" }}>未完成</span>
  );
}
