"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Application {
  id: string;
  appNo: string;
  teamName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  commitmentAgreed: boolean;
  status: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "待处理", color: "#d97706", bg: "#fffbeb" },
  CONTACTED: { label: "已联系", color: "#2563eb", bg: "#eff6ff" },
  CONVERTED: { label: "已转为案例", color: "#16a34a", bg: "#f0fdf4" },
  REJECTED: { label: "已拒绝", color: "#64748b", bg: "#f1f5f9" },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/applications?${params}`);
    const data = await res.json();
    setApps(data.applications);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleSearch = () => setSearch(searchInput.trim());

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/admin/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchApps();
  };

  const formatTime = (d: string) => new Date(d).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="page-enter">
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "12px" }}>
          <input
            type="text"
            className="form-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索申请编号、团队名称、联系人、电话、邮箱..."
            style={{ flex: 1, minWidth: "200px" }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>搜索</button>
          {search && <button className="btn btn-outline btn-sm" onClick={() => { setSearch(""); setSearchInput(""); }}>清除</button>}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className={`btn ${!statusFilter ? "btn-primary" : "btn-outline"} btn-sm`} onClick={() => setStatusFilter("")}>全部</button>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <button key={k} className={`btn ${statusFilter === k ? "btn-primary" : "btn-outline"} btn-sm`} onClick={() => setStatusFilter(statusFilter === k ? "" : k)}>{v.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>加载中...</div>
      ) : apps.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>暂无申请</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>申请编号</th>
                <th>团队名称</th>
                <th>联系人</th>
                <th>联系电话</th>
                <th>邮箱</th>
                <th>承诺书</th>
                <th>状态</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const st = STATUS_MAP[a.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "14px" }}>{a.appNo}</td>
                    <td style={{ fontWeight: 500 }}>{a.teamName}</td>
                    <td>{a.contactName}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{a.contactPhone}</td>
                    <td style={{ fontSize: "13px" }}>{a.contactEmail}</td>
                    <td>{a.commitmentAgreed ? <span style={{ color: "#16a34a" }}>已确认</span> : "-"}</td>
                    <td><span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 500, color: st.color, background: st.bg }}>{st.label}</span></td>
                    <td style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>{formatTime(a.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        <Link href={`/admin/applications/${a.id}`} className="btn btn-outline btn-sm">详情</Link>
                        {a.status === "PENDING" && (
                          <button className="btn btn-outline btn-sm" style={{ color: "#2563eb", borderColor: "#bfdbfe" }} onClick={() => handleStatusChange(a.id, "CONTACTED")}>已联系</button>
                        )}
                        {a.status === "PENDING" && (
                          <button className="btn btn-outline btn-sm" style={{ color: "#dc2626", borderColor: "#fecaca" }} onClick={() => handleStatusChange(a.id, "REJECTED")}>拒绝</button>
                        )}
                      </div>
                    </td>
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
