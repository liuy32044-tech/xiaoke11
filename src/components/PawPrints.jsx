export default function PawPrints({ sm }) {
  const paws = sm
    ? [
        { top: 4, right: 20, rot: 15, op: 0.4 },
        { top: 8, right: 40, rot: -10, op: 0.3 },
      ]
    : [
        { top: 40, left: 60, rot: -20 },
        { top: 120, left: 200, rot: 15 },
        { bottom: 80, right: 120, rot: 30 },
        { top: 300, right: 60, rot: -10 },
      ];

  return (
    <>
      {paws.map((p, i) => (
        <svg
          key={i}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{
            position: "absolute",
            ...p,
            transform: `rotate(${p.rot || 0}deg)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <ellipse cx="7" cy="9" rx="4" ry="3.5" fill="#F2C4CE" opacity={p.op || 0.5} />
          <circle cx="4" cy="5.5" r="1.5" fill="#F2C4CE" opacity={p.op || 0.5} />
          <circle cx="7" cy="4.5" r="1.5" fill="#F2C4CE" opacity={p.op || 0.5} />
          <circle cx="10" cy="5.5" r="1.5" fill="#F2C4CE" opacity={p.op || 0.5} />
          <circle cx="2.5" cy="7" r="1.2" fill="#F2C4CE" opacity={p.op || 0.5} />
        </svg>
      ))}
    </>
  );
}
