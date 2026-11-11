import type { Metadata } from "next";
import { ArchPhoto, PageHead } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Our story" };

export default function OurStoryPage() {
  return (
    <>
      <PageHead kicker="Our story" title="An unexpected beginning" />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap story-layout">
          <div className="story-layout__photo">
            <ArchPhoto
              src={site.photos.story}
              alt={`${site.couple.first} and ${site.couple.second}`}
              label="Story photo"
              className="story-photo"
              vine="left"
            />
          </div>
          <div className="prose prose--letter">
            <p>
              Our story began with an unexpected encounter and a conversation that neither of us knew would lead
              to something so beautiful.
            </p>
            <p>
              What started as a simple connection quickly turned into daily conversations, shared laughter, and a
              growing excitement to know more about each other. It didn&rsquo;t take long for us to realize that
              something special was unfolding. In just a matter of weeks, what began so unexpectedly had blossomed
              into a relationship.
            </p>
            <p>
              Looking back, we smile at how it all began and are grateful for the way God brought our paths
              together. Through love, friendship, and growth, we&rsquo;ve found in each other someone to share
              life&rsquo;s ordinary moments and extraordinary adventures with.
            </p>
            <p>And now, here we are, preparing to say &ldquo;I do&rdquo; and begin our next chapter together.</p>
            <p className="closing">Who knew one simple encounter could lead to a lifetime of love?</p>
          </div>
        </div>
      </section>
    </>
  );
}