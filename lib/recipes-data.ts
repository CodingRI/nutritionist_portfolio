export interface Recipe {
  id: number
  title: string
  description: string
  image: string
  prepTime: number
  cookTime: number
  servings: number
  calories: number
  difficulty: "Easy" | "Medium" | "Hard"
  likes: number
  tags: string[]
  ingredients: { item: string; amount: string; unit: string }[]
  instructions: string[]
  nutrients: { protein: string; fiber: string; carbs: string; fat: string }
  tips: string[]
}

export const recipes: Recipe[] = [
  {
    id: 1,
    title: "Quinoa Buddha Bowl with Tahini Dressing",
    description:
      "A nutrient-dense meal packed with protein, fiber, and healthy fats for sustained energy throughout the day.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    calories: 420,
    difficulty: "Easy",
    likes: 312,
    tags: ["High Protein", "Vegan"],
    ingredients: [
      { item: "Quinoa", amount: "1 cup", unit: "cooked" },
      { item: "Chickpeas", amount: "1 can", unit: "drained" },
      { item: "Kale", amount: "2 cups", unit: "chopped" },
      { item: "Roasted sweet potato", amount: "1 cup", unit: "cubed" },
      { item: "Avocado", amount: "1", unit: "" },
      { item: "Tahini", amount: "3 tbsp", unit: "" },
      { item: "Lemon juice", amount: "2 tbsp", unit: "" },
      { item: "Garlic", amount: "1 clove", unit: "minced" },
    ],
    instructions: [
      "Cook quinoa according to package directions and let cool.",
      "Massage kale with a bit of olive oil to soften.",
      "Arrange kale as the base of your bowl.",
      "Add cooked quinoa and arrange chickpeas, sweet potato, and avocado on top.",
      "Blend tahini, lemon juice, garlic, and water for the dressing.",
      "Drizzle dressing over the bowl and serve immediately.",
    ],
    nutrients: { protein: "18g", fiber: "12g", carbs: "52g", fat: "14g" },
    tips: [
      "Make this in advance and store in an airtight container for up to 3 days.",
      "Feel free to substitute vegetables based on seasonal availability.",
      "Add a soft-boiled egg on top for extra protein.",
    ],
  },
  {
    id: 2,
    title: "Green Smoothie Power Blend",
    description:
      "Start your day with this energizing smoothie loaded with greens, protein, and natural sweetness.",
    image:
      "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=800&q=80",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 280,
    difficulty: "Easy",
    likes: 245,
    tags: ["Quick", "Detox"],
    ingredients: [
      { item: "Spinach", amount: "2 cups", unit: "fresh" },
      { item: "Banana", amount: "1", unit: "frozen" },
      { item: "Greek yogurt", amount: "1/2 cup", unit: "" },
      { item: "Almond milk", amount: "1 cup", unit: "" },
      { item: "Chia seeds", amount: "1 tbsp", unit: "" },
      { item: "Honey", amount: "1 tbsp", unit: "" },
    ],
    instructions: [
      "Add spinach and almond milk to the blender first.",
      "Add banana, yogurt, chia seeds, and honey.",
      "Blend until smooth, about 1-2 minutes.",
      "Serve immediately over ice if desired.",
    ],
    nutrients: { protein: "12g", fiber: "5g", carbs: "38g", fat: "6g" },
    tips: [
      "Freeze spinach in advance for a thicker, colder smoothie.",
      "Add a scoop of protein powder for a post-workout boost.",
    ],
  },
  {
    id: 3,
    title: "Grilled Salmon with Roasted Vegetables",
    description:
      "Omega-3 rich salmon paired with colorful roasted vegetables for a complete, heart-healthy meal.",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    prepTime: 10,
    cookTime: 25,
    servings: 3,
    calories: 380,
    difficulty: "Medium",
    likes: 198,
    tags: ["Omega-3", "Heart Healthy"],
    ingredients: [
      { item: "Salmon fillets", amount: "3", unit: "6 oz each" },
      { item: "Broccoli florets", amount: "2 cups", unit: "" },
      { item: "Bell peppers", amount: "2", unit: "sliced" },
      { item: "Zucchini", amount: "1", unit: "sliced" },
      { item: "Olive oil", amount: "3 tbsp", unit: "" },
      { item: "Lemon", amount: "1", unit: "" },
      { item: "Fresh dill", amount: "2 tbsp", unit: "chopped" },
      { item: "Garlic powder", amount: "1 tsp", unit: "" },
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Toss vegetables with olive oil, garlic powder, salt, and pepper on a sheet pan.",
      "Roast vegetables for 15 minutes.",
      "Season salmon with salt, pepper, and dill.",
      "Place salmon on the pan with vegetables and roast for 12-15 minutes.",
      "Squeeze fresh lemon over everything before serving.",
    ],
    nutrients: { protein: "34g", fiber: "4g", carbs: "12g", fat: "22g" },
    tips: [
      "Don't overcook the salmon — it should be slightly translucent in the center.",
      "Try cedar plank grilling for a smoky flavor.",
    ],
  },
  {
    id: 4,
    title: "Mediterranean Chickpea Salad",
    description:
      "Fresh, vibrant salad with chickpeas, cucumber, tomatoes, and feta for a protein-packed lunch.",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    calories: 310,
    difficulty: "Easy",
    likes: 267,
    tags: ["High Protein", "No Cook"],
    ingredients: [
      { item: "Chickpeas", amount: "2 cans", unit: "drained" },
      { item: "Cucumber", amount: "1 large", unit: "diced" },
      { item: "Cherry tomatoes", amount: "1 cup", unit: "halved" },
      { item: "Red onion", amount: "1/2", unit: "finely diced" },
      { item: "Feta cheese", amount: "1/2 cup", unit: "crumbled" },
      { item: "Kalamata olives", amount: "1/3 cup", unit: "" },
      { item: "Extra virgin olive oil", amount: "3 tbsp", unit: "" },
      { item: "Red wine vinegar", amount: "2 tbsp", unit: "" },
    ],
    instructions: [
      "Combine chickpeas, cucumber, tomatoes, red onion, and olives in a large bowl.",
      "Whisk together olive oil, red wine vinegar, oregano, salt, and pepper.",
      "Pour dressing over salad and toss gently.",
      "Top with crumbled feta and fresh herbs.",
      "Refrigerate for 30 minutes before serving for best flavor.",
    ],
    nutrients: { protein: "14g", fiber: "9g", carbs: "36g", fat: "12g" },
    tips: [
      "This salad gets better overnight as flavors meld.",
      "Add grilled chicken for extra protein.",
    ],
  },
  {
    id: 5,
    title: "Avocado Toast with Poached Eggs",
    description:
      "Creamy avocado on sourdough topped with perfectly poached eggs and a sprinkle of everything seasoning.",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    calories: 350,
    difficulty: "Medium",
    likes: 276,
    tags: ["Breakfast", "Fiber Rich"],
    ingredients: [
      { item: "Sourdough bread", amount: "2 slices", unit: "" },
      { item: "Avocado", amount: "1 large", unit: "ripe" },
      { item: "Eggs", amount: "2", unit: "" },
      { item: "White vinegar", amount: "1 tbsp", unit: "" },
      { item: "Everything bagel seasoning", amount: "1 tsp", unit: "" },
      { item: "Red pepper flakes", amount: "pinch", unit: "" },
      { item: "Lemon juice", amount: "1 tsp", unit: "" },
    ],
    instructions: [
      "Toast sourdough until golden and crispy.",
      "Mash avocado with lemon juice, salt, and pepper.",
      "Bring a pot of water to a gentle simmer and add vinegar.",
      "Crack eggs into the simmering water and poach for 3-4 minutes.",
      "Spread mashed avocado on toast and top with poached eggs.",
      "Sprinkle with everything seasoning and red pepper flakes.",
    ],
    nutrients: { protein: "16g", fiber: "8g", carbs: "30g", fat: "20g" },
    tips: [
      "Use the freshest eggs possible for the best poach shape.",
      "Swirl the water before dropping the egg in for a neater shape.",
    ],
  },
  {
    id: 6,
    title: "Thai Coconut Lentil Soup",
    description:
      "Warming, fragrant soup with red lentils, coconut milk, and Thai spices — comfort in a bowl.",
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    calories: 290,
    difficulty: "Easy",
    likes: 341,
    tags: ["Vegan", "Comfort Food"],
    ingredients: [
      { item: "Red lentils", amount: "1 cup", unit: "rinsed" },
      { item: "Coconut milk", amount: "1 can", unit: "400ml" },
      { item: "Vegetable broth", amount: "3 cups", unit: "" },
      { item: "Red curry paste", amount: "2 tbsp", unit: "" },
      { item: "Ginger", amount: "1 inch", unit: "grated" },
      { item: "Garlic", amount: "3 cloves", unit: "minced" },
      { item: "Lime", amount: "1", unit: "" },
      { item: "Fresh cilantro", amount: "1/4 cup", unit: "" },
    ],
    instructions: [
      "Sauté garlic and ginger in a large pot until fragrant.",
      "Stir in curry paste and cook for 30 seconds.",
      "Add lentils, broth, and coconut milk. Bring to a boil.",
      "Reduce heat and simmer for 20-25 minutes until lentils are tender.",
      "Season with lime juice and salt to taste.",
      "Serve topped with cilantro and a drizzle of coconut milk.",
    ],
    nutrients: { protein: "14g", fiber: "10g", carbs: "34g", fat: "12g" },
    tips: [
      "Blend half the soup for a creamier texture.",
      "Stores well in the freezer for up to 3 months.",
    ],
  },
  {
    id: 7,
    title: "Berry Overnight Oats",
    description:
      "Prep the night before for a grab-and-go breakfast that's as delicious as it is nutritious.",
    image:
      "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&q=80",
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    calories: 320,
    difficulty: "Easy",
    likes: 289,
    tags: ["Meal Prep", "Breakfast"],
    ingredients: [
      { item: "Rolled oats", amount: "1 cup", unit: "" },
      { item: "Almond milk", amount: "1 cup", unit: "" },
      { item: "Greek yogurt", amount: "1/2 cup", unit: "" },
      { item: "Chia seeds", amount: "2 tbsp", unit: "" },
      { item: "Mixed berries", amount: "1 cup", unit: "" },
      { item: "Maple syrup", amount: "1 tbsp", unit: "" },
      { item: "Vanilla extract", amount: "1 tsp", unit: "" },
    ],
    instructions: [
      "Combine oats, milk, yogurt, chia seeds, maple syrup, and vanilla in a jar.",
      "Stir well to combine everything evenly.",
      "Top with mixed berries.",
      "Cover and refrigerate overnight (at least 6 hours).",
      "Enjoy cold or warm it up in the morning.",
    ],
    nutrients: { protein: "14g", fiber: "8g", carbs: "48g", fat: "8g" },
    tips: [
      "Use mason jars for easy portioning and transport.",
      "Try different toppings: nuts, seeds, nut butter, or granola.",
    ],
  },
  {
    id: 8,
    title: "Stuffed Bell Peppers with Turkey",
    description:
      "Colorful bell peppers stuffed with lean ground turkey, rice, and melted cheese — a family favorite.",
    image:
      "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=800&q=80",
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    calories: 360,
    difficulty: "Medium",
    likes: 234,
    tags: ["High Protein", "Family Meal"],
    ingredients: [
      { item: "Bell peppers", amount: "4 large", unit: "" },
      { item: "Ground turkey", amount: "1 lb", unit: "lean" },
      { item: "Brown rice", amount: "1 cup", unit: "cooked" },
      { item: "Diced tomatoes", amount: "1 can", unit: "" },
      { item: "Mozzarella cheese", amount: "1 cup", unit: "shredded" },
      { item: "Onion", amount: "1", unit: "diced" },
      { item: "Italian seasoning", amount: "1 tbsp", unit: "" },
    ],
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Cut tops off peppers and remove seeds.",
      "Brown turkey with onion and Italian seasoning.",
      "Mix turkey with rice and diced tomatoes.",
      "Stuff peppers and place in a baking dish with a splash of water.",
      "Bake for 25 minutes, top with cheese, and bake 10 more minutes.",
    ],
    nutrients: { protein: "28g", fiber: "5g", carbs: "32g", fat: "10g" },
    tips: [
      "Use any color peppers — red and yellow are sweetest.",
      "Substitute turkey with black beans for a vegetarian version.",
    ],
  },
  {
    id: 9,
    title: "Mango Chia Pudding",
    description:
      "Tropical, creamy chia pudding layered with fresh mango — a guilt-free dessert or breakfast treat.",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=800&q=80",
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    calories: 240,
    difficulty: "Easy",
    likes: 198,
    tags: ["Dessert", "Vegan"],
    ingredients: [
      { item: "Chia seeds", amount: "1/4 cup", unit: "" },
      { item: "Coconut milk", amount: "1 cup", unit: "" },
      { item: "Mango", amount: "1 large", unit: "diced" },
      { item: "Maple syrup", amount: "1 tbsp", unit: "" },
      { item: "Vanilla extract", amount: "1/2 tsp", unit: "" },
      { item: "Shredded coconut", amount: "2 tbsp", unit: "for topping" },
    ],
    instructions: [
      "Mix chia seeds, coconut milk, maple syrup, and vanilla in a bowl.",
      "Stir well and refrigerate for at least 4 hours or overnight.",
      "Blend half the mango into a puree.",
      "Layer pudding with mango puree and fresh mango chunks.",
      "Top with shredded coconut and serve chilled.",
    ],
    nutrients: { protein: "6g", fiber: "12g", carbs: "30g", fat: "10g" },
    tips: [
      "Works with any tropical fruit — try papaya or passion fruit.",
      "Stir the chia mixture after 30 minutes to prevent clumping.",
    ],
  },
  {
    id: 10,
    title: "Spicy Black Bean Tacos",
    description:
      "Crispy corn tortillas loaded with seasoned black beans, fresh salsa, and creamy avocado.",
    image:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    calories: 340,
    difficulty: "Easy",
    likes: 356,
    tags: ["Vegan", "Quick"],
    ingredients: [
      { item: "Black beans", amount: "2 cans", unit: "drained" },
      { item: "Corn tortillas", amount: "8", unit: "" },
      { item: "Avocado", amount: "1", unit: "sliced" },
      { item: "Tomatoes", amount: "2", unit: "diced" },
      { item: "Red onion", amount: "1/2", unit: "diced" },
      { item: "Lime", amount: "2", unit: "" },
      { item: "Cumin", amount: "1 tsp", unit: "" },
      { item: "Smoked paprika", amount: "1 tsp", unit: "" },
      { item: "Fresh cilantro", amount: "1/4 cup", unit: "" },
    ],
    instructions: [
      "Heat black beans with cumin, paprika, and a squeeze of lime.",
      "Mash half the beans for a creamy texture, keep the rest whole.",
      "Warm tortillas in a dry pan until slightly charred.",
      "Mix diced tomatoes, red onion, cilantro, and lime juice for salsa.",
      "Assemble tacos with beans, salsa, and avocado slices.",
      "Serve with extra lime wedges on the side.",
    ],
    nutrients: { protein: "16g", fiber: "14g", carbs: "48g", fat: "10g" },
    tips: [
      "Double-stack tortillas to prevent tearing.",
      "Add pickled jalapeños for extra heat.",
    ],
  },
  {
    id: 11,
    title: "Roasted Cauliflower Steaks",
    description:
      "Thick-cut cauliflower roasted to golden perfection with chimichurri sauce — a show-stopping side dish.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    prepTime: 10,
    cookTime: 30,
    servings: 2,
    calories: 180,
    difficulty: "Medium",
    likes: 167,
    tags: ["Low Calorie", "Vegan"],
    ingredients: [
      { item: "Cauliflower", amount: "1 large head", unit: "" },
      { item: "Olive oil", amount: "3 tbsp", unit: "" },
      { item: "Fresh parsley", amount: "1 cup", unit: "packed" },
      { item: "Red wine vinegar", amount: "2 tbsp", unit: "" },
      { item: "Garlic", amount: "3 cloves", unit: "" },
      { item: "Red pepper flakes", amount: "1/4 tsp", unit: "" },
    ],
    instructions: [
      "Preheat oven to 425°F (220°C).",
      "Cut cauliflower into 1-inch thick steaks from the center.",
      "Brush with olive oil and season with salt and pepper.",
      "Roast for 25-30 minutes until golden and tender.",
      "Blend parsley, garlic, vinegar, olive oil, and red pepper flakes for chimichurri.",
      "Drizzle chimichurri over cauliflower steaks and serve.",
    ],
    nutrients: { protein: "6g", fiber: "6g", carbs: "14g", fat: "12g" },
    tips: [
      "Save the outer florets for soup or stir-fry.",
      "Try adding a sprinkle of smoked paprika before roasting.",
    ],
  },
  {
    id: 12,
    title: "Protein-Packed Energy Balls",
    description:
      "No-bake energy balls with oats, peanut butter, and dark chocolate — the perfect healthy snack.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    prepTime: 15,
    cookTime: 0,
    servings: 6,
    calories: 160,
    difficulty: "Easy",
    likes: 423,
    tags: ["Snack", "No Bake"],
    ingredients: [
      { item: "Rolled oats", amount: "1 cup", unit: "" },
      { item: "Peanut butter", amount: "1/2 cup", unit: "" },
      { item: "Honey", amount: "1/4 cup", unit: "" },
      { item: "Dark chocolate chips", amount: "1/3 cup", unit: "" },
      { item: "Flaxseed", amount: "2 tbsp", unit: "ground" },
      { item: "Vanilla extract", amount: "1 tsp", unit: "" },
    ],
    instructions: [
      "Mix all ingredients in a large bowl until well combined.",
      "Refrigerate the mixture for 30 minutes to firm up.",
      "Roll into 1-inch balls using your hands.",
      "Place on a parchment-lined tray.",
      "Refrigerate for at least 1 hour before serving.",
    ],
    nutrients: { protein: "6g", fiber: "3g", carbs: "18g", fat: "8g" },
    tips: [
      "Store in the fridge for up to 2 weeks or freeze for a month.",
      "Try almond butter or cashew butter as alternatives.",
    ],
  },
]

export function getRecipeById(id: number): Recipe | undefined {
  return recipes.find((r) => r.id === id)
}

export function getDifficultyColor(difficulty: Recipe["difficulty"]) {
  switch (difficulty) {
    case "Easy":
      return "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40"
    case "Medium":
      return "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40"
    case "Hard":
      return "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40"
  }
}
