type ShowProperties = {
  title: React.ReactNode;
  description: React.ReactNode;
  top: number;
  left: number;
  start: number;
  end: number;
  scrollAmount: number;
  width?: number;
};

export function Show({
  title,
  description,
  top,
  left,
  scrollAmount,
  start,
  end,
  width,
}: ShowProperties) {
  return (
    <div
      className="absolute rounded-lg bg-[#0000007f] p-8 text-white shadow-lg transition-all duration-500"
      style={{
        width: width ?? "400px",
        opacity: scrollAmount > start && scrollAmount < end ? 1 : 0,
        left: `${left}%`,
        top: `${top}%`,
        zIndex: 50,
      }}
    >
      <div className="mb-4 text-center text-3xl font-bold">{title}</div>
      <div className="text-left">{description}</div>
    </div>
  );
}
