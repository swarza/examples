import Image from "next/image";
import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { event } from "@/lib/program";
import hall from "./hall.jpg";

export const metadata = { title: "Venue" };

export default function Venue() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Venue · {event.city}</p>
        <h1>Hall A, The Depot</h1>
        <p className="lead">
          A tram shed from 1913, now a hall with 400 seats. The rails are still in the floor; mind them with a
          coffee in your hand.
        </p>
      </header>
      <figure className="figure">
        <div className="figure-photo">
          <Image
            src={hall}
            alt="Hall A seen from the back row: rows of people facing a stage and a large screen"
            sizes="(max-width: 1280px) 100vw, 1232px"
            placeholder="blur"
            priority
          />
          <FeatureHint id="image" corner />
        </div>
        <figcaption>Hall A from the back row. Drawn for this demo: the venue is made up too.</figcaption>
      </figure>
      <dl className="facts facts-wide">
        <div>
          <dt>Getting there</dt>
          <dd>Trams 3 and 13 to Depot, ten minutes from the main station. There is no parking.</dd>
        </div>
        <div>
          <dt>Access</dt>
          <dd>Step-free from the street, a hearing loop in Hall A and a quiet room upstairs.</dd>
        </div>
        <div>
          <dt>Food</dt>
          <dd>
            Coffee all day and lunch at 13:00, vegetarian by default. Tell us about allergies at the desk.
          </dd>
        </div>
        <div>
          <dt>Wifi</dt>
          <dd>
            Network hydrate, password on your badge. Talks are streamed, so please don&apos;t upload videos.
          </dd>
        </div>
      </dl>
      <HowItWorks id="venue" />
    </div>
  );
}
