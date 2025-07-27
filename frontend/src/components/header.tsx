"use client"

import { ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
            <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={scrollToTop}
                >
                    <ShieldCheck className="h-8 w-8 text-primary group-hover:animate-pulse" />
                    <span className="font-bold text-xl tracking-tight">Psychometric Insights</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => document.getElementById('tests')?.scrollIntoView({ behavior: 'smooth' })}>
                        Assessments
                    </Button>
                    <Button onClick={() => document.getElementById('tests')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">Get Started</Button>
                </div>
            </div>
        </header>
    );
}
