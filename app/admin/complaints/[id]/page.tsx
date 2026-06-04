"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface ComplaintDetail {
  id: string;
  caseId: string;
  caseNo: string;
  caseName: string;
  type: string;
  description: string;
  evidenceUrl: string | null;
  reporterName: string | null;
  reporterPhone: string | null;
  reporterEmail: string | null;
  status: string;
  handlerNote: string | null;
  handledAt: string | null;
  createdAt: string;
  case: {
    id: string;
    caseNo: string;
    name: string;
    status: string;
    directorName: string;
    teamName: string | null;
  } | null;
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

const CASE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "草稿", color: "#64748b" },
  PUBLISHED: { label: "已发布", color: "#16a34a" },
  UNPUBLISHED: { label: "已下架", color: "#dc2626" },
  REJECTED: { label: "已拒绝", color: "#9333ea" },
};

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);

  const loadComplaint = async () => {
    const res = await fetch(`/api/admin/complaints/${id}`);
    const data = await res.json();
    setComplaint(data.complaint);
    setLoading(false);
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "操作失败" });
      } else {
        setMsg({ type: "success", text: "操作成功" });
        setNote("");
        loadComplaint();
      }
    } catch {
      setMsg({ type: "error", text: "操作失败" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("确认下架该案例吗？下架后公开页将不可访问。")) return;
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/complaints/${id}/unpublish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "操作失败" });
      } else {
        setMsg({ type: "success", text: "案例已下架" });
        loadComplaint();
      }
    } catch {
      setMsg({ type: "error", text: "操作失败" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>加载中...</div>;
  }

  if (!complaint) {
    return <div className="alert alert-error">投诉不存在</div>;
  }

  const st = STATUS_MAP[complaint.status] || STATUS_MAP.PENDING;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: "16px" }}>
        <Link href="/admin/complaints" className="btn btn-outline btn-sm">
          返回投诉列表
        </Link>
      </div>

      {msg && (
        <div className={`alert ${msg.type === "success" ? "alert-success" : "alert-error"}`} style={{ marginBottom: "16px" }}>
          {msg.text}
        </div>
      )}

      {/* 投诉信息 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <h3 className="card-title" style={{ margin: 0 }}>投诉详情</h3>
          <span style={{
            padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 500,
            color: st.color, background: st.bg,
          }}>
            {st.label}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px", marginBottom: "16px" }}>
          <div>
            <span style={{ color: "#94a3b8" }}>投诉编号：</span>
            <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{complaint.id}</span>
          </div>
          <div>
            <span style={{ color: "#94a3b8" }}>提交时间：</span>
            {new Date(complaint.createdAt).toLocaleString("zh-CN")}
          </div>
          <div>
            <span style={{ color: "#94a3b8" }}>投诉类型：</span>
            <strong>{TYPE_LABELS[complaint.type] || complaint.type}</strong>
          </div>
          {complaint.handler && (
            <div>
              <span style={{ color: "#94a3b8" }}>处理人：</span>
              {complaint.handler.username}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>投诉说明</div>
          <div style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{complaint.description}</div>
        </div>

        {complaint.evidenceUrl && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>证明材料链接</div>
            <a href={complaint.evidenceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: "13px" }}>
              {complaint.evidenceUrl}
            </a>
          </div>
        )}

        {complaint.handlerNote && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>处理备注</div>
            <div style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px" }}>
              {complaint.handlerNote}
            </div>
          </div>
        )}
      </div>

      {/* 投诉人信息 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 className="card-title">投诉人信息</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
          <div><span style={{ color: "#94a3b8" }}>姓名：</span>{complaint.reporterName || "未填写"}</div>
          <div><span style={{ color: "#94a3b8" }}>电话：</span>{complaint.reporterPhone || "未填写"}</div>
          <div><span style={{ color: "#94a3b8" }}>邮箱：</span>{complaint.reporterEmail || "未填写"}</div>
        </div>
      </div>

      {/* 关联案例 */}
      {complaint.case && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 className="card-title">关联案例</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>案例编号：</span>
              <Link href={`/p/${complaint.case.caseNo}`} target="_blank" style={{ fontFamily: "monospace", color: "#2563eb" }}>
                #{complaint.case.caseNo}
              </Link>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>案例名称：</span>
              <Link href={`/admin/cases/${complaint.case.id}`} style={{ color: "#2563eb" }}>
                {complaint.case.name}
              </Link>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>导播：</span>{complaint.case.directorName}
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>状态：</span>
              <span style={{ color: CASE_STATUS_LABELS[complaint.case.status]?.color }}>
                {CASE_STATUS_LABELS[complaint.case.status]?.label || complaint.case.status}
              </span>
            </div>
          </div>

          {complaint.case.status === "PUBLISHED" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleUnpublish}
              disabled={actionLoading}
              style={{ marginTop: "12px", background: "#dc2626" }}
            >
              {actionLoading ? "处理中..." : "一键下架该案例"}
            </button>
          )}
        </div>
      )}

      {/* 处理操作 */}
      <div className="card">
        <h3 className="card-title">处理操作</h3>
        <div className="form-group">
          <label className="form-label">处理备注</label>
          <textarea
            className="form-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="填写处理备注..."
            rows={3}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {complaint.status === "PENDING" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange("PROCESSING")}
              disabled={actionLoading}
            >
              标记为处理中
            </button>
          )}
          {(complaint.status === "PENDING" || complaint.status === "PROCESSING") && (
            <>
              <button
                className="btn btn-outline btn-sm"
                style={{ color: "#16a34a", borderColor: "#bbf7d0" }}
                onClick={() => handleStatusChange("RESOLVED")}
                disabled={actionLoading}
              >
                标记为已处理
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ color: "#64748b", borderColor: "#e2e8f0" }}
                onClick={() => handleStatusChange("REJECTED")}
                disabled={actionLoading}
              >
                标记为无效投诉
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
