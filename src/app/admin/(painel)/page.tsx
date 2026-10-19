import { Suspense } from "react";
import Link from "next/link";
import { BarList, ColumnChart, StatTile, formatDay } from "@/components/admin/charts";
import { Card, PageHeader, Skeleton } from "@/components/admin/ui";
import { getMetrics } from "@/lib/admin";

const PERIODS = [7, 30, 90] as const;
const nf = new Intl.NumberFormat("pt-BR");
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

function sourceLabel(source: string) {
  if (source === "direto") return "Direto / link salvo";
  if (source.includes("instagram")) return "Instagram";
  if (source.includes("facebook")) return "Facebook";
  if (source.includes("google")) return "Google";
  if (source.includes("whatsapp") || source === "wa.me") return "WhatsApp";
  if (source.includes("tiktok")) return "TikTok";
  if (source.includes("pinterest")) return "Pinterest";
  return source;
}

export default function MetricsPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<MetricsSkeleton />}>
      <Metrics searchParams={searchParams} />
    </Suspense>
  );
}

async function Metrics({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const { periodo } = await searchParams;
  const days = PERIODS.find((p) => String(p) === periodo) ?? 30;
  const m = await getMetrics(days);
  const t = m.totals;

  const sources = new Map<string, number>();
  for (const r of m.referrers) {
    const label = sourceLabel(r.source);
    sources.set(label, (sources.get(label) ?? 0) + r.total);
  }
  const topProducts = m.products.filter((p) => p.views > 0 || p.clicks > 0).slice(0, 8);

  return (
    <>
      <PageHeader
        title="Métricas"
        subtitle={`Últimos ${days} dias · contagem anônima, sem as suas próprias visitas`}
        action={
          <div role="group" aria-label="Período" className="flex rounded-full border border-amber-100 bg-white p-1 shadow-sm">
            {PERIODS.map((p) => (
              <Link
                key={p}
                href={`/admin?periodo=${p}`}
                aria-current={p === days ? "true" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                  p === days ? "bg-terracota text-white" : "text-cafe hover:text-grafite"
                }`}
              >
                {p} dias
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Visitantes" value={nf.format(t.visitors)} hint={`${nf.format(t.page_views)} visitas no total`} />
        <StatTile label="Peças abertas" value={nf.format(t.product_views)} hint="cliques para ver detalhes" />
        <StatTile label="Pedidos no WhatsApp" value={nf.format(t.whatsapp_clicks)} hint="cliques em “Fazer pedido”" />
        <StatTile
          label="Conversão"
          value={t.visitors ? pct.format(t.whatsapp_clicks / t.visitors) : "—"}
          hint="visitantes que pediram"
        />
      </div>

      {t.page_views === 0 && (
        <p className="mt-4 rounded-2xl bg-rosa-claro px-4 py-3 text-sm text-terracota-escuro">
          Ainda não há visitas neste período. Os números aparecem assim que o site começar a
          receber clientes.
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <ColumnChart
            title="Visitas por dia"
            unit={["visita", "visitas"]}
            data={m.daily.map((d) => ({ label: formatDay(d.day), value: d.page_views }))}
          />
        </Card>
        <Card>
          <ColumnChart
            title="Pedidos no WhatsApp por dia"
            unit={["pedido", "pedidos"]}
            data={m.daily.map((d) => ({ label: formatDay(d.day), value: d.whatsapp_clicks }))}
          />
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="font-bold text-grafite">Peças mais procuradas</h2>
        {topProducts.length === 0 ? (
          <p className="mt-4 text-sm text-cafe">Nenhuma peça foi aberta neste período.</p>
        ) : (
          <div className="-mx-5 mt-4 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-b border-amber-100 text-left text-xs uppercase tracking-wide text-cafe">
                  <th className="px-5 py-2 font-semibold sm:px-6">Peça</th>
                  <th className="px-3 py-2 text-right font-semibold">Abertas</th>
                  <th className="px-3 py-2 text-right font-semibold">Pedidos</th>
                  <th className="px-5 py-2 text-right font-semibold sm:px-6">Conversão</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {topProducts.map((p) => (
                  <tr key={p.id} className="border-b border-amber-100/60 last:border-0">
                    <td className="px-5 py-3 text-grafite sm:px-6">{p.name}</td>
                    <td className="px-3 py-3 text-right text-cafe">{nf.format(p.views)}</td>
                    <td className="px-3 py-3 text-right font-bold text-grafite">{nf.format(p.clicks)}</td>
                    <td className="px-5 py-3 text-right text-cafe sm:px-6">
                      {p.views ? pct.format(p.clicks / p.views) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <BarList
            title="Cores mais pedidas"
            empty="Nenhum pedido neste período."
            items={m.palettes.map((p) => ({ label: p.palette, value: p.total }))}
          />
        </Card>
        <Card>
          <BarList
            title="De onde vêm as visitas"
            empty="Sem visitas neste período."
            items={[...sources].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)}
          />
        </Card>
        <Card>
          <BarList
            title="Aparelhos"
            empty="Sem visitas neste período."
            items={m.devices
              .map((d) => ({ label: d.device === "mobile" ? "Celular" : "Computador", value: d.total }))
              .sort((a, b) => b.value - a.value)}
          />
        </Card>
      </div>
    </>
  );
}

function MetricsSkeleton() {
  return (
    <>
      <Skeleton className="mb-8 h-12 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </>
  );
}
