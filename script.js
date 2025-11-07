/* ---------- Theme handling ---------- */
(function(){
  const html = document.documentElement;
  // initial theme
  const theme = localStorage.getItem('theme') || 'dark';
  if(theme === 'light') html.classList.add('light');

  // attach listeners when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.themeToggle').forEach(btn => {
      btn.addEventListener('click', () => {
        html.classList.toggle('light');
        const isLight = html.classList.contains('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
      });
    });

    // Load user data on dashboard
    loadUserData();
    
    // Load profile settings on settings page
    loadProfileSettings();
    
    // Load profile picture
    loadProfilePicture();
    
    // Apply saved language
    applyLanguage();
    
    // Attach event listeners to apply buttons
    document.querySelectorAll('.apply-btn').forEach(btn => {
      if(btn.dataset.jobTitle && btn.dataset.company) {
        btn.addEventListener('click', function() {
          openApplicationModal(this.dataset.jobTitle, this.dataset.company);
        });
      }
    });

    // small helper: wire any "back to dashboard" or "close" anchors visually handled by anchors, nothing to do.
  });
})();

/* ---------- Language Translations ---------- */
function applyLanguage() {
  const profile = JSON.parse(localStorage.getItem('ai_profile') || '{}');
  const selectedLang = profile.lang || 'English';
  const lang = translations[selectedLang] || translations['English'];
  
  // Translate all elements with data-translate attribute
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if(lang[key]) {
      el.textContent = lang[key];
    }
  });
  
  // Translate placeholders
  document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
    const key = el.getAttribute('data-translate-placeholder');
    if(lang[key]) {
      el.placeholder = lang[key];
    }
  });
  
  // Translate dashboard elements
  const elements = {
    'quickActions': document.querySelector('.quick-actions h2'),
    'careerRecommendations': document.querySelector('.recommendations h2'),
    'searchJobs': document.getElementById('jobSearchInput'),
    'appliedJobs': document.querySelector('.notification-header'),
    'noApplications': document.querySelector('.notification-empty')
  };
  
  // Update text content
  if(elements.quickActions) elements.quickActions.textContent = lang.quickActions;
  if(elements.careerRecommendations) elements.careerRecommendations.textContent = lang.careerRecommendations;
  if(elements.searchJobs) elements.searchJobs.placeholder = `🔍 ${lang.searchJobs}`;
  if(elements.appliedJobs) elements.appliedJobs.textContent = lang.appliedJobs;
  if(elements.noApplications) elements.noApplications.textContent = lang.noApplications;
  
  // Translate quick action cards
  const cards = document.querySelectorAll('.quick-actions .card');
  if(cards.length >= 3) {
    const card1Title = cards[0].querySelector('h3');
    const card1Desc = cards[0].querySelector('.muted');
    if(card1Title) card1Title.textContent = lang.aiCareerMentor;
    if(card1Desc) card1Desc.textContent = lang.chatWithAI;
    
    const card2Title = cards[1].querySelector('h3');
    const card2Desc = cards[1].querySelector('.muted');
    if(card2Title) card2Title.textContent = lang.uploadResume;
    if(card2Desc) card2Desc.textContent = lang.getAIPowered;
    
    const card3Title = cards[2].querySelector('h3');
    const card3Desc = cards[2].querySelector('.muted');
    if(card3Title) card3Title.textContent = lang.generateRecommendations;
    if(card3Desc) card3Desc.textContent = lang.getAICareer;
  }
  
  // Translate dropdown menu
  const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
  if(dropdownItems.length >= 3) {
    const lightModeText = dropdownItems[0].querySelector('span:last-child') || dropdownItems[0].childNodes[2];
    const profileText = dropdownItems[1].querySelector('span:last-child') || dropdownItems[1].childNodes[2];
    const signOutText = dropdownItems[2].querySelector('span:last-child') || dropdownItems[2].childNodes[2];
    
    if(lightModeText && lightModeText.nodeType === 3) lightModeText.textContent = ' ' + lang.lightMode;
    if(profileText && profileText.nodeType === 3) profileText.textContent = ' ' + lang.profile;
    if(signOutText && signOutText.nodeType === 3) signOutText.textContent = ' ' + lang.signOut;
  }
  
  // Translate apply buttons
  const applyButtons = document.querySelectorAll('.apply-btn');
  applyButtons.forEach(btn => {
    // Re-attach event listeners to apply buttons in job recommendations
    if(btn.dataset.jobTitle && btn.dataset.company && !btn.hasAttribute('data-listener-attached')) {
      btn.addEventListener('click', function() {
        openApplicationModal(this.dataset.jobTitle, this.dataset.company);
      });
      btn.setAttribute('data-listener-attached', 'true');
    }
    
    // Translate button text
    if(btn.textContent.includes('Apply') || btn.dataset.translate === 'applyNow') {
      btn.textContent = lang.applyNow;
    }
  });
}

window.applyLanguage = applyLanguage;

/* ---------- Navigation helpers (used by sign-in/sign-up forms to simulate auth) ---------- */
function toDashboard(event){
  // Prevent form submission
  event.preventDefault();
  
  // Get form data and save user info
  const form = event.target;
  let emailInput, nameInput, passwordInput;
  
  // Handle signup form
  if(form.id === 'signupForm'){
    emailInput = document.getElementById('signupEmail');
    nameInput = document.getElementById('signupName');
    passwordInput = document.getElementById('signupPassword');
  }
  // Handle signin form
  else if(form.id === 'signinForm'){
    emailInput = document.getElementById('signinEmail');
    passwordInput = document.getElementById('signinPassword');
  }
  // Fallback to querySelector
  else{
    emailInput = form.querySelector('input[type="email"]');
    nameInput = form.querySelector('input[type="text"]');
    passwordInput = form.querySelector('input[type="password"]');
  }

  if(emailInput && passwordInput){
    const email = emailInput.value;
    const password = passwordInput.value;
    const name = nameInput ? nameInput.value : 'User';

    // For signup - create new user account
    if(form.id === 'signupForm') {
      // Check if account already exists
      const allAccounts = JSON.parse(localStorage.getItem('all_accounts') || '{}');
      if(allAccounts[email]) {
        alert('❌ An account with this email already exists. Please sign in instead.');
        return false; // Don't navigate
      }
      
      const userData = { 
        name, 
        email, 
        password,
        createdAt: new Date().toISOString()
      };
      
      // Save to all_accounts registry
      allAccounts[email] = userData;
      localStorage.setItem('all_accounts', JSON.stringify(allAccounts));
      
      // Set as current user
      localStorage.setItem('user_account', JSON.stringify(userData));
      localStorage.setItem('user_data', JSON.stringify({ name, email }));
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('current_user_email', email);
      
      // Initialize empty profile for this new account
      const userProfileKey = `ai_profile_${email}`;
      localStorage.setItem(userProfileKey, JSON.stringify({}));
      
      // Show success notification
      alert(`✅ Account created successfully!\nWelcome, ${name}!`);
      
      // Navigate to dashboard
      window.location.href = 'dashboard.html';
    }
    // For signin - verify credentials
    else if(form.id === 'signinForm') {
      const allAccounts = JSON.parse(localStorage.getItem('all_accounts') || '{}');
      const storedUser = allAccounts[email];
      
      // Check if account exists
      if(!storedUser) {
        alert('❌ No account found with this email. Please sign up first.');
        return false; // Don't navigate
      }
      
      // Verify email and password match
      if(storedUser.password === password) {
        // Set as current user
        localStorage.setItem('user_account', JSON.stringify(storedUser));
        localStorage.setItem('user_data', JSON.stringify({ name: storedUser.name, email: storedUser.email }));
        localStorage.setItem('is_logged_in', 'true');
        localStorage.setItem('current_user_email', email);
        
        alert(`✅ Welcome back, ${storedUser.name}!`);
        
        // Navigate to dashboard ONLY if credentials are correct
        window.location.href = 'dashboard.html';
      } else {
        // Wrong credentials - show error and DON'T navigate
        alert('❌ Invalid email or password. Please try again.');
        
        // Clear password field for security
        passwordInput.value = '';
        passwordInput.focus();
        
        return false; // Prevent navigation
      }
    }
  }
  
  return false; // Prevent default form submission
}

function signOut() {
  // Clear only session data, NOT user-specific data
  localStorage.removeItem('is_logged_in');
  localStorage.removeItem('user_data');
  localStorage.removeItem('user_account');
  localStorage.removeItem('current_user_email');
  
  // NOTE: We keep all_accounts and user-specific data (ai_profile_email, etc.)
  // so users can sign back in and see their data
  
  // Show confirmation
  alert('✅ You have been signed out successfully!');
  
  // Redirect to signin page
  window.location.href = 'signin.html';
}

/* ---------- Chat simulation ---------- */
function sendMessage(){
  const input = document.getElementById('chatInput');
  const log = document.getElementById('chatLog');
  if(!input || !log) return;
  const text = input.value.trim();
  if(!text) return;

  // add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = text;
  log.appendChild(userMsg);
  input.value = '';
  log.scrollTop = log.scrollHeight;

  // simulate AI typing...
  const aiMsg = document.createElement('div');
  aiMsg.className = 'message ai';
  aiMsg.textContent = '⏳ Thinking...';
  log.appendChild(aiMsg);
  log.scrollTop = log.scrollHeight;

  // Generate friendly AI response
  setTimeout(() => {
    const response = generateFriendlyResponse(text);
    aiMsg.textContent = response;
    log.scrollTop = log.scrollHeight;
  }, 800 + Math.random() * 800);
}

