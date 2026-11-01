"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isProtectedPath, site } from "@/lib/site";
import { UNLOCKED_EVENT, UnlockForm } from "./UnlockForm";

/**
 * Friendly pop-up for the invitation-code gate.
 *
 * When a visitor who hasn't entered the code clicks any link to a gated page, this opens a
 * modal asking for the code instead of leaving the current page. A correct code unlocks the
 * site and continues to the page they clicked. The real protection is still on the server
 * (src/proxy.ts): direct visits and new tabs go to the full /unlock page as before.
 */
export function GateProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    // null = not checked yet: links behave normally until we know.
    const [unlocked, setUnlocked] = useState<boolean | null>(null);
    const [target, setTarget] = useState<string | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/unlock", { cache: "no-store" })
            .then((r) => r.json())
            .then((j: { unlocked?: boolean }) => {
                if (!cancelled) setUnlocked(Boolean(j.unlocked));
            })
            .catch(() => { });
        // A code entered anywhere else (the full code page, the RSVP form) unlocks the site too.
        const onUnlocked = () => setUnlocked(true);
        window.addEventListener(UNLOCKED_EVENT, onUnlocked);
        return () => {
            cancelled = true;
            window.removeEventListener(UNLOCKED_EVENT, onUnlocked);
        };
    }, []);

    // Catch clicks on links to gated pages (menu, footer, in-page links) while locked.
    useEffect(() => {
        if (unlocked !== false) return;
        const onClick = (e: MouseEvent) => {
            // Leave new-tab / modified clicks alone; the server shows the code page there.
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = (e.target as Element | null)?.closest?.("a");
            if (!a || (a.target && a.target !== "_self")) return;
            const path = a.dataset.path ?? (a.origin === window.location.origin ? a.pathname : null);
            if (!path || !isProtectedPath(path.split(/[?#]/)[0])) return;
            e.preventDefault();
            e.stopImmediatePropagation(); // stop Next.js <Link> navigating
            setTarget(a.dataset.path ?? a.pathname + a.search + a.hash);
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [unlocked]);

    // Open and close the native <dialog> (it handles focus, Esc and the backdrop).
    useEffect(() => {
        const d = dialog.current;
        if (!d) return;
        if (target && !d.open) {
            d.showModal();
            d.querySelector<HTMLInputElement>("#unlock-code")?.focus(); // ready to type
        }
        if (!target && d.open) d.close();
    }, [target]);

    function unlockedAndGo(next: string) {
        setUnlocked(true);
        setTarget(null);
        router.push(next);
        router.refresh();
    }

    return (
        <>
            {children}
            <dialog
                ref={dialog}
                className="gate-modal"
                aria-labelledby="gate-modal-title"
                onClose={() => setTarget(null)}
                onClick={(e) => {
                    if (e.target === dialog.current) dialog.current?.close(); // click on the backdrop
                }}
            >
                {target && (
                    <div className="gate-modal__card">
                        <button type="button" className="gate-modal__close" aria-label="Close" onClick={() => dialog.current?.close()}>
                            <svg viewBox="0 0 16 16" aria-hidden="true">
                                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                        </button>
                        <p className="page-head__kicker">For our guests</p>
                        <h2 id="gate-modal-title">Please enter your invitation code</h2>
                        <p className="gate-modal__text">
                            Our wedding details, travel guides and gift information are just for our guests. Enter the code from your
                            invitation email (the same code you use to RSVP) and we&rsquo;ll take you there.
                        </p>
                        <UnlockForm next={target} onSuccess={unlockedAndGo} submitLabel="Continue" />
                        <p className="gate-modal__help">
                            {site.gate.contact ? (
                                <>Can&rsquo;t find your code? {site.gate.contact}</>
                            ) : (
                                <>
                                    Can&rsquo;t find your code? Ask {site.couple.first} or {site.couple.second} and they&rsquo;ll send
                                    it to you.
                                </>
                            )}
                        </p>
                    </div>
                )}
            </dialog>
        </>
    );
}