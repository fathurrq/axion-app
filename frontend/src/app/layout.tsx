import type { Metadata } from "next";
import "./globals.css";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import AuthSync from "@/components/AuthSync";
import { AppProvider } from "@/contexts/AppContext";

export const metadata: Metadata = {
    title: "Axion - Task Management",
    description: "Modern task management for teams",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Auth0Provider>
                    <AppProvider>
                        <AuthSync />
                        {children}
                    </AppProvider>
                </Auth0Provider>
            </body>
        </html>
    );
}
