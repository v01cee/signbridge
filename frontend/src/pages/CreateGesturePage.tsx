import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGesture } from "../api/gestures";
import type { GestureCreate } from "../types";

export function CreateGesturePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<GestureCreate>({ title: "", description: "" });
  const [errors, setErrors] = useState<Partial<GestureCreate>>({});

  const mutation = useMutation({
    mutationFn: createGesture,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gestures"] });
      navigate(`/gestures/${data.id}`);
    },
  });

  function validate(): boolean {
    const e: Partial<GestureCreate> = {};
    if (!form.title.trim()) e.title = "Название обязательно";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
    });
  }

  return (
    <main style={styles.main}>
      <Link to="/" style={styles.breadcrumb}>← Словарь</Link>

      <div style={styles.card}>
        <div style={styles.cardHead}>
          <span style={{ fontSize: 32 }}>🤟</span>
          <div>
            <h1 style={styles.title}>Добавить жест</h1>
            <p style={styles.sub}>Пополните словарь новым жестом</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Название *</label>
            <input
              style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
              placeholder="Например: Привет"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              disabled={mutation.isPending}
            />
            {errors.title && <p style={styles.fieldError}>{errors.title}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Описание</label>
            <textarea
              style={styles.textarea}
              placeholder="Краткое описание жеста..."
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={mutation.isPending}
            />
          </div>

          {mutation.isError && (
            <div style={styles.errorBox}>
              ⚠️ Не удалось сохранить. Убедитесь, что backend запущен.
            </div>
          )}

          <div style={styles.actions}>
            <Link to="/" style={styles.cancelBtn}>Отмена</Link>
            <button type="submit" style={styles.submitBtn} disabled={mutation.isPending}>
              {mutation.isPending ? "Сохранение..." : "Сохранить жест"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 640, margin: "0 auto", padding: "32px 24px 64px" },
  breadcrumb: { display: "inline-block", marginBottom: 28, fontSize: 14, color: "var(--text-muted)" },
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "36px",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
    paddingBottom: 28,
    borderBottom: "1px solid var(--border)",
  },
  title: { fontSize: 22, fontWeight: 700 },
  sub: { fontSize: 14, color: "var(--text-muted)", marginTop: 2 },
  form: { display: "flex", flexDirection: "column", gap: 24 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" },
  input: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.15s",
  },
  inputError: { borderColor: "var(--error)" },
  textarea: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    resize: "vertical" as const,
    lineHeight: 1.6,
  },
  fieldError: { fontSize: 13, color: "var(--error)" },
  errorBox: {
    background: "#2a1520",
    border: "1px solid #4a2030",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    color: "var(--error)",
    fontSize: 14,
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  cancelBtn: {
    padding: "10px 24px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-muted)",
    background: "var(--bg)",
    border: "1px solid var(--border)",
  },
  submitBtn: {
    padding: "10px 28px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    background: "var(--accent)",
    border: "none",
  },
};