function generateFriendlyResponse(userText) {
  const lowerText = userText.toLowerCase();
  
  // Greetings - must come first for best UX
  if(lowerText.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/)) {
    const greetings = [
      `Hey there! 👋 I'm your AI assistant. I can help you with career advice, answer general questions, or just chat! What's on your mind?`,
      `Hello! 😊 Great to see you! I'm here to help with anything - career guidance, tech questions, life advice, or just a friendly conversation. What can I do for you?`,
      `Hi! 🌟 I'm your personal AI assistant. Ask me about careers, technology, science, or anything else you're curious about!`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Career guidance responses
  if(lowerText.includes('career') || lowerText.includes('job')){
    return `Great question about careers! 🎯 I can help you explore different career paths based on your interests and skills. What field are you interested in? (Tech, Business, Healthcare, Creative, etc.) Or would you like me to analyze your resume?`;
  }
  
  // Technology & Programming
  if(lowerText.includes('programming') || lowerText.includes('coding') || lowerText.includes('developer')){
    return `💻 Programming is an amazing skill! Popular languages include Python (great for beginners & data science), JavaScript (web development), Java (enterprise apps), and C++ (systems programming). What would you like to know more about?`;
  }
  
  if(lowerText.includes('python')){
    return `🐍 Python is fantastic! It's beginner-friendly, versatile, and used in web development (Django/Flask), data science (pandas/numpy), AI/ML (TensorFlow/PyTorch), automation, and more. Want to know how to get started?`;
  }
  
  if(lowerText.includes('javascript') || lowerText.includes('js')){
    return `⚡ JavaScript powers the web! You can use it for frontend (React, Vue, Angular), backend (Node.js), mobile apps (React Native), and even desktop apps (Electron). It's everywhere! Need learning resources?`;
  }
  
  // Artificial Intelligence & Machine Learning
  if(lowerText.includes('artificial intelligence') || lowerText.includes(' ai ') || lowerText.match(/\bai\b/)){
    return `🤖 AI is transforming the world! It includes Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, and Robotics. Popular applications: chatbots, recommendation systems, autonomous vehicles, and medical diagnosis. What aspect interests you?`;
  }
  
  if(lowerText.includes('machine learning') || lowerText.includes('ml')){
    return `🧠 Machine Learning enables computers to learn from data! Main types: Supervised Learning (labeled data), Unsupervised Learning (patterns in unlabeled data), and Reinforcement Learning (learning through rewards). Tools: scikit-learn, TensorFlow, PyTorch. Want to dive deeper?`;
  }
  
  // Deep Learning & Neural Networks
  if(lowerText.includes('deep learning') || lowerText.includes('neural network')){
    return `🕸️ Deep Learning uses artificial neural networks with multiple layers! It powers image recognition, NLP, speech recognition, and autonomous vehicles. Key architectures: CNNs (images), RNNs (sequences), Transformers (language). Frameworks: TensorFlow, PyTorch, Keras. What would you like to know?`;
  }
  
  // CNN Models - General
  if(lowerText.includes('cnn') || lowerText.includes('convolutional neural')){
    return `🖼️ CNNs (Convolutional Neural Networks) are specialized for image processing! They use convolutional layers to detect features like edges, textures, and patterns.

**Famous CNN Architectures:**
📊 AlexNet (2012) - Started the deep learning revolution
🏗️ VGG (2014) - Simple, deep architecture
🔄 ResNet (2015) - Skip connections, very deep (152 layers)
🌟 Inception/GoogLeNet (2014) - Multi-scale processing
⚡ EfficientNet (2019) - Optimized efficiency

Want details about a specific model?`;
  }
  
  // AlexNet
  if(lowerText.includes('alexnet')){
    return `🎯 **AlexNet (2012)** - The breakthrough model!

**Architecture:**
• 8 layers (5 conv + 3 fully connected)
• 60 million parameters
• Used ReLU activation (first to do so)
• Dropout for regularization
• Data augmentation

**Key Innovations:**
✅ ReLU instead of tanh/sigmoid (faster training)
✅ GPU training (2 GTX 580 GPUs)
✅ Local Response Normalization
✅ Overlapping pooling

**Impact:** Won ImageNet 2012 with 15.3% error (vs 26% previous best), sparked the deep learning revolution!

**Applications:** Image classification, object detection foundation`;
  }
  
  // VGG
  if(lowerText.includes('vgg')){
    return `🏛️ **VGG (Visual Geometry Group, 2014)** - Simple but powerful!

**Architecture:**
• VGG-16: 16 layers (13 conv + 3 FC)
• VGG-19: 19 layers (16 conv + 3 FC)
• 138 million parameters
• Only 3×3 conv filters throughout
• 2×2 max pooling

**Key Features:**
✅ Uniform architecture (all 3×3 filters)
✅ Depth matters (deeper = better)
✅ Small filters stack for large receptive field
✅ Simple and easy to implement

**Strengths:** Excellent feature extractor, transfer learning
**Weakness:** Large memory/compute requirements

**Applications:** Transfer learning, feature extraction, style transfer`;
  }
  
  // ResNet
  if(lowerText.includes('resnet')){
    return `🔗 **ResNet (Residual Network, 2015)** - Revolutionary skip connections!

**Architecture:**
• ResNet-50, ResNet-101, ResNet-152 (up to 152 layers!)
• Residual blocks with skip connections
• ~25 million parameters (ResNet-50)

**Key Innovation - Skip Connections:**
F(x) + x instead of just F(x)
✅ Solves vanishing gradient problem
✅ Enables training very deep networks (100+ layers)
✅ Identity mapping preserves information

**Variants:**
• ResNeXt - Grouped convolutions
• Wide ResNet - Wider layers
• ResNet-V2 - Improved architecture

**Impact:** Won ImageNet 2015 (3.57% error), enabled ultra-deep networks

**Applications:** Image classification, object detection (Faster R-CNN), segmentation`;
  }
  
  // Inception / GoogLeNet
  if(lowerText.includes('inception') || lowerText.includes('googlenet')){
    return `🌟 **Inception/GoogLeNet (2014)** - Multi-scale feature extraction!

**Architecture:**
• 22 layers deep
• Inception modules with parallel convolutions
• Only 5 million parameters (12× less than AlexNet!)
• No fully connected layers

**Inception Module - Parallel Processing:**
1×1, 3×3, 5×5 convolutions + max pooling in parallel
✅ Captures features at multiple scales
✅ 1×1 convs reduce dimensions (computational efficiency)
✅ Concatenates all outputs

**Versions:**
• Inception v1 (GoogLeNet) - Original
• Inception v2/v3 - Batch normalization, factorized convolutions
• Inception v4 - Combined with ResNet (Inception-ResNet)
• Xception - Extreme Inception with depthwise separable convs

**Impact:** Won ImageNet 2014, proved efficiency matters

**Applications:** Real-time applications, mobile deployment`;
  }
  
  // EfficientNet
  if(lowerText.includes('efficientnet')){
    return `⚡ **EfficientNet (2019)** - Compound scaling for optimal efficiency!

**Architecture:**
• EfficientNet-B0 to B7 (scaled versions)
• Mobile Inverted Bottleneck Conv (MBConv)
• Squeeze-and-Excitation blocks
• B0: 5.3M params, B7: 66M params

**Key Innovation - Compound Scaling:**
Balances 3 dimensions simultaneously:
📏 **Depth** - Number of layers
📐 **Width** - Channel size
🖼️ **Resolution** - Input image size

Formula: depth × width² × resolution² ≈ 2^φ

**Why It's Special:**
✅ State-of-the-art accuracy with fewer parameters
✅ 8.4× smaller than best existing CNNs
✅ 6.1× faster inference
✅ Mobile-friendly (EfficientNet-Lite)

**Performance:**
EfficientNet-B7: 84.3% ImageNet top-1 accuracy

**Applications:** Mobile vision, edge devices, production systems, AutoML`;
  }
  
  // CNN comparison
  if(lowerText.includes('compare cnn') || lowerText.includes('cnn comparison')){
    return `📊 **CNN Model Comparison:**

**AlexNet (2012):** 60M params, 15.3% error
├ First deep CNN success
└ High memory usage

**VGG-16 (2014):** 138M params, 7.3% error
├ Simple uniform design
└ Very large memory footprint

**GoogLeNet (2014):** 5M params, 6.7% error
├ Efficient multi-scale processing
└ Complex architecture

**ResNet-50 (2015):** 25M params, 3.6% error
├ Revolutionary skip connections
└ Easy to train very deep

**EfficientNet-B7 (2019):** 66M params, 15.7% error
├ Best accuracy/efficiency trade-off
└ Compound scaling

**Choose based on:**
• Accuracy needed
• Hardware constraints
• Inference speed requirements
• Training time available`;
  }
  
  // Transfer Learning with CNNs
  if(lowerText.includes('transfer learning')){
    return `🎓 **Transfer Learning with CNNs** - Use pre-trained models!

**How it works:**
1. Take a CNN pre-trained on ImageNet (1.2M images, 1000 classes)
2. Remove the final classification layer
3. Add your custom layers for your task
4. Fine-tune or freeze early layers

**Popular Pre-trained Models:**
• VGG16/VGG19 - Great feature extractor
• ResNet50/ResNet101 - Balanced performance
• InceptionV3 - Efficient
• EfficientNet - State-of-the-art
• MobileNet - Mobile devices

**Strategies:**
🔒 **Feature Extraction:** Freeze all layers, train only new layers
🔧 **Fine-tuning:** Freeze early layers, train later layers
🔥 **Full Training:** Train entire network (if lots of data)

**Benefits:**
✅ Faster training
✅ Less data needed
✅ Better performance
✅ Proven architectures

**Use cases:** Medical imaging, custom object detection, facial recognition`;
  }
  
  // Science topics
  if(lowerText.includes('space') || lowerText.includes('universe') || lowerText.includes('astronomy')){
    return `🌌 Space is incredible! The universe is about 13.8 billion years old, contains billions of galaxies, and is still expanding. Recent discoveries include exoplanets, black holes, and gravitational waves. What cosmic topic fascinates you?`;
  }
  
  if(lowerText.includes('physics')){
    return `⚛️ Physics explains how the universe works! From quantum mechanics (tiny particles) to general relativity (massive objects), it covers motion, energy, forces, and the fabric of spacetime. Specific area you're curious about?`;
  }
  
  // Health & Fitness
  if(lowerText.includes('health') || lowerText.includes('fitness') || lowerText.includes('exercise')){
    return `💪 Health is wealth! Regular exercise (150 min/week cardio + strength training), balanced nutrition, good sleep (7-9 hours), hydration, and stress management are key. What health topic would you like to explore?`;
  }
  
  // Education & Learning
  if(lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('education')){
    return `📚 Learning is a lifelong journey! Effective strategies: active recall, spaced repetition, practice testing, and teaching others. Online resources: Coursera, edX, Khan Academy, YouTube. What would you like to learn about?`;
  }
  
  // Business & Entrepreneurship
  if(lowerText.includes('business') || lowerText.includes('startup') || lowerText.includes('entrepreneur')){
    return `💼 Building a business is exciting! Key elements: identify a problem, create a solution, understand your market, build an MVP, get feedback, iterate. Remember: persistence beats perfection! What business aspect interests you?`;
  }
  
  // Money & Finance
  if(lowerText.includes('money') || lowerText.includes('finance') || lowerText.includes('invest')){
    return `💰 Financial literacy is crucial! Key concepts: budgeting (track income/expenses), emergency fund (3-6 months expenses), reduce debt, invest for long-term (index funds, diversification), and continuous learning. What financial topic can I help with?`;
  }
  
  // Skills & Resume
  if(lowerText.includes('skill') || lowerText.includes('resume') || lowerText.includes('cv')){
    return `🚀 Skills are your superpower! In-demand skills: communication, problem-solving, critical thinking, digital literacy, adaptability. For resumes: highlight achievements with metrics, use action verbs, tailor to each job. Want to upload your resume for analysis?`;
  }
  
  // Interview prep
  if(lowerText.includes('interview')){
    return `🎯 Interview success tips: Research the company thoroughly, practice STAR method (Situation, Task, Action, Result), prepare questions to ask them, dress appropriately, arrive early, maintain eye contact, and follow up with a thank-you email. Need specific interview advice?`;
  }
  
  // Mathematics
  if(lowerText.includes('math') || lowerText.includes('mathematics') || lowerText.includes('calculus')){
    return `🔢 Math is the language of the universe! From basic algebra to advanced calculus, it's used in science, engineering, finance, and AI. What mathematical concept can I help explain?`;
  }
  
  // History
  if(lowerText.includes('history')){
    return `📜 History teaches us about human civilization, cultures, wars, innovations, and social movements. Understanding the past helps us navigate the present and future. Any specific historical period or event you're interested in?`;
  }
  
  // Art & Creativity
  if(lowerText.includes('art') || lowerText.includes('creative') || lowerText.includes('design')){
    return `🎨 Creativity is essential! Whether it's visual art, music, writing, or design, creative expression enriches life. Digital tools make creativity more accessible than ever. What creative pursuit interests you?`;
  }
  
  // Music
  if(lowerText.includes('music')){
    return `🎵 Music is universal! From classical to hip-hop, it affects our emotions, memory, and well-being. Fun fact: listening to music releases dopamine (the "feel-good" chemical). What genre do you enjoy?`;
  }
  
  // Books & Reading
  if(lowerText.includes('book') || lowerText.includes('read')){
    return `📖 Reading expands your mind! It improves vocabulary, focus, empathy, and knowledge. Fiction builds creativity, non-fiction provides practical insights. What topics do you enjoy reading about?`;
  }
  
  // Weather & Climate
  if(lowerText.includes('weather') || lowerText.includes('climate')){
    return `🌍 Climate is the long-term pattern, weather is day-to-day. Climate change is real and accelerating - rising temperatures, extreme weather, sea level rise. Solutions include renewable energy, conservation, and sustainable practices. What would you like to know?`;
  }
  
  // Food & Cooking
  if(lowerText.includes('food') || lowerText.includes('cook') || lowerText.includes('recipe')){
    return `🍳 Cooking is both art and science! Balanced nutrition includes proteins, carbs, healthy fats, vitamins, and minerals. Cooking at home is healthier and more economical. What cuisine or cooking technique interests you?`;
  }
  
  // Travel
  if(lowerText.includes('travel')){
    return `✈️ Travel broadens perspectives! It exposes you to new cultures, foods, languages, and experiences. Tips: plan ahead, budget wisely, stay flexible, respect local customs, and document your journey. Dream destination?`;
  }
  
  // Sports
  if(lowerText.includes('sport') || lowerText.includes('football') || lowerText.includes('cricket') || lowerText.includes('basketball')){
    return `⚽ Sports teach teamwork, discipline, and perseverance! Whether playing or watching, they bring people together. Physical activity boosts mental and physical health. What sport do you follow or play?`;
  }
  
  // Motivation & Mental Health
  if(lowerText.includes('motivation') || lowerText.includes('inspire') || lowerText.includes('mental health') || lowerText.includes('stress')){
    return `🌟 Your mental health matters! Strategies: practice mindfulness, exercise regularly, connect with others, pursue hobbies, seek help when needed, celebrate small wins. Remember: it's okay not to be okay. What's on your mind?`;
  }
  
  // Time Management
  if(lowerText.includes('time management') || lowerText.includes('productivity')){
    return `⏰ Time management is key! Techniques: Pomodoro (25-min focus blocks), Eisenhower Matrix (urgent/important), time blocking, eliminate distractions, prioritize tasks, and take breaks. What productivity challenge can I help with?`;
  }
  
  // "What is" questions
  if(lowerText.startsWith('what is ') || lowerText.startsWith('what are ')){
    return `That's a great question! "${userText}" - I'd love to help explain that! Could you be more specific about what aspect you'd like to know? Or I can give you a general overview if you'd like!`;
  }
  
  // "How to" questions
  if(lowerText.startsWith('how to ') || lowerText.startsWith('how do ') || lowerText.startsWith('how can ')){
    return `Excellent question about "${userText}"! 🎯 Let me help you with that. Could you provide a bit more context? For example, are you looking for career advice, technical steps, or general guidance?`;
  }
  
  // Thank you responses
  if(lowerText.includes('thank') || lowerText.includes('thanks')){
    return `You're very welcome! 😊 I'm always here to help with any questions - whether it's about careers, technology, science, or just life in general. Feel free to ask me anything!`;
  }
  
  // Help & Confusion
  if(lowerText.includes('help') || lowerText.includes('confused') || lowerText.includes('lost') || lowerText.includes('don\'t understand')){
    return `Hey, no worries! 🤗 I'm here to help. Try asking me about: careers, technology (programming, AI), science, health, education, business, or any topic you're curious about. What would you like to know?`;
  }
  
  // Jokes
  if(lowerText.includes('joke') || lowerText.includes('funny')){
    const jokes = [
      `Why don't programmers like nature? 🌳 It has too many bugs! 😄`,
      `Why did the scarecrow win an award? 🏆 Because he was outstanding in his field! 😂`,
      `What do you call a bear with no teeth? 🐻 A gummy bear! 😆`,
      `Why don't scientists trust atoms? ⚛️ Because they make up everything! 🤣`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // Default intelligent response
  return `That's an interesting point about "${userText}"! 🤔 I can help you with many topics:

💼 Career & Jobs
💻 Technology & Programming
🧠 AI & Machine Learning
🔬 Science & Math
📚 Education & Learning
💪 Health & Fitness
💰 Finance & Business

What would you like to explore?`;
}

/* ---------- Resume upload handler ---------- */
function handleResumeUpload(input) {
  const file = input.files && input.files[0];
  const fileNameEl = document.getElementById('uploadedFileName');
  const uploadResultEl = document.getElementById('uploadResult');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  if(!file) {
    if(fileNameEl) fileNameEl.innerHTML = '';
    if(uploadResultEl) uploadResultEl.innerHTML = '';
    if(analyzeBtn) analyzeBtn.disabled = true;
    return;
  }
  
  // Validate file size
  if(file.size > 5 * 1024 * 1024){
    if(fileNameEl) fileNameEl.innerHTML = '<span style="color:#ff6b6b;">❌ File too large. Maximum size is 5MB</span>';
    if(uploadResultEl) uploadResultEl.innerHTML = '';
    if(analyzeBtn) analyzeBtn.disabled = true;
    input.value = '';
    return;
  }
  
  // Validate file type
  const fileName = file.name.toLowerCase();
  if(!(fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx'))){
    if(fileNameEl) fileNameEl.innerHTML = '<span style="color:#ff6b6b;">❌ Unsupported format. Please use PDF, DOC, or DOCX</span>';
    if(uploadResultEl) uploadResultEl.innerHTML = '';
    if(analyzeBtn) analyzeBtn.disabled = true;
    input.value = '';
    return;
  }
  
  // Show success message
  const fileSize = (file.size / 1024).toFixed(2);
  if(fileNameEl) {
    fileNameEl.innerHTML = `
      <div style="background:rgba(80,201,195,0.1); padding:12px 16px; border-radius:10px; border:1px solid rgba(80,201,195,0.3);">
        <div style="color:#50C9C3; font-weight:600; margin-bottom:4px;">✅ File Uploaded Successfully!</div>
        <div style="color:var(--text); font-size:0.9rem;">📄 ${file.name}</div>
        <div style="color:var(--muted); font-size:0.85rem; margin-top:4px;">💾 Size: ${fileSize} KB</div>
      </div>
    `;
  }
  
  // Save file info to localStorage
  const resumeInfo = {
    fileName: file.name,
    fileSize: file.size,
    uploadDate: new Date().toISOString()
  };
  localStorage.setItem('uploaded_resume', JSON.stringify(resumeInfo));
  
  // Enable analyze button
  if(analyzeBtn) analyzeBtn.disabled = false;
  if(uploadResultEl) uploadResultEl.innerHTML = '';
}

/* ---------- Resume analyze stub ---------- */
function analyzeResume(){
  const fileInput = document.getElementById('resumeFile');
  const resEl = document.getElementById('uploadResult');
  if(!fileInput || !resEl) return;
  const file = fileInput.files && fileInput.files[0];
  if(!file) {
    resEl.innerHTML = '<span style="color:#ff6b6b;">❌ Please choose a file first.</span>';
    return;
  }

  // basic validations (client-side)
  const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if(file.size > 5 * 1024 * 1024){
    resEl.innerHTML = '<span style="color:#ff6b6b;">❌ File too large. Max 5MB.</span>';
    return;
  }
  // Accept wide variety; do a simple extension check if MIME not reliable
  const name = file.name.toLowerCase();
  if(!(name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx'))){
    resEl.innerHTML = '<span style="color:#ff6b6b;">❌ Unsupported format. Please use PDF, DOC or DOCX.</span>';
    return;
  }

  resEl.innerHTML = `
    <div style="background:rgba(74,144,226,0.1); padding:16px; border-radius:12px; border:1px solid rgba(74,144,226,0.3);">
      <div style="color:#4A90E2; font-weight:600; margin-bottom:12px;">🔍 Analyzing resume with AI...</div>
      <div style="color:var(--muted); font-size:0.9rem; margin-bottom:8px;">🧠 Using Advanced CNN Models:</div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
          <span style="color:#50C9C3;">✓</span>
          <span style="color:var(--text);">ResNet-50 - Document Classification</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
          <span style="color:#50C9C3;">✓</span>
          <span style="color:var(--text);">EfficientNet-B3 - Skill Extraction</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
          <span style="color:#50C9C3;">✓</span>
          <span style="color:var(--text);">Inception-v3 - Pattern Recognition</span>
        </div>
      </div>
      <div class="progress-bar" style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
        <div style="width:0%; height:100%; background:linear-gradient(90deg, #50C9C3, #4A90E2); animation: progress 2s ease-in-out;"></div>
      </div>
    </div>
    <style>
      @keyframes progress {
        0% { width: 0%; }
        50% { width: 60%; }
        100% { width: 100%; }
      }
    </style>
  `;
  
  // Disable button during analysis
  const analyzeBtn = document.getElementById('analyzeBtn');
  if(analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';
  }
  
  // simulate analysis
  setTimeout(() => {
    const skills = ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Time Management', 'JavaScript', 'Python', 'Data Analysis'];
    const detectedSkills = skills.slice(0, 3 + Math.floor(Math.random() * 3));
    
    resEl.innerHTML = `
      <div style="background:rgba(74,144,226,0.1); padding:20px; border-radius:12px; border:1px solid rgba(74,144,226,0.3); margin-top:12px;">
        <div style="color:#4A90E2; font-weight:600; margin-bottom:16px; font-size:1.1rem;">✨ AI Analysis Complete!</div>
        
        <!-- CNN Models Used -->
        <div style="background:rgba(80,201,195,0.1); padding:12px; border-radius:8px; margin-bottom:16px; border-left:3px solid #50C9C3;">
          <div style="color:#50C9C3; font-weight:600; margin-bottom:8px; font-size:0.9rem;">🧠 CNN Models Applied:</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:8px; font-size:0.85rem;">
            <div style="color:var(--text);">• <strong>ResNet-50</strong>: Document structure</div>
            <div style="color:var(--text);">• <strong>EfficientNet-B3</strong>: Skill detection</div>
            <div style="color:var(--text);">• <strong>Inception-v3</strong>: Pattern matching</div>
            <div style="color:var(--text);">• <strong>VGG-16</strong>: Feature extraction</div>
          </div>
        </div>
        
        <!-- Detected Skills -->
        <div style="margin-bottom:16px;">
          <div style="color:var(--text); margin-bottom:10px; font-weight:600;">🎯 Top Skills Detected:</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${detectedSkills.map(skill => `<span style="background:rgba(74,144,226,0.2); padding:8px 16px; border-radius:20px; font-size:0.9rem; color:var(--text); font-weight:500;">${skill}</span>`).join('')}
          </div>
        </div>
        
        <!-- Analysis Metrics -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; padding-top:16px; border-top:1px solid var(--glass-border);">
          <div>
            <div style="color:var(--muted); font-size:0.85rem; margin-bottom:4px;">📊 Match Score</div>
            <div style="color:#50C9C3; font-weight:600; font-size:1.2rem;">${85 + Math.floor(Math.random() * 10)}%</div>
          </div>
          <div>
            <div style="color:var(--muted); font-size:0.85rem; margin-bottom:4px;">📊 Confidence</div>
            <div style="color:#4A90E2; font-weight:600; font-size:1.2rem;">${90 + Math.floor(Math.random() * 8)}%</div>
          </div>
          <div>
            <div style="color:var(--muted); font-size:0.85rem; margin-bottom:4px;">📄 Processing Time</div>
            <div style="color:var(--accent); font-weight:600; font-size:1.2rem;">${(Math.random() * 0.5 + 0.5).toFixed(2)}s</div>
          </div>
        </div>
      </div>
    `;
    
    // Save analysis results with account-specific key
    const currentEmail = localStorage.getItem('current_user_email');
    const resumeKey = `resume_analysis_${currentEmail}`;
    const analysisResult = {
      skills: detectedSkills,
      analyzedDate: new Date().toISOString(),
      fileName: file.name
    };
    localStorage.setItem(resumeKey, JSON.stringify(analysisResult));
    
    // Generate and show job recommendations
    const profile = { skills: detectedSkills.join(', '), interests: '', edu: '' };
    const jobRecommendations = generateMockRecommendations(profile, analysisResult);
    displayJobRecommendations(jobRecommendations);
    
    // Re-enable button
    if(analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '🔍 Analyze Resume';
    }
  }, 1500 + Math.random()*1000);
}

/* ---------- Settings save stub ---------- */
function handleProfilePicture(input) {
  const file = input.files && input.files[0];
  if(!file) return;
  
  // Validate file type
  if(!file.type.startsWith('image/')) {
    alert('❌ Please upload a valid image file (JPG, PNG, GIF, etc.)');
    input.value = '';
    return;
  }
  
  // Validate file size (max 2MB)
  if(file.size > 2 * 1024 * 1024) {
    alert('❌ Image size too large. Please upload an image smaller than 2MB.');
    input.value = '';
    return;
  }
  
  // Read and display the image
  const reader = new FileReader();
  reader.onload = function(e) {
    const imgElement = document.getElementById('profileImg');
    const initialElement = document.getElementById('profileInitial');
    const nameElement = document.getElementById('profilePicName');
    
    if(imgElement && initialElement) {
      imgElement.src = e.target.result;
      imgElement.style.display = 'block';
      initialElement.style.display = 'none';
      
      // Save to localStorage with account-specific key
      const currentEmail = localStorage.getItem('current_user_email');
      const pictureKey = `profile_picture_${currentEmail}`;
      localStorage.setItem(pictureKey, e.target.result);
      
      if(nameElement) {
        nameElement.innerHTML = `<span style="color:#50C9C3;">✅ ${file.name}</span>`;
      }
    }
  };
  reader.readAsDataURL(file);
}

function loadProfilePicture() {
  const currentEmail = localStorage.getItem('current_user_email');
  const pictureKey = `profile_picture_${currentEmail}`;
  const savedPicture = localStorage.getItem(pictureKey);
  
  // Load profile picture in settings page (for preview)
  if(savedPicture) {
    const imgElement = document.getElementById('profileImg');
    const initialElement = document.getElementById('profileInitial');
    
    if(imgElement && initialElement) {
      imgElement.src = savedPicture;
      imgElement.style.display = 'block';
      initialElement.style.display = 'none';
    }
  }
  
  // ONLY update dashboard profile icon if on dashboard page
  const dashboardLogo = document.querySelector('.logo');
  const isDashboard = document.querySelector('.quick-actions'); // Dashboard has quick-actions section
  
  if(dashboardLogo && savedPicture && isDashboard) {
    dashboardLogo.innerHTML = `<img src="${savedPicture}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" />`;
  }
}

function saveSettings(){
  // read values and persist to localStorage as demo
  const name = document.getElementById('nameInput')?.value || '';
  const age = document.getElementById('ageInput')?.value || '';
  const edu = document.getElementById('eduSelect')?.value || '';
  const skills = document.getElementById('skillsInput')?.value || '';
  const interests = document.getElementById('interestsInput')?.value || '';
  const lang = document.getElementById('langSelect')?.value || 'English';

  // Validate that at least some data is provided
  if(!name && !age && !edu && !skills && !interests){
    alert('Please fill in at least one field before saving.');
    return;
  }

  // Get current user email
  const currentEmail = localStorage.getItem('current_user_email');
  const userProfileKey = `ai_profile_${currentEmail}`;
  
  const profile = { name, age, edu, skills, interests, lang, updated: new Date().toISOString() };
  localStorage.setItem(userProfileKey, JSON.stringify(profile));

  // Also save/update user data AND user account if name is provided
  if(name){
    const existingUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const updatedUserData = { ...existingUserData, name };
    localStorage.setItem('user_data', JSON.stringify(updatedUserData));
    
    // Also update the user_account name so signin message shows updated name
    const existingAccount = JSON.parse(localStorage.getItem('user_account') || '{}');
    if(existingAccount.email) {
      existingAccount.name = name;
      existingAccount.updatedAt = new Date().toISOString();
      localStorage.setItem('user_account', JSON.stringify(existingAccount));
      
      // Update in all_accounts registry
      const allAccounts = JSON.parse(localStorage.getItem('all_accounts') || '{}');
      if(allAccounts[currentEmail]) {
        allAccounts[currentEmail].name = name;
        allAccounts[currentEmail].updatedAt = new Date().toISOString();
        localStorage.setItem('all_accounts', JSON.stringify(allAccounts));
      }
    }
  }

  // Show detailed confirmation of saved data
  const savedData = `
Profile Saved Successfully!

${name ? 'Name: ' + name : ''}
${age ? 'Age: ' + age : ''}
${edu ? 'Education: ' + edu : ''}
${skills ? 'Skills: ' + skills : ''}
${interests ? 'Interests: ' + interests : ''}
${lang ? 'Language: ' + lang : ''}

Returning to dashboard...`;
  
  alert(savedData);
  window.location.href = 'dashboard.html';
}

/* ---------- Generate Recommendations ---------- */
function generateRecommendations(){
  // Get profile data from localStorage with account-specific key
  const currentEmail = localStorage.getItem('current_user_email');
  const userProfileKey = `ai_profile_${currentEmail}`;
  const resumeKey = `resume_analysis_${currentEmail}`;
  
  const profile = JSON.parse(localStorage.getItem(userProfileKey) || '{}');
  const resumeData = localStorage.getItem(resumeKey) || 'No resume data available';

  // Check if user has profile data
  if(!profile.skills && !profile.interests && !profile.edu){
    const shouldGoToSettings = confirm('To generate personalized recommendations, please complete your profile first.\n\nWould you like to go to settings now?');
    if(shouldGoToSettings){
      window.location.href = 'settings.html';
    }
    return;
  }

  // Simulate AI recommendation generation based on profile
  const recommendations = generateMockRecommendations(profile, resumeData);

  // Update the recommendations section (this will replace default jobs)
  updateRecommendationsSection(recommendations);
  
  // Show the recommendations section
  const recommendationsSection = document.getElementById('recommendationsSection');
  if(recommendationsSection) {
    recommendationsSection.style.display = 'block';
  }

  // Show success message with details
  const profileSummary = `
Profile Summary:
- Skills: ${profile.skills || 'Not specified'}
- Interests: ${profile.interests || 'Not specified'}
- Education: ${profile.edu || 'Not specified'}

Generated ${recommendations.length} personalized career recommendations!`;
  
  alert('Recommendations Generated!' + profileSummary);
  
  // Scroll to recommendations section
  if(recommendationsSection) {
    recommendationsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function generateMockRecommendations(profile, resumeData){
  // Mock recommendations based on profile data
  const recommendations = [];
  const edu = profile.edu || '';

  // 🟩 After 10th Pass Jobs
  if(edu === 'High School' || edu === '10th Pass' || !edu){
    recommendations.push(
      {title: 'Delivery Partner', description: 'Deliver packages and goods to customers efficiently and on time using bikes or vehicles.', score: '75%', tags: ['Driving', 'Time Management', 'Customer Service'], icon: '🛵', salary: '₹12,000 – ₹20,000'},
      {title: 'Office Assistant', description: 'Provide administrative support, manage files, handle basic office tasks and assist staff.', score: '73%', tags: ['Organization', 'Communication', 'Computer Skills'], icon: '📋', salary: '₹10,000 – ₹18,000'},
      {title: 'Security Guard', description: 'Monitor premises, control access, and ensure safety and security of property and people.', score: '72%', tags: ['Alertness', 'Physical Fitness', 'Responsibility'], icon: '🛡️', salary: '₹10,000 – ₹18,000'},
      {title: 'Warehouse Worker', description: 'Handle inventory, load/unload goods, and maintain warehouse organization and cleanliness.', score: '74%', tags: ['Physical Stamina', 'Teamwork', 'Organization'], icon: '📦', salary: '₹12,000 – ₹20,000'},
      {title: 'Store Keeper', description: 'Manage inventory, track stock levels, receive and dispatch goods in stores or warehouses.', score: '76%', tags: ['Inventory Management', 'Attention to Detail', 'Record Keeping'], icon: '🏪', salary: '₹15,000 – ₹22,000'},
      {title: 'Driver (Cab/Truck)', description: 'Transport passengers or goods safely, maintain vehicle, and follow traffic regulations.', score: '77%', tags: ['Driving License', 'Navigation', 'Punctuality'], icon: '🚗', salary: '₹15,000 – ₹30,000'}
    );
  }

  // 🟨 After 12th Pass Jobs
  if(edu === 'High School' || edu === '12th Pass' || edu === "Bachelor's" || !edu){
    recommendations.push(
      {title: 'Customer Care Executive', description: 'Handle customer inquiries, resolve complaints, and provide excellent service over phone or chat.', score: '80%', tags: ['Communication', 'Problem Solving', 'Patience'], icon: '📞', salary: '₹15,000 – ₹28,000'},
      {title: 'Receptionist', description: 'Greet visitors, answer calls, schedule appointments, and manage front desk operations.', score: '78%', tags: ['Communication', 'Organization', 'Professional Appearance'], icon: '🏢', salary: '₹14,000 – ₹25,000'},
      {title: 'Computer Operator', description: 'Operate computer systems, enter data, manage files, and perform basic IT tasks.', score: '79%', tags: ['Computer Skills', 'Typing', 'MS Office'], icon: '💻', salary: '₹15,000 – ₹25,000'},
      {title: 'Data Entry Clerk', description: 'Input and maintain accurate data in computer systems and databases with high attention to detail.', score: '76%', tags: ['Data Entry', 'Accuracy', 'Typing Speed'], icon: '⌨️', salary: '₹12,000 – ₹20,000'},
      {title: 'Sales Executive', description: 'Generate leads, meet clients, present products, and achieve sales targets.', score: '81%', tags: ['Sales', 'Communication', 'Persuasion'], icon: '💼', salary: '₹15,000 – ₹30,000'},
      {title: 'Telecaller', description: 'Make outbound calls, generate leads, follow up with customers, and maintain call records.', score: '75%', tags: ['Communication', 'Persuasion', 'Patience'], icon: '📱', salary: '₹12,000 – ₹22,000'}
    );
  }

  // 🟦 After ITI/Diploma Jobs
  if(edu === 'Diploma' || edu === 'ITI' || profile.skills?.toLowerCase().includes('technical')){
    recommendations.push(
      {title: 'Electrician', description: 'Install, maintain, and repair electrical systems, wiring, and equipment.', score: '82%', tags: ['Electrical Skills', 'Safety', 'Problem Solving'], icon: '⚡', salary: '₹15,000 – ₹30,000'},
      {title: 'Mechanic (Auto/AC/Diesel)', description: 'Diagnose, repair, and maintain vehicles, AC units, or diesel engines.', score: '83%', tags: ['Mechanical Skills', 'Tools', 'Troubleshooting'], icon: '🔧', salary: '₹18,000 – ₹30,000'},
      {title: 'Technician (Electrical/Mechanical)', description: 'Install, maintain, and repair technical equipment and machinery.', score: '84%', tags: ['Technical Skills', 'Maintenance', 'Safety'], icon: '⚙️', salary: '₹18,000 – ₹35,000'},
      {title: 'Quality Inspector', description: 'Inspect products and processes to ensure they meet quality standards and specifications.', score: '81%', tags: ['Attention to Detail', 'Quality Control', 'Inspection'], icon: '🔍', salary: '₹18,000 – ₹35,000'}
    );
  }

  // Technology/Software recommendations
  if((profile.skills && (profile.skills.toLowerCase().includes('javascript') || profile.skills.toLowerCase().includes('python') || profile.skills.toLowerCase().includes('programming'))) || 
     (profile.interests && (profile.interests.toLowerCase().includes('software') || profile.interests.toLowerCase().includes('technology') || profile.interests.toLowerCase().includes('coding'))) ||
     (edu === "Bachelor's" || edu === "Master's")){
    
    recommendations.push({
      title: 'Software Developer',
      description: 'Design, develop, and maintain software applications using various programming languages. Work on web, mobile, or desktop applications.',
      score: '92%',
      tags: ['Programming', 'Problem Solving', 'Technology', 'Creativity'],
      icon: '💻',
      salary: '₹40,000 – ₹1,00,000+'
    });
    
    recommendations.push({
      title: 'Web Developer',
      description: 'Build and maintain websites and web applications. Work with HTML, CSS, JavaScript, and modern frameworks.',
      score: '90%',
      tags: ['Web Development', 'Frontend', 'Backend', 'JavaScript'],
      icon: '🌐',
      salary: '₹35,000 – ₹90,000'
    });
  }

  // 🟥 After Professional Degrees
  if(edu === "Bachelor's" || edu === "Master's"){
    recommendations.push(
      {title: 'Data Scientist', description: 'Use advanced analytics, machine learning, and statistical methods to extract insights from data.', score: '94%', tags: ['Machine Learning', 'Python', 'Statistics', 'AI'], icon: '🧠', salary: '₹50,000 – ₹1,50,000+'},
      {title: 'Cloud Engineer', description: 'Design, implement, and manage cloud infrastructure and services for scalable applications.', score: '91%', tags: ['Cloud Computing', 'AWS', 'DevOps', 'Infrastructure'], icon: '☁️', salary: '₹45,000 – ₹1,20,000'},
      {title: 'Cybersecurity Analyst', description: 'Protect systems and networks from cyber threats, monitor security incidents, and implement safeguards.', score: '93%', tags: ['Cybersecurity', 'Network Security', 'Risk Analysis'], icon: '🔒', salary: '₹40,000 – ₹1,10,000'},
      {title: 'Product Manager', description: 'Define product vision, manage roadmaps, and work with teams to deliver successful products.', score: '92%', tags: ['Product Management', 'Strategy', 'Agile', 'Leadership'], icon: '📊', salary: '₹60,000 – ₹2,00,000+'}
    );
  }

  // 🟦 Graduation Level Jobs (BA/BCom/BSc/BBA)
  if(edu === "Bachelor's" || edu === "Master's"){
    recommendations.push(
      {title: 'Accountant', description: 'Manage financial records, prepare reports, handle tax filings, and ensure compliance.', score: '85%', tags: ['Accounting', 'Tally', 'Excel', 'Finance'], icon: '📊', salary: '₹20,000 – ₹40,000'},
      {title: 'HR Executive', description: 'Manage recruitment, employee relations, training, and HR processes.', score: '84%', tags: ['HR', 'Recruitment', 'Communication', 'People Management'], icon: '👥', salary: '₹22,000 – ₹45,000'},
      {title: 'Marketing Executive', description: 'Develop marketing strategies, manage campaigns, and promote products or services.', score: '86%', tags: ['Marketing', 'Communication', 'Creativity', 'Strategy'], icon: '📣', salary: '₹25,000 – ₹50,000'},
      {title: 'Business Development Associate', description: 'Identify business opportunities, build client relationships, and drive revenue growth.', score: '87%', tags: ['Sales', 'Business Strategy', 'Communication', 'Networking'], icon: '📈', salary: '₹25,000 – ₹60,000'}
    );
  }

  // Data Science/Analytics recommendations
  if((profile.skills && (profile.skills.toLowerCase().includes('python') || profile.skills.toLowerCase().includes('data') || profile.skills.toLowerCase().includes('analysis'))) || 
     (profile.interests && (profile.interests.toLowerCase().includes('data') || profile.interests.toLowerCase().includes('analytics')))){
    
    recommendations.push({
      title: 'Data Analyst',
      description: 'Analyze complex data sets to help organizations make informed business decisions. Create reports and visualizations.',
      score: '88%',
      tags: ['Data Analysis', 'Statistics', 'Visualization', 'Excel'],
      icon: '📊'
    });
    
    if(profile.edu && (profile.edu === "Bachelor's" || profile.edu === "Master's")){
      recommendations.push({
        title: 'Data Scientist',
        description: 'Use advanced analytics, machine learning, and statistical methods to extract insights from data.',
        score: '89%',
        tags: ['Machine Learning', 'Python', 'Statistics', 'AI'],
        icon: '🧠'
      });
    }
  }

  // Communication/Customer Service recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('communication') || profile.skills.toLowerCase().includes('customer'))){
    recommendations.push({
      title: 'Customer Service Representative',
      description: 'Assist customers with inquiries, provide support, and ensure satisfaction across various industries.',
      score: '85%',
      tags: ['Communication', 'Customer Service', 'Problem Solving', 'Empathy'],
      icon: '📞'
    });
    
    recommendations.push({
      title: 'Sales Representative',
      description: 'Build relationships with clients, present products or services, and achieve sales targets.',
      score: '83%',
      tags: ['Sales', 'Communication', 'Negotiation', 'Client Relations'],
      icon: '💼'
    });
  }

  // Marketing/Digital recommendations
  if(profile.interests && (profile.interests.toLowerCase().includes('marketing') || profile.interests.toLowerCase().includes('social media') || profile.interests.toLowerCase().includes('digital'))){
    recommendations.push({
      title: 'Digital Marketing Specialist',
      description: 'Develop and implement online marketing strategies, manage social media, and analyze campaign performance.',
      score: '86%',
      tags: ['Digital Marketing', 'SEO', 'Social Media', 'Content'],
      icon: '📣'
    });
  }

  // Design recommendations
  if(profile.interests && (profile.interests.toLowerCase().includes('design') || profile.interests.toLowerCase().includes('creative') || profile.interests.toLowerCase().includes('art'))){
    recommendations.push({
      title: 'UI/UX Designer',
      description: 'Create intuitive and visually appealing user interfaces and experiences for digital products.',
      score: '87%',
      tags: ['Design', 'User Experience', 'Creativity', 'Figma'],
      icon: '🎨'
    });
  }

  // Business/Management recommendations
  if((profile.edu && (profile.edu === "Bachelor's" || profile.edu === "Master's")) && 
     (profile.skills && (profile.skills.toLowerCase().includes('leadership') || profile.skills.toLowerCase().includes('management')))){
    recommendations.push({
      title: 'Project Manager',
      description: 'Plan, execute, and oversee projects from initiation to completion. Lead teams and manage resources.',
      score: '84%',
      tags: ['Project Management', 'Leadership', 'Communication', 'Agile'],
      icon: '📈'
    });
  }

  // Teamwork recommendations
  if(profile.skills && profile.skills.toLowerCase().includes('teamwork')){
    recommendations.push({
      title: 'Operations Coordinator',
      description: 'Coordinate day-to-day operations, support team activities, and ensure smooth workflow processes.',
      score: '81%',
      tags: ['Organization', 'Teamwork', 'Coordination', 'Communication'],
      icon: '⚙️'
    });
  }
  
  // Problem Solving recommendations
  if(profile.skills && profile.skills.toLowerCase().includes('problem')){
    recommendations.push({
      title: 'Business Analyst',
      description: 'Analyze business processes, identify improvement opportunities, and provide data-driven solutions.',
      score: '86%',
      tags: ['Problem Solving', 'Analysis', 'Communication', 'Strategic Thinking'],
      icon: '💡'
    });
  }
  
  // Time Management recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('time management') || profile.skills.toLowerCase().includes('organization'))){
    recommendations.push({
      title: 'Executive Assistant',
      description: 'Provide high-level administrative support, manage schedules, and coordinate executive communications.',
      score: '80%',
      tags: ['Time Management', 'Organization', 'Communication', 'Multitasking'],
      icon: '📅'
    });
  }
  
  // Teaching/Education recommendations
  if(profile.interests && (profile.interests.toLowerCase().includes('teaching') || profile.interests.toLowerCase().includes('education'))){
    recommendations.push({
      title: 'Corporate Trainer',
      description: 'Design and deliver training programs to enhance employee skills and knowledge in corporate settings.',
      score: '84%',
      tags: ['Teaching', 'Communication', 'Presentation', 'Curriculum Design'],
      icon: '👨‍🏫'
    });
  }
  
  // Finance recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('finance') || profile.skills.toLowerCase().includes('accounting'))){
    recommendations.push({
      title: 'Financial Analyst',
      description: 'Analyze financial data, prepare reports, and provide insights to support business decisions.',
      score: '87%',
      tags: ['Finance', 'Analysis', 'Excel', 'Reporting'],
      icon: '💰'
    });
  }
  
  // Writing/Content recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('writing') || profile.skills.toLowerCase().includes('content'))){
    recommendations.push({
      title: 'Content Writer',
      description: 'Create engaging written content for websites, blogs, social media, and marketing materials.',
      score: '82%',
      tags: ['Writing', 'Creativity', 'SEO', 'Research'],
      icon: '✍️'
    });
  }
  
  // HR/Recruitment recommendations
  if(profile.interests && (profile.interests.toLowerCase().includes('hr') || profile.interests.toLowerCase().includes('human resource') || profile.interests.toLowerCase().includes('recruitment'))){
    recommendations.push({
      title: 'HR Specialist',
      description: 'Manage recruitment, employee relations, and HR processes to support organizational goals.',
      score: '83%',
      tags: ['HR', 'Recruitment', 'Communication', 'People Management'],
      icon: '👥'
    });
  }
  
  // Quality Assurance recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('testing') || profile.skills.toLowerCase().includes('quality'))){
    recommendations.push({
      title: 'QA Tester',
      description: 'Test software applications, identify bugs, and ensure products meet quality standards.',
      score: '85%',
      tags: ['Testing', 'Attention to Detail', 'Problem Solving', 'Documentation'],
      icon: '🔍'
    });
  }
  
  // Healthcare recommendations
  if(profile.interests && (profile.interests.toLowerCase().includes('health') || profile.interests.toLowerCase().includes('medical'))){
    recommendations.push({
      title: 'Healthcare Administrator',
      description: 'Manage healthcare facility operations, coordinate patient services, and ensure regulatory compliance.',
      score: '81%',
      tags: ['Healthcare', 'Administration', 'Organization', 'Compliance'],
      icon: '🏥'
    });
  }
  
  // Supply Chain recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('logistics') || profile.skills.toLowerCase().includes('supply'))){
    recommendations.push({
      title: 'Supply Chain Analyst',
      description: 'Optimize supply chain processes, analyze inventory data, and improve operational efficiency.',
      score: '84%',
      tags: ['Logistics', 'Analysis', 'Planning', 'Optimization'],
      icon: '📦'
    });
  }
  
  // Cybersecurity recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('security') || profile.skills.toLowerCase().includes('cyber'))){
    recommendations.push({
      title: 'Cybersecurity Analyst',
      description: 'Protect systems and networks from cyber threats, monitor security incidents, and implement safeguards.',
      score: '91%',
      tags: ['Cybersecurity', 'Network Security', 'Risk Analysis', 'Monitoring'],
      icon: '🔒'
    });
  }
  
  // Cloud Computing recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('cloud') || profile.skills.toLowerCase().includes('aws') || profile.skills.toLowerCase().includes('azure'))){
    recommendations.push({
      title: 'Cloud Engineer',
      description: 'Design, implement, and manage cloud infrastructure and services for scalable applications.',
      score: '90%',
      tags: ['Cloud Computing', 'AWS', 'DevOps', 'Infrastructure'],
      icon: '☁️'
    });
  }
  
  // Mobile Development recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('mobile') || profile.skills.toLowerCase().includes('android') || profile.skills.toLowerCase().includes('ios'))){
    recommendations.push({
      title: 'Mobile App Developer',
      description: 'Build native or cross-platform mobile applications for iOS and Android platforms.',
      score: '89%',
      tags: ['Mobile Development', 'React Native', 'Flutter', 'API Integration'],
      icon: '📱'
    });
  }
  
  // DevOps recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('devops') || profile.skills.toLowerCase().includes('ci/cd') || profile.skills.toLowerCase().includes('docker'))){
    recommendations.push({
      title: 'DevOps Engineer',
      description: 'Automate deployment processes, manage CI/CD pipelines, and ensure system reliability.',
      score: '91%',
      tags: ['DevOps', 'Docker', 'Kubernetes', 'Automation'],
      icon: '🚀'
    });
  }
  
  // Product Management recommendations
  if(profile.skills && (profile.skills.toLowerCase().includes('product') || profile.skills.toLowerCase().includes('strategy'))){
    recommendations.push({
      title: 'Product Manager',
      description: 'Define product vision, manage roadmaps, and work with teams to deliver successful products.',
      score: '88%',
      tags: ['Product Management', 'Strategy', 'Agile', 'Stakeholder Management'],
      icon: '📊',
      salary: '₹60,000 – ₹2,00,000+'
    });
  }
  
  // ⚪ Creative & Freelance Roles (Open for All)
  if(profile.interests && (profile.interests.toLowerCase().includes('creative') || profile.interests.toLowerCase().includes('design') || profile.interests.toLowerCase().includes('art'))){
    recommendations.push(
      {title: 'Video Editor', description: 'Edit and produce video content for films, YouTube, social media, and corporate projects.', score: '84%', tags: ['Video Editing', 'Creativity', 'Adobe Premiere', 'Final Cut'], icon: '🎬', salary: '₹20,000 – ₹60,000'},
      {title: 'Graphic Designer', description: 'Create visual content, logos, brochures, and marketing materials using design software.', score: '86%', tags: ['Design', 'Photoshop', 'Illustrator', 'Creativity'], icon: '🎨', salary: '₹25,000 – ₹50,000'},
      {title: 'Photographer', description: 'Capture professional photos for events, products, portraits, or creative projects.', score: '82%', tags: ['Photography', 'Camera Skills', 'Editing', 'Creativity'], icon: '📷', salary: '₹15,000 – ₹50,000'},
      {title: 'Animator', description: 'Create animated content for movies, games, advertisements, and digital media.', score: '85%', tags: ['Animation', '3D Modeling', 'Creativity', 'Software Skills'], icon: '🎭', salary: '₹25,000 – ₹70,000'}
    );
  }
  
  if(profile.interests && (profile.interests.toLowerCase().includes('fashion') || profile.interests.toLowerCase().includes('interior'))){
    recommendations.push(
      {title: 'Fashion Designer', description: 'Design clothing, accessories, and fashion products. Create unique styles and trends.', score: '83%', tags: ['Fashion', 'Creativity', 'Design', 'Trend Analysis'], icon: '👗', salary: '₹25,000 – ₹70,000'},
      {title: 'Interior Designer', description: 'Design interior spaces for homes, offices, and commercial properties.', score: '85%', tags: ['Interior Design', 'Creativity', 'Space Planning', 'CAD'], icon: '🏠', salary: '₹30,000 – ₹80,000'}
    );
  }
  
  if(profile.interests && (profile.interests.toLowerCase().includes('social media') || profile.interests.toLowerCase().includes('content') || profile.interests.toLowerCase().includes('influencer'))){
    recommendations.push(
      {title: 'Social Media Manager', description: 'Manage social media accounts, create content, and grow online presence for brands.', score: '84%', tags: ['Social Media', 'Content Creation', 'Marketing', 'Analytics'], icon: '📱', salary: '₹25,000 – ₹60,000'},
      {title: 'Content Creator / Influencer', description: 'Create engaging content for YouTube, Instagram, or other platforms and build audience.', score: '80%', tags: ['Content Creation', 'Creativity', 'Video Production', 'Marketing'], icon: '🎥', salary: '₹15,000 – ₹1,00,000+'},
      {title: 'Freelancer', description: 'Work independently in any field - writing, design, programming, consulting, etc.', score: '81%', tags: ['Self-Management', 'Skills', 'Client Relations', 'Flexibility'], icon: '💼', salary: '₹15,000 – ₹1,00,000+'}
    );
  }

  // Default recommendations if no specific matches
  if(recommendations.length === 0){
    recommendations.push({
      title: 'Administrative Assistant',
      description: 'Provide administrative support, manage schedules, handle correspondence, and maintain office efficiency.',
      score: '75%',
      tags: ['Organization', 'Communication', 'Multitasking', 'Office Skills'],
      icon: '📋'
    });
    
    recommendations.push({
      title: 'Customer Service Associate',
      description: 'Help customers with inquiries, process transactions, and provide excellent service in retail or office settings.',
      score: '78%',
      tags: ['Customer Service', 'Communication', 'Problem Solving'],
      icon: '🛍️'
    });
    
    recommendations.push({
      title: 'Office Clerk',
      description: 'Perform various administrative tasks including data entry, filing, and general office support.',
      score: '76%',
      tags: ['Data Entry', 'Organization', 'Attention to Detail'],
      icon: '🗄️'
    });
  }

  // Limit to top 6 recommendations and sort by score
  return recommendations
    .sort((a, b) => parseInt(b.score) - parseInt(a.score))
    .slice(0, 6);
}

