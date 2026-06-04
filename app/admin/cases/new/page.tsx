"use client";

import CaseForm, { CaseFormData } from "../CaseForm";

export default function NewCasePage() {
  const handleSubmit = async (data: CaseFormData) => {
    const res = await fetch("/api/admin/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "创建失败" };
    }
    return {};
  };

  return <CaseForm mode="create" onSubmit={handleSubmit} />;
}
