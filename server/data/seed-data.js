const categories = [
  { name: 'Fiction', description: 'Novels, stories, and literary works', icon: '📖' },
  { name: 'Non-Fiction', description: 'Informative and factual works', icon: '📚' },
  { name: 'Science & Technology', description: 'Computers, programming, and scientific topics', icon: '🔬' },
  { name: 'History', description: 'Historical accounts and analyses', icon: '📜' },
  { name: 'Business & Economics', description: 'Finance, management, and entrepreneurship', icon: '💼' },
  { name: 'Self-Development', description: 'Personal growth, motivation, and psychology', icon: '🌱' },
  { name: 'Children & Teens', description: 'Books for young readers', icon: '🧒' },
  { name: 'Romance', description: 'Love stories and romantic fiction', icon: '💕' },
  { name: 'Thriller & Mystery', description: 'Suspense, crime, and detective stories', icon: '🔍' },
  { name: 'Fantasy & Sci-Fi', description: 'Imaginative worlds and futuristic tales', icon: '🌌' },
];

const users = [
  { name: 'Admin User', email: 'admin@bookhub.rw', password: 'Admin@123', role: 'admin', phone: '+250788100001', emailVerified: true },
  { name: 'Jean Pierre', email: 'jean@example.com', password: 'User@1234', role: 'customer', phone: '+250788100002', emailVerified: true },
  { name: 'Alice Mugisha', email: 'alice@example.com', password: 'User@1234', role: 'customer', phone: '+250788100003', emailVerified: true },
  { name: 'Bob Habimana', email: 'bob@example.com', password: 'User@1234', role: 'customer', phone: '+250788100004', emailVerified: true },
  { name: 'Claire Uwimana', email: 'claire@example.com', password: 'User@1234', role: 'customer', phone: '+250788100005', emailVerified: true },
];

const products = [
  {
    title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565',
    description: 'A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, exploring decadence, idealism, social upheaval, and excess during the Jazz Age.',
    price: 15000, format: 'both', physicalBook: { stock: 50, weight: 0.5, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '2.1 MB', previewPages: 10 }, language: 'English', pages: 180,
    publisher: 'Scribner', publishedYear: 1925, tags: ['classic', 'american', 'jazz-age'],
    featured: true, bestSeller: true, ratingsAverage: 4.4, ratingsCount: 1245, salesCount: 3400,
    aiSummary: 'Step into the glittering world of 1920s New York, where mysterious millionaire Jay Gatsby throws lavish parties in hopes of reuniting with his lost love, Daisy Buchanan. F. Scott Fitzgerald\'s masterpiece is far more than a love story—it is a searing critique of the American Dream and the empty pursuit of wealth. Through the eyes of narrator Nick Carraway, readers witness the tragedy of a man who built an empire of illusions, only to discover that the past cannot be rewritten. The prose shimmers with poetic beauty, from the famous green light at the end of Daisy\'s dock to the haunting eyes of Doctor T.J. Eckleburg watching over the Valley of Ashes. This is a novel about ambition, class, betrayal, and the devastating cost of longing for something just out of reach. A timeless classic that reveals new depths with every reading.',
  },
  {
    title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, exploring racial injustice and the loss of innocence.',
    price: 16500, discountPrice: 13500, format: 'both', physicalBook: { stock: 40, weight: 0.55, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '1.8 MB', previewPages: 15 }, language: 'English', pages: 281,
    publisher: 'Harper Perennial', publishedYear: 1960, tags: ['classic', 'american', 'racial-justice'],
    featured: true, bestSeller: true, ratingsAverage: 4.6, ratingsCount: 2100, salesCount: 5000,
    aiSummary: 'In the sleepy town of Maycomb, Alabama, young Scout Finch learns the hardest lessons about humanity during a summer that changes everything. Harper Lee\'s Pulitzer Prize-winning novel is a masterful exploration of racial injustice, moral courage, and the loss of childhood innocence, told through the eyes of a young girl trying to make sense of a deeply flawed world. Her father, Atticus Finch, stands as one of literature\'s greatest heroes—a man who defends a Black man accused of a crime he didn\'t commit, not because he expects to win, but because it is the right thing to do. Through Scout\'s innocent perspective, Lee exposes the hypocrisy and prejudice simmering beneath the surface of a small Southern town. Warm, heartbreaking, and ultimately hopeful, this is a story about empathy, integrity, and the quiet bravery of standing up for justice even when the world is against you.',
  },
  {
    title: '1984', author: 'George Orwell', isbn: '9780451524935',
    description: 'A dystopian novel set in a totalitarian society ruled by Big Brother, exploring surveillance, propaganda, and the erosion of truth.',
    price: 14000, format: 'both', physicalBook: { stock: 60, weight: 0.45, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '1.5 MB', previewPages: 12 }, language: 'English', pages: 328,
    publisher: 'Signet', publishedYear: 1949, tags: ['dystopian', 'classic', 'science-fiction'],
    featured: true, bestSeller: true, ratingsAverage: 4.5, ratingsCount: 1890, salesCount: 4200,
    aiSummary: 'In a world where Big Brother watches everything and the Thought Police punish independent thinking, Winston Smith dares to rebel. George Orwell\'s chilling masterpiece has never been more relevant than today. Set in a totalitarian superstate where history is rewritten daily, language is stripped down to eliminate dissent, and two minutes of hate keep the population in line, this novel follows one man\'s desperate journey toward truth and freedom. Winston\'s illicit affair with Julia and his tentative alliance with the mysterious O\'Brien offer glimpses of a life beyond the Party\'s control. But in Oceania, hope is the most dangerous weapon of all. Orwell\'s exploration of surveillance, propaganda, and the manipulation of truth is both a gripping narrative and a profound warning about the fragility of freedom. The concepts of Newspeak, doublethink, and Room 101 have become part of our cultural vocabulary—proof of this novel\'s enduring power.',
  },
  {
    title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884',
    description: 'A handbook of agile software craftsmanship, providing principles and practices for writing clean, maintainable code.',
    price: 45000, discountPrice: 38000, format: 'both', physicalBook: { stock: 30, weight: 0.8, shippingCost: 2500 },
    ebook: { fileUrl: null, fileSize: '5.2 MB', previewPages: 20 }, language: 'English', pages: 464,
    publisher: 'Prentice Hall', publishedYear: 2008, tags: ['programming', 'software-engineering', 'agile'],
    featured: true, ratingsAverage: 4.3, ratingsCount: 980, salesCount: 2800,
    aiSummary: 'Every software developer knows the pain of working with messy code. Robert C. Martin\'s Clean Code is the definitive guide to writing code that is readable, maintainable, and professional. This book goes far beyond syntax and patterns—it teaches a mindset of craftsmanship that separates mediocre developers from great ones. Through detailed case studies and refactoring exercises, Uncle Bob demonstrates how to transform tangled, fragile code into clean, robust systems. You will learn meaningful naming conventions, proper function design, effective error handling, and the art of writing tests that actually protect your codebase. The principles of SOLID design are explained with clarity and practical examples. Whether you are a junior developer looking to build good habits or a seasoned professional seeking to refine your craft, Clean Code offers timeless wisdom that will make you a better developer from the very first chapter.',
  },
  {
    title: 'The Pragmatic Programmer', author: 'Andrew Hunt, David Thomas', isbn: '9780135957059',
    description: 'Timeless lessons in software development covering personal responsibility, career development, and architectural techniques.',
    price: 42000, format: 'physical', physicalBook: { stock: 25, weight: 0.6, shippingCost: 2000 },
    language: 'English', pages: 352, publisher: 'Addison-Wesley', publishedYear: 2019, tags: ['programming', 'software-engineering', 'career'],
    featured: true, newArrival: true, ratingsAverage: 4.5, ratingsCount: 720, salesCount: 1900,
    aiSummary: 'Software development is not just about writing code—it is a craft that demands discipline, curiosity, and a pragmatic approach to problem-solving. Andrew Hunt and David Thomas have updated their classic for the modern era, offering wisdom that transcends any specific language or framework. From the importance of investing in your knowledge portfolio to the art of communicating clearly through code, this book covers the full spectrum of what it means to be a professional software developer. Learn how to avoid duplication, create flexible architectures, automate repetitive tasks, and write code that adapts to change rather than fighting it. Each chapter is packed with practical advice, real-world examples, and exercises that challenge you to think differently. The new edition addresses topics like concurrency, cloud computing, and ethical responsibility while retaining the timeless principles that made the original a must-read. This is the book that transforms good programmers into great software engineers.',
  },
  {
    title: "Ikinyarwanda Cy'umwana", author: 'Rwandan Authors Collective', isbn: '9789997700101',
    description: "A vibrant children's book introducing young readers to the Kinyarwanda language through colorful stories and illustrations.",
    price: 8000, format: 'physical', physicalBook: { stock: 100, weight: 0.2, shippingCost: 1500 },
    language: 'kinyarwanda', pages: 48, publisher: 'Rwanda Publishing House', publishedYear: 2022, tags: ['children', 'kinyarwanda', 'education'],
    newArrival: true, ratingsAverage: 4.8, ratingsCount: 45, salesCount: 320,
    aiSummary: 'Introduce your child to the beauty of Kinyarwanda with this delightful picture book designed specifically for young learners. Written by a collective of Rwandan authors and educators, this book combines colorful illustrations with simple, engaging stories that make language learning a joyful adventure. Each page introduces new vocabulary through familiar scenes from daily Rwandan life—from morning greetings to market days, from family meals to village celebrations. The stories are carefully crafted to build confidence in young readers, with repeating phrases and gentle progression that make Kinyarwanda accessible and fun. Parents and teachers will appreciate the educational value, while children will be captivated by the vibrant artwork and relatable characters. Whether you are raising bilingual children in Rwanda or introducing Kinyarwanda to learners abroad, this book is the perfect starting point for a lifelong journey with one of Africa\'s most beautiful languages.',
  },
  {
    title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007',
    description: 'A magical story about following your dreams and listening to your heart, following a young Andalusian shepherd on his journey to find treasure.',
    price: 16000, discountPrice: 12000, format: 'both', physicalBook: { stock: 80, weight: 0.35, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '1.2 MB', previewPages: 8 }, language: 'English', pages: 197,
    publisher: 'HarperOne', publishedYear: 1988, tags: ['inspirational', 'philosophy', 'adventure'],
    featured: true, bestSeller: true, ratingsAverage: 4.7, ratingsCount: 3200, salesCount: 8000,
    aiSummary: 'Santiago, a young Andalusian shepherd, dreams of finding treasure buried near the Egyptian pyramids. His journey takes him from the rolling hills of Spain to the bustling markets of Tangier and across the vast Sahara Desert. Along the way, he meets a mysterious king, a crystal merchant, an Englishman searching for alchemy, and a desert woman who teaches him about love. Paulo Coelho\'s enchanting novel is a profound meditation on destiny, courage, and the universal human quest for meaning. Through Santiago\'s adventures, readers discover that the greatest treasure is not gold or jewels, but the wisdom gained by following one\'s heart. The book\'s central message—that when you truly want something, the universe conspires to help you achieve it—has inspired millions around the world. This is a story that speaks directly to the soul, reminding us that the journey itself is the destination, and that the answers we seek are often closer than we imagine.',
  },
  {
    title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9780062316110',
    description: "A groundbreaking narrative of humanity's creation and evolution that explores how we conquered the world and shaped our societies.",
    price: 32000, format: 'both', physicalBook: { stock: 45, weight: 0.7, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '4.8 MB', previewPages: 18 }, language: 'English', pages: 443,
    publisher: 'Harper', publishedYear: 2015, tags: ['history', 'anthropology', 'science'],
    featured: true, bestSeller: true, ratingsAverage: 4.6, ratingsCount: 2800, salesCount: 6000,
    aiSummary: 'How did an insignificant ape from a corner of Africa come to dominate the planet, create complex societies, and stand on the brink of becoming gods? Yuval Noah Harari\'s groundbreaking book answers this question with a sweeping narrative that spans the Cognitive Revolution, the Agricultural Revolution, and the Scientific Revolution. Harari challenges everything we think we know about humanity—arguing that our ability to believe in shared fictions like money, nations, and laws is what truly sets us apart. From the first stone tools to the atomic bomb, from hunter-gatherer bands to global empires, this book traces the remarkable journey of Homo sapiens with wit, clarity, and provocative insight. Harari\'s ability to connect ancient history to contemporary issues makes this far more than a dry historical account—it is a lens through which to understand the challenges of the modern world, from political polarization to artificial intelligence. A truly mind-expanding read.',
  },
  {
    title: 'Think and Grow Rich', author: 'Napoleon Hill', isbn: '9781585424337',
    description: 'The landmark bestseller that reveals the secrets of success based on the principles of personal achievement and financial independence.',
    price: 18000, format: 'physical', physicalBook: { stock: 70, weight: 0.4, shippingCost: 2000 },
    language: 'English', pages: 233, publisher: 'TarcherPerigee', publishedYear: 1937, tags: ['self-help', 'success', 'wealth'],
    featured: true, ratingsAverage: 4.3, ratingsCount: 1500, salesCount: 4500,
    aiSummary: 'Napoleon Hill spent over twenty years studying the most successful people of his era—including Andrew Carnegie, Henry Ford, and Thomas Edison—to distill the universal principles of achievement. The result is this timeless classic that has transformed millions of lives worldwide. Hill\'s philosophy centers on the power of definiteness of purpose: the idea that burning desire, coupled with a concrete plan and unwavering faith, can overcome any obstacle. The book introduces the thirteen principles of success, from the mastermind alliance to the mysterious power of the subconscious mind. Far more than a guide to accumulating wealth, this is a manual for personal transformation. Hill teaches that our thoughts shape our reality, that failure is merely a temporary setback, and that persistence in the face of adversity is the true marker of character. Nearly a century after its publication, the wisdom in these pages remains as powerful and relevant as ever.',
  },
  {
    title: 'The Art of War', author: 'Sun Tzu', isbn: '9781590302255',
    description: 'An ancient Chinese military treatise that has become a classic of strategy and leadership, applied in business, sports, and life.',
    price: 9500, format: 'both', physicalBook: { stock: 90, weight: 0.25, shippingCost: 1500 },
    ebook: { fileUrl: null, fileSize: '0.8 MB', previewPages: 5 }, language: 'English', pages: 112,
    publisher: 'Shambhala', publishedYear: -500, tags: ['strategy', 'philosophy', 'leadership'],
    ratingsAverage: 4.2, ratingsCount: 2100, salesCount: 7000,
    aiSummary: 'Written over two thousand years ago by the legendary Chinese military strategist Sun Tzu, this compact treatise remains one of the most influential books on strategy ever written. Its teachings have transcended the battlefield to inform leadership, business, sports, and personal development. Sun Tzu\'s core philosophy is elegantly simple: the supreme art of war is to defeat your opponent without fighting. Through concise, aphoristic chapters, The Art of War covers everything from assessing your competitive position to the importance of deception, terrain, timing, and leadership. Know yourself and know your enemy, and you will not fear the outcome of a hundred battles. This edition features clear translations that preserve the poetic wisdom of the original text. Whether you are a business leader navigating competitive markets, an athlete preparing for competition, or simply someone seeking strategic clarity in daily life, the timeless principles in these pages offer profound guidance.',
  },
  {
    title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292',
    description: 'An easy and proven way to build good habits and break bad ones, through small changes that lead to remarkable results.',
    price: 22000, discountPrice: 18500, format: 'both', physicalBook: { stock: 65, weight: 0.5, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '2.5 MB', previewPages: 14 }, language: 'English', pages: 320,
    publisher: 'Avery', publishedYear: 2018, tags: ['self-help', 'habits', 'productivity'],
    featured: true, bestSeller: true, newArrival: true, ratingsAverage: 4.8, ratingsCount: 4500, salesCount: 12000,
    aiSummary: 'Forget everything you thought you knew about habit change. James Clear reveals that the key to remarkable results is not massive overhauls, but tiny, atomic-sized improvements that compound over time. If you can get just one percent better each day, you will be thirty-seven times better by the end of the year. This book is a practical, research-backed guide to building systems that make good habits inevitable and bad habits impossible. Clear introduces the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying. Each law is supported by real-world examples, from Olympic athletes to successful business leaders, and accompanied by actionable strategies you can implement immediately. Learn how to design your environment for success, use habit stacking to build new routines, and understand the crucial role of identity in sustaining change. This is not just a book about habits—it is a complete framework for transforming your life, one small step at a time.',
  },
  {
    title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546',
    description: 'A gripping thriller that follows journalist Mikael Blomkvist and hacker Lisbeth Salander as they investigate a decades-old disappearance.',
    price: 17000, format: 'both', physicalBook: { stock: 35, weight: 0.9, shippingCost: 2500 },
    ebook: { fileUrl: null, fileSize: '3.1 MB', previewPages: 16 }, language: 'English', pages: 672,
    publisher: 'Vintage', publishedYear: 2005, tags: ['thriller', 'mystery', 'crime'],
    featured: true, ratingsAverage: 4.2, ratingsCount: 1800, salesCount: 3500,
    aiSummary: 'Journalist Mikael Blomkvist is hired by wealthy industrialist Henrik Vanger to solve a mystery that has haunted his family for forty years: the disappearance of his beloved niece Harriet. As Blomkvist delves into the dark secrets of the powerful Vanger dynasty, he enlists the help of Lisbeth Salander—a brilliant but deeply troubled hacker with a photographic memory and a fierce determination to see justice done. Stieg Larsson\'s international bestseller is a masterfully crafted thriller that weaves together corporate corruption, family treachery, and buried crimes into an unputdownable narrative. Salander is one of the most unforgettable characters in modern fiction—a punk, antisocial genius who fights back against a system that failed her. Dark, atmospheric, and intricately plotted, this is a story about power, abuse, and the dangerous lengths people will go to protect their secrets. The first book in the Millennium series sets the stage for an extraordinary trilogy.',
  },
  {
    title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', isbn: '9781408855652',
    description: "The first book in the Harry Potter series, following the young wizard's discovery of his magical heritage and his first year at Hogwarts.",
    price: 19000, format: 'both', physicalBook: { stock: 100, weight: 0.6, shippingCost: 2000 },
    ebook: { fileUrl: null, fileSize: '2.8 MB', previewPages: 12 }, language: 'English', pages: 352,
    publisher: 'Bloomsbury', publishedYear: 1997, tags: ['fantasy', 'magic', 'adventure', 'children'],
    featured: true, bestSeller: true, ratingsAverage: 4.9, ratingsCount: 5500, salesCount: 15000,
    aiSummary: 'The story that started a worldwide phenomenon. Harry Potter has spent eleven miserable years living with the dreadful Dursleys, sleeping in a cupboard under the stairs and believing he is nothing special. But on his eleventh birthday, everything changes—a mysterious letter, a giant named Hagrid, and the astonishing revelation that he is a wizard. Soon Harry is swept into the magical world of Hogwarts School of Witchcraft and Wizardry, where he makes lifelong friends, learns to fly on a broomstick, and uncovers a dark secret linking him to the most powerful dark wizard of all time. J.K. Rowling\'s debut novel is a masterful blend of wonder, humor, and heart. From the enchanted ceiling of the Great Hall to the moving staircases and forbidden third-floor corridor, every page brims with imagination. But beneath the magic lies a deeper story about love, loss, courage, and the choices that define who we truly are. The perfect introduction to a world you will never want to leave.',
  },
  {
    title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593',
    description: 'Set on the desert planet Arrakis, this epic science fiction tale explores politics, religion, ecology, and human emotion.',
    price: 20000, format: 'both', physicalBook: { stock: 40, weight: 1.0, shippingCost: 2500 },
    ebook: { fileUrl: null, fileSize: '4.2 MB', previewPages: 22 }, language: 'English', pages: 688,
    publisher: 'Ace', publishedYear: 1965, tags: ['science-fiction', 'fantasy', 'epic'],
    featured: true, ratingsAverage: 4.5, ratingsCount: 2200, salesCount: 4800,
    aiSummary: 'Set on the desert planet Arrakis—the only source of the universe\'s most valuable substance, spice melange—Frank Herbert\'s epic masterpiece weaves together politics, religion, ecology, and human destiny. When the noble House Atreides is assigned to govern Arrakis, young Paul Atreides is thrust into a complex web of betrayal, assassination, and tribal warfare. The planet\'s native Fremen people harbor secrets that could change the galaxy, and Paul may be the prophesied messiah they have been waiting for. But messiahs come with a terrible price. Herbert\'s world-building is unparalleled: the giant sandworms, the stillsuits that conserve every drop of water, the Bene Gesserit sisterhood with their centuries-spanning genetic plans, and the intricate political maneuvering of the Great Houses. Beneath the thrilling adventure lies a profound meditation on leadership, ecology, and the danger of charismatic figures. Dune has influenced generations of science fiction and remains startlingly relevant to our own environmental and political challenges.',
  },
  {
    title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894',
    description: 'A methodology for developing businesses and products that aims to shorten product development cycles and rapidly discover if a proposed business model is viable.',
    price: 28000, discountPrice: 23500, format: 'physical', physicalBook: { stock: 20, weight: 0.55, shippingCost: 2000 },
    language: 'English', pages: 336, publisher: 'Crown Business', publishedYear: 2011, tags: ['business', 'startup', 'entrepreneurship'],
    featured: true, ratingsAverage: 4.1, ratingsCount: 890, salesCount: 2200,
    aiSummary: 'Most startups fail not because they build the wrong product, but because they build the wrong product in the wrong way. Eric Ries revolutionized the entrepreneurial world with The Lean Startup, a methodology that replaces traditional business planning with a cycle of build-measure-learn. Instead of spending months or years developing a product in secret, lean startups create minimum viable products and test their hypotheses against real customer feedback from day one. Learn how to use actionable metrics instead of vanity metrics, when to pivot and when to persevere, and how to implement continuous deployment to accelerate the learning cycle. Ries draws on his own experiences as a startup founder and the principles of lean manufacturing to create a framework that is as applicable to a solo founder in a garage as it is to innovation teams within Fortune 500 companies. This is the essential playbook for anyone building a business in an age of uncertainty.',
  },
];

