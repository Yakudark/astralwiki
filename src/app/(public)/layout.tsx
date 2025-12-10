import { AppSidebar } from "@/components/layout/AppSidebar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 md:pl-64 transition-all duration-300 ease-in-out">
         <div className="container mx-auto max-w-5xl p-6 md:p-10 fade-in-section">
            {children}
         </div>
      </main>
    </div>
  );
}
