const tiles = [2, 4, 1, 3, 0, 5, 1, 3, 2];

export function GridMark() {
  return (
    <div className="mb-2 grid grid-cols-[repeat(3,--spacing(8))] gap-1.5" aria-hidden="true">
      {tiles.map((heat, index) => (
        <span
          key={index}
          className="h-8 rounded-cell bg-paper shadow-[inset_0_0_0_2px_var(--color-edge)] data-heat:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5"
          data-heat={heat || undefined}
        />
      ))}
    </div>
  );
}
