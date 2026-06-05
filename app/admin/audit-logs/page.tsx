"use client";

import { useEffect, useState, useCallback } from "react";

interface LogEntry {
  id: string;
  adminName: string;
  action: string;
  caseNo: string | null;
  ip: string | null;
  result: string | null;
  note: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "管理员登录",
  CREATE_CASE: "创建案例",
  EDIT_CASE: "编辑案例",
  SAVE_HTML: "保存 HTML",
  UPLOAD_COMMITMENT: "上传承诺书",
  VIEW_COMMITMENT: "查看承诺书",
  WECHAT_VERIFY: "微信核验",
  WECHAT_UNVERIFY: "取消微信核验",
  PUBLISH_CASE: "发布案例",
  UNPUBLISH_CASE: "下架案例",
  RESTORE_CASE: "恢复发布",
  REJECT_CASE: "拒绝案例",
  DELETE_CASE: "删除案例",
  COMPLAINT_SUBMIT: "提交投诉",
  VIEW_COMPLAINT: "查看投诉",
  HANDLE_COMPLAINT: "处理投诉",
  COMPLAINT_UNPUBLISH: "投诉一键下架",
  APPLICATION_SUBMIT: "提交申请",
  VIEW_APPLICATION: "查看申请",
  UPDATE_APPLICATION_STATUS: "更新申请状态",
  CONVERT_APPLICATION: "转为案例",
  SMTP_NOT_CONFIGURED: "SMTP 未配置",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", "50");
    const res = await fetch(`/api/admin/audit-logs?${params}`);
    const data = await res.json();
    setLogs(data.logs);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatTime = (d: string) => new Date(d).toLocaleString("zh-CN");

  return (
    <div className="page-enter">
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            className="form-input"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSearch(searchInput.trim())}
            placeholder="搜索案例编号、操作人、操作类型..."
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-sm" onClick={() => setSearch(searchInput.trim())}>搜索</button>
          {search && <button className="btn btn-outline btn-sm" onClick={() => { setSearch(""); setSearchInput(""); }}>清除</button>}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>加载中...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>暂无操作日志</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>操作人</th>
                <th>操作类型</th>
                <th>案例编号</th>
                <th>IP</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#64748b" }}>{formatTime(l.createdAt)}</td>
                  <td>{l.adminName}</td>
                  <td>{ACTION_LABELS[l.action] || l.action}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{l.caseNo || "-"}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>{l.ip || "-"}</td>
                  <td style={{ fontSize: "12px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>{l.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
        <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>上一页</button>
        <span style={{ padding: "4px 12px", fontSize: "13px", color: "#64748b" }}>第 {page} 页</span>
        <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)}>下一页</button>
      </div>
    </div>
  );
}
