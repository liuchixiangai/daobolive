"use client";

import { useState, useEffect } from "react";

interface CommitmentInfo {
  commitmentUploaded: boolean;
  commitmentFileName?: string | null;
  commitmentFileSize?: number | null;
  commitmentUploadedAt?: string | null;
  commitmentUploadedBy?: string | null;
}

interface CommitmentUploadProps {
  caseId: string;
}

export default function CommitmentUpload({ caseId }: CommitmentUploadProps) {
  const [info, setInfo] = useState<CommitmentInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const loadInfo = async () => {
    try {
      const res = await fetch(`/api/admin/cases/${caseId}/commitment`);
      const data = await res.json();
      setInfo(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadInfo();
  }, [caseId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/cases/${caseId}/commitment`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "上传失败" });
      } else {
        setMessage({ type: "success", text: "承诺书已上传" });
        loadInfo();
      }
    } catch {
      setMessage({ type: "error", text: "上传失败" });
    } finally {
      setUploading(false);
      e.target.value = "";
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  return (
    <div className="card" style={{ marginTop: "16px" }}>
      <h3 className="card-title">承诺书</h3>

      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "12px", padding: "8px 12px", fontSize: "13px" }}
        >
          {message.text}
        </div>
      )}

      {info?.commitmentUploaded ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>
              <span style={{ color: "#16a34a", marginRight: "6px" }}>&#10003;</span>
              已上传
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              {info.commitmentFileName}
              {info.commitmentFileSize && <span> · {formatSize(info.commitmentFileSize)}</span>}
            </div>
            {info.commitmentUploadedAt && (
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                {formatTime(info.commitmentUploadedAt)}
                {info.commitmentUploadedBy && <span> · {info.commitmentUploadedBy}</span>}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <label className="btn btn-outline btn-sm" style={{ cursor: "pointer" }}>
              {uploading ? "上传中..." : "重新上传"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
            尚未上传承诺书（PDF / JPG / PNG，最大 10MB）
          </div>
          <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
            {uploading ? "上传中..." : "上传承诺书"}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