const bookReviews = [
  [
    { rating: 5, title: 'A Timeless Classic', comment: 'Fitzgerald\'s masterpiece captures the essence of the Jazz Age like no other. The prose is beautiful, the characters deeply flawed yet sympathetic, and the themes of wealth and the American Dream are as relevant today as in 1925.' },
    { rating: 4, title: 'Beautiful but Tragic', comment: 'The writing is absolutely gorgeous—some of the best prose I\'ve ever read. The story is a slow burn that builds to a devastating conclusion. I can see why it\'s considered a classic.' },
    { rating: 5, title: 'The Great American Novel', comment: 'This book deserves every bit of praise. Gatsby\'s tragic optimism and the green light symbolism resonate deeply. Nick Carraway\'s narration provides the perfect lens for this story of love and loss.' },
  ],
  [
    { rating: 5, title: 'Essential Reading for Everyone', comment: 'Harper Lee\'s novel is a powerful exploration of racial injustice seen through the innocent eyes of Scout Finch. Atticus Finch remains one of literature\'s greatest heroes. Should be required reading in every school.' },
    { rating: 5, title: 'Changed My Perspective', comment: 'Reading this as an adult hit differently than in school. The themes of empathy, courage, and standing up for what\'s right are universal. A truly timeless story that I think about often.' },
    { rating: 4, title: 'Beautiful Story', comment: 'The child\'s perspective makes the heavy themes more accessible without diminishing their impact. The courtroom scenes are absolutely gripping. Only dropped a star because some parts felt slow.' },
  ],
  [
    { rating: 5, title: 'Prophetic and Terrifying', comment: 'Orwell predicted so much of our modern surveillance state. The concepts of Newspeak and doublethink are more relevant than ever in the age of misinformation. A must-read that will leave you thinking long after the last page.' },
    { rating: 4, title: 'Dark but Important', comment: 'Bleak and disturbing, but that\'s exactly the point. The world-building is incredible and the themes about government overreach and loss of truth are chillingly prescient. Not an easy read but an essential one.' },
    { rating: 5, title: 'Every Generation Needs This Book', comment: 'I first read this in high school and revisit it every few years. Each time I discover new layers of meaning. The scariest part is how much of what Orwell envisioned has come true. A masterpiece of dystopian fiction.' },
  ],
  [
    { rating: 5, title: 'Transformed My Coding', comment: 'This book changed how I think about writing code. The principles are practical and immediately applicable. My code is cleaner, my projects more maintainable, and my team has adopted many of Uncle Bob\'s practices.' },
    { rating: 4, title: 'Essential for Junior Developers', comment: 'Great principles that every developer should learn early in their career. Some examples feel a bit dated, and the advice can be dogmatic at times, but the core concepts about naming, functions, and testing are invaluable.' },
    { rating: 5, title: 'The Bible of Code Quality', comment: 'If you write code for a living, you owe it to yourself and your team to read this book. The chapter on error handling alone is worth the price. I reference this book constantly in code reviews.' },
  ],
  [
    { rating: 5, title: 'Timeless Wisdom', comment: 'The updated edition retains everything that made the original great while adding relevant modern topics. The advice about knowledge portfolios and communicating through code has shaped my entire career approach.' },
    { rating: 4, title: 'Should Be Required Reading', comment: 'Every developer should read this early in their career. The philosophy of being a pragmatic programmer—taking responsibility, avoiding duplication, and creating flexible code—is more important than any specific technology.' },
    { rating: 5, title: 'Still Relevant After All These Years', comment: 'I read the first edition years ago and the second edition is even better. The new content on concurrency and ethical responsibility shows the authors understand where the industry is heading.' },
  ],
  [
    { rating: 5, title: 'My Child Loves This Book', comment: 'My five-year-old asks me to read this every night. The illustrations are beautiful and the Kinyarwanda is simple enough for beginners. It has really helped us incorporate Kinyarwanda into our daily routine at home.' },
    { rating: 4, title: 'Great Educational Resource', comment: 'As a teacher in Kigali, I find this book invaluable for introducing young children to reading in Kinyarwanda. The stories reflect Rwandan culture and daily life, making them relatable. I wish there were more books like this.' },
    { rating: 5, title: 'Perfect Gift', comment: 'Bought this for my nephew living abroad. His parents wanted him to learn Kinyarwanda and this book has been fantastic. The progression of vocabulary is well thought out and the stories keep him engaged.' },
  ],
  [
    { rating: 5, title: 'Life-Changing Book', comment: 'I read this at a crossroads in my life and it gave me the courage to pursue my dreams. The message that the universe conspires to help you achieve your destiny is incredibly powerful. I\'ve bought copies for friends and family.' },
    { rating: 5, title: 'A Spiritual Journey', comment: 'Simple, profound, and beautiful. Coelho writes with such clarity and wisdom. Santiago\'s journey is a metaphor for life itself. I find something new to appreciate with every re-reading. This book has a special place in my heart.' },
    { rating: 4, title: 'Inspiring but Simple', comment: 'The message about following your dreams is beautiful, and the storytelling is enchanting. I just found the philosophy a bit too simplistic at times. Still, it\'s an uplifting read that I recommend to anyone feeling lost.' },
  ],
  [
    { rating: 5, title: 'Mind-Expanding', comment: 'Harari has a gift for making complex historical and scientific concepts accessible and engaging. This book completely changed how I think about human civilization. The chapter on the Cognitive Revolution alone is worth the read.' },
    { rating: 5, title: 'A Masterpiece', comment: 'One of the most thought-provoking books I have ever read. Harari connects dots across disciplines with remarkable clarity. The way he explains how shared beliefs shape societies is brilliant. Cannot recommend this enough.' },
    { rating: 4, title: 'Fascinating but Long', comment: 'Incredibly interesting and well-researched. Harari presents a compelling narrative of human history. My only criticism is that some sections feel drawn out. Still, it\'s a book everyone should read to understand where we come from.' },
  ],
  [
    { rating: 5, title: 'Classic for a Reason', comment: 'The principles Hill outlines are timeless. Definiteness of purpose, the mastermind alliance, and persistence are as relevant today as in the 1930s. This book has helped me reframe my approach to both career and personal goals.' },
    { rating: 4, title: 'Good but Dated in Parts', comment: 'The core philosophy is solid and the success principles are universal. Some of the language and examples feel dated, and the writing style can be repetitive. But if you can look past that, there is genuine wisdom here.' },
    { rating: 5, title: 'Foundation of Modern Self-Help', comment: 'So many modern success books borrow from Hill without giving credit. This is the original and still the best. The concept of burning desire as the starting point of all achievement has stuck with me for years.' },
  ],
  [
    { rating: 4, title: 'More Than Military Strategy', comment: 'Sun Tzu\'s principles apply to so many areas of life. I use this for business strategy and negotiation. The teachings about knowing yourself and your competition are simple yet profound. A short read that packs a punch.' },
    { rating: 5, title: 'Essential Strategy Guide', comment: 'Every leader should read this book. Its lessons about preparation, positioning, and timing are invaluable. The beauty of The Art of War is that each reading reveals new insights. I discover something new every time.' },
    { rating: 4, title: 'Brief but Brilliant', comment: 'You can read this in an afternoon but spend a lifetime implementing its lessons. The translation in this edition is clear and readable. Some advice is very context-specific to ancient warfare, but the strategic principles are universal.' },
  ],
  [
    { rating: 5, title: 'Changed My Life', comment: 'This book completely transformed my approach to personal development. The idea that small daily improvements compound into remarkable results is both liberating and motivating. I have built habits that have stuck for months since reading this.' },
    { rating: 5, title: 'The Best Book on Habits', comment: 'I have read dozens of self-help books and this is by far the most practical and well-researched. The Four Laws of Behavior Change provide a clear framework that actually works. Every chapter has actionable advice you can apply immediately.' },
    { rating: 5, title: 'Practical and Scientific', comment: 'Clear combines research with real-world examples in a way that is both credible and engaging. The systems approach—focus on environment and identity rather than willpower—is a game changer. I have recommended this to everyone I know.' },
    { rating: 4, title: 'Excellent but Repetitive', comment: 'The core ideas are brilliant and well-supported. However, the book could have been half the length. The examples are useful but after a while they feel repetitive. Still, the principles are so good that it deserves a high rating.' },
  ],
  [
    { rating: 5, title: 'Gripping from Start to Finish', comment: 'Lisbeth Salander is one of the most compelling characters I have ever encountered in fiction. The mystery is intricately plotted and kept me guessing until the very end. Dark, atmospheric, and absolutely unputdownable.' },
    { rating: 4, title: 'Great Thriller, Slow Start', comment: 'The first 100 pages are a bit slow with all the setup, but once the investigation gets going, this book is impossible to put down. Salander is a brilliant character and the mystery is satisfyingly complex. Worth the slow start.' },
    { rating: 5, title: 'Dark and Addictive', comment: 'Larsson created something truly special with this book. The blend of corporate thriller, family saga, and character study is masterful. The violence is graphic but serves the story. I immediately bought the next two books.' },
  ],
  [
    { rating: 5, title: 'Pure Magic', comment: 'This book defined my childhood and reading it as an adult brings even more joy. Rowling created a world so vivid and detailed that it feels real. The characters, the humor, the mystery—everything works perfectly. A timeless masterpiece.' },
    { rating: 5, title: 'The Start of Something Magical', comment: 'Reading the first chapter always gives me chills. The way Rowling introduces the magical world through Harry\'s eyes is masterful storytelling. Hogwarts feels like home, and these characters become friends. A perfect book in every way.' },
    { rating: 5, title: 'A Book for All Ages', comment: 'I first read this to my children and now they read it to theirs. The themes of friendship, courage, and love transcend generations. Rowling\'s imagination is unparalleled and her ability to weave a compelling mystery within a magical world is extraordinary.' },
    { rating: 4, title: 'Wonderful but Simple', comment: 'Beautifully written and endlessly imaginative, though as an adult reader I found the plot a bit straightforward. That said, it is a children\'s book and it excels at what it sets out to do. Harry Potter remains a cultural phenomenon for good reason.' },
  ],
  [
    { rating: 5, title: 'Science Fiction at Its Best', comment: 'Dune is not just a sci-fi novel—it is a masterwork of world-building, political intrigue, and philosophical depth. Herbert created a universe so rich and complex that it feels real. Paul\'s journey from boy to messiah is epic and tragic.' },
    { rating: 5, title: 'Complex and Rewarding', comment: 'This is not a light read, but it rewards every ounce of effort you put in. The ecological themes, the political machinations, the religious symbolism—all woven into an incredible story. The sandworms alone are worth the price of admission.' },
    { rating: 4, title: 'Brilliant but Dense', comment: 'Herbert\'s vision is extraordinary and the world of Arrakis is unforgettable. The book demands patience with its slow pacing and dense political detail, but the payoff is immense. A foundational work of science fiction that still feels fresh.' },
  ],
  [
    { rating: 5, title: 'Essential for Entrepreneurs', comment: 'The build-measure-learn feedback loop changed how I think about building products. Ries provides a practical framework that saves startups from wasting time and money on untested assumptions. Every founder should read this.' },
    { rating: 4, title: 'Great Concepts, Repetitive', comment: 'The core ideas are excellent and the methodology is sound. I have applied the MVP concept successfully with my team. However, the book is quite repetitive and could have been edited down significantly. Still worth reading for the framework.' },
    { rating: 4, title: 'Good but Not Revolutionary', comment: 'Some solid advice about validating assumptions and iterating quickly. Much of it feels like common sense dressed up in business jargon, but I suppose it needed to be said. The case studies are the most valuable part of the book.' },
  ],
];

const provinces = ['Kigali City', 'Eastern Province', 'Northern Province', 'Western Province', 'Southern Province'];
const cities = ['Kigali', 'Kibungo', 'Byumba', 'Kibuye', 'Butare', 'Rusizi', 'Musanze', 'Nyagatare'];
const paymentMethods = ['mtn_momo', 'airtel_money', 'cod'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatDate(daysAgo) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d; }

function getCategoryName(index) {
  const map = [
    'Fiction', 'Fiction', 'Fiction',
    'Science & Technology', 'Science & Technology',
    'Children & Teens',
    'Fiction',
    'History',
    'Self-Development',
    'Non-Fiction',
    'Self-Development',
    'Thriller & Mystery',
    'Fantasy & Sci-Fi',
    'Fantasy & Sci-Fi',
    'Business & Economics',
  ];
  return map[index] || 'Fiction';
}

module.exports = {
  categories, users, products, bookReviews,
  provinces, cities, paymentMethods,
  randomItem, randomInt, formatDate, getCategoryName,
};
