import Link from "next/link";
import { PageHead } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <PageHead title="We couldn't find that page" meta="It may have moved. Head back home to find what you need." />
      <p className="center" style={{ paddingBottom: "6rem" }}>
        <Link href="/" className="btn">
          Go to the home page
        </Link>
      </p>
    </>
  );
}