function updateRecommendationsSection(recommendations){
  const section = document.querySelector('.recommendations .cards-grid');
  if(!section) return;

  // Clear existing recommendations
  section.innerHTML = '';

  // Add new recommendations
  recommendations.forEach(rec => {
    const card = document.createElement('div');
    card.className = 'card glass job';
    
    // Generate a simple company name based on job title
    const company = getCompanyName(rec.title);
    
    card.innerHTML = `
      <div class="job-head">
        <div class="ficon small">${rec.icon}</div>
        <div class="score">${rec.score}</div>
      </div>
      <h3>${rec.title}</h3>
      <p class="muted">${rec.description}</p>
      <div class="tags">
        ${rec.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="btn apply-btn" data-job-title="${rec.title}" data-company="${company}">Apply for Job</button>
      </div>
    `;
    
    // Add click event listener to apply button
    const applyBtn = card.querySelector('.apply-btn');
    if(applyBtn) {
      applyBtn.addEventListener('click', function() {
        openApplicationModal(this.dataset.jobTitle, this.dataset.company);
      });
    }
    
    section.appendChild(card);
  });
}

function getCompanyName(jobTitle) {
  const companyMap = {
    // After 10th
    'Delivery Partner': 'QuickDeliver Services',
    'Office Assistant': 'Corporate Office Solutions',
    'Security Guard': 'SecureGuard Services',
    'Warehouse Worker': 'Logistics Hub Inc.',
    'Store Keeper': 'Inventory Masters Ltd.',
    'Driver (Cab/Truck)': 'FastTrack Transport',
    // After 12th
    'Customer Care Executive': 'Customer First Inc.',
    'Receptionist': 'Professional Services Co.',
    'Computer Operator': 'Tech Office Solutions',
    'Data Entry Clerk': 'DataPro Services',
    'Sales Executive': 'Sales Masters Ltd.',
    'Telecaller': 'CallCenter Pro',
    // ITI/Diploma
    'Electrician': 'ElectroTech Services',
    'Mechanic (Auto/AC/Diesel)': 'AutoCare Workshop',
    'Technician (Electrical/Mechanical)': 'TechFix Solutions',
    'Quality Inspector': 'Quality Assurance Labs',
    // Graduation
    'Accountant': 'Finance Pros Inc.',
    'HR Executive': 'Talent Solutions Group',
    'Marketing Executive': 'Marketing Hub',
    'Business Development Associate': 'Growth Partners Inc.',
    // Professional
    'Software Developer': 'Tech Solutions Inc.',
    'Web Developer': 'Digital Agency Co.',
    'Data Analyst': 'Analytics Corp.',
    'Data Scientist': 'Data Insights LLC',
    'Cloud Engineer': 'CloudTech Solutions',
    'Cybersecurity Analyst': 'SecureNet Technologies',
    'Product Manager': 'Product Excellence Inc.',
    // Creative
    'Video Editor': 'Creative Studios',
    'Graphic Designer': 'Design Pro Agency',
    'Photographer': 'Picture Perfect Studios',
    'Animator': 'Animation Works',
    'Fashion Designer': 'Fashion House',
    'Interior Designer': 'Interior Concepts',
    'Social Media Manager': 'Social Buzz Agency',
    'Content Creator / Influencer': 'Content Creators Network',
    'Freelancer': 'Independent Professional',
    // Others
    'Customer Service Representative': 'Service Pro Inc.',
    'Sales Representative': 'Sales Masters Ltd.',
    'Digital Marketing Specialist': 'Marketing Hub',
    'UI/UX Designer': 'Design Studio',
    'Project Manager': 'Enterprise Solutions',
    'Operations Coordinator': 'Operations Group',
    'Administrative Assistant': 'Business Services Co.',
    'Customer Service Associate': 'Customer First Inc.',
    'Office Clerk': 'Office Solutions Ltd.',
    'Business Analyst': 'Strategy Consulting Group',
    'Executive Assistant': 'Executive Partners LLC',
    'Corporate Trainer': 'Learning & Development Co.',
    'Financial Analyst': 'Finance Pros Inc.',
    'Content Writer': 'Content Creators Agency',
    'HR Specialist': 'Talent Solutions Group',
    'QA Tester': 'Quality Assurance Labs',
    'Healthcare Administrator': 'MediCare Systems',
    'Supply Chain Analyst': 'Logistics Partners Inc.',
    'Mobile App Developer': 'AppDev Studios',
    'DevOps Engineer': 'DevOps Innovators'
  };
  return companyMap[jobTitle] || 'Professional Services Inc.';
}

