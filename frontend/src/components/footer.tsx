"use client"

import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border/50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <ShieldCheck className="h-6 w-6 text-primary" />
             <span className="font-bold text-lg">Psychometric Insights</span>
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>Developed by team oathkeeper.</p>
            <p>All tests and analyses are for educational and self-assessment purposes only.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
