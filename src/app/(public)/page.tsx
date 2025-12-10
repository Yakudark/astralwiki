import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Book, Gavel, Map, Search, ShieldAlert, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-sidebar via-background to-primary/5 p-10 md:p-20 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary/50 bg-primary/10 backdrop-blur-md animate-pulse">
            <Sparkles className="mr-2 h-3 w-3" />
            Astral Roleplay V2
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Explorez l'Univers <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Astral</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La documentation officielle pour maîtriser votre RP. <br className="hidden md:block"/>
            Règles, Lore, Guides et plus encore.
          </p>

          <div className="w-full max-w-md relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <Button className="relative w-full h-14 text-lg bg-background/80 hover:bg-background border border-primary/30 text-muted-foreground justify-start px-6 backdrop-blur-xl transition-all">
                <Search className="mr-3 h-5 w-5 text-primary" />
                Rechercher un article, une règle...
                <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
             </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          Les Piliers d'Astral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Règlements */}
          <Link href="/docs/reglement-general" className="group">
            <Card className="h-full bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_var(--primary)] hover:-translate-y-1 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Gavel className="h-24 w-24 -mr-4 -mt-4 rotate-12" />
               </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Gavel className="h-5 w-5" /> Règlements
                </CardTitle>
                <CardDescription>Les fondements du serveur.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary/50" /> Règlement Général</li>
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary/50" /> Règles Illégales</li>
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary/50" /> Zones Safe</li>
                 </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2: Documents RP */}
          <Link href="/docs/code-penal" className="group">
            <Card className="h-full bg-card/50 backdrop-blur-sm border-white/5 hover:border-blue-400/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)] hover:-translate-y-1 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Book className="h-24 w-24 -mr-4 -mt-4 rotate-12" />
               </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <Book className="h-5 w-5" /> Documents RP
                </CardTitle>
                <CardDescription>Lois et procédures officielles.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-400/50" /> Code Pénal</li>
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-400/50" /> Procédures LSPD</li>
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-400/50" /> Tarifs des amendes</li>
                 </ul>
              </CardContent>
            </Card>
          </Link>

           {/* Card 3: Guides */}
           <Link href="/docs/debuter" className="group">
            <Card className="h-full bg-card/50 backdrop-blur-sm border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-1 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="h-24 w-24 -mr-4 -mt-4 rotate-12" />
               </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 group-hover:text-emerald-500 transition-colors">
                  <Map className="h-5 w-5" /> Guides & Aide
                </CardTitle>
                <CardDescription>Pour bien commencer votre aventure.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" /> Débuter sur Astral</li>
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" /> Système de Drogue</li>
                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" /> Touches & Commandes</li>
                 </ul>
              </CardContent>
            </Card>
          </Link>

        </div>
      </section>

      {/* Footer CTA */}
      <section className="rounded-2xl bg-secondary/30 border border-white/5 p-8 text-center">
         <h3 className="text-xl font-semibold mb-2">Vous ne trouvez pas ce que vous cherchez ?</h3>
         <p className="text-muted-foreground mb-4">Rejoignez le Discord pour poser vos questions au staff.</p>
         <Button variant="default" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
            Rejoindre le Discord
            <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </section>
    </div>
  );
}
