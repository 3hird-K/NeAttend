import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/Logologin.png";
import LogoLight from "@/assets/loginlogolight.png";

// import shadcn accordion
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // <- adjust path if needed
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 w-full flex justify-center border-b border-b-foreground/10 bg-background/80 backdrop-blur">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>
                <div className="flex justify-center">
                  <Image
                    src={LogoLight}
                    alt="Logo Light"
                    width={120}
                    height={100}
                    className="block dark:hidden"
                  />
                  <Image
                    src={Logo}
                    alt="Logo Dark"
                    width={120}
                    height={100}
                    className="hidden dark:block"
                  />
                </div>
              </Link>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 flex flex-col gap-10 max-w-5xl p-5">
          <Hero />

          <section className="w-full max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is NE-Attend?</AccordionTrigger>
                <AccordionContent>
                  NE-Attend is an automated system for monitoring attendance in
                  online learning sessions and conferences. It helps streamline
                  record keeping and ensures accuracy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How does it work?</AccordionTrigger>
                <AccordionContent>
                  The system integrates with your sessions to automatically
                  track participant presence. Data is stored securely and can be
                  exported for reporting.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Who can use this application?</AccordionTrigger>
                <AccordionContent>
                  This app is designed for universities, organizations, and
                  event managers who want a reliable attendance tracking
                  solution.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Developed by{" "}
            <a
              href="https://www.ustp.edu.ph/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              USTP student
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
