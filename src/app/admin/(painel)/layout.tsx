import AdminNav from "@/components/admin/AdminNav";

export default function PainelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
