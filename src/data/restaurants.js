export const restaurants = [
  // ── LOCAL / GATSBY / TAKEAWAY ──
  { name: "The Golden Dish", area: "Gatesville", vibe: "The OG gatsby spot — Cape Town legend", rating: 4.2, knownFor: "Full house steak masala gatsby, salomies", price: "local", moods: ["hangry", "comfort", "lazy"], lat: -33.9686, lng: 18.5335, placeId: "ChIJU3jYdaxEzB0R6nmVm2gfcPA" },
  { name: "Super Fisheries", area: "Athlone", vibe: "Home of the ORIGINAL gatsby since forever", rating: 4.5, knownFor: "Polony & atchar gatsby, fish & chips, calamari", price: "local", moods: ["hangry", "comfort", "lazy", "adventurous"], lat: -33.9615, lng: 18.5036, placeId: "ChIJH4ejvLZczB0RhgIZTVuNM10" },
  { name: "Cosy Corner", area: "Wynberg", vibe: "Huge gatsbys, legendary chips", rating: 4.2, knownFor: "BBQ steak gatsby, masala gatsby, milkshakes", price: "local", moods: ["hangry", "comfort", "lazy"], lat: -34.0113, lng: 18.4784, placeId: "ChIJudISlYFDzB0RyVexyJJOU0Q" },
  { name: "Aneesa's Takeaways", area: "Wynberg", vibe: "Parcels, gatsbys, proper Cape Town takeaway", rating: 4.3, knownFor: "Jumbo parcels, mutton curry gatsby", price: "local", moods: ["hangry", "comfort", "lazy"], lat: -34.0114, lng: 18.4779, placeId: "ChIJNZcgDwFDzB0RQdJquFMpawQ" },
  { name: "Kalky's", area: "Kalk Bay Harbour", vibe: "Cash-only harbourside fish & chips legend", rating: 4.2, knownFor: "Fried snoek, crayfish, calamari, harbour views", price: "local", moods: ["adventurous", "treat", "social"], lat: -34.1290, lng: 18.4488, placeId: "ChIJ8SkpLY1BzB0RMPl2PmlbuTg" },
  { name: "Mariner's Wharf", area: "Hout Bay", vibe: "Old-world seafood with stunning harbour views", rating: 4.3, knownFor: "Fish & chips, sole meunière, fresh seafood", price: "budget", moods: ["treat", "social", "adventurous"], lat: -34.0475, lng: 18.3484, placeId: "ChIJ9TPNpzJpzB0RqfD6vEeMoQU" },
  { name: "Lusitania Fisheries", area: "CBD", vibe: "Old-school chippy, fast and fresh", rating: 4.4, knownFor: "Hake, snoek, calamari — no frills, just good fish", price: "local", moods: ["hangry", "lazy", "comfort"], lat: -33.9192, lng: 18.4207, placeId: "ChIJ26dk2mZnzB0R-9v69Io5ZxE" },
  { name: "Faeeza's Home Kitchen", area: "Bo-Kaap", vibe: "Cape Malay cooking from a family kitchen", rating: 4.5, knownFor: "Bobotie, daltjies, koeksisters, cooking classes", price: "local", moods: ["adventurous", "comfort", "foodie"], lat: -33.9211, lng: 18.4141, placeId: "ChIJj-mFzdlnzB0RzpiePwqElwA" },
  { name: "Bo-Kaap Kombuis", area: "Bo-Kaap", vibe: "Cape Malay buffet with Table Mountain views", rating: 4.3, knownFor: "Bobotie, bredie, samoosas, curry", price: "budget", moods: ["adventurous", "comfort", "social"], lat: -33.9175, lng: 18.4129, placeId: "ChIJyc1tK2hnzB0RMRgKOyWj35Q" },
  { name: "Biesmiellah", area: "Bo-Kaap", vibe: "Traditional Cape Malay institution since 1800s", rating: 4.0, knownFor: "Denningvleis, Cape Malay curry, roti", price: "budget", moods: ["adventurous", "comfort"], lat: -33.9202, lng: 18.4140, placeId: "ChIJHzEevGhnzB0RXrMsWSryv-M" },
  { name: "Farieda's Koeksisters", area: "Lansdowne", vibe: "The best koeksisters in Cape Town, period", rating: 4.6, knownFor: "Fresh koeksisters, samoosas, pies, bollas", price: "local", moods: ["lazy", "comfort", "treat"], lat: -33.9953, lng: 18.5092, placeId: "ChIJoZnJP29DzB0RH8-EBldJIgg" },

  // ── BUDGET EATS ──
  { name: "Eastern Food Bazaar", area: "CBD", vibe: "Bustling food hall with massive portions", rating: 4.3, knownFor: "Bunny chow, shawarmas, Turkish wraps, curries", price: "budget", moods: ["hangry", "comfort", "adventurous"], lat: -33.9246, lng: 18.4224, placeId: "ChIJNa_uZWNnzB0RVv-g5Wj6Xo4" },
  { name: "NY Slice Pizza", area: "Kloof St", vibe: "Late-night NYC-style slices, no cash", rating: 4.4, knownFor: "Giant pizza slices, late-night vibes", price: "budget", moods: ["hangry", "lazy"], lat: -33.9290, lng: 18.4118, placeId: "ChIJkV-WxnFnzB0RYjE2N4mWtQs" },
  { name: "Jordan Ways of Cooking", area: "Langa", vibe: "Township soul food with live music", rating: 4.3, knownFor: "Braai meats, pap, authentic vibes", price: "budget", moods: ["comfort", "adventurous", "hangry"], lat: -33.9437, lng: 18.5280, placeId: "ChIJf2k2dv5bzB0ReBkpXzg3a7s" },
  { name: "Penny Lane", area: "Wynberg", vibe: "Hidden gem, full breakfast for R55", rating: 4.5, knownFor: "Full breakfasts under R60, no signage", price: "budget", moods: ["comfort", "lazy"], lat: -34.0039, lng: 18.4688, placeId: "ChIJL1AHn-RCzB0RCjIzWRHjE3A" },
  { name: "AfroDeli Eatery", area: "CBD", vibe: "Pan-African flavours — eat with your hands", rating: 4.5, knownFor: "Pap & stew, tilapia, ox trotters", price: "budget", moods: ["adventurous", "comfort", "hangry"], lat: -33.9229, lng: 18.4184, placeId: "ChIJ8zrom15nzB0RDnWPPOrZrMM" },
  { name: "Food Inn India", area: "Long St", vibe: "24hr Indian food court energy", rating: 4.0, knownFor: "Lamb bunny chow, amazing naan bread", price: "budget", moods: ["hangry", "lazy"], lat: -33.9245, lng: 18.4167, placeId: "ChIJrdkWnWVnzB0RuMcoY0WJfYU" },

  // ── MID RANGE ──
  { name: "Dog's Bollocks at YARD", area: "Gardens", vibe: "Massive burgers, cool courtyard vibes", rating: 4.7, knownFor: "Huge burgers, craft pizza, wings", price: "mid", moods: ["hangry", "treat", "social"], lat: -33.9323, lng: 18.4192, placeId: "ChIJZdIh1ntnzB0RAjkMOWET5X8" },
  { name: "Zuney Wagyu Burgers", area: "Kloof St", vibe: "Tiny spot, insane wagyu smash burgers", rating: 4.8, knownFor: "Wagyu smash burgers, wagyu fries", price: "mid", moods: ["hangry", "treat", "foodie"], lat: -33.9299, lng: 18.4110, placeId: "ChIJD36XE6VnzB0RtrKG4zFjTc0" },
  { name: "Prima Burgers", area: "Kloof St", vibe: "New kid, juicy smash burgers & wedges", rating: 4.9, knownFor: "Prima Classic, spicy loaded wedges", price: "mid", moods: ["hangry", "treat"], lat: -33.9328, lng: 18.4086, placeId: "ChIJefU4FQBnzB0RlZdLp1-WKAk" },
  { name: "Le Pickle", area: "De Waterkant", vibe: "Everything homemade, aesthetic spot", rating: 4.7, knownFor: "Le Pickle burger, soft serve, happy hour", price: "mid", moods: ["treat", "foodie", "social"], lat: -33.9157, lng: 18.4175, placeId: "ChIJqez0rlxnzB0RFmkA78OWfog" },
  { name: "Hudsons Burger Joint", area: "Kloof St", vibe: "Classic burgers + Rita's bar upstairs", rating: 4.6, knownFor: "Gourmet burgers, frozen margaritas", price: "mid", moods: ["hangry", "social"], lat: -33.9279, lng: 18.4125, placeId: "ChIJfWJEl3FnzB0RMKNBSt7LYZQ" },
  { name: "Three Wise Monkeys", area: "Sea Point", vibe: "Buzzing ramen & sushi bar with a view", rating: 4.4, knownFor: "Brisket ramen, bao buns, sushi platters", price: "mid", moods: ["comfort", "foodie", "social"], lat: -33.9215, lng: 18.3828, placeId: "ChIJnecEKiBnzB0RvYu7KO8_as8" },
  { name: "Downtown Ramen", area: "CBD", vibe: "Dark wood izakaya atmosphere", rating: 4.3, knownFor: "Classic ramen, gyoza, Asian beer", price: "mid", moods: ["comfort", "lazy", "foodie"], lat: -33.9294, lng: 18.4229, placeId: "ChIJZ4lGZ3xnzB0RhZkyCO1Maio" },
  { name: "Ramenhead", area: "CBD", vibe: "Small menu, massive flavour", rating: 4.4, knownFor: "Wagyu ramen, chicken gyoza", price: "mid", moods: ["comfort", "foodie", "treat"], lat: -33.9249, lng: 18.4217, placeId: "ChIJkzxK0GJnzB0R4O_aUdBgD2A" },
  { name: "Aiko Sushi", area: "Bree St", vibe: "All-you-can-eat sushi on the strip", rating: 4.5, knownFor: "AYCE sushi, Pretty Woman roll", price: "mid", moods: ["treat", "social", "foodie"], lat: -33.9169, lng: 18.4220, placeId: "ChIJn5HVdgXztAERd3pYjUcKITk" },
  { name: "JARRYDS", area: "Sea Point", vibe: "Massive boho brunch palace", rating: 4.5, knownFor: "International menu, great fries, shops inside", price: "mid", moods: ["treat", "social", "lazy"], lat: -33.9216, lng: 18.3822, placeId: "ChIJ880OJCBnzB0RLQv_25AQjzo" },
  { name: "Our Local", area: "Kloof St", vibe: "Garden-feel brunch, antique decor", rating: 4.5, knownFor: "Shakshuka, avo toast, communal tables", price: "mid", moods: ["lazy", "social", "comfort"], lat: -33.9326, lng: 18.4085, placeId: "ChIJS163JlBnzB0R5Bb6f6fSCFQ" },
  { name: "Tiger's Milk", area: "Long St", vibe: "Sports bar meets great steaks", rating: 4.6, knownFor: "Steaks, wings, BOGO beer specials", price: "mid", moods: ["social", "hangry"], lat: -33.9213, lng: 18.4202, placeId: "ChIJqzqOH2RnzB0RYb0HL78H0ao" },
  { name: "VIXI Social House", area: "Bree St", vibe: "Trendy bistro, great for groups", rating: 4.5, knownFor: "Lamb chops, mezze, pappardelle ragu", price: "mid", moods: ["social", "treat", "foodie"], lat: -33.9196, lng: 18.4201, placeId: "ChIJGZRTFJRnzB0REpkgn08FxV0" },
  { name: "Mama Africa", area: "Long St", vibe: "Live band, African cuisine, face painting", rating: 4.2, knownFor: "Crocodile, kudu, zebra, live music", price: "mid", moods: ["adventurous", "social", "treat"], lat: -33.9251, lng: 18.4161, placeId: "ChIJ-f-De2VnzB0RwYNmkT4nR1A" },
  { name: "The Conscious Kitchen", area: "Kloof St", vibe: "100% vegan with Table Mountain views", rating: 4.8, knownFor: "Buddha bowls, smoothies, sugar-free cakes", price: "mid", moods: ["healthy", "treat", "lazy"], lat: -33.9288, lng: 18.4117, placeId: "ChIJuUfa2eVnzB0RERwhTfbeOBM" },
  { name: "Wild Eatery", area: "District Six", vibe: "Fresh wraps & bowls, food truck style", rating: 4.9, knownFor: "Cauliflower bowl, superfood salad", price: "mid", moods: ["healthy", "lazy"], lat: -33.9282, lng: 18.4243, placeId: "ChIJF2rLyBBnzB0RBjFff2ctcyg" },
  { name: "Romeo & Vero", area: "De Waterkant", vibe: "Vegan butchery — comfort food without meat", rating: 4.7, knownFor: "Vegan steak, fried chicken, Mexican pizza", price: "mid", moods: ["healthy", "comfort", "adventurous"], lat: -33.9162, lng: 18.4178, placeId: "ChIJr1mXGphnzB0RP_epmOrEFhQ" },
  { name: "Florentin", area: "Loop St", vibe: "Israeli-inspired, flavour explosion", rating: 4.7, knownFor: "Shakshuka, kawarma, za'atar flatbread", price: "mid", moods: ["treat", "foodie", "social"], lat: -33.9219, lng: 18.4187, placeId: "ChIJiWyxI59nzB0ROu1JHlWcR1g" },
  { name: "Mulberry and Prince", area: "Pepper St", vibe: "Insta-famous brunch, pancake heaven", rating: 4.1, knownFor: "Chicken & waffles, blueberry pancakes", price: "mid", moods: ["treat", "lazy", "social"], lat: -33.9241, lng: 18.4152, placeId: "ChIJFZoOfG9nzB0RuJUuH-U2DvQ" },
  { name: "Mulino", area: "Bree St", vibe: "Italian-American cafe, 80s music vibes", rating: 4.8, knownFor: "Avo bagel, Japanese curry, great coffee", price: "mid", moods: ["lazy", "comfort", "treat"], lat: -33.9179, lng: 18.4214, placeId: "ChIJmyp_o3lnzB0RM6K0PIKT3TM" },
  { name: "SeaBreeze Fish & Shell", area: "Bree St", vibe: "Seafood bistro with Cape Malay fish curry", rating: 4.5, knownFor: "Oysters, grilled prawns, fish curry", price: "mid", moods: ["treat", "foodie", "social"], lat: -33.9254, lng: 18.4137, placeId: "ChIJGUK0pW9nzB0RP5dsBSk_kjQ" },

  // ── SPLURGE ──
  { name: "Kloof Street House", area: "Kloof St", vibe: "Victorian house, dreamy garden dining", rating: 4.4, knownFor: "Ostrich, fillet, cocktails, stunning decor", price: "splurge", moods: ["treat", "social", "foodie"], lat: -33.9282, lng: 18.4121, placeId: "ChIJ_Tc00XFnzB0R1TIppn46x4I" },
  { name: "Villa 47", area: "Bree St", vibe: "Upscale Italian, cozy and warm", rating: 4.5, knownFor: "Pasta, octopus carpaccio, wine list", price: "splurge", moods: ["treat", "foodie", "social"], lat: -33.9193, lng: 18.4204, placeId: "ChIJK6TSwmZnzB0RdPrSt6J-_fg" },
  { name: "Bo-Vine Wine & Grill", area: "Hout St", vibe: "Funky steakhouse, free bone broth on arrival", rating: 4.7, knownFor: "Wagyu tomahawk, ceviche, wine pairings", price: "splurge", moods: ["treat", "foodie", "hangry"], lat: -33.9203, lng: 18.4183, placeId: "ChIJia99_XdnzB0RhWZnbERGLUI" },
  { name: "Bodega Ramen", area: "CBD", vibe: "Speakeasy ramen bar, candlelit vibes", rating: 4.6, knownFor: "Short rib ramen, cocktails, small plates", price: "splurge", moods: ["foodie", "treat", "comfort"], lat: -33.9226, lng: 18.4171, placeId: "ChIJkW3B22JdzB0RL4lFwlvVYsk" },
  { name: "Yatai Ramenbar", area: "Bree St", vibe: "Premium Japanese with wine pairings", rating: 4.4, knownFor: "Wagyu ramen, prawn dumplings, set menus", price: "splurge", moods: ["foodie", "treat", "social"], lat: -33.9208, lng: 18.4189, placeId: "ChIJmeQdFABnzB0Rx4rKZF66xxM" },
  { name: "Utopia", area: "De Waterkant", vibe: "15th floor, 360° Cape Town views", rating: 4.4, knownFor: "Sunset cocktails, steaks, seafood", price: "splurge", moods: ["treat", "social", "foodie"], lat: -33.9174, lng: 18.4179, placeId: "ChIJn5Y5l2dnzB0Rh5Bm-QZC0fo" },
  { name: "Willoughby & Co", area: "V&A Waterfront", vibe: "Legendary sushi & seafood institution", rating: 4.5, knownFor: "Fresh sushi, cajun calamari, expect a queue", price: "splurge", moods: ["treat", "foodie", "social"], lat: -33.9027, lng: 18.4216, placeId: "ChIJh_UCllBnzB0RUabPNDvtxmE" },

  // ── BALLER ──
  { name: "Belly of the Beast", area: "CBD", vibe: "No menu — trust the chef completely", rating: 4.8, knownFor: "Surprise multi-course, wine pairings", price: "baller", moods: ["foodie", "treat", "adventurous"], lat: -33.9294, lng: 18.4226, placeId: "ChIJVWO4oURnzB0RNaPCKWYBfZE" },
  { name: "Reverie Social Table", area: "Observatory", vibe: "Communal dinner party with strangers", rating: 4.9, knownFor: "5-course dinner, wine, meet new people", price: "baller", moods: ["adventurous", "treat", "foodie", "social"], lat: -33.9313, lng: 18.4658, placeId: "ChIJewRWnAddzB0RRRs-qXskh-Y" },
  { name: "Nikkei by PAN Collection", area: "Bree St", vibe: "Japanese-Peruvian fusion, unforgettable", rating: 4.6, knownFor: "9-course tasting, sushi, cocktail pairings", price: "baller", moods: ["foodie", "treat", "social"], lat: -33.9208, lng: 18.4189, placeId: "ChIJrf6RSQBnzB0RnzFHz-szrKc" },
];

