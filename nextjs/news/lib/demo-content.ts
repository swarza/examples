/**
 * Demo content for "Load demo content" in /admin. Everything here is made up: the people, the
 * companies, the towns and the numbers.
 */
export const demoCategories = [
  { slug: "tech", name: "Tech", description: "Software, hardware and the people who build them." },
  { slug: "science", name: "Science", description: "Research, discoveries and the work behind them." },
  { slug: "culture", name: "Culture", description: "Books, film, music and how we spend our evenings." },
  { slug: "business", name: "Business", description: "Companies, markets and the money in between." },
  { slug: "climate", name: "Climate", description: "Weather, energy and the places that are changing." },
  { slug: "opinion", name: "Opinion", description: "Arguments from our writers and guests." },
];

export const demoAuthors = [
  {
    name: "Mara Lindqvist",
    email: "mara@dispatch.example",
    bio: "Covers software and the web. Previously a backend developer.",
  },
  {
    name: "Tomasz Wrona",
    email: "tomasz@dispatch.example",
    bio: "Science editor. Writes about physics, biology and lab life.",
  },
  { name: "Ada Okafor", email: "ada@dispatch.example", bio: "Culture writer based in Lisbon." },
  { name: "Luca Bernardi", email: "luca@dispatch.example", bio: "Business and climate reporter." },
];

type DemoPost = {
  title: string;
  dek: string;
  category: string;
  author: number;
  /** Hours before loading the demo; negative means scheduled that far ahead. */
  hoursAgo: number;
  hero?: boolean;
  featured?: boolean;
  draft?: boolean;
  body: string;
};

