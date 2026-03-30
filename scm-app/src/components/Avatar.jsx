export default function Avatar({ name, size = 34, variant = "circle", gradient, onClick, style }) {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const borderRadius = variant === "circle" ? "50%" : 8;
  const bg = gradient ?? "linear-gradient(135deg, #6366F1, #8B5CF6)";
  const fontSize = size <= 28 ? 10 : size <= 32 ? 12 : 13;

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius,
        flexShrink: 0,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