export const MOODS = [
  { emoji: "\u{1F624}", label: "Hangry", value: "hangry", color: "#FF4D4D" },
  { emoji: "\u{1F634}", label: "Lazy", value: "lazy", color: "#A78BFA" },
  { emoji: "\u{1F973}", label: "Treat Me", value: "treat", color: "#F59E0B" },
  { emoji: "\u{1F957}", label: "Healthy", value: "healthy", color: "#34D399" },
  { emoji: "\u{1F9F8}", label: "Comfort", value: "comfort", color: "#FB923C" },
  { emoji: "\u{1F9D1}\u200D\u{1F373}", label: "Foodie", value: "foodie", color: "#EC4899" },
  { emoji: "\u{1F30D}", label: "Adventure", value: "adventurous", color: "#06B6D4" },
  { emoji: "\u{1F389}", label: "Social", value: "social", color: "#8B5CF6" },
];

export const BUDGETS = [
  { emoji: "\u{1F3E0}", label: "Local Takeaway", value: "local", desc: "Gatsby, fish & chips, koeksisters" },
  { emoji: "\u{1FA99}", label: "Under R100", value: "budget", desc: "Solid meals, no stress" },
  { emoji: "\u{1F4B5}", label: "R100\u2013250", value: "mid", desc: "Proper sit-down vibes" },
  { emoji: "\u{1F4B8}", label: "R250\u2013500", value: "splurge", desc: "Treat yourself" },
  { emoji: "\u{1F48E}", label: "R500+", value: "baller", desc: "Full experience, no limits" },
];