export const demoPosts: DemoPost[] = [
  {
    title: "The small web is getting faster, and nobody planned it",
    dek: "Personal sites that ship a few kilobytes now load before the big platforms finish their first request.",
    category: "tech",
    author: 0,
    hoursAgo: 2,
    hero: true,
    body: `When Ines Carvalho rebuilt her recipe blog last spring, she deleted more than she wrote. The tracking scripts went, then the font loader, then the carousel nobody clicked. What was left weighed 14 kilobytes.

"I measured it on a train with one bar of signal," she says. "It opened before the video ad on the news site next to it had even started loading."

## Less to download

Her site is one of thousands in a loose movement people call the small web: hand-made pages, mostly static, served from a single region or a cheap CDN. None of it is new technology. What changed is the gap between these sites and everything else.

- A typical home page on a large publisher now pulls in more than 200 requests.
- A small-web page often needs fewer than ten.
- On a slow connection, the difference is several seconds.

## What it costs

Speed used to be expensive. Now the cheapest option is often the fastest one, because there is less to run. Carvalho pays a flat monthly price and has stopped checking her traffic graph.

> "The page is the product. Everything else was decoration I was paying for."

Whether the big platforms follow is another question. For now, the fastest pages on the internet are the ones nobody is optimizing.`,
  },
  {
    title: "A lab in Tartu grew a battery from mushroom roots",
    dek: "The prototype holds a fraction of a phone battery's charge, but it rots in a garden in six weeks.",
    category: "science",
    author: 1,
    hoursAgo: 5,
    body: `Researchers at a small materials lab in Tartu have built a working battery whose casing and separator are grown from mycelium, the root network of fungi.

The cell is modest. It powers a temperature sensor for about three weeks, roughly what a coin cell does. The point is what happens next: buried in soil, the casing breaks down in about six weeks, leaving the metal parts easy to collect.

## Why it matters

Single-use sensors are multiplying in farms, warehouses and forests. Most are never collected. "We are scattering millions of tiny batteries into places we will never visit again," says lead author Kadri Mets.

The team grows each casing in a mould over nine days. Changing the feed changes the density, which lets them tune how quickly it decomposes.

## What is missing

The cells do not like humidity, which is a problem for something meant to live outdoors. The group is now testing a beeswax coating. Mets expects a field trial next year, on a vineyard that already counts its sensors in the hundreds.`,
  },
  {
    title: "The quiet return of the late-night radio show",
    dek: "Small stations are finding listeners after midnight, when the playlists run out.",
    category: "culture",
    author: 2,
    hoursAgo: 9,
    body: `At 1 a.m. on a Tuesday, Rui Tavares is reading listener letters about lost bicycles. His show on a community station in Porto has no sponsor and no playlist. It has about four thousand listeners, most of them awake for work.

Late-night radio never disappeared, but it had been automated almost everywhere. Stations filled the hours with music on a loop. What brought hosts back was cheap streaming: a station that once reached one city now reaches night-shift workers in six time zones.

## Who listens

Nurses, bakers, long-distance drivers and, Tavares says, "a surprising number of new parents." The letters are handwritten more often than you would expect.

> "People at 3 a.m. are honest. Nobody performs for an audience that's half asleep."

The format costs almost nothing to produce. That is also its weakness: when a host leaves, the show usually ends with them.`,
  },
  {
    title: "Why a bakery chain stopped using apps for orders",
    dek: "A 40-shop bakery in Kraków went back to phone and walk-in orders. Revenue went up.",
    category: "business",
    author: 3,
    hoursAgo: 14,
    body: `Two years ago, Piekarnia Nowak moved all its pre-orders into a delivery app. Last month it moved them out again.

The app took a commission of close to a third of each order. It also took the customer: people who ordered through it rarely came into a shop, and never bought the extra loaf by the till.

## What they did instead

Orders now come by phone, by a simple form on the bakery's own site, or in person. Owner Beata Nowak hired two people to answer calls. The form is one page with a list of breads and a pickup time.

- Pre-orders dropped by about 15%.
- Walk-in sales rose by more than that.
- The commission, which cost more than both new salaries together, is gone.

Nowak is careful not to call it a trend. "It works for bread," she says. "People want to see bread."`,
  },
  {
    title: "A town in the Alps is storing summer heat for January",
    dek: "Heat from solar panels goes into a buried tank of gravel and water. It comes back out in winter.",
    category: "climate",
    author: 3,
    hoursAgo: 20,
    featured: true,
    body: `Under a football pitch in the small Swiss town of Vallon lies a tank the size of a swimming pool, filled with gravel and water. In summer, solar collectors on the sports hall heat it to around 80 °C. In winter, the town draws that heat back out to warm 60 homes.

Seasonal heat storage has worked in Denmark for decades, usually at a much larger scale. What is new here is the size: small enough for one municipality to build without a utility partner.

## The numbers

The tank loses about a third of its heat between August and January. That sounds wasteful, but the heat was free, and the alternative was oil.

> "We are not trying to be efficient. We are trying to stop buying fuel," says the town engineer, Aurelia Schmid.

The project cost less than a new road. Two neighbouring towns have asked for the drawings.`,
  },
  {
    title: "Stop calling it the cloud",
    dek: "It is somebody's computer in a specific building. Knowing which one is useful.",
    category: "opinion",
    author: 0,
    hoursAgo: 26,
    body: `Every few years someone writes that the cloud is just other people's computers. It is still true, and we still forget it.

When your application runs in Frankfurt, it is in Frankfurt. Visitors in Sydney wait for the round trip. Your database is on one machine with one disk, however many layers of software sit on top. The word *cloud* makes all of this sound weather-like and vague, which is the opposite of how it behaves.

## Why it matters for small teams

Large companies can afford to treat infrastructure as abstract. They have people whose job is to know where things are. Small teams do not, and the vague word hides costs:

1. Data leaving a region costs money, and the bill arrives later.
2. Two services in different regions are slower than one.
3. "Serverless" still means a server somewhere starts up.

None of this is a reason to avoid hosting providers. It is a reason to ask them where your things live, and to prefer the ones that tell you plainly.`,
  },
  {
    title: "The spreadsheet that runs a city's snow ploughs",
    dek: "A municipal engineer built the dispatch system in a shared sheet. Twelve winters later it is still in use.",
    category: "tech",
    author: 0,
    hoursAgo: 31,
    body: `In 2014, Henrik Aas needed a way to tell eleven snow plough drivers where to go. The city's software tender had failed. He opened a spreadsheet.

Twelve winters later, the sheet has 40 tabs, a colour code everyone in the depot understands, and a macro that nobody is allowed to touch. It dispatches 38 vehicles.

## Why it survived

Two replacement projects have come and gone. Both produced systems that did more and that the drivers did not trust. The sheet does one thing: it shows who is where and which streets are waiting.

"Every row is a street a person has driven," Aas says. "You can't get that from a vendor."

The city is now paying a small firm to turn the sheet into an application, on one condition: it must look like the sheet.`,
  },
  {
    title: "Octopuses sleep in two stages, like us",
    dek: "Researchers filmed colour changes that line up with an active phase, a bit like dreaming.",
    category: "science",
    author: 1,
    hoursAgo: 38,
    body: `Octopuses in a lab tank change colour while they sleep, and the changes follow a pattern. A team of marine biologists filmed 22 animals for three months and found two distinct stages: a long, pale, still phase, and short bursts of rippling colour and twitching arms.

The active phase lasts about a minute and comes back every 30 to 40 minutes. When the researchers woke the animals during it, they responded more slowly than during quiet sleep.

## Careful with the word "dream"

The team avoids it. What they can say is that two very different nervous systems, ours and the octopus's, seem to have arrived at a similar arrangement.

> "Evolution solved the same problem twice," says co-author Noor Haddad. "What the problem is, we don't fully know."`,
  },
  {
    title: "Libraries are lending out things that aren't books",
    dek: "Drills, sewing machines, telescopes. The catalogue is growing faster than the shelves.",
    category: "culture",
    author: 2,
    hoursAgo: 44,
    body: `The central library in Ghent now lends 600 objects that are not books. The most popular is a carpet cleaner. The waiting list for the telescope is four months long.

Libraries of things are not new, but they have moved from volunteer projects into public libraries, which already have the catalogues, the counters and the trust.

## What borrowers want

Staff say the list follows the seasons: tents in spring, dehumidifiers in autumn, raclette sets in December. Tools that people use once a year are the easy case.

The harder part is repairs. The library has hired a part-time technician, the first in its history whose job has nothing to do with paper.`,
  },
  {
    title: "Four-day weeks, two years in: what one software firm learned",
    dek: "Output held steady. Meetings did not survive.",
    category: "business",
    author: 3,
    hoursAgo: 52,
    body: `When a 70-person software company in Tallinn moved to a four-day week, the founders expected to lose about 10% of their output. Two years later, they say they lost almost nothing, and they lost it in one place: meetings.

## What changed

- Standing meetings were cut to two a week.
- Every meeting needed a written agenda the day before.
- Friday became the day off for everyone, so nobody felt they were missing something.

The company tracks shipped features and support tickets closed. Both are within a few percent of where they were before the change.

## What didn't work

Customer support could not all take Fridays off. That team works a rota, and it is the one team where people still talk about the old schedule with some nostalgia. Hiring, the founders say, has never been easier.`,
  },
  {
    title: "Rivers are warming faster than the air above them",
    dek: "A study of 400 European rivers found summer water temperatures rising quickly, with trouble for fish.",
    category: "climate",
    author: 3,
    hoursAgo: 60,
    body: `A survey of 400 river stations across Europe found that summer water temperatures have risen faster over the past 30 years than air temperatures in the same regions.

Lower summer flows are the main reason. Less water warms up faster, and dams and straightened channels leave less shade and fewer cool pools.

## Why fish care

Trout and grayling struggle above about 20 °C. At several stations in the survey, that threshold is now crossed for weeks every summer.

Some fixes are cheap. Planting trees along banks lowers water temperature measurably within a decade. Several regions now pay farmers to leave a strip of land by the river unmown.`,
  },
  {
    title: "Your to-do app is not the problem",
    dek: "Switching tools feels like progress. It rarely is.",
    category: "opinion",
    author: 2,
    hoursAgo: 70,
    body: `I have used eleven to-do apps. I know because I kept a list.

Each switch felt productive: import the tasks, set up the tags, admire the empty inbox. A week later the list was long again, because the list was never the problem. The problem was that I kept saying yes.

## What helped

Writing fewer things down. A task that has been on the list for a month is not a task, it is a wish, and wishes can go somewhere else.

The app I use now is the one that came with my phone. It is fine. I have stopped reading reviews of the others.`,
  },
  {
    title: "Inside the fight over a 90-year-old font",
    dek: "A typeface drawn for railway signs is at the centre of a licensing dispute between two foundries.",
    category: "tech",
    author: 0,
    hoursAgo: 84,
    featured: true,
    body: `In 1934, a draughtsman at a national railway drew an alphabet for station signs. Nobody thought of it as a font. Ninety years later, two type foundries are arguing about who owns its digital version.

One foundry digitised the letters in the 1990s from the original drawings. The other made its own version from photographs of the signs. Both are sold under similar names.

## Why it matters

Type is hard to protect. In many countries, the shapes of letters cannot be copyrighted at all; only the font software can. The case turns on whether one foundry copied files or only looked at the same old signs.

For designers, the practical advice is dull and useful: keep your licence files, and know which version of a typeface you actually bought.`,
  },
  {
    title: "The seed vault that keeps a village's tomatoes",
    dek: "Forty families store seeds in one room, with a notebook for every variety.",
    category: "science",
    author: 1,
    hoursAgo: 96,
    body: `In a former school in the hills of northern Portugal, a room with two freezers holds seeds from 212 local vegetable varieties. Most exist nowhere else.

Families bring seeds after harvest and take some back in spring. Each variety has a notebook: who grew it, where, and how it did in a dry year.

## Small but careful

Seed banks usually mean national institutions. This one is run by a retired teacher and a spreadsheet. Plant geneticists visit anyway, because local varieties often carry traits, like drought tolerance, that commercial seeds have lost.

The notebooks may be the most valuable part. A seed without its history is just a seed.`,
  },
  {
    title: "A cinema that only shows films people ask for",
    dek: "Audiences vote on the week's programme. Old comedies usually win.",
    category: "culture",
    author: 2,
    hoursAgo: 110,
    body: `A 90-seat cinema in Bologna has handed its programme to the audience. Every Monday, people vote on a list of titles, and the top six play that week.

The owners expected new releases to dominate. Instead, the winners are mostly comedies from the 1980s and films that people half remember from childhood.

> "They want to watch something together that they already know they'll like," says co-owner Chiara Russo.

Ticket sales are up by a third. The distributors, who rent the old films cheaply, are happy too.`,
  },
  {
    title: "Why electricians are the new bottleneck for heat pumps",
    dek: "The pumps are available. The people to install them are not.",
    category: "business",
    author: 3,
    hoursAgo: 130,
    body: `Heat pump sales have grown for five years in a row. The waiting time for installation has grown faster. In some regions, homeowners now wait five months for an installer.

The shortage is specific: electricians who can upgrade old household connections. Many older homes need a new fuse board before a heat pump can be connected.

## Training takes time

Vocational schools are adding places, but an apprenticeship takes three years. Some installers now train existing plumbers in the electrical side, which regulators in several countries are still debating.

For buyers, the practical step is to have the electrical check done first. It is often the longest part of the wait.`,
  },
  {
    title: "A housing block in Ghent shares one heat pump. The first bills are in.",
    dek: "Ninety-six flats, one machine in the basement, and heating costs down by a third.",
    category: "climate",
    author: 3,
    hoursAgo: 3,
    body: `The block on Kasteelstraat was built in 1974 with a gas boiler for every flat. Last autumn the housing cooperative replaced all 96 of them with a single heat pump in the basement and a loop of pipes that runs up through the old chimney shafts.

The first full winter bills arrived this month. The average flat paid 31 percent less for heat than the winter before, at similar temperatures.

## Why one machine

Individual heat pumps would have needed 96 outdoor units on a listed facade. One large unit fits in the old coal store, and it runs more efficiently than small ones.

- Installation took eleven weeks, with residents in their homes.
- The cooperative borrowed the cost over 20 years.
- The loan payments are smaller than the savings, so rents did not rise.

"Nobody noticed anything, which was the goal," says Hilde Maes, who chairs the cooperative's board. "The radiators are the same. They are just warm for less money."

Two other cooperatives in the city have asked to see the numbers.`,
  },
  {
    title: "Stop sending voice notes to the group chat",
    dek: "A two-minute recording that could have been one sentence is not a message. It is homework.",
    category: "opinion",
    author: 2,
    hoursAgo: 7,
    body: `A voice note asks the listener to stop, find headphones and give you two minutes of their day, in order, at your speed. They cannot skim it. They cannot search it next week.

In a conversation between two people, that can be a kindness. In a group of fifteen, it is fifteen people doing homework for one.

Write the sentence. If it needs your voice, call.`,
  },
  {
    title: "Why some bees still find home in thick fog",
    dek: "Researchers tracked 300 bumblebees on grey mornings and found they switch to smell.",
    category: "science",
    author: 1,
    hoursAgo: 11,
    body: `Bumblebees navigate mostly by sight: the angle of the sun, the shape of the horizon, landmarks near the nest. On foggy mornings none of that is visible, yet most of them still come home.

A team at a field station in the Netherlands fitted 300 bees with tiny radio tags and followed them on 14 foggy days. The bees flew lower and slower than usual, and their paths bent towards the scent of the nest once they were within about 40 metres.

When the researchers masked the nest smell with a neutral odour, far fewer bees returned before the fog lifted.

"They have a backup system," says Dr Femke Visser, who led the study. "It is shorter range, but it works when the view does not."`,
  },
  {
    title: "The printer driver that nobody at the council can replace",
    dek: "One old machine prints every parking permit in the city, and only one laptop can talk to it.",
    category: "tech",
    author: 0,
    hoursAgo: 17,
    body: `In a back office of a mid-sized city council there is a printer from 2006. It prints parking permits on thick card with a hologram strip. The company that made it no longer exists, and its driver only runs on one laptop with an operating system that stopped getting updates years ago.

The laptop is not connected to the internet. Permit data arrives on a USB stick every morning.

## Why not replace it

A new printer would need new card stock, a new hologram supplier and a new permit design, which needs approval from a committee that meets four times a year. The last attempt stalled in 2019.

"It works," says the permits manager, who asked not to be named. "Every year I buy a spare laptop of the same model on an auction site, just in case."`,
  },
  {
    title: "A shoe repair chain is opening shops again",
    dek: "After closing half its branches, it now opens one a month, mostly in supermarkets.",
    category: "business",
    author: 3,
    hoursAgo: 23,
    body: `Ten years ago the chain had 80 shops and was closing one every few weeks. It now has 52 and is opening one a month, most of them as small counters inside supermarkets.

The owners say two things changed. Good shoes got more expensive, so repairing them makes sense again. And a supermarket counter costs a fraction of a high-street lease.

Heels, soles and zips make up most of the work. Key cutting, once the main business, is now under a fifth of sales.`,
  },
  {
    title: "The choir that only sings in car parks",
    dek: "Forty singers, one conductor with a torch, and the best echo in town on the top deck.",
    category: "culture",
    author: 2,
    hoursAgo: 29,
    body: `Every second Thursday at nine in the evening, a choir of about forty people meets on the top deck of a multi-storey car park in the city centre. They sing for an hour and go home.

The founder, a music teacher named Rui Costa, picked the place for the sound. Concrete floors and low ceilings give a long echo, and after nine the car park is nearly empty.

Anyone can join. There are no auditions and no concerts, although people now come up the ramp to listen. The car park operator has started leaving the lights on.`,
  },
  {
    title: "Night trains are full, and the tracks are the reason there are not more",
    dek: "Operators want to add routes. They cannot get the slots.",
    category: "climate",
    author: 3,
    hoursAgo: 34,
    featured: true,
    body: `Sleeper trains across Europe have been close to full on most nights for three years. Operators have bought new carriages and announced new routes. Many of those routes have not started.

The problem is track time. Night is when rail networks do maintenance and run freight, and a sleeper train needs a slot on every network it crosses, each booked by a different company with its own calendar.

## A slow fix

- One cross-border route took four years to schedule.
- Maintenance windows change every year, so the timetable has to be agreed again.
- Freight operators pay more per slot and are usually booked first.

Several rail agencies have agreed to plan a small number of international night slots together, starting with two routes next year. Operators say it is the first step that might actually add trains.`,
  },
  {
    title: "Your meeting could have been a document, and the document could have been shorter",
    dek: "The fix for too many meetings is not fewer meetings. It is better writing.",
    category: "opinion",
    author: 0,
    hoursAgo: 41,
    body: `Every company says it has too many meetings. Most try to fix it by cancelling some, and a month later they are back.

The meetings exist because the writing does not work. A proposal that nobody can follow on its own needs a room of people to explain it. So write something that can be understood without you there: what you want, why, what it costs, and what you need from the reader, on one page.

Then send it and wait. Most of the time the answer is yes, and nobody needed to book a room.`,
  },
  {
    title: "A telescope built from old satellite dishes found its first pulsar",
    dek: "Students linked eight dishes from a closed TV station, and the signal came through on a Tuesday.",
    category: "science",
    author: 1,
    hoursAgo: 48,
    featured: true,
    body: `When a regional TV relay station closed, its owner offered the dishes to anyone who would take them away. A physics department took eight.

Over two years, students cleaned them, fitted new receivers and connected them with fibre so they work as one instrument. Each dish is only four metres across. Together they can pick up a pulsar, a spinning dead star that sends a pulse of radio waves many times a second.

## The first detection

The signal came from a well-known pulsar, which was the point: the team knew exactly what it should look like. It arrived as a faint regular tick buried in noise, and took three hours of recording to confirm.

"Nothing new was discovered," says Dr Anna Kowalczyk, who supervises the project. "What is new is that thirty undergraduates can now do this on a weekday."

The department plans to open observing time to local schools next year.`,
  },
  {
    title: "What happened when a school turned off notifications",
    dek: "Phones stayed in pockets. The school app went quiet between 8 and 4. Teachers noticed first.",
    category: "tech",
    author: 0,
    hoursAgo: 57,
    body: `A secondary school did not ban phones. It turned off its own notifications. The school app, which had sent messages about homework, lunch menus and room changes all day, now sends one summary at four in the afternoon.

Teachers say lessons start faster. Parents say they read the summary more carefully than they read forty separate alerts. Students mostly did not comment, which the head teacher took as a good sign.

The one complaint was about room changes, so those still arrive straight away.`,
  },
  {
    title: "The ski lift that now carries hikers and hay",
    dek: "With less snow each winter, one valley runs its chairlift in summer instead.",
    category: "climate",
    author: 3,
    hoursAgo: 65,
    body: `The lift above the village of Val Serra used to run from December to April. For the last four winters it has run for fewer than sixty days, because the snow has not stayed.

Two summers ago the village started running it from June to October. It carries hikers, mountain bikes and, on Tuesday mornings, bales of hay for the farms on the upper pastures, which used to take a tractor two hours.

Summer ticket sales now cover more of the lift's costs than winter ones.`,
  },
  {
    title: "A bookshop that sells novels one chapter at a time",
    dek: "Readers pay for the first chapter. If they come back for the rest, the chapter is free.",
    category: "culture",
    author: 2,
    hoursAgo: 76,
    featured: true,
    body: `In a narrow shop near the river, the owner prints the first chapter of every new novel she stocks and binds it in plain paper. A chapter costs two euros. If you come back to buy the book, the two euros come off the price.

She says about half of chapter readers return. The other half, she says, have saved themselves the price of a book they would not have finished.

## Publishers agreed

The idea needed permission. Most publishers said yes once they saw the sales, which went up in the first year. Two refused, and their books are sold whole, as usual.`,
  },
  {
    title: "The last typewriter repair shop in town has a waiting list",
    dek: "Three months for a service, and most customers are under thirty.",
    category: "business",
    author: 3,
    hoursAgo: 90,
    body: `The shop has been in the same basement since 1962. Its owner, Jonas Berg, is the second generation to run it, and for most of the 2000s he thought he would be the last.

Now there is a three-month wait for a full service. Most of the machines come from grandparents' attics, and most of their owners are students and writers in their twenties.

Parts are the hard part. Berg buys broken machines in bulk to take them apart, and a friend with a lathe makes the springs he cannot find.`,
  },
  {
    title: "Scientists should publish the experiments that did not work",
    dek: "A failed result is still a result. Hiding it costs other labs years.",
    category: "opinion",
    author: 1,
    hoursAgo: 102,
    body: `Every lab has a drawer of experiments that did not work. The method was sound, the result was nothing, and nobody published it because journals prefer findings.

So another lab tries the same thing, gets the same nothing, and puts it in the same kind of drawer.

A short, searchable note saying "we tried this, here is how, it did not work" would save that time. A few journals now accept them. Funders could ask for them. It would cost less than the experiments being repeated.`,
  },
  {
    title: "Counting fish by the DNA they leave in the water",
    dek: "A litre of river water can now tell ecologists which species passed by.",
    category: "science",
    author: 1,
    hoursAgo: 120,
    body: `Fish shed cells, scales and mucus all the time. Traces of their DNA stay in the water for a day or two. Ecologists now filter a litre of river water, sequence what they catch and get a list of species from it.

The method used to be too expensive to do often. Costs have fallen enough that one regional water authority now samples 40 sites every month instead of netting fish twice a year.

It does not count individual fish well. It does find rare species that nets miss, including one eel population nobody knew was there.`,
  },
  {
    title: "A bus timetable app written by a retired driver",
    dek: "He drove route 14 for 31 years. His app is the one the drivers use.",
    category: "tech",
    author: 0,
    hoursAgo: 140,
    body: `After Piet Janssen retired, he taught himself to program so he could fix the thing that annoyed him most: the official timetable app, which showed scheduled times rather than where the buses actually were.

His app reads the same open data feed and shows it as a simple list: your stop, the next three buses, how late each one is. It has no account, no ads and no map.

About 9,000 people use it. Many of them are drivers.`,
  },
  {
    title: "Green roofs on bus shelters, three summers later",
    dek: "The city planted sedum on 120 shelters. The bees came. So did the maintenance bills.",
    category: "climate",
    author: 3,
    hoursAgo: 160,
    body: `Three summers ago the city put small planted roofs on 120 bus shelters. The idea was more space for insects, a little shade and some rain soaked up before it reached the drains.

Surveys found more pollinating insects near the planted shelters than near bare ones. The shelters are slightly cooler in the afternoon.

## What it costs

Each roof needs weeding and watering in dry spells, which the city had not budgeted for. It now pays a local horticultural college to look after them, and students count the insects as part of their course.`,
  },
  {
    title: "An orchestra that rehearses in public, twice a week",
    dek: "No tickets and no dress code. You can leave in the middle of a bar.",
    category: "culture",
    author: 2,
    hoursAgo: 185,
    body: `A city orchestra moved its rehearsals from a closed hall to the foyer of the central library. Anyone can sit and listen on Tuesday and Friday mornings.

It is not a concert. The conductor stops the music, repeats a passage six times and argues with the brass section. Audiences say that is the interesting part.

Attendance at the orchestra's paid concerts has gone up since, mostly among people who first heard it in the library.`,
  },
  {
    title: "A ferry company cut its off-peak fares and filled its night boats",
    dek: "Half-price crossings after 9 pm moved a fifth of passengers off the busiest sailings.",
    category: "business",
    author: 3,
    hoursAgo: 210,
    body: `The company runs four ferries between the mainland and two islands. The morning and evening sailings were full, and the late ones carried mostly freight.

Last year it halved fares after nine in the evening. Within six months, about a fifth of foot passengers had moved to the later boats. The busiest sailings now have space for cars again, which pay more.

Revenue fell slightly in the first quarter and has been higher than the year before in every quarter since.`,
  },
  {
    title: "Let the library stay quiet",
    dek: "Libraries have become community centres, cafes and workspaces. Some of them should also be libraries.",
    category: "opinion",
    author: 2,
    hoursAgo: 235,
    body: `Libraries have done well by becoming more things: places for toddlers, job clubs, repair cafes and remote workers. That is good, and it keeps them open.

But there are fewer and fewer places where you can sit for two hours without anyone talking, selling or playing music. A library used to be one of them.

Keep the cafe. Keep the toddler mornings. And keep one room, with a door, where nobody speaks.`,
  },
  {
    title: "Next week: what a year of hosting logs taught one small team",
    dek: "Every request, every error, and the three graphs they actually look at.",
    category: "tech",
    author: 0,
    hoursAgo: -0.15,
    body: `This story is scheduled. It goes live a few minutes after the demo content is loaded, when the publishing job runs.

A small team kept every request log for a year and read them. Most of what they found was boring, which was the point: a few slow pages, one bot that visited every hour, and a Friday afternoon spike they still cannot explain.`,
  },
  {
    title: "Draft: notes for a piece on community broadband",
    dek: "Not published yet.",
    category: "opinion",
    author: 1,
    hoursAgo: 1,
    draft: true,
    body: `A draft. It shows up in /admin but not on the site.

- Villages that built their own fibre
- Who maintains it after ten years?
- What happens when the founder moves away`,
  },
];

export const demoAbout = `Dispatch is a demo newsroom. It shows what an application on swarza can do: pages rendered by Next.js and cached at the edge, a database for the stories, a storage bucket for the images, and scheduled jobs that publish stories and count what people read.`;
