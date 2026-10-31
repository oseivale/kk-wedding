import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UnlockView } from "@/components/UnlockView";
import { safeNext } from "@/lib/site";
import { ACCESS_COOKIE, hasAccess } from "@/lib/access";

export const metadata: Metadata = { title: "Enter your invitation code" };

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNext(next);
  // Already unlocked on this device: go straight to the page they wanted.
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (await hasAccess(token)) redirect(target);
  return <UnlockView next={target} error={error === "1"} />;
}
