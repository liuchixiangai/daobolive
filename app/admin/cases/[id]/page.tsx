"use client";

import { useEffect, useState, use } from "react";
import CaseForm, { CaseFormData } from "../CaseForm";
import HtmlEditor from "../HtmlEditor";

interface CaseDetail {
  id: string;
  caseNo: string;
  status: string;
  name: string;
  directorName: string;
  teamName: string | null;
  contactInfo: string | null;
  category: string | null;
  province: string | null;
  city: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactWechat: string | null;
  contactEmail: string | null;
  summary: string | null;
  teamDisplay: string | null;
  techTags: string | null;
  htmlContent: string | null;
}

export default function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/cases/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("案例不存在");
        return res.json();
      })
      .then((data) => setCaseData(data.case))
      .catch(() => setError("加载案例失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: CaseFormData) => {
    const res = await fetch(`/api/admin/cases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "保存失败" };
    }
    return {};
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
        加载中...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="alert alert-error">{error || "案例不存在"}</div>
    );
  }

  const formData: CaseFormData & { caseNo?: string; status?: string } = {
    name: caseData.name,
    directorName: caseData.directorName,
    teamName: caseData.teamName || "",
    contactInfo: caseData.contactInfo || "",
    category: caseData.category || "",
    province: caseData.province || "",
    city: caseData.city || "",
    contactPerson: caseData.contactPerson || "",
    contactPhone: caseData.contactPhone || "",
    contactWechat: caseData.contactWechat || "",
    contactEmail: caseData.contactEmail || "",
    summary: caseData.summary || "",
    teamDisplay: caseData.teamDisplay || "",
    techTags: caseData.techTags || "",
    caseNo: caseData.caseNo,
    status: caseData.status,
  };

  return (
    <div className="page-enter">
      <CaseForm mode="edit" initialData={formData} onSubmit={handleSubmit} />
      <HtmlEditor caseId={caseData.id} initialHtml={caseData.htmlContent} />
    </div>
  );
}