/* ---------- Load user data ---------- */
function loadUserData(){
  // Load both user data and profile data
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const currentEmail = localStorage.getItem('current_user_email');
  const userProfileKey = `ai_profile_${currentEmail}`;
  const profile = JSON.parse(localStorage.getItem(userProfileKey) || '{}');
  const welcomeEl = document.getElementById('welcomeMessage');
  const emailEl = document.getElementById('userEmail');

  // Prioritize profile name over user_data name (profile name is more current)
  const displayName = profile.name || userData.name || 'User';
  
  if(welcomeEl){
    welcomeEl.textContent = `Welcome back, ${displayName}!`;
  }
  if(emailEl && userData.email){
    emailEl.textContent = userData.email;
  }
}

/* ---------- Load profile settings ---------- */
function loadProfileSettings(){
  // Check if we're on the settings page
  const nameInput = document.getElementById('nameInput');
  if(!nameInput) return; // Not on settings page

  // Load saved profile data for current user
  const currentEmail = localStorage.getItem('current_user_email');
  const userProfileKey = `ai_profile_${currentEmail}`;
  const profile = JSON.parse(localStorage.getItem(userProfileKey) || '{}');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

  // Populate form fields with saved data
  if(profile.name || userData.name){
    nameInput.value = profile.name || userData.name || '';
  }
  
  const ageInput = document.getElementById('ageInput');
  if(ageInput && profile.age){
    ageInput.value = profile.age;
  }

  const eduSelect = document.getElementById('eduSelect');
  if(eduSelect && profile.edu){
    eduSelect.value = profile.edu;
  }

  const skillsInput = document.getElementById('skillsInput');
  if(skillsInput && profile.skills){
    skillsInput.value = profile.skills;
  }

  const interestsInput = document.getElementById('interestsInput');
  if(interestsInput && profile.interests){
    interestsInput.value = profile.interests;
  }

  const langSelect = document.getElementById('langSelect');
  if(langSelect && profile.lang){
    langSelect.value = profile.lang;
  }
}

