// Icone dei traguardi del collezionista.
const P: Record<string, string> = {
  benvenuto: "M14 9a4 4 0 1 1-3.5-4 4 4 0 0 1 3.5 4zm-1 3l7 7m-3-3l2-2m-4 0l2-2",
  email: "M4 6h16v12H4zM4 7l8 6 8-6",
  prima: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4h6v6H9z",
  tris: "M5 6h9v14H5zM9 4h9v14M13 2h7v14",
  holo: "M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1z",
  full: "M4 4h16v16H4zM4 15l5-5 4 4 3-3 4 4",
  legend: "M3 8l4 4 5-7 5 7 4-4-2 11H5zM5 19h14",
  custode: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  elementi: "M12 3c3 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3 0-5 0-7z",
  regalo: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-4-6-1s4 1 6 1zm0 0c2-4 6-4 6-1s-4 1-6 1z",
};
export function BadgeIcon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={P[id] ?? P.prima} />
    </svg>
  );
}
