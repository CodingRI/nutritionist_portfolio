export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  likes: number;
  comments: number;
}

export const blogs: Blog[] = [
  {
    id: 1,
    title: "5 Simple Habits for Better Gut Health",
    excerpt:
      "Discover easy daily practices that can transform your digestive wellness and boost your energy levels naturally.",
    content: `Your gut is often called the "second brain" — and for good reason. It influences everything from digestion and immunity to mood and energy levels. The good news? You don't need a drastic overhaul to start supporting your gut health.

## 1. Start Your Day with Warm Lemon Water

Before reaching for coffee, try a glass of warm water with fresh lemon juice. This gentle ritual stimulates digestive enzymes and helps prepare your stomach for the day ahead. The citric acid supports the natural acid in your stomach, making it easier to break down food.

## 2. Eat More Fermented Foods

Fermented foods are nature's probiotics. Yogurt, kefir, sauerkraut, kimchi, and kombucha are all excellent sources of beneficial bacteria. Aim to include at least one serving of fermented food in your daily diet. Start small — even a tablespoon of sauerkraut with lunch makes a difference.

## 3. Feed Your Good Bacteria with Fiber

Probiotics need fuel, and that fuel is prebiotic fiber. Foods like garlic, onions, bananas, asparagus, and oats contain prebiotic compounds that nourish your gut microbiome. A diverse diet rich in plant foods is the single best thing you can do for gut diversity.

## 4. Slow Down When You Eat

Digestion begins in the mouth. Chewing thoroughly and eating mindfully gives your digestive system time to prepare for incoming food. Try putting your fork down between bites and aiming for 20-30 chews per mouthful. This simple habit can reduce bloating and improve nutrient absorption.

## 5. Manage Stress Proactively

Chronic stress directly impacts gut health through the gut-brain axis. Incorporate stress-management practices like deep breathing, short walks, meditation, or journaling into your routine. Even five minutes of intentional relaxation can make a meaningful difference.

## The Bottom Line

Gut health isn't built overnight, but small, consistent habits compound over time. Start with one or two of these practices, build momentum, and notice how your body responds. Your gut will thank you.`,
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    date: "Mar 15, 2026",
    readTime: "5 min read",
    author: "Sarah Mitchell",
    category: "Gut Health",
    likes: 124,
    comments: 18,
  },
  {
    id: 2,
    title: "The Truth About Intermittent Fasting",
    excerpt:
      "Learn what science really says about intermittent fasting and whether it's right for your lifestyle.",
    content: `Intermittent fasting has exploded in popularity, but the hype can make it hard to separate fact from fiction. Let's look at what the research actually tells us.

## What Is Intermittent Fasting?

Intermittent fasting (IF) isn't a diet — it's an eating pattern. The most common approaches include the 16:8 method (fasting for 16 hours, eating within an 8-hour window), the 5:2 method (eating normally for 5 days, restricting calories to 500-600 on 2 days), and alternate-day fasting.

## What the Science Says

Research suggests that IF can support weight management, improve insulin sensitivity, reduce inflammation, and promote cellular repair through a process called autophagy. However, most studies have been short-term, and long-term effects are still being studied.

## Who Should Be Cautious

IF isn't for everyone. Pregnant or breastfeeding women, people with a history of eating disorders, those with diabetes requiring medication management, and anyone under 18 should consult a healthcare provider before trying any form of fasting.

## Practical Tips for Beginners

Start with a 12:12 approach and gradually extend your fasting window. Stay hydrated during fasting periods. Break your fast with balanced meals rather than bingeing. Listen to your body — if you feel dizzy, weak, or unwell, eat something.

## My Professional Opinion

IF can be a useful tool for some people, but it's not magic. The quality of what you eat during your eating window matters far more than the window itself. Focus on whole foods, adequate protein, and plenty of vegetables regardless of your eating schedule.`,
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
    date: "Mar 10, 2026",
    readTime: "7 min read",
    author: "Sarah Mitchell",
    category: "Nutrition",
    likes: 89,
    comments: 23,
  },
  {
    id: 3,
    title: "Superfoods That Actually Work",
    excerpt:
      "Cut through the marketing hype and discover which superfoods are backed by real scientific evidence.",
    content: `The term "superfood" is more marketing than science, but some foods genuinely pack an extraordinary nutritional punch. Here's what's worth your attention — and your grocery budget.

## Blueberries: The Antioxidant Powerhouse

Blueberries are rich in anthocyanins, which give them their deep color and potent antioxidant properties. Regular consumption has been linked to improved memory, reduced blood pressure, and better heart health. Fresh or frozen, they're equally nutritious.

## Salmon: Omega-3 Champion

Wild-caught salmon is one of the best sources of omega-3 fatty acids, essential for brain health, reducing inflammation, and supporting heart function. Aim for two servings of fatty fish per week.

## Leafy Greens: The Foundation

Kale, spinach, and Swiss chard are loaded with vitamins A, C, K, folate, and minerals. They're also rich in nitrates, which support cardiovascular health. Variety is key — rotate between different greens throughout the week.

## Turmeric: Nature's Anti-Inflammatory

Curcumin, the active compound in turmeric, has powerful anti-inflammatory and antioxidant effects. Pair it with black pepper (which contains piperine) to increase absorption by up to 2,000%.

## What to Skip

Be skeptical of expensive "superfood" powders, exotic berry supplements, and anything that promises miraculous results. The best superfoods are whole, minimally processed, and available at your local grocery store.`,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    date: "Mar 5, 2026",
    readTime: "6 min read",
    author: "Sarah Mitchell",
    category: "Nutrition",
    likes: 156,
    comments: 31,
  },
  {
    id: 4,
    title: "The Power of Whole Grains: Transform Your Health",
    excerpt:
      "How incorporating whole grains into your diet can boost energy, improve digestion, and support long-term wellness.",
    content: `Whole grains are a fundamental component of a healthy diet. They contain all three parts of the grain kernel — the bran, germ, and endosperm — making them significantly more nutritious than refined grains.

## Why Whole Grains Matter

The fiber in whole grains feeds beneficial gut bacteria, supports healthy cholesterol levels, and helps regulate blood sugar. B vitamins support energy metabolism, while minerals like magnesium and zinc are essential for hundreds of enzymatic reactions.

## Getting Started

Replace half of your regular grains with whole grains. Try new varieties like quinoa, barley, farro, and freekeh. Read labels carefully — "multigrain" and "wheat" don't necessarily mean whole grain. Look for "whole grain" as the first ingredient.

## Best Whole Grain Choices

Oats are perfect for breakfast and rich in beta-glucans. Brown rice is versatile and nutrient-dense. Quinoa is a complete protein with all essential amino acids. Barley offers excellent fiber content and a satisfying chewy texture.

## Making the Transition

Your digestive system needs time to adapt to increased fiber. Start small, drink plenty of water, and gradually increase portions over 2-3 weeks. Pair whole grains with lean proteins, healthy fats, and plenty of vegetables for balanced meals.`,
    image:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
    date: "Feb 28, 2026",
    readTime: "5 min read",
    author: "Sarah Mitchell",
    category: "Nutrition",
    likes: 234,
    comments: 18,
  },
  {
    id: 5,
    title: "Hydration 101: Beyond Just Water",
    excerpt:
      "Explore the science of hydration and discover optimal beverage choices for your health goals.",
    content: `Proper hydration is fundamental to every bodily function, but it goes far beyond simply drinking eight glasses of water a day. Let's explore what optimal hydration really looks like.

## How Much Do You Really Need?

The "8 glasses a day" rule is a rough guideline. Your actual needs depend on body size, activity level, climate, and diet. A better indicator: check your urine color. Pale yellow means you're well-hydrated; dark yellow means you need more fluids.

## Beyond Water

While water is the gold standard, other beverages contribute to hydration too. Herbal teas, coconut water, and even coffee (in moderate amounts) count toward your daily intake. Foods like cucumber, watermelon, oranges, and lettuce are also excellent hydration sources.

## Electrolytes Matter

When you sweat heavily, you lose electrolytes — sodium, potassium, and magnesium — that water alone can't replace. For intense exercise lasting over an hour, consider adding a pinch of sea salt to your water or choosing a low-sugar electrolyte drink.

## Signs of Dehydration

Watch for headaches, fatigue, difficulty concentrating, dry skin, and dark urine. By the time you feel thirsty, you're already mildly dehydrated. Keep a water bottle visible as a reminder to sip throughout the day.

## Practical Tips

Start each morning with a full glass of water. Set reminders if you tend to forget. Flavor water naturally with cucumber, mint, or citrus slices. Eat water-rich fruits and vegetables daily.`,
    image:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
    date: "Feb 20, 2026",
    readTime: "6 min read",
    author: "Sarah Mitchell",
    category: "Wellness",
    likes: 156,
    comments: 12,
  },
  {
    id: 6,
    title: "Meal Prep Mastery: Your Weekly Guide",
    excerpt:
      "Essential techniques and tips for effective meal prep that saves time and ensures healthy eating all week.",
    content: `Meal prep is the single most effective strategy for maintaining a healthy diet while managing a busy schedule. Here's how to master it without spending your entire Sunday in the kitchen.

## The 2-Hour Sunday Prep

Dedicate just two hours on Sunday to set yourself up for the week. Cook a large batch of grains, roast a sheet pan of vegetables, prepare two protein sources, and wash and chop salad ingredients. These building blocks become countless meals.

## Smart Containers

Invest in quality glass containers in various sizes. Glass doesn't stain, doesn't leach chemicals, and goes from fridge to microwave to dishwasher. Label everything with the date to track freshness.

## The Mix-and-Match System

Instead of preparing identical meals, prep components that can be combined differently throughout the week. Monday's grain bowl becomes Wednesday's wrap filling. Thursday's roasted vegetables become Friday's soup base.

## Storage Guidelines

Most prepped meals last 3-4 days in the fridge. If you're prepping for a full week, freeze Thursday and Friday's meals and thaw them the night before. Dressings and sauces should be stored separately to keep ingredients fresh.

## Start Simple

Begin with prepping just lunches for the work week. Once that becomes routine, expand to breakfasts and snacks. Don't try to overhaul everything at once — sustainable habits are built gradually.`,
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    date: "Feb 14, 2026",
    readTime: "8 min read",
    author: "Sarah Mitchell",
    category: "Meal Prep",
    likes: 189,
    comments: 24,
  },
  {
    id: 7,
    title: "Understanding Food Labels: A Complete Guide",
    excerpt:
      "Learn to decode nutrition labels so you can make informed, confident choices at the grocery store.",
    content: `Food labels can be confusing by design. Manufacturers use clever marketing language to make products appear healthier than they are. Here's how to see through the noise.

## The Ingredient List

Ingredients are listed by weight, from most to least. If sugar (in any form — sucrose, high fructose corn syrup, dextrose, maltose) appears in the first three ingredients, the product is primarily sugar. Look for short ingredient lists with recognizable whole foods.

## Serving Size Tricks

Always check the serving size first. A bag of chips might list 150 calories per serving, but the bag contains 3 servings. That's 450 calories if you eat the whole thing — which most people do.

## "Natural" Means Nothing

The term "natural" has no regulated definition. Neither does "lightly sweetened" or "made with real fruit." Look for specific certifications like USDA Organic or Non-GMO Project Verified instead.

## Key Numbers to Watch

Focus on fiber (aim high), added sugars (aim low), sodium (under 600mg per meal), and protein. Don't obsess over total fat — the type of fat matters more than the amount.

## The Simplest Rule

The healthiest foods often don't have labels at all — fresh fruits, vegetables, whole grains from bulk bins, and unprocessed meats. When you do buy packaged foods, choose products with five or fewer recognizable ingredients.`,
    image:
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
    date: "Feb 8, 2026",
    readTime: "7 min read",
    author: "Sarah Mitchell",
    category: "Education",
    likes: 178,
    comments: 29,
  },
  {
    id: 8,
    title: "Plant-Based Eating: Getting Started",
    excerpt:
      "A practical guide to incorporating more plant-based meals into your diet without going fully vegan.",
    content: `You don't have to go fully vegan to reap the benefits of plant-based eating. Even small shifts toward more plants can significantly improve your health, reduce your environmental footprint, and expand your culinary horizons.

## Start with One Meal

Instead of overhauling everything, make one meal per day plant-based. Breakfast is often the easiest — oatmeal with fruit, smoothie bowls, or avocado toast are naturally plant-forward and satisfying.

## Protein Isn't a Problem

The "where do you get your protein?" question is largely a myth. Lentils, chickpeas, tofu, tempeh, quinoa, nuts, and seeds provide ample protein. A varied plant-based diet easily meets protein requirements for most adults.

## Build Flavor

Plant-based cooking shines when you invest in seasoning. Build a spice collection, learn to make a good sauce, and don't be afraid of healthy fats from olive oil, nuts, and avocados. Roasting and caramelizing bring out natural sweetness in vegetables.

## Common Pitfalls

Beware of processed vegan junk food — vegan cookies are still cookies. Focus on whole foods. Also, supplement B12 if you're eating mostly plant-based, as it's primarily found in animal products.

## The 80/20 Approach

Eat plant-based 80% of the time and allow flexibility for the other 20%. This sustainable approach removes pressure, prevents social awkwardness, and still delivers meaningful health benefits.`,
    image:
      "https://images.unsplash.com/photo-1540914124281-342587941389?w=800&q=80",
    date: "Jan 30, 2026",
    readTime: "6 min read",
    author: "Sarah Mitchell",
    category: "Plant-Based",
    likes: 203,
    comments: 35,
  },
  {
    id: 9,
    title: "Sleep and Nutrition: The Hidden Connection",
    excerpt:
      "How what you eat affects how you sleep — and how poor sleep sabotages your nutrition goals.",
    content: `Sleep and nutrition are deeply intertwined. Poor sleep drives cravings for high-calorie foods, disrupts hunger hormones, and undermines willpower. Meanwhile, certain foods can dramatically improve or worsen your sleep quality.

## How Sleep Affects Eating

Just one night of poor sleep increases ghrelin (the hunger hormone) and decreases leptin (the fullness hormone). This hormonal shift can increase calorie intake by 300-400 calories the next day, primarily from sugary and fatty foods.

## Foods That Help Sleep

Tart cherry juice is one of the few natural sources of melatonin. Kiwi, fatty fish, nuts (especially almonds and walnuts), and chamomile tea have all shown sleep-promoting benefits in studies.

## Foods That Hurt Sleep

Caffeine has a half-life of 5-6 hours — that afternoon coffee at 3 PM is still in your system at bedtime. Alcohol may help you fall asleep faster but disrupts sleep architecture, reducing deep and REM sleep. Heavy, spicy, or acidic foods close to bedtime can cause discomfort and reflux.

## The Timing Factor

Finish your last substantial meal at least 2-3 hours before bed. If you need a bedtime snack, choose something small that combines complex carbs with a bit of protein — a banana with almond butter, or a small bowl of oatmeal.

## Building a Sleep-Supportive Routine

Consistency is key. Eat meals at regular times, limit caffeine after noon, avoid alcohol within 3 hours of bedtime, and establish a calming evening routine. Your body thrives on rhythm.`,
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
    date: "Jan 22, 2026",
    readTime: "7 min read",
    author: "Sarah Mitchell",
    category: "Wellness",
    likes: 145,
    comments: 19,
  },
];

export function getBlogById(id: number): Blog | undefined {
  return blogs.find((b) => b.id === id);
}
