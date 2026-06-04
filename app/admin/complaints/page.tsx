"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ComplaintItem {
  id: string;
  caseNo: string;
  caseName: string;
  type: string;
  description: string;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
  status: string;
  createdAt: string;
  handler: { id: string; username: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  INFRINGEMENT: "内容侵权",
  FALSE_AD: "虚假宣传",
  ILLEGAL: "违法违规",
  WRONG_CONTACT: "联系方式错误",
  VIDEO_BROKEN: "视频无法播放",
  OTHER: "其他",
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "待处理", color: "#d97706", bg: "#fffbeb" },
  PROCESSING: { label: "处理中", color: "#2563eb", bg: "#eff6ff" },
  RESOLVED: { label: "已处理", color: "#16a34a", bg: "#f0fdf4" },
  REJECTED: { label: "无效投诉", color: "#64748b", bg: "#f1f5f9" },
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/complaints?${params.toString()}`);
      const data = await res.json();
      setComplaints(data.complaints);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-enter">
      <div className="card" style={{ marginBottom: "16px" }}>
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
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>加载中...</div>
      ) : complaints.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
          {statusFilter ? "该状态下暂无投诉" : "暂无投诉"}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>投诉编号</th>
                <th>案例编号</th>
                <th>案例名称</th>
                <th>投诉类型</th>
                <th>投诉人邮箱</th>
                <th>投诉状态</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {c.id.slice(0, 8)}...
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "13px" }}>#{c.caseNo}</td>
                    <td style={{ fontWeight: 500 }}>{c.caseName}</td>
                    <td>{TYPE_LABELS[c.type] || c.type}</td>
                    <td style={{ fontSize: "13px" }}>{c.reporterEmail || "-"}</td>
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
                    <td style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatTime(c.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/admin/complaints/${c.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        查看详情
                      </Link>
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
