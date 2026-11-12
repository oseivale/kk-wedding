import { PageLoader } from "@/components/PageLoader";

/** Shown by Next.js while a page is loading (only appears if it takes more than a moment). */
export default function Loading() {
  return <PageLoader delayed />;
}
