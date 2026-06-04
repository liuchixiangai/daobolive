"use client";

import { useState, use } from "react";

export default function ComplaintPage({
  params,
}: {
  params: Promise<{ caseNo: string }>;
}) {
  const { caseNo } = use(params);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("请选择投诉类型");
      return;
    }
    if (!description.trim()) {
      setError("请填写投诉说明");
      return;
    }
    if (!reporterEmail.trim()) {
      setError("请填写联系邮箱，方便我们回复处理结果");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseNo,
          type,
          description: description.trim(),
          reporterName: reporterName.trim() || null,
          reporterPhone: reporterPhone.trim() || null,
          reporterEmail: reporterEmail.trim(),
          evidenceUrl: evidenceUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交失败");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: "600px", margin: "80px auto", padding: "24px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>&#10003;</div>
          <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "#16a34a" }}>
            投诉已提交
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            我们会尽快处理，感谢您的反馈。
          </p>
        </div>
      </div>
    );
  }

  const complaintTypes = [
    { value: "INFRINGEMENT", label: "内容侵权" },
    { value: "FALSE_AD", label: "虚假宣传" },
    { value: "ILLEGAL", label: "违法违规" },
    { value: "WRONG_CONTACT", label: "联系方式错误" },
    { value: "VIDEO_BROKEN", label: "视频无法播放" },
    { value: "OTHER", label: "其他" },
  ];

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "24px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>
        投诉 / 举报本案例
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">案例编号</label>
            <input type="text" className="form-input" value={caseNo} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">
              投诉类型 <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">请选择投诉类型</option>
              {complaintTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              投诉说明 <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述您要投诉的内容..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label className="form-label">投诉人姓名</label>
            <input
              type="text"
              className="form-input"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="可选"
            />
          </div>

          <div className="form-group">
            <label className="form-label">投诉人电话</label>
            <input
              type="text"
              className="form-input"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              placeholder="可选"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              投诉人邮箱 <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="请留下邮箱，方便我们回复"
            />
          </div>

          <div className="form-group">
            <label className="form-label">证明材料链接</label>
            <input
              type="text"
              className="form-input"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="可选，请提供相关证明链接"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "提交中..." : "提交投诉"}
          </button>
        </form>
      </div>
    </div>
  );
}
