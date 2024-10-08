"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Services", href: "/services" },
        { name: "Contact", href: "/contact" }
    ];

    return (
        <nav>
            <div className="container mx-1 px-4 sm:px-6 bg-primary shadow-md">
                <div className="flex items-center h-16">
                    <div className="flex items-center">
                        <a href="/" className="text-xl font-bold text-white">
                            tgstation-server
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map(item => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-white hover:bg-primary hover:text-primary-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    {item.name}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-primary">
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Menu className="h-6 w-6" aria-hidden="true" />
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[240px] sm:w-[300px] bg-primary">
                                <nav className="flex flex-col space-y-4 mt-6">
                                    {navItems.map(item => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="text-white hover:bg-primary hover:text-primary-foreground px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}>
                                            {item.name}
                                        </a>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
