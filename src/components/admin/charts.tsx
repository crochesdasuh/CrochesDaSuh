// Gráficos do painel em HTML/CSS puro (sem biblioteca): uma métrica por
// gráfico, cor única, tooltip ao passar o mouse ou tocar, e tabela para
// leitores de tela.

const nf = new Intl.NumberFormat("pt-BR");

/** Arredonda para cima até um número "redondo" (1, 2, 5, 10, 20, 50…). */
function niceCeil(value: number) {
  if (value <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= value) return step * pow;
  return 10 * pow;
}

export function formatDay(day: string) {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm text-cafe">{label}</p>
      <p className="mt-1 text-3xl font-bold text-grafite">{value}</p>
      {hint && <p className="mt-1 text-xs text-cafe">{hint}</p>}
    </div>
  );
}

export function ColumnChart({
  title,
  data,
  unit,
}: {
  title: string;
  data: { label: string; value: number }[];
  unit: [singular: string, plural: string];
}) {
  const max = niceCeil(Math.max(0, ...data.map((d) => d.value)));
  const ticks = Number.isInteger(max / 2) ? [max, max / 2, 0] : [max, 0];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const plural = (n: number) => (n === 1 ? unit[0] : unit[1]);
  const xLabels = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="font-bold text-grafite">{title}</span>
        <span className="text-sm text-cafe">
          {nf.format(total)} {plural(total)}
        </span>
      </figcaption>

      <div className="mt-5 flex gap-2">
        {/* eixo Y */}
        <div className="flex h-40 flex-col justify-between text-right text-[11px] tabular-nums text-cafe">
          {ticks.map((t) => (
            <span key={t} className="-my-1.5 leading-3">
              {nf.format(t)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 h-px bg-amber-100"
                style={{ bottom: `${(t / max) * 100}%` }}
              />
            ))}
            <div className="relative flex h-full items-end gap-[2px]">
              {data.map((d) => (
                <div
                  key={d.label}
                  tabIndex={0}
                  aria-label={`${d.label}: ${d.value} ${plural(d.value)}`}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  <div
                    className="w-full max-w-6 rounded-t-[4px] bg-terracota-escuro transition-opacity group-hover:opacity-80 group-focus:opacity-80"
                    style={{ height: `${(d.value / max) * 100}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-grafite px-2.5 py-1.5 text-xs text-white shadow-md group-hover:block group-focus:block">
                    <strong className="block">{d.label}</strong>
                    {nf.format(d.value)} {plural(d.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-[2px] text-[11px] tabular-nums text-cafe">
            {data.map((d, i) => (
              <span
                key={d.label}
                className={`flex-1 whitespace-nowrap ${
                  i === 0 ? "text-left" : i === data.length - 1 ? "text-right" : "text-center"
                }`}
              >
                {xLabels.has(i) ? d.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function BarList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <figure>
      <figcaption className="font-bold text-grafite">{title}</figcaption>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-cafe">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-grafite">{item.label}</span>
                <span className="shrink-0 tabular-nums text-cafe">
                  <strong className="text-grafite">{nf.format(item.value)}</strong>{" "}
                  · {Math.round((item.value / total) * 100)}%
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-creme">
                <div
                  className="h-2 rounded-full bg-terracota-escuro"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
