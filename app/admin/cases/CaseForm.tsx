"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface CaseFormData {
  name: string;
  directorName: string;
  teamName: string;
  contactInfo: string;
  category: string;
  province: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  contactWechat: string;
  contactEmail: string;
  summary: string;
  teamDisplay: string;
  techTags: string;
}

const initialFormData: CaseFormData = {
  name: "",
  directorName: "",
  teamName: "",
  contactInfo: "",
  category: "",
  province: "",
  city: "",
  contactPerson: "",
  contactPhone: "",
  contactWechat: "",
  contactEmail: "",
  summary: "",
  teamDisplay: "",
  techTags: "",
};

const CATEGORIES = [
  "体育赛事",
  "会议直播",
  "文艺演出",
  "大型活动",
  "企业直播",
  "线上会议",
  "教育培训",
  "电商直播",
  "其他",
];

const PROVINCES = [
  "安徽", "北京", "重庆", "福建", "甘肃", "广东", "广西", "贵州",
  "海南", "河北", "河南", "黑龙江", "湖北", "湖南", "吉林", "江苏",
  "江西", "辽宁", "内蒙古", "宁夏", "青海", "山东", "山西", "陕西",
  "上海", "四川", "天津", "西藏", "新疆", "云南", "浙江",
  "香港", "澳门", "台湾",
];

const TECH_TAGS = [
  "导播", "切像", "回放", "慢动作", "字幕", "音控", "灯光",
  "AR包装", "虚拟制作", "多机位", "体育赛事", "会议直播",
  "文艺演出", "大型活动", "企业直播", "线上会议",
];

interface CaseFormProps {
  mode: "create" | "edit";
  initialData?: CaseFormData & { caseNo?: string; status?: string };
  onSubmit: (data: CaseFormData) => Promise<{ error?: string }>;
}

export default function CaseForm({ mode, initialData, onSubmit }: CaseFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CaseFormData>(initialData || initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSelectedTags(
        initialData.techTags
          ? initialData.techTags.split(",").map((t) => t.trim()).filter(Boolean)
          : []
      );
    }
  }, [initialData]);

  const updateField = (field: keyof CaseFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      // 同步更新 form 中的 techTags
      setForm((f) => ({ ...f, techTags: next.join(", ") }));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 验证必填
    if (!form.name.trim()) {
      setError("案例名称不能为空");
      return;
    }
    if (!form.directorName.trim()) {
      setError("导播姓名不能为空");
      return;
    }
    if (!form.category.trim()) {
      setError("活动分类不能为空");
      return;
    }

    setSaving(true);
    try {
      const result = await onSubmit({
        ...form,
        techTags: selectedTags.join(", "),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/cases");
        router.refresh();
      }
    } catch {
      setError("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      {initialData?.caseNo && (
        <div className="card" style={{ marginBottom: "16px", display: "flex", gap: "24px", alignItems: "center" }}>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>案例编号</span>
            <span style={{ marginLeft: "8px", fontFamily: "monospace", fontWeight: 600 }}>#{initialData.caseNo}</span>
          </div>
          {initialData.status && (
            <div>
              <span style={{ color: "#94a3b8", fontSize: "13px" }}>状态</span>
              <span style={{ marginLeft: "8px" }}>{STATUS_LABELS[initialData.status] || initialData.status}</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* 基本信息 */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 className="card-title">基本信息</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                案例名称 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="请输入案例名称"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                导播姓名 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={form.directorName}
                onChange={(e) => updateField("directorName", e.target.value)}
                placeholder="请输入导播姓名"
              />
            </div>
            <div className="form-group">
              <label className="form-label">团队名称</label>
              <input
                type="text"
                className="form-input"
                value={form.teamName}
                onChange={(e) => updateField("teamName", e.target.value)}
                placeholder="请输入团队名称"
              />
            </div>
            <div className="form-group">
              <label className="form-label">联系方式</label>
              <input
                type="text"
                className="form-input"
                value={form.contactInfo}
                onChange={(e) => updateField("contactInfo", e.target.value)}
                placeholder="公开联系方式"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                活动分类 <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">请选择活动分类</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">省份</label>
              <select
                className="form-select"
                value={form.province}
                onChange={(e) => updateField("province", e.target.value)}
              >
                <option value="">请选择省份</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">城市</label>
              <input
                type="text"
                className="form-input"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="请输入城市"
              />
            </div>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 className="card-title">联系信息</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">联系人姓名</label>
              <input
                type="text"
                className="form-input"
                value={form.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)}
                placeholder="联系人姓名"
              />
            </div>
            <div className="form-group">
              <label className="form-label">手机号</label>
              <input
                type="text"
                className="form-input"
                value={form.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                placeholder="手机号"
              />
            </div>
            <div className="form-group">
              <label className="form-label">微信号</label>
              <input
                type="text"
                className="form-input"
                value={form.contactWechat}
                onChange={(e) => updateField("contactWechat", e.target.value)}
                placeholder="微信号"
              />
            </div>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                type="email"
                className="form-input"
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="邮箱地址"
              />
            </div>
          </div>
        </div>

        {/* 展示信息 */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 className="card-title">展示信息</h3>
          <div className="form-group">
            <label className="form-label">案例简介</label>
            <textarea
              className="form-textarea"
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="简要介绍本案例..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">团队展示内容</label>
            <textarea
              className="form-textarea"
              value={form.teamDisplay}
              onChange={(e) => updateField("teamDisplay", e.target.value)}
              placeholder="展示团队信息、设备、经验..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">技术标签</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {TECH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    border: selectedTags.includes(tag)
                      ? "1px solid #2563eb"
                      : "1px solid #e2e8f0",
                    background: selectedTags.includes(tag) ? "#eff6ff" : "#ffffff",
                    color: selectedTags.includes(tag) ? "#2563eb" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
                已选：{selectedTags.join("、")}
              </div>
            )}
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="card" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => router.back()}
          >
            取消
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "保存中..." : mode === "create" ? "创建案例" : "保存修改"}
          </button>
        </div>
      </form>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  UNPUBLISHED: "已下架",
  REJECTED: "已拒绝",
};
