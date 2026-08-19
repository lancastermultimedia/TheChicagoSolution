const FACTS = [
  'Chicago is home to the first-ever skyscraper, the Home Insurance Building, built in 1885.',
  "The Chicago River has been dyed green every St. Patrick's Day since 1962.",
  'Deep-dish pizza was invented here, at Pizzeria Uno, in 1943.',
  "Chicago's flag has four red six-pointed stars, each marking a specific event in the city's history.",
  "In 1900, engineers reversed the Chicago River's flow to protect the city's drinking water in Lake Michigan.",
  "The 1893 World's Fair, held in Chicago, introduced the world to the Ferris wheel.",
  'The Willis Tower (formerly the Sears Tower) was the tallest building on Earth from 1973 to 1998.',
  "Chicago's 'L' opened in 1892, making it one of the oldest rapid transit systems in the country.",
  'Order a hot dog in Chicago and skip the ketchup — it is genuinely not done.',
  'Wrigley Field opened in 1914 and is the second-oldest ballpark still active in Major League Baseball.',
  "\"The Windy City\" nickname is older than you'd think — one leading theory ties it to 19th-century politicians, not the lake breeze.",
  'The Great Chicago Fire of 1871 leveled much of downtown — and led directly to the fireproof, steel-framed buildings the city became famous for.',
  '"The Bean" in Millennium Park is officially named Cloud Gate and is built from 168 stainless steel plates welded seamlessly together.',
  'Chicago has over 200 miles of lakefront and river trails.',
  'The Field Museum, Shedd Aquarium, and Adler Planetarium all sit within walking distance of each other on the Museum Campus.',
  "Lincoln Park Zoo has been free to enter since it opened in 1868 — it's one of the last free zoos in the country.",
]

// Simple deterministic hash so the fact stays stable for a given day + player,
// then rotates the next day — no backend needed for this.
function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function getDailyFact(date: Date, playerId: string): string {
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const index = hash(`${dateKey}:${playerId}`) % FACTS.length
  return FACTS[index]
}