/* ---------- Wire analyze button for direct global calls (if any) ---------- */
window.analyzeResume = analyzeResume;
window.handleResumeUpload = handleResumeUpload;
window.sendMessage = sendMessage;
window.toDashboard = toDashboard;
window.signOut = signOut;
window.saveSettings = saveSettings;
window.loadUserData = loadUserData;
window.loadProfileSettings = loadProfileSettings;
window.generateRecommendations = generateRecommendations;

/* ---------- Dropdown toggle ---------- */
function toggleDropdown() {
  const dropdown = document.getElementById('settingsDropdown');
  if(dropdown) {
    dropdown.classList.toggle('show');
  }
}

window.toggleDropdown = toggleDropdown;

/* ---------- Job Application System ---------- */
let currentJobTitle = '';
let currentJobCompany = '';

function showSuccessMessage(message) {
  // Create a modern success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #50C9C3 0%, #3ab5af 100%);
    color: white;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(80, 201, 195, 0.4);
    z-index: 10000;
    max-width: 400px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

function openApplicationModal(jobTitle, company) {
  currentJobTitle = jobTitle;
  currentJobCompany = company;
  
  document.getElementById('jobTitle').value = jobTitle;
  document.getElementById('jobCompany').value = company;
  
  // Pre-fill with user data if available
  const currentEmail = localStorage.getItem('current_user_email');
  const userProfileKey = `ai_profile_${currentEmail}`;
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const profile = JSON.parse(localStorage.getItem(userProfileKey) || '{}');
  
  if(userData.name || profile.name) {
    document.getElementById('applicantName').value = userData.name || profile.name;
  }
  if(userData.email) {
    document.getElementById('applicantEmail').value = userData.email;
  }
  if(profile.skills) {
    document.getElementById('applicantSkills').value = profile.skills;
  }
  
  const modal = document.getElementById('applicationModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeApplicationModal() {
  const modal = document.getElementById('applicationModal');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  
  // Reset form
  document.getElementById('applicationForm').reset();
  document.getElementById('fileName').textContent = '';
}

function updateFileName(input) {
  const fileName = input.files[0]?.name || '';
  document.getElementById('fileName').textContent = fileName ? `Selected: ${fileName}` : '';
}

function submitApplication() {
  const form = document.getElementById('applicationForm');
  if(!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const application = {
    jobTitle: document.getElementById('jobTitle').value,
    company: document.getElementById('jobCompany').value,
    name: document.getElementById('applicantName').value,
    email: document.getElementById('applicantEmail').value,
    phone: document.getElementById('applicantPhone').value,
    skills: document.getElementById('applicantSkills').value,
    experience: document.getElementById('applicantExperience').value,
    coverLetter: document.getElementById('coverLetterText').value,
    resumeFile: document.getElementById('resumeUpload').files[0]?.name || 'Not provided',
    appliedDate: new Date().toISOString(),
    status: 'Submitted'
  };
  
  // Save to localStorage with account-specific key
  const currentEmail = localStorage.getItem('current_user_email');
  const applicationsKey = `job_applications_${currentEmail}`;
  const applications = JSON.parse(localStorage.getItem(applicationsKey) || '[]');
  applications.push(application);
  localStorage.setItem(applicationsKey, JSON.stringify(applications));
  
  // Update notifications
  updateNotifications();
  
  // Close modal first
  closeApplicationModal();
  
  // Show success message with modern styling
  showSuccessMessage(`✅ Application Submitted Successfully!

Job: ${application.jobTitle}
Company: ${application.company}

We'll review your application and get back to you soon. Good luck!`);
}

/* ---------- Notifications System ---------- */
function toggleNotifications() {
  const dropdown = document.getElementById('notificationDropdown');
  const settingsDropdown = document.getElementById('settingsDropdown');
  
  // Close settings dropdown if open
  if(settingsDropdown) {
    settingsDropdown.classList.remove('show');
  }
  
  if(dropdown) {
    dropdown.classList.toggle('show');
  }
}

function updateNotifications() {
  const currentEmail = localStorage.getItem('current_user_email');
  const applicationsKey = `job_applications_${currentEmail}`;
  const applications = JSON.parse(localStorage.getItem(applicationsKey) || '[]');
  const badge = document.getElementById('notificationBadge');
  const list = document.getElementById('notificationList');
  
  if(!badge || !list) return;
  
  // Update badge
  if(applications.length > 0) {
    badge.textContent = applications.length;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
  
  // Update notification list
  if(applications.length === 0) {
    list.innerHTML = '<div class="notification-empty">No applications yet</div>';
    return;
  }
  
  list.innerHTML = applications.reverse().map((app, index) => {
    const date = new Date(app.appliedDate);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `
      <div class="notification-item" onclick="showApplicationDetails(${applications.length - 1 - index})">
        <div class="notification-job-title">${app.jobTitle}</div>
        <div class="notification-company">🏢 ${app.company}</div>
        <div class="notification-date">📅 Applied on ${dateStr}</div>
        <div style="font-size:0.8rem; color:var(--muted); margin-top:4px;">☝️ Click to view details</div>
      </div>
    `;
  }).join('');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
  const notificationBell = event.target.closest('.notification-bell');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsDropdown = document.getElementById('settingsDropdown');
  
  // Close notification dropdown
  if(!notificationBell && notificationDropdown && !notificationDropdown.contains(event.target)) {
    notificationDropdown.classList.remove('show');
  }
  
  // Close settings dropdown
  if(settingsDropdown && settingsToggle && !settingsToggle.contains(event.target) && !settingsDropdown.contains(event.target)) {
    settingsDropdown.classList.remove('show');
  }
});

// Show application details modal
function showApplicationDetails(index) {
  const currentEmail = localStorage.getItem('current_user_email');
  const applicationsKey = `job_applications_${currentEmail}`;
  const applications = JSON.parse(localStorage.getItem(applicationsKey) || '[]');
  const app = applications[applications.length - 1 - index]; // Reverse index
  
  if(!app) return;
  
  const date = new Date(app.appliedDate);
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const details = `
💼 APPLICATION DETAILS

🎯 Job Title: ${app.jobTitle}
🏢 Company: ${app.company}

👤 Applicant Information:
- Name: ${app.name}
- Email: ${app.email}
- Phone: ${app.phone || 'Not provided'}

📊 Experience: ${app.experience} years
🛠️ Skills: ${app.skills}

📄 Resume: ${app.resumeFile}

📝 Cover Letter:
${app.coverLetter}

📅 Applied: ${dateStr} at ${timeStr}
✅ Status: ${app.status}`;
  
  alert(details);
  
  // Close notification dropdown
  const notificationDropdown = document.getElementById('notificationDropdown');
  if(notificationDropdown) {
    notificationDropdown.classList.remove('show');
  }
}

// Close modal when clicking overlay
document.addEventListener('click', (event) => {
  if(event.target.classList.contains('modal-overlay')) {
    closeApplicationModal();
  }
});

// Update notifications on page load
if(document.getElementById('notificationBadge')) {
  updateNotifications();
}

window.openApplicationModal = openApplicationModal;
window.closeApplicationModal = closeApplicationModal;
window.updateFileName = updateFileName;
window.submitApplication = submitApplication;
window.toggleNotifications = toggleNotifications;
window.updateNotifications = updateNotifications;
window.showApplicationDetails = showApplicationDetails;
window.handleProfilePicture = handleProfilePicture;

/* ---------- Job Recommendations Display ---------- */
function displayJobRecommendations(recommendations) {
  const recommendationsSection = document.getElementById('jobRecommendations');
  const grid = document.getElementById('recommendedJobsGrid');
  
  if(!recommendationsSection || !grid) return;
  
  if(recommendations.length === 0) {
    recommendationsSection.style.display = 'none';
    return;
  }
  
  recommendationsSection.style.display = 'block';
  grid.innerHTML = '';
  
  recommendations.slice(0, 6).forEach(rec => {
    const company = getCompanyName(rec.title);
    const card = document.createElement('div');
    card.className = 'card glass job';
    card.innerHTML = `
      <div class="job-head">
        <div class="ficon small">${rec.icon}</div>
        <div class="score">${rec.score}</div>
      </div>
      <h3>${rec.title}</h3>
      <p class="muted">${rec.description}</p>
      <div class="tags">
        ${rec.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="btn apply-btn" data-job-title="${rec.title}" data-company="${company}" style="width:100%;">Apply Now</button>
      </div>
    `;
    
    // Add click event listener to apply button
    const applyBtn = card.querySelector('.apply-btn');
    if(applyBtn) {
      applyBtn.addEventListener('click', function() {
        openApplicationModal(this.dataset.jobTitle, this.dataset.company);
      });
    }
    
    grid.appendChild(card);
  });
  
  // Scroll to recommendations
  setTimeout(() => {
    recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 300);
}

/* ---------- Job Search Function ---------- */
// Initialize all 60 India jobs if database is empty
let jobsDatabase = JSON.parse(localStorage.getItem('jobs_database') || '[]');

if(jobsDatabase.length === 0) {
  const allIndiaJobs = [
    // 🟩 After 10th Pass
    {title: 'Delivery Partner', salary: '₹12,000 – ₹20,000', desc: 'Deliver food, groceries, or parcels to customers using bike/scooter. Flexible hours and location-based delivery jobs.', category: '10th Pass', company: 'QuickDeliver Services'},
    {title: 'Office Assistant', salary: '₹10,000 – ₹18,000', desc: 'Maintain files, assist office staff, handle photocopying, emails, and errands.', category: '10th Pass', company: 'Corporate Office Solutions'},
    {title: 'Helper / Cleaner', salary: '₹9,000 – ₹15,000', desc: 'Cleaning, organizing materials, and supporting day-to-day office or site maintenance.', category: '10th Pass', company: 'CleanPro Services'},
    {title: 'Security Guard', salary: '₹10,000 – ₹18,000', desc: 'Protect premises, monitor CCTV, and manage entry points in offices or apartments.', category: '10th Pass', company: 'SecureGuard Services'},
    {title: 'Warehouse Worker', salary: '₹12,000 – ₹20,000', desc: 'Sorting, packing, loading, and unloading goods in warehouses.', category: '10th Pass', company: 'Logistics Hub Inc.'},
    {title: 'Store Keeper', salary: '₹15,000 – ₹22,000', desc: 'Maintain inventory records and manage incoming/outgoing goods.', category: '10th Pass', company: 'Inventory Masters Ltd.'},
    {title: 'Driver', salary: '₹15,000 – ₹30,000', desc: 'Transport goods or passengers safely. Must hold a valid driving license.', category: '10th Pass', company: 'FastTrack Transport'},
    {title: 'Sales Associate', salary: '₹12,000 – ₹20,000', desc: 'Assist customers in retail stores and manage product sales.', category: '10th Pass', company: 'Retail Store Inc.'},
    {title: 'Factory Helper', salary: '₹10,000 – ₹17,000', desc: 'Support machine operators and ensure factory cleanliness.', category: '10th Pass', company: 'Manufacturing Co.'},
    {title: 'Field Worker', salary: '₹12,000 – ₹18,000', desc: 'Outdoor work such as surveys, collections, or basic field support.', category: '10th Pass', company: 'Field Services Ltd.'},
    
    // 🟨 After 12th Pass
    {title: 'Customer Care Executive', salary: '₹15,000 – ₹28,000', desc: 'Handle customer calls, solve queries, and record feedback.', category: '12th Pass', company: 'Customer First Inc.'},
    {title: 'Receptionist', salary: '₹14,000 – ₹25,000', desc: 'Manage front desk, answer calls, and greet clients.', category: '12th Pass', company: 'Professional Services Co.'},
    {title: 'Computer Operator', salary: '₹15,000 – ₹25,000', desc: 'Operate computer systems, maintain records, and handle MS Office tasks.', category: '12th Pass', company: 'Tech Office Solutions'},
    {title: 'Data Entry Clerk', salary: '₹12,000 – ₹20,000', desc: 'Enter and manage data into systems accurately.', category: '12th Pass', company: 'DataPro Services'},
    {title: 'Sales Executive', salary: '₹15,000 – ₹30,000', desc: 'Promote and sell company products to clients or customers.', category: '12th Pass', company: 'Sales Masters Ltd.'},
    {title: 'Telecaller', salary: '₹12,000 – ₹22,000', desc: 'Make or receive calls to promote services and collect leads.', category: '12th Pass', company: 'CallCenter Pro'},
    {title: 'Cashier', salary: '₹15,000 – ₹25,000', desc: 'Handle cash counters, billing, and customer payments.', category: '12th Pass', company: 'Retail Chain Inc.'},
    {title: 'Air Ticketing Executive', salary: '₹18,000 – ₹35,000', desc: 'Book flight tickets, assist travelers, and manage travel queries.', category: '12th Pass', company: 'Travel Solutions'},
    {title: 'Travel Agent', salary: '₹18,000 – ₹30,000', desc: 'Create travel packages, manage bookings, and assist customers.', category: '12th Pass', company: 'Tour & Travels Co.'},
    {title: 'Police / Army (Constable)', salary: '₹25,000 – ₹40,000', desc: 'Maintain law and order, public safety, and discipline.', category: '12th Pass', company: 'Government of India'},
    
    // 🟦 After ITI/Diploma
    {title: 'Electrician', salary: '₹15,000 – ₹30,000', desc: 'Install and maintain electrical systems and equipment.', category: 'ITI/Diploma', company: 'ElectroTech Services'},
    {title: 'Fitter', salary: '₹14,000 – ₹28,000', desc: 'Assemble and repair machinery and mechanical parts.', category: 'ITI/Diploma', company: 'Mechanical Works'},
    {title: 'Welder', salary: '₹14,000 – ₹25,000', desc: 'Join metal parts using welding equipment.', category: 'ITI/Diploma', company: 'Welding Solutions'},
    {title: 'Plumber', salary: '₹15,000 – ₹25,000', desc: 'Install and repair water supply and drainage systems.', category: 'ITI/Diploma', company: 'Plumbing Services'},
    {title: 'Mechanic (Auto / AC / Diesel)', salary: '₹18,000 – ₹30,000', desc: 'Diagnose and repair vehicles or machinery.', category: 'ITI/Diploma', company: 'AutoCare Workshop'},
    {title: 'Technician (Electrical / Mechanical)', salary: '₹18,000 – ₹35,000', desc: 'Maintain and repair technical equipment and systems.', category: 'ITI/Diploma', company: 'TechFix Solutions'},
    {title: 'Machine Operator', salary: '₹15,000 – ₹30,000', desc: 'Operate and monitor industrial machines.', category: 'ITI/Diploma', company: 'Industrial Corp.'},
    {title: 'Quality Inspector', salary: '₹18,000 – ₹35,000', desc: 'Check product quality and ensure standards.', category: 'ITI/Diploma', company: 'Quality Assurance Labs'},
    {title: 'Draftsman', salary: '₹20,000 – ₹40,000', desc: 'Prepare technical drawings using CAD software.', category: 'ITI/Diploma', company: 'Engineering Design Co.'},
    {title: 'Site Supervisor', salary: '₹18,000 – ₹35,000', desc: 'Oversee on-site construction and labor activities.', category: 'ITI/Diploma', company: 'Construction Corp.'},
    
    // 🟪 After Graduation
    {title: 'Accountant', salary: '₹20,000 – ₹40,000', desc: 'Manage company accounts, GST, and daily transactions.', category: 'Graduation', company: 'Finance Pros Inc.'},
    {title: 'HR Executive', salary: '₹22,000 – ₹45,000', desc: 'Handle recruitment, payroll, and employee relations.', category: 'Graduation', company: 'Talent Solutions Group'},
    {title: 'Marketing Executive', salary: '₹25,000 – ₹50,000', desc: 'Execute marketing campaigns and analyze results.', category: 'Graduation', company: 'Marketing Hub'},
    {title: 'Business Development Associate', salary: '₹25,000 – ₹60,000', desc: 'Find business leads and convert clients.', category: 'Graduation', company: 'Growth Partners Inc.'},
    {title: 'Customer Relationship Manager', salary: '₹25,000 – ₹50,000', desc: 'Maintain long-term relationships with clients.', category: 'Graduation', company: 'Client Solutions'},
    {title: 'Data Analyst', salary: '₹30,000 – ₹60,000', desc: 'Analyze business data and prepare reports.', category: 'Graduation', company: 'Analytics Corp.'},
    {title: 'Graphic Designer', salary: '₹25,000 – ₹50,000', desc: 'Design visual content using tools like Photoshop or Canva.', category: 'Graduation', company: 'Design Pro Agency'},
    {title: 'Content Writer', salary: '₹20,000 – ₹45,000', desc: 'Write blogs, articles, and marketing content.', category: 'Graduation', company: 'Content Creators Agency'},
    {title: 'Social Media Manager', salary: '₹25,000 – ₹60,000', desc: 'Manage brand presence on Instagram, LinkedIn, etc.', category: 'Graduation', company: 'Social Buzz Agency'},
    {title: 'Government Clerk / Assistant', salary: '₹30,000 – ₹45,000', desc: 'Manage records and paperwork in government offices.', category: 'Graduation', company: 'Government Office'},
    
    // 🟥 After Professional Degrees
    {title: 'Software Developer', salary: '₹40,000 – ₹1,00,000+', desc: 'Develop and maintain software applications.', category: 'Professional Degree', company: 'Tech Solutions Inc.'},
    {title: 'Web / App Developer', salary: '₹35,000 – ₹90,000', desc: 'Build and update websites and mobile applications.', category: 'Professional Degree', company: 'Digital Agency Co.'},
    {title: 'Data Scientist', salary: '₹50,000 – ₹1,50,000+', desc: 'Analyze data using AI/ML tools for business insights.', category: 'Professional Degree', company: 'Data Insights LLC'},
    {title: 'Cloud Engineer', salary: '₹45,000 – ₹1,20,000', desc: 'Manage cloud systems like AWS, Azure, or GCP.', category: 'Professional Degree', company: 'CloudTech Solutions'},
    {title: 'Cybersecurity Analyst', salary: '₹40,000 – ₹1,10,000', desc: 'Protect systems from security breaches and malware.', category: 'Professional Degree', company: 'SecureNet Technologies'},
    {title: 'Mechanical / Civil / Electrical Engineer', salary: '₹30,000 – ₹80,000', desc: 'Design, build, and manage engineering projects.', category: 'Professional Degree', company: 'Engineering Solutions'},
    {title: 'Architect', salary: '₹40,000 – ₹90,000', desc: 'Design residential and commercial building structures.', category: 'Professional Degree', company: 'Architecture Firm'},
    {title: 'Doctor', salary: '₹60,000 – ₹2,00,000+', desc: 'Provide medical diagnosis and treatment.', category: 'Professional Degree', company: 'Hospital / Clinic'},
    {title: 'Chartered Accountant', salary: '₹50,000 – ₹1,50,000+', desc: 'Manage auditing, taxation, and financial records.', category: 'Professional Degree', company: 'CA Firm'},
    {title: 'Product / Project Manager', salary: '₹60,000 – ₹2,00,000+', desc: 'Plan, execute, and manage product or project development.', category: 'Professional Degree', company: 'Product Excellence Inc.'},
    
    // ⚪ Creative & Freelance
    {title: 'Video Editor', salary: '₹20,000 – ₹60,000', desc: 'Edit and produce videos for social media or films.', category: 'Creative & Freelance', company: 'Creative Studios'},
    {title: 'Photographer', salary: '₹15,000 – ₹50,000', desc: 'Capture and edit professional photos.', category: 'Creative & Freelance', company: 'Picture Perfect Studios'},
    {title: 'Animator', salary: '₹25,000 – ₹70,000', desc: 'Create animated graphics and motion visuals.', category: 'Creative & Freelance', company: 'Animation Works'},
    {title: 'Game Designer', salary: '₹30,000 – ₹90,000', desc: 'Design gameplay, levels, and game art.', category: 'Creative & Freelance', company: 'Game Studio'},
    {title: 'Fashion Designer', salary: '₹25,000 – ₹70,000', desc: 'Create and design apparel and accessories.', category: 'Creative & Freelance', company: 'Fashion House'},
    {title: 'Interior Designer', salary: '₹30,000 – ₹80,000', desc: 'Design and decorate residential and commercial interiors.', category: 'Creative & Freelance', company: 'Interior Concepts'},
    {title: 'Blogger / Influencer', salary: '₹15,000 – ₹1,00,000+', desc: 'Create online content and earn through brand deals.', category: 'Creative & Freelance', company: 'Content Creators Network'},
    {title: 'YouTuber', salary: '₹10,000 – ₹1,00,000+', desc: 'Create and upload engaging video content.', category: 'Creative & Freelance', company: 'YouTube Platform'},
    {title: 'Music Producer', salary: '₹25,000 – ₹80,000', desc: 'Compose, record, and mix songs or soundtracks.', category: 'Creative & Freelance', company: 'Music Studios'},
    {title: 'Freelancer (Any Field)', salary: '₹15,000 – ₹1,00,000+', desc: 'Offer skills online such as writing, design, coding, etc.', category: 'Creative & Freelance', company: 'Independent Professional'}
  ];
  
  localStorage.setItem('jobs_database', JSON.stringify(allIndiaJobs));
  jobsDatabase = allIndiaJobs; // Update the reference
  console.log('✅ Loaded', allIndiaJobs.length, 'jobs into database');
}

function searchJobs(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('searchResults');
  
  if(!resultsContainer) {
    // If on dashboard page without search results container, filter recommendations
    const jobCards = document.querySelectorAll('.job');
    
    if(!searchTerm) {
      jobCards.forEach(card => card.style.display = 'flex');
      return;
    }
    
    jobCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const description = card.querySelector('.muted')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
      
      const matches = title.includes(searchTerm) || description.includes(searchTerm) || tags.includes(searchTerm);
      card.style.display = matches ? 'flex' : 'none';
    });
    return;
  }
  
  // Search in jobs database
  if(!searchTerm) {
    resultsContainer.style.display = 'none';
    return;
  }
  
  const jobs = JSON.parse(localStorage.getItem('jobs_database') || '[]');
  console.log('Searching for:', searchTerm);
  console.log('Total jobs in database:', jobs.length);
  
  const filtered = jobs.filter(job => {
    const title = job.title.toLowerCase();
    const desc = job.desc.toLowerCase();
    const category = job.category.toLowerCase();
    const company = job.company.toLowerCase();
    
    return title.includes(searchTerm) || desc.includes(searchTerm) || category.includes(searchTerm) || company.includes(searchTerm);
  });
  
  console.log('Filtered jobs:', filtered.length);
  
  if(filtered.length === 0) {
    resultsContainer.innerHTML = '<div style="padding:16px; text-align:center; color:var(--muted);">🔍 No jobs found</div>';
    resultsContainer.style.display = 'block';
    return;
  }
  
  // Show ALL matching jobs with count header
  resultsContainer.innerHTML = `
    <div style="padding:12px 16px; background:rgba(80,201,195,0.1); border-bottom:1px solid var(--glass-border); font-weight:600; color:#50C9C3; position:sticky; top:0; z-index:10;">
      Found ${filtered.length} job${filtered.length > 1 ? 's' : ''}
    </div>
  ` + filtered.map(job => `
    <div style="padding:16px; border-bottom:1px solid var(--glass-border); cursor:pointer; transition:background 0.2s;" 
         onmouseover="this.style.background='rgba(80,201,195,0.1)'" 
         onmouseout="this.style.background='transparent'"
         onclick="addJobToRecommendations('${job.title.replace(/'/g, "\\'")}')">
      <div style="font-weight:600; color:var(--accent); margin-bottom:4px;">${job.title}</div>
      <div style="color:#50C9C3; font-size:0.85rem; margin-bottom:4px;">${job.salary}</div>
      <div style="color:var(--muted); font-size:0.85rem;">🏢 ${job.company} • ${job.category}</div>
    </div>
  `).join('');
  
  resultsContainer.style.display = 'block';
}

function showSearchResults() {
  const searchInput = document.getElementById('jobSearchInput');
  if(searchInput && searchInput.value.trim()) {
    searchJobs({target: searchInput});
  }
}

function showSearchHelp() {
  const searchInput = document.getElementById('jobSearchInput');
  const resultsContainer = document.getElementById('searchResults');
  
  if(!resultsContainer || !searchInput) return;
  
  // If there's already text, show search results instead
  if(searchInput.value.trim()) {
    showSearchResults();
    return;
  }
  
  // Show search help message
  resultsContainer.innerHTML = `
    <div style="padding:20px;">
      <div style="font-weight:600; color:var(--accent); margin-bottom:16px; font-size:1.1rem;">
        🔍 Search Examples:
      </div>
      <div style="line-height:2; color:var(--text);">
        <div style="padding:8px; background:rgba(80,201,195,0.1); border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='rgba(80,201,195,0.2)'" 
             onmouseout="this.style.background='rgba(80,201,195,0.1)'"
             onclick="performSearch('10th')">
          🟩 Search <strong>"10th"</strong> → Shows all 10 jobs for 10th Pass
        </div>
        <div style="padding:8px; background:rgba(255,193,7,0.1); border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='rgba(255,193,7,0.2)'" 
             onmouseout="this.style.background='rgba(255,193,7,0.1)'"
             onclick="performSearch('12th')">
          🟨 Search <strong>"12th"</strong> → Shows all 10 jobs for 12th Pass
        </div>
        <div style="padding:8px; background:rgba(33,150,243,0.1); border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='rgba(33,150,243,0.2)'" 
             onmouseout="this.style.background='rgba(33,150,243,0.1)'"
             onclick="performSearch('ITI')">
          🟦 Search <strong>"ITI"</strong> → Shows all 10 ITI/Diploma jobs
        </div>
        <div style="padding:8px; background:rgba(156,39,176,0.1); border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='rgba(156,39,176,0.2)'" 
             onmouseout="this.style.background='rgba(156,39,176,0.1)'"
             onclick="performSearch('graduation')">
          🟪 Search <strong>"graduation"</strong> → Shows all 10 Graduation jobs
        </div>
        <div style="padding:8px; background:rgba(244,67,54,0.1); border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='rgba(244,67,54,0.2)'" 
             onmouseout="this.style.background='rgba(244,67,54,0.1)'"
             onclick="performSearch('professional')">
          🟥 Search <strong>"professional"</strong> → Shows all 10 Professional Degree jobs
        </div>
        <div style="padding:8px; background:rgba(158,158,158,0.1); border-radius:8px; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='rgba(158,158,158,0.2)'" 
             onmouseout="this.style.background='rgba(158,158,158,0.1)'"
             onclick="performSearch('creative')">
          ⚪ Search <strong>"creative"</strong> → Shows all 10 Creative & Freelance jobs
        </div>
      </div>
      <div style="margin-top:16px; padding:12px; background:rgba(80,201,195,0.15); border-radius:8px; font-size:0.9rem; color:var(--muted);">
        💡 <strong>Tip:</strong> You can also search by job title, company name, or skill!
      </div>
    </div>
  `;
  
  resultsContainer.style.display = 'block';
}

function performSearch(searchTerm) {
  const searchInput = document.getElementById('jobSearchInput');
  if(searchInput) {
    // Show searching notification
    showToast(`🔍 Searching for "${searchTerm}" jobs...`);
    
    // Set search input value
    searchInput.value = searchTerm;
    
    // Perform search after small delay for better UX
    setTimeout(() => {
      searchJobs({target: searchInput});
      
      // Show results notification
      const jobs = JSON.parse(localStorage.getItem('jobs_database') || '[]');
      const filtered = jobs.filter(job => {
        const title = job.title.toLowerCase();
        const desc = job.desc.toLowerCase();
        const category = job.category.toLowerCase();
        const company = job.company.toLowerCase();
        const term = searchTerm.toLowerCase();
        
        return title.includes(term) || desc.includes(term) || category.includes(term) || company.includes(term);
      });
      
      setTimeout(() => {
        showToast(`✅ Found ${filtered.length} job${filtered.length > 1 ? 's' : ''} matching "${searchTerm}"`);
      }, 300);
    }, 200);
  }
}

function addJobToRecommendations(jobTitle) {
  const jobs = JSON.parse(localStorage.getItem('jobs_database') || '[]');
  const job = jobs.find(j => j.title === jobTitle);
  
  if(!job) return;
  
  // Hide search results
  const resultsContainer = document.getElementById('searchResults');
  if(resultsContainer) resultsContainer.style.display = 'none';
  
  // Clear search input
  const searchInput = document.getElementById('jobSearchInput');
  if(searchInput) searchInput.value = '';
  
  // Show recommendations section
  const recommendationsSection = document.getElementById('recommendationsSection');
  if(recommendationsSection) {
    recommendationsSection.style.display = 'block';
  }
  
  // Add job to recommendations
  const recommendationsGrid = document.querySelector('.recommendations .cards-grid');
  if(!recommendationsGrid) return;
  
  const card = document.createElement('div');
  card.className = 'card glass job';
  card.innerHTML = `
    <div class="job-head">
      <div class="ficon small">💼</div>
      <div class="score">Match</div>
    </div>
    <h3>${job.title}</h3>
    <p class="muted">${job.desc}</p>
    <div class="tags">
      <span class="tag">${job.category}</span>
      <span class="tag">${job.salary}</span>
    </div>
    <div class="card-actions">
      <button class="btn apply-btn" data-job-title="${job.title}" data-company="${job.company}">Apply for Job</button>
    </div>
  `;
  
  // Add click event listener to apply button
  const applyBtn = card.querySelector('.apply-btn');
  if(applyBtn) {
    applyBtn.addEventListener('click', function() {
      if(window.openApplicationModal) {
        window.openApplicationModal(this.dataset.jobTitle, this.dataset.company);
      }
    });
  }
  
  recommendationsGrid.insertBefore(card, recommendationsGrid.firstChild);
  
  // Scroll to recommendations
  setTimeout(() => {
    recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
  
  // Show toast notification instead of alert
  showToast(`✅ "${job.title}" added to recommendations!`);
}

// Toast notification function
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.getElementById('toast-notification');
  if(existingToast) existingToast.remove();
  
  // Create toast
  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #50C9C3 0%, #3da8a3 100%);
    color: #000;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(80,201,195,0.4);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
  const searchInput = document.getElementById('jobSearchInput');
  const searchResults = document.getElementById('searchResults');
  
  if(searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.style.display = 'none';
  }
});

window.displayJobRecommendations = displayJobRecommendations;
window.searchJobs = searchJobs;
window.showSearchResults = showSearchResults;
window.showSearchHelp = showSearchHelp;
window.performSearch = performSearch;
window.addJobToRecommendations = addJobToRecommendations;
window.showToast = showToast;
