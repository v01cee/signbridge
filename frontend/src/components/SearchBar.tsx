interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Поиск жестов..." }: Props) {
  return (
    <div style={styles.wrap}>
      <span style={styles.icon}>🔍</span>
      <input
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button style={styles.clear} onClick={() => onChange("")}>
          ✕
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "0 16px",
    gap: 10,
    maxWidth: 560,
    width: "100%",
  },
  icon: { fontSize: 16, flexShrink: 0 },
  input: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontSize: 15,
    height: 48,
  },
  clear: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 14,
    padding: "4px 6px",
    borderRadius: 4,
  },
};
