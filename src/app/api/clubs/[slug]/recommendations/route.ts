import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Smart project recommendation engine for a club
// Uses domain-specific recommendation pools with deterministic weekly rotation

interface Recommendation {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tools: string[];
  estimatedTime: string;
  outcomes: string[];
  employerValue: string;
  interviewTips: string[];
}

const domainRecommendations: Record<string, Recommendation[]> = {
  "Sports Analytics": [
    {
      id: "sa-1",
      title: "Win Probability Model",
      description:
        "Build a live win probability model for a sport of your choice using historical play-by-play data. Train a logistic regression or XGBoost model on game state features (score differential, time remaining, possession, field position) and visualize how win probability shifts throughout a game.",
      difficulty: "Intermediate",
      tools: ["Python", "scikit-learn", "matplotlib", "pandas"],
      estimatedTime: "2-3 weeks",
      outcomes: [
        "A trained classification model with documented accuracy metrics (AUC, log loss)",
        "An interactive visualization showing win probability curves for completed games",
        "A written analysis explaining which game-state features are most predictive",
        "Experience with feature engineering, model evaluation, and sports data APIs",
      ],
      employerValue:
        "Win probability models are used by every major sports analytics department, from ESPN's broadcast graphics to front office decision-making tools. This project demonstrates you can work with messy real-world data, build production-quality models, and communicate statistical concepts visually — all core skills for analyst roles.",
      interviewTips: [
        "Walk through your feature engineering process — explain why you chose specific game-state variables and how you handled missing data or edge cases",
        "Discuss the model's calibration — did your predicted 70% win probabilities actually correspond to 70% wins? Show you understand model evaluation beyond just accuracy",
        "Explain a surprising insight from the model — e.g., 'I found that time of possession in the 4th quarter was 3x more predictive than overall game stats'",
      ],
    },
    {
      id: "sa-2",
      title: "Player Similarity Tool",
      description:
        "Create a tool that finds comparable players using statistical profiles. Apply K-means or hierarchical clustering on per-game stats normalized by position, then build a nearest-neighbor search so users can input any player and receive the five most similar players with an explanation of why they match.",
      difficulty: "Advanced",
      tools: ["Python", "pandas", "scikit-learn", "Streamlit"],
      estimatedTime: "3-4 weeks",
      outcomes: [
        "A clustering pipeline that groups players into statistically meaningful archetypes with silhouette scores",
        "An interactive Streamlit app where users select a player and see ranked comparisons with similarity percentages",
        "A written report analyzing the archetypes discovered — e.g., 'stretch bigs' vs. 'rim protectors' in NBA data",
        "Hands-on experience with dimensionality reduction (PCA/t-SNE), distance metrics, and unsupervised learning",
      ],
      employerValue:
        "Player comparison tools are a staple of front office analytics — teams use them for trade evaluation, free agency targets, and draft scouting. Building one demonstrates mastery of unsupervised learning and the ability to translate complex statistical output into actionable insights for non-technical stakeholders like GMs and scouts.",
      interviewTips: [
        "Explain your choice of distance metric (Euclidean vs. cosine vs. Mahalanobis) and why it matters for player stats that have different scales",
        "Show a specific comparison that validated your model — e.g., 'The tool identified Player X and Player Y as 92% similar, and their career trajectories actually followed nearly identical paths'",
        "Discuss how you would extend this to handle players across eras by adjusting for pace, rule changes, and positional evolution",
      ],
    },
    {
      id: "sa-3",
      title: "Game Prediction Dashboard",
      description:
        "Build a dashboard that predicts game outcomes using historical team and player statistics. Train a gradient boosting model on season-level features (offensive/defensive ratings, recent form, home/away splits), display predictions with confidence intervals, and track your model's accuracy over a live season.",
      difficulty: "Intermediate",
      tools: ["Python", "XGBoost", "Tableau", "pandas"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A trained prediction model with a live accuracy tracker comparing your picks against Vegas spreads",
        "A Tableau dashboard showing predictions, confidence levels, and historical model performance",
        "A feature importance analysis revealing which team stats are most predictive of wins",
        "Experience integrating live data feeds, building model pipelines, and presenting results in BI tools",
      ],
      employerValue:
        "Game prediction is the backbone of sports betting analytics, media coverage, and front office planning. This project proves you can build end-to-end ML pipelines, create stakeholder-facing dashboards, and critically evaluate model performance over time — skills that translate directly to any predictive analytics role.",
      interviewTips: [
        "Discuss how you handled data leakage — explain why you used only pre-game features and how you split train/test by time rather than randomly",
        "Compare your model's performance to a baseline (e.g., home team always wins, or Vegas lines) and explain what the delta tells you about your model's value",
        "Describe how you would productionize this — scheduled data pulls, automated retraining, and alerting when model drift is detected",
      ],
    },
    {
      id: "sa-4",
      title: "Salary Cap Optimizer",
      description:
        "Build a linear programming model for optimal roster construction under salary cap constraints. Define an objective function (maximize projected wins or points), encode positional requirements and cap rules as constraints, and solve for the best possible roster from a pool of available players.",
      difficulty: "Advanced",
      tools: ["Python", "PuLP", "pandas", "matplotlib"],
      estimatedTime: "3 weeks",
      outcomes: [
        "A working optimization model that outputs an optimal roster given cap space, positional needs, and player projections",
        "Sensitivity analysis charts showing how the optimal roster changes as the cap increases or player costs shift",
        "A comparison document pitting your optimizer's roster against actual team rosters to evaluate theoretical vs. real-world decisions",
        "Practical experience with linear programming, constraint modeling, and operations research applied to sports",
      ],
      employerValue:
        "Every professional sports team with a salary cap uses some form of optimization for roster construction and trade analysis. This project shows you understand constrained optimization — a skill set that extends well beyond sports into supply chain, finance, and resource allocation roles. Candidates who can formulate real problems as optimization models stand out immediately.",
      interviewTips: [
        "Walk through how you translated roster rules into mathematical constraints — explain the difference between hard constraints (salary cap) and soft objectives (positional balance)",
        "Discuss the limitations of your model — e.g., it doesn't account for team chemistry, player development curves, or injury risk — and how you would layer those in",
        "Explain how you validated the results — did your optimizer suggest moves that actual GMs later made? What did it miss and why?",
      ],
    },
    {
      id: "sa-5",
      title: "Shot Chart Analyzer",
      description:
        "Visualize and analyze shooting patterns using NBA or soccer shot location data. Build hexbin heatmaps showing shooting efficiency by zone, calculate expected goals or expected points from shot locations, and compare individual players against league averages to identify strengths and weaknesses.",
      difficulty: "Beginner",
      tools: ["Python", "matplotlib", "seaborn", "pandas"],
      estimatedTime: "1 week",
      outcomes: [
        "Publication-quality shot chart visualizations with hexbin heatmaps colored by shooting efficiency",
        "A comparison dashboard overlaying a player's shot distribution against league-average efficiency by zone",
        "A written summary identifying specific tendencies — e.g., 'Player X shoots 8% above average from the left corner but 12% below from mid-range'",
        "Foundational skills in spatial data visualization, data cleaning, and sports analytics storytelling",
      ],
      employerValue:
        "Shot charts are one of the most recognizable outputs in sports analytics, used by coaching staffs for game planning and by media outlets for storytelling. Even as a beginner project, a polished shot chart analysis shows hiring managers you can work with coordinate data, create clear visualizations, and extract actionable insights — the bread and butter of any analyst position.",
      interviewTips: [
        "Explain how you handled the coordinate system — did you normalize court/field dimensions, and how did you bin the shot locations into meaningful zones?",
        "Highlight a specific insight your analysis revealed that wasn't obvious from box scores alone — e.g., a player's efficiency from certain zones before and after the All-Star break",
        "Describe how a coaching staff could use your analysis to adjust defensive schemes or play-calling for a specific opponent",
      ],
    },
    {
      id: "sa-6",
      title: "Draft Board Builder",
      description:
        "Build a weighted composite scoring system for ranking draft prospects. Combine physical measurables, college/amateur performance stats, and advanced metrics into a single draft score. Allow users to adjust category weights and see how rankings shift, then backtest against historical drafts to evaluate predictive accuracy.",
      difficulty: "Intermediate",
      tools: ["Python", "pandas", "Streamlit", "scikit-learn"],
      estimatedTime: "2 weeks",
      outcomes: [
        "An interactive draft board tool where users can adjust stat weights and instantly see re-ranked prospect lists",
        "A backtesting analysis comparing your model's historical rankings against actual draft order and career outcomes",
        "A written evaluation of which metrics are most predictive of professional success, broken down by position",
        "Experience with composite scoring, normalization techniques, and building interactive data tools",
      ],
      employerValue:
        "Every front office builds internal draft boards that go beyond public consensus rankings. This project demonstrates you can synthesize multiple data sources into a decision-support tool — a skill that applies to any role requiring multi-criteria evaluation, from talent analytics to product scoring to risk assessment.",
      interviewTips: [
        "Explain your normalization approach — how did you make combine 40-yard dash times comparable to college three-point percentage on a common scale?",
        "Share your backtesting results — which positions did your model predict well, and where did it fail? Discuss whether the failures were data problems or genuine unpredictability",
        "Describe how you would incorporate qualitative scouting data (intangibles, interview scores) into a primarily quantitative model",
      ],
    },
    {
      id: "sa-7",
      title: "Injury Prediction Model",
      description:
        "Build a machine learning model that estimates injury risk for athletes based on workload metrics (minutes played, distance covered, sprint counts), playing surface type, injury history, position, and age. Use survival analysis or gradient boosting to predict time-to-injury and identify the highest-risk players on a roster.",
      difficulty: "Advanced",
      tools: ["Python", "XGBoost", "lifelines", "pandas"],
      estimatedTime: "4 weeks",
      outcomes: [
        "A trained risk model that outputs per-player injury probability scores with confidence intervals",
        "A dashboard showing roster-level risk heatmaps and individual player workload trend lines",
        "A research write-up analyzing which workload thresholds correlate most strongly with injury onset",
        "Deep experience with imbalanced classification, survival analysis, and sensitive data handling in sports science",
      ],
      employerValue:
        "Injury prediction is one of the highest-value applications in sports analytics — teams spend millions on player health, and even small improvements in load management save franchises significant money. This project shows you can work with complex, imbalanced medical data, apply advanced ML techniques, and communicate risk to non-technical decision-makers like coaches and athletic trainers.",
      interviewTips: [
        "Discuss how you handled class imbalance — injuries are rare events, so explain your resampling strategy (SMOTE, undersampling) and why you chose precision-recall metrics over accuracy",
        "Walk through a real finding — e.g., 'Players who exceeded 85% of their max sprint count in three consecutive games had a 4x higher injury rate in the following week'",
        "Explain the ethical considerations — how would you present this model to a coaching staff without it being used to bench healthy players or devalue athletes?",
      ],
    },
    {
      id: "sa-8",
      title: "Fan Engagement Tracker",
      description:
        "Build a social media sentiment analysis pipeline for sports teams. Collect tweets and Reddit posts using APIs, classify sentiment using a pre-trained NLP model (VADER or a fine-tuned transformer), and visualize how fan sentiment correlates with team performance, trades, and off-field events over a full season.",
      difficulty: "Intermediate",
      tools: ["Python", "VADER/transformers", "plotly", "pandas"],
      estimatedTime: "2-3 weeks",
      outcomes: [
        "A sentiment classification pipeline processing thousands of social media posts with labeled polarity scores",
        "An interactive timeline visualization correlating sentiment spikes and dips with specific team events (wins, losses, trades)",
        "A written analysis identifying which types of events drive the strongest fan reactions and how quickly sentiment recovers",
        "Practical experience with NLP preprocessing, API data collection, time-series visualization, and social media analytics",
      ],
      employerValue:
        "Sports teams, leagues, and media companies all monitor fan sentiment to guide marketing spend, content strategy, and crisis communication. This project shows you can build real data pipelines, work with unstructured text data, and derive business insights from social media — skills valued in marketing analytics, brand management, and media roles across industries.",
      interviewTips: [
        "Explain how you handled noisy social media text — sarcasm, slang, emojis — and what preprocessing steps improved your classifier's accuracy",
        "Share a specific correlation you discovered — e.g., 'Fan sentiment dropped 40% after the trade deadline but recovered within 5 days when the team won 3 straight'",
        "Discuss how you would turn this into a real-time monitoring tool with alerts when sentiment crosses critical thresholds",
      ],
    },
  ],
  "Computer Science": [
    {
      id: "cs-1",
      title: "Full-Stack CRUD App",
      description:
        "Build a complete web application with user authentication, a relational database, and a RESTful API. Implement proper input validation, error handling, role-based access control, and deploy it to a cloud provider. Choose a real-world use case — task manager, recipe book, inventory system — to give the project portfolio substance.",
      difficulty: "Beginner",
      tools: ["Next.js", "Prisma", "PostgreSQL", "Tailwind CSS"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A deployed, fully functional web app with authentication, CRUD operations, and a polished UI",
        "A documented API with clear endpoint descriptions, request/response examples, and error codes",
        "A database schema diagram showing relationships, indexes, and migration history",
        "End-to-end experience with the modern web stack: frontend, backend, database, auth, and deployment",
      ],
      employerValue:
        "Full-stack CRUD apps are the foundation of virtually every software product. Hiring managers look for candidates who can own a feature from database to UI, and a deployed project proves you can do exactly that. Candidates who can point to a live URL with real authentication immediately stand out over those with only coursework.",
      interviewTips: [
        "Walk through your database schema design decisions — why you chose certain relationships, what indexes you added, and how you handled data validation at both the API and database level",
        "Discuss a bug you encountered during deployment (environment variables, CORS, database connection pooling) and how you debugged it systematically",
        "Explain how you would add a feature to this app — e.g., real-time notifications or a search function — to show you think about extensibility",
      ],
    },
    {
      id: "cs-2",
      title: "CLI Tool in Rust",
      description:
        "Build a performant command-line utility in Rust that solves a real problem — a file deduplicator, a log parser, a Markdown-to-HTML converter, or a Git statistics tool. Focus on proper error handling with Result types, argument parsing with clap, and cross-platform compatibility. Publish it to crates.io.",
      difficulty: "Intermediate",
      tools: ["Rust", "clap", "serde", "tokio"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A published CLI tool on crates.io with proper documentation, help text, and semantic versioning",
        "A benchmark comparison showing your tool's performance against equivalent Python or shell scripts",
        "A README with usage examples, installation instructions, and architecture overview",
        "Practical experience with Rust's ownership model, error handling patterns, and the crate ecosystem",
      ],
      employerValue:
        "Rust is increasingly adopted at companies like AWS, Microsoft, and Cloudflare for performance-critical systems. A published crate demonstrates not just language proficiency but also software distribution skills — versioning, documentation, and cross-platform testing. Systems engineering candidates who ship open-source Rust tools signal strong fundamentals.",
      interviewTips: [
        "Explain a specific ownership or borrowing challenge you hit and how Rust's compiler guided you to the correct solution — this shows you truly understand the language, not just fought with it",
        "Share your benchmarking methodology — how you measured performance, what baseline you compared against, and what the speedup was in concrete terms",
        "Discuss your testing strategy — unit tests for core logic, integration tests for CLI behavior, and how you handled platform-specific differences (Windows vs. Unix paths)",
      ],
    },
    {
      id: "cs-3",
      title: "Distributed Key-Value Store",
      description:
        "Implement a distributed key-value database supporting replication across multiple nodes. Use the Raft consensus algorithm for leader election and log replication, implement read/write operations with configurable consistency levels, and build a client library that handles node failover automatically.",
      difficulty: "Advanced",
      tools: ["Go", "gRPC", "Protocol Buffers", "Docker Compose"],
      estimatedTime: "4 weeks",
      outcomes: [
        "A multi-node key-value store that survives node failures and maintains data consistency",
        "A chaos testing suite that kills nodes randomly and verifies data integrity after recovery",
        "A technical design document explaining your consistency model, failure modes, and trade-offs (CAP theorem)",
        "Deep experience with distributed systems fundamentals: consensus, replication, partitioning, and failure handling",
      ],
      employerValue:
        "Distributed systems knowledge is the most sought-after backend engineering skill. Companies like Google, Amazon, and Stripe build their infrastructure on these primitives. A working distributed KV store on your resume signals to hiring managers that you understand the hardest problems in backend engineering — and that you can implement, not just describe, solutions.",
      interviewTips: [
        "Walk through your Raft implementation — explain leader election, log replication, and how you handle split-brain scenarios with concrete examples from your testing",
        "Discuss a consistency bug you found during chaos testing — what caused it, how you detected it, and what the fix taught you about distributed systems",
        "Explain the trade-offs you made — why you chose eventual vs. strong consistency for reads, and how you would change the design if latency requirements were 10x stricter",
      ],
    },
    {
      id: "cs-4",
      title: "Browser Extension",
      description:
        "Build a productivity browser extension that solves a daily workflow problem. Ideas: a tab manager that groups tabs by project, a reading-time estimator that tracks articles you've read, or a meeting cost calculator. Use the Chrome Extension Manifest V3 API with a popup UI, background service worker, and content scripts.",
      difficulty: "Beginner",
      tools: ["JavaScript", "Chrome Extension API", "HTML/CSS", "Webpack"],
      estimatedTime: "1 week",
      outcomes: [
        "A published Chrome extension with a polished popup UI and at least one content script injection",
        "A demo video showing the extension in action with real-world usage scenarios",
        "Documentation covering the extension architecture: popup, background worker, content scripts, and storage",
        "Hands-on experience with browser APIs, message passing between extension contexts, and Chrome Web Store publishing",
      ],
      employerValue:
        "Browser extensions demonstrate strong JavaScript fundamentals in a constrained environment with real users. Publishing to the Chrome Web Store shows you can ship a product end-to-end, handle user feedback, and work within platform constraints — all skills that frontend and product engineering roles value highly.",
      interviewTips: [
        "Explain the Chrome Extension architecture — how popup scripts, background workers, and content scripts communicate through message passing and shared storage",
        "Discuss a UX decision you made — how you designed the popup to be useful in under 3 seconds, or how you minimized content script impact on page performance",
        "Describe how you would add a feature that requires cross-tab state — e.g., syncing data between devices using Chrome's storage.sync API",
      ],
    },
    {
      id: "cs-5",
      title: "Open Source Contribution",
      description:
        "Find an active open-source project, identify a meaningful issue (bug fix, feature, documentation improvement), and submit a merged pull request. Focus on reading and understanding unfamiliar codebases, following contribution guidelines, writing clear PR descriptions, and responding to code review feedback constructively.",
      difficulty: "Intermediate",
      tools: ["Git", "GitHub", "any language"],
      estimatedTime: "Ongoing",
      outcomes: [
        "At least one merged pull request to a recognized open-source project with public code review history",
        "A documented process of how you found the project, selected the issue, and navigated the codebase",
        "Experience reading and modifying code you did not write — understanding patterns, conventions, and test suites in unfamiliar repositories",
        "Collaboration skills including writing clear commit messages, responding to review feedback, and following project-specific workflows",
      ],
      employerValue:
        "Open-source contributions are the strongest signal of real-world collaboration ability. Hiring managers can see your actual code, your communication style in PR discussions, and your ability to work within existing codebases. Candidates with merged PRs to known projects consistently outperform those with only solo projects in interview evaluations.",
      interviewTips: [
        "Walk through how you onboarded to the codebase — how you navigated the project structure, ran tests locally, and identified where your change needed to go",
        "Discuss the code review process — what feedback you received, how you iterated, and what you learned from the maintainer's perspective on code quality",
        "Explain why you chose that specific project and issue — show intentionality rather than randomness, and connect it to your interests or career goals",
      ],
    },
    {
      id: "cs-6",
      title: "API Rate Limiter",
      description:
        "Implement multiple rate-limiting algorithms — token bucket, sliding window log, and fixed window counter — as reusable middleware. Build a Node.js API server that applies different rate limits per endpoint and per API key, stores state in Redis for distributed deployments, and returns proper 429 responses with Retry-After headers.",
      difficulty: "Intermediate",
      tools: ["Node.js", "Redis", "Express", "Jest"],
      estimatedTime: "1 week",
      outcomes: [
        "A production-ready rate-limiting middleware library with three algorithm implementations and configurable limits",
        "A load test report showing how each algorithm behaves under burst traffic, sustained load, and distributed client scenarios",
        "Clear documentation comparing the trade-offs of each algorithm with diagrams and use-case recommendations",
        "Experience with Redis data structures, HTTP status codes, middleware patterns, and system design fundamentals",
      ],
      employerValue:
        "Rate limiting is a core system design topic that comes up in nearly every backend engineering interview. Building one from scratch — rather than just using a library — proves you understand the underlying algorithms and trade-offs. Companies handling API traffic at scale need engineers who grasp these concepts at the implementation level.",
      interviewTips: [
        "Compare the three algorithms concretely — explain when you would use token bucket (bursty APIs) vs. sliding window (strict fairness) and why the trade-off matters",
        "Discuss how your Redis-backed implementation handles distributed deployments — what happens if two servers process requests for the same API key simultaneously?",
        "Describe how you load tested the system — what tools you used, what throughput you achieved, and where the bottleneck was (Redis round-trip, algorithm computation, or network)",
      ],
    },
    {
      id: "cs-7",
      title: "Real-time Chat App",
      description:
        "Build a WebSocket-based messaging application with chat rooms, typing indicators, read receipts, message history with pagination, and user presence (online/offline). Persist messages in a database, handle reconnection gracefully, and implement basic message encryption for private conversations.",
      difficulty: "Intermediate",
      tools: ["Next.js", "Socket.io", "Prisma", "Redis"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A deployed real-time chat application supporting multiple rooms, private messages, and persistent history",
        "A system architecture diagram showing WebSocket connection management, message flow, and database interactions",
        "A performance analysis documenting concurrent user capacity, message latency, and reconnection behavior",
        "Experience with real-time protocols, event-driven architecture, connection state management, and message persistence patterns",
      ],
      employerValue:
        "Real-time systems power features at Slack, Discord, and every collaboration tool. Building a chat app from scratch demonstrates you understand WebSocket lifecycle management, event-driven architectures, and the challenges of state synchronization — skills that are hard to learn from tutorials alone and highly valued in backend and full-stack roles.",
      interviewTips: [
        "Explain how you handle connection drops and reconnection — what happens to messages sent while a user is offline, and how do you prevent duplicate delivery?",
        "Discuss your scaling strategy — how would you support 10,000 concurrent users? Talk about horizontal scaling with Redis pub/sub for cross-server message broadcasting",
        "Walk through the typing indicator implementation — how you debounce events, handle timeouts, and avoid flooding the server with keystroke events",
      ],
    },
    {
      id: "cs-8",
      title: "ML Model Deployment",
      description:
        "Train a machine learning model (image classifier, text sentiment, or recommendation engine), wrap it in a FastAPI REST endpoint, containerize it with Docker, and deploy it with monitoring. Implement request validation, model versioning, A/B testing between model versions, and basic performance monitoring (latency, throughput, prediction distribution).",
      difficulty: "Advanced",
      tools: ["Python", "FastAPI", "Docker", "scikit-learn", "Prometheus"],
      estimatedTime: "3 weeks",
      outcomes: [
        "A containerized ML API serving predictions with sub-200ms latency and proper error handling",
        "A CI/CD pipeline that retrains, tests, and deploys new model versions with automated rollback capability",
        "A monitoring dashboard tracking prediction latency, request volume, and model drift indicators",
        "End-to-end MLOps experience covering training, serving, containerization, versioning, and production monitoring",
      ],
      employerValue:
        "The biggest gap in ML hiring is between people who can train models in notebooks and people who can deploy them in production. This project bridges that gap explicitly. Companies need ML engineers who understand Docker, API design, monitoring, and CI/CD — not just scikit-learn. Candidates with deployed ML services skip ahead of 90% of applicants.",
      interviewTips: [
        "Walk through your deployment architecture — explain the request flow from client to prediction, how you handle model loading, and why you chose FastAPI over Flask",
        "Discuss model versioning — how you manage multiple model versions simultaneously, run A/B tests, and decide when to promote a new version to production",
        "Explain how you would detect and handle model drift — what metrics you monitor, what thresholds trigger retraining, and how you automate the retraining pipeline",
      ],
    },
  ],
  Finance: [
    {
      id: "fi-1",
      title: "Portfolio Tracker",
      description:
        "Build a real-time portfolio tracking dashboard that pulls live market data from a free API (Yahoo Finance or Alpha Vantage). Display holdings with cost basis, current value, unrealized P&L, daily change, and allocation pie charts. Add historical performance tracking with benchmark comparisons against the S&P 500.",
      difficulty: "Beginner",
      tools: ["Python", "Streamlit", "yfinance", "plotly"],
      estimatedTime: "1 week",
      outcomes: [
        "A live portfolio dashboard displaying real-time positions, P&L, allocation breakdowns, and performance charts",
        "A benchmark comparison view overlaying your portfolio's returns against the S&P 500 and a 60/40 portfolio",
        "A risk metrics panel showing portfolio beta, Sharpe ratio, and maximum drawdown calculated from historical data",
        "Practical experience with financial data APIs, portfolio math, and building interactive financial dashboards",
      ],
      employerValue:
        "Portfolio tracking tools are used daily by wealth managers, financial advisors, and investment analysts. Building one shows you understand core portfolio metrics, can work with financial data APIs, and can translate numbers into visual insights for clients — exactly the skillset entry-level finance and fintech roles look for.",
      interviewTips: [
        "Explain how you calculate key metrics — walk through your Sharpe ratio calculation, what risk-free rate you used, and why annualization matters",
        "Discuss data challenges — how you handled stock splits, dividends, missing data points on holidays, and timezone differences in market data",
        "Describe how you would extend this for a financial advisor managing 50 client portfolios — what architecture changes would be needed for multi-tenancy and performance",
      ],
    },
    {
      id: "fi-2",
      title: "Options Pricing Calculator",
      description:
        "Implement Black-Scholes and binomial tree models for European and American options pricing. Build an interactive tool that calculates option premiums and visualizes the Greeks (Delta, Gamma, Theta, Vega, Rho) as functions of underlying price, time to expiry, and volatility. Include an implied volatility solver using Newton's method.",
      difficulty: "Intermediate",
      tools: ["Python", "NumPy", "SciPy", "Streamlit"],
      estimatedTime: "2 weeks",
      outcomes: [
        "An interactive options calculator comparing Black-Scholes and binomial tree prices with configurable parameters",
        "3D surface plots showing how each Greek changes across strike prices and expiration dates simultaneously",
        "An implied volatility solver that reverse-engineers market prices to extract the market's expected volatility",
        "Deep understanding of derivatives pricing theory, numerical methods, and sensitivity analysis in finance",
      ],
      employerValue:
        "Options pricing is fundamental to every derivatives desk, risk management team, and quantitative finance role. Building the models from scratch — not just calling a library — proves you understand the mathematical foundations. Quant and trading firms specifically look for candidates who can implement numerical methods and explain the intuition behind the Greeks.",
      interviewTips: [
        "Walk through the Black-Scholes assumptions and explain which ones break down in practice — volatility smile, discrete dividends, early exercise — and how the binomial model addresses some of these",
        "Demonstrate your implied vol solver — explain why you used Newton's method, how you handled convergence issues, and how your results compare to market-quoted implied volatility",
        "Discuss a practical insight — e.g., 'I visualized Gamma near expiration and saw how it spikes for at-the-money options, which explains why market makers hedge more frequently close to expiry'",
      ],
    },
    {
      id: "fi-3",
      title: "Algorithmic Trading Bot",
      description:
        "Design, backtest, and paper-trade an algorithmic trading strategy. Implement at least two strategies (momentum and mean-reversion), build a backtesting engine that accounts for transaction costs and slippage, and compare risk-adjusted returns. Use walk-forward optimization to avoid overfitting and log all trades for analysis.",
      difficulty: "Advanced",
      tools: ["Python", "pandas", "backtrader", "matplotlib"],
      estimatedTime: "4 weeks",
      outcomes: [
        "A backtesting framework with two implemented strategies showing equity curves, drawdowns, and risk-adjusted metrics",
        "A trade log analysis revealing win rate, average profit/loss, maximum drawdown, and Sortino ratio for each strategy",
        "A walk-forward optimization report demonstrating your strategy is robust across out-of-sample time periods",
        "Experience with quantitative strategy development, backtesting methodology, risk management, and avoiding common pitfalls like survivorship bias and overfitting",
      ],
      employerValue:
        "Algorithmic trading experience is directly valued at hedge funds, proprietary trading firms, and fintech companies. More broadly, the backtesting and quantitative analysis skills transfer to any role requiring data-driven decision-making under uncertainty. Candidates who understand transaction costs, slippage, and overfitting demonstrate a sophistication that textbook-only learners lack.",
      interviewTips: [
        "Explain your backtesting methodology — how you handled look-ahead bias, survivorship bias, and why you used walk-forward optimization instead of simple train/test splits",
        "Discuss your risk management rules — position sizing, stop losses, and maximum drawdown limits — and show how they impacted overall strategy performance",
        "Be honest about what didn't work — describe a strategy that looked great in-sample but failed out-of-sample, and explain what you learned about overfitting from that experience",
      ],
    },
    {
      id: "fi-4",
      title: "Financial News Sentiment",
      description:
        "Build an NLP pipeline that ingests financial news articles and earnings call transcripts, classifies sentiment (bullish/bearish/neutral) using a fine-tuned FinBERT model, and correlates sentiment scores with subsequent stock price movements over 1-day, 5-day, and 30-day windows to test whether news sentiment has predictive alpha.",
      difficulty: "Intermediate",
      tools: ["Python", "transformers", "pandas", "plotly"],
      estimatedTime: "2-3 weeks",
      outcomes: [
        "A sentiment classification pipeline achieving 80%+ accuracy on financial text using FinBERT or similar domain-specific model",
        "A statistical analysis showing correlation (or lack thereof) between news sentiment and forward stock returns across multiple time horizons",
        "An interactive dashboard displaying sentiment trends for specific tickers alongside price charts and volume data",
        "Experience with domain-specific NLP, financial data analysis, event studies, and the efficient market hypothesis in practice",
      ],
      employerValue:
        "Alternative data analysis — especially NLP on news and filings — is one of the fastest-growing areas in quantitative finance. Asset managers and hedge funds invest heavily in sentiment signals. This project demonstrates you can build end-to-end NLP pipelines, apply them to financial data, and critically evaluate whether a signal has economic value — a key analytical mindset for buy-side research roles.",
      interviewTips: [
        "Explain why you used FinBERT instead of generic sentiment tools like VADER — discuss how financial language ('aggressive growth' is positive, 'aggressive accounting' is negative) requires domain-specific models",
        "Share your findings honestly — if sentiment was not predictive, explain why (market efficiency, speed of information incorporation) and what that teaches about alpha generation",
        "Discuss how you would extend this into a real trading signal — lag considerations, position sizing based on confidence scores, and how you would handle earnings blackout periods",
      ],
    },
    {
      id: "fi-5",
      title: "Credit Risk Model",
      description:
        "Build a credit scoring model using the Lending Club loan dataset or similar public data. Engineer features from borrower demographics, credit history, and loan characteristics. Train logistic regression and gradient boosting models, calibrate predicted probabilities, and build a scorecard that maps model outputs to traditional credit score ranges.",
      difficulty: "Intermediate",
      tools: ["Python", "scikit-learn", "XGBoost", "pandas"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A calibrated credit scoring model with AUC > 0.75, documented feature importance, and a traditional scorecard mapping",
        "ROC curves, precision-recall curves, and a profit analysis showing optimal cutoff thresholds for different risk appetites",
        "A fairness analysis checking for disparate impact across demographic groups with bias mitigation recommendations",
        "Experience with credit risk modeling, probability calibration, scorecard development, and responsible AI practices in lending",
      ],
      employerValue:
        "Credit risk modeling is a core function at every bank, credit card company, and fintech lender. This project demonstrates you understand the full modeling lifecycle — from feature engineering through calibration to business-relevant cutoff selection. The fairness analysis component is increasingly required by regulators, and candidates who address it proactively show maturity and awareness.",
      interviewTips: [
        "Walk through your feature engineering — explain which borrower attributes were most predictive of default, and how you handled missing values and categorical encoding for variables like employment length or home ownership",
        "Discuss calibration — explain why a model that says '30% default probability' needs to actually correspond to 30% defaults, and how you validated this using calibration curves",
        "Address the fairness question — what protected attributes did you check, what disparities did you find, and what techniques (reweighting, threshold adjustment) could mitigate bias without destroying model performance?",
      ],
    },
    {
      id: "fi-6",
      title: "DCF Valuation Tool",
      description:
        "Build an automated discounted cash flow valuation tool that pulls financial statements from a free API (SEC EDGAR or Financial Modeling Prep), projects future free cash flows using historical growth rates, and calculates intrinsic value with sensitivity tables for discount rate and terminal growth rate assumptions. Compare your valuation to current market price.",
      difficulty: "Beginner",
      tools: ["Python", "pandas", "yfinance", "Streamlit"],
      estimatedTime: "1 week",
      outcomes: [
        "An automated DCF tool that generates intrinsic value estimates for any publicly traded company with one click",
        "A sensitivity table showing how valuation changes across different WACC and terminal growth rate assumptions",
        "A comparison report showing your model's valuation vs. market price, analyst consensus, and comparable company multiples",
        "Practical experience with financial statement analysis, valuation methodology, and building financial modeling tools programmatically",
      ],
      employerValue:
        "DCF analysis is the most fundamental valuation technique in investment banking, equity research, and corporate finance. Automating it with code — rather than building spreadsheets manually — shows you bring technical efficiency to traditional finance workflows. Hiring managers in IB and equity research value candidates who can combine financial theory with programming skills.",
      interviewTips: [
        "Walk through your assumptions — how you projected revenue growth, operating margins, and capital expenditure, and why you chose those specific assumptions over alternatives",
        "Discuss the sensitivity analysis — show which input has the largest impact on valuation and explain why terminal value typically represents 60-80% of total DCF value",
        "Explain limitations honestly — why DCF struggles with early-stage companies, cyclical businesses, or financial firms, and what alternative valuation approaches you would use instead",
      ],
    },
    {
      id: "fi-7",
      title: "Crypto Market Analyzer",
      description:
        "Build a real-time cryptocurrency market analysis dashboard using the CoinGecko or Binance API. Track prices, 24h volume, market cap dominance, and cross-asset correlations. Implement technical indicators (RSI, MACD, Bollinger Bands) and backtest whether they have any predictive power on crypto markets compared to traditional equities.",
      difficulty: "Intermediate",
      tools: ["Python", "pandas", "plotly", "APIs"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A real-time dashboard displaying crypto prices, volume, and technical indicators with configurable timeframes",
        "A correlation matrix showing how major cryptocurrencies move relative to each other and to traditional assets (S&P 500, gold, bonds)",
        "A backtesting analysis evaluating whether RSI and MACD generate profitable signals in crypto markets vs. equities",
        "Experience with real-time data streaming, technical analysis implementation, and cross-asset comparative analysis",
      ],
      employerValue:
        "Crypto and digital asset analysis is a growing field at traditional finance firms and dedicated crypto funds alike. This project demonstrates you can work with real-time market data, implement technical indicators from scratch, and critically evaluate trading signals — skills that apply whether you end up in crypto, traditional asset management, or fintech.",
      interviewTips: [
        "Discuss your correlation findings — explain whether crypto behaves as an uncorrelated asset class or has increasing correlation with equities during market stress, and what that means for portfolio construction",
        "Walk through your technical indicator implementation — show you built RSI from the underlying math rather than calling a library, and explain what the indicator actually measures",
        "Be thoughtful about market microstructure differences — crypto trades 24/7 with no circuit breakers, which affects volatility calculations, backtesting assumptions, and risk management differently than equities",
      ],
    },
    {
      id: "fi-8",
      title: "Monte Carlo Simulator",
      description:
        "Build a portfolio risk simulation engine that models thousands of scenarios using geometric Brownian motion and historical return distributions. Calculate Value-at-Risk (VaR) and Conditional VaR (Expected Shortfall) at multiple confidence levels. Compare parametric, historical, and Monte Carlo VaR approaches and analyze when each method breaks down.",
      difficulty: "Advanced",
      tools: ["Python", "NumPy", "SciPy", "matplotlib"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A Monte Carlo engine generating 10,000+ portfolio return scenarios with correlated asset movements using Cholesky decomposition",
        "VaR and CVaR estimates at 95% and 99% confidence levels using three methods (parametric, historical, Monte Carlo) with a comparison analysis",
        "Stress test scenarios showing portfolio behavior during historical crises (2008, COVID crash, 2022 rate hikes) by shocking correlations and volatility",
        "Deep experience with stochastic simulation, risk measurement methodologies, and quantitative risk management frameworks used by banks and regulators",
      ],
      employerValue:
        "Monte Carlo simulation and VaR calculations are regulatory requirements at every bank and fund under Basel III. Risk management teams need analysts who understand these methods at the implementation level — not just conceptually. This project shows you can build the tools that risk teams depend on, making you immediately useful in quantitative risk, treasury, or compliance analytics roles.",
      interviewTips: [
        "Explain the Cholesky decomposition step — why simulating correlated asset returns requires decomposing the covariance matrix and how you validated that your simulated correlations match historical correlations",
        "Compare your three VaR methods — discuss when parametric VaR underestimates risk (fat tails, skewed returns) and why Monte Carlo gives more flexibility but at a computational cost",
        "Walk through your stress testing approach — how you shocked correlations to simulate crisis periods (correlations go to 1 in a crash) and what that revealed about the portfolio's tail risk",
      ],
    },
  ],
  Marketing: [
    {
      id: "mk-1",
      title: "Social Media Dashboard",
      description:
        "Build a unified analytics dashboard that aggregates metrics from Instagram, Twitter/X, and LinkedIn using their APIs (or exported CSV data). Display follower growth, engagement rates, post performance rankings, and optimal posting time analysis. Include week-over-week trend comparisons and content type breakdowns (video vs. image vs. text).",
      difficulty: "Beginner",
      tools: ["Python", "Streamlit", "pandas", "plotly"],
      estimatedTime: "1 week",
      outcomes: [
        "A unified dashboard displaying cross-platform metrics with follower growth curves, engagement rate trends, and top-performing posts",
        "An optimal posting time heatmap showing which days and hours generate the highest engagement for each platform",
        "A content type analysis comparing performance of videos, images, carousels, and text posts with actionable recommendations",
        "Practical experience with social media APIs, metric calculation (engagement rate, reach rate), and marketing analytics dashboards",
      ],
      employerValue:
        "Every marketing team needs someone who can pull data from multiple platforms and create unified reporting. Tools like Sprout Social and Hootsuite do this at scale, but building your own proves you understand the underlying metrics and can customize analysis beyond what off-the-shelf tools offer. This is the most directly applicable project for social media marketing and digital marketing analyst roles.",
      interviewTips: [
        "Walk through how you calculated engagement rate — explain why you used (likes + comments + shares) / impressions rather than / followers, and how the choice affects the insights you draw",
        "Share a specific finding — e.g., 'Carousel posts generated 2.3x more engagement than single images on Instagram, but text-only posts outperformed on LinkedIn by 40%'",
        "Discuss how you would automate this for a marketing team — scheduled data pulls, automated weekly email reports, and alerts when engagement drops below a threshold",
      ],
    },
    {
      id: "mk-2",
      title: "A/B Test Calculator",
      description:
        "Build a statistical significance calculator for A/B tests that goes beyond simple p-values. Implement both frequentist (chi-squared test, z-test for proportions) and Bayesian (Beta-Binomial) approaches. Visualize sample size requirements, statistical power, and the probability that each variant is the winner. Include a minimum detectable effect calculator for test planning.",
      difficulty: "Intermediate",
      tools: ["Python", "SciPy", "Streamlit", "plotly"],
      estimatedTime: "1 week",
      outcomes: [
        "An interactive A/B test analyzer supporting both frequentist and Bayesian statistical methods with clear result explanations",
        "A sample size calculator that tells marketers how long to run a test based on their baseline rate and minimum detectable effect",
        "Visualizations showing posterior distributions, confidence intervals, and the probability each variant wins over time",
        "Solid understanding of hypothesis testing, statistical power, Bayesian inference, and common A/B testing mistakes (peeking, multiple comparisons)",
      ],
      employerValue:
        "A/B testing is the backbone of data-driven marketing, product management, and growth engineering. Companies like Airbnb, Netflix, and Booking.com run thousands of experiments. Building a calculator from scratch — showing you understand the statistics, not just the tools — is a strong signal for any growth, product analytics, or marketing science role.",
      interviewTips: [
        "Explain the difference between your frequentist and Bayesian approaches — when would you recommend each to a marketing team, and what are the practical trade-offs in interpretability and speed?",
        "Discuss the peeking problem — why checking results daily inflates false positive rates, and how your tool addresses this (sequential testing, spending functions, or Bayesian continuous monitoring)",
        "Walk through a real-world scenario — 'If a marketing manager asks you to call a winner after 2 days with 500 visitors per variant, how would you explain why that is or isn't enough data?'",
      ],
    },
    {
      id: "mk-3",
      title: "Email Campaign Analyzer",
      description:
        "Build an email campaign analysis tool that imports data from Mailchimp exports (or simulated data) and identifies patterns driving open rates and click-through rates. Analyze subject line characteristics (length, emoji usage, personalization, urgency words), send time optimization, and segment performance. Build a predictive model for expected open rate given campaign parameters.",
      difficulty: "Beginner",
      tools: ["Python", "pandas", "scikit-learn", "matplotlib"],
      estimatedTime: "1 week",
      outcomes: [
        "An analysis report identifying the top 5 subject line characteristics that correlate with higher open rates in your dataset",
        "A send-time optimization chart showing the best day/hour combinations for each audience segment",
        "A simple predictive model estimating expected open rate based on subject line features, send time, and segment — with documented accuracy",
        "Experience with marketing analytics, text feature extraction, A/B test interpretation, and translating data into actionable campaign recommendations",
      ],
      employerValue:
        "Email marketing generates $36-$42 in ROI per dollar spent, making it one of the highest-value marketing channels. Companies need analysts who can optimize campaigns with data, not intuition. This project shows you can extract actionable insights from real campaign data and communicate them to non-technical marketers — a daily task in any marketing analytics role.",
      interviewTips: [
        "Share your most actionable finding — e.g., 'Subject lines with 6-10 words and a question mark had 22% higher open rates than longer subject lines, but only for the engaged subscriber segment'",
        "Discuss confounding variables — explain why you can't just say 'Tuesday sends perform best' without controlling for subject line content, audience segment, and seasonality",
        "Describe how you would set up a systematic testing framework — one variable at a time, proper holdout groups, and a testing calendar that builds institutional knowledge over months",
      ],
    },
    {
      id: "mk-4",
      title: "Brand Sentiment Tracker",
      description:
        "Build a real-time brand monitoring tool that tracks mentions across Twitter/X and Reddit using their APIs. Classify each mention as positive, negative, or neutral using VADER sentiment analysis, aggregate sentiment scores over time, and generate automated alerts when sentiment drops below a rolling average threshold. Include competitor comparison dashboards.",
      difficulty: "Intermediate",
      tools: ["Python", "VADER", "Streamlit", "plotly"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A live brand monitoring dashboard tracking mention volume, sentiment distribution, and trending topics in real-time",
        "An automated alert system that flags significant sentiment drops with the specific posts that triggered them",
        "A competitive benchmarking view comparing your brand's sentiment against 2-3 competitors over the same time period",
        "Practical experience with social listening, NLP for brand monitoring, alerting systems, and competitive intelligence workflows",
      ],
      employerValue:
        "Brand monitoring is a multi-billion dollar industry (Brandwatch, Meltwater, Sprinklr), and every marketing team tracks brand health. Building your own tool demonstrates you understand the technical pipeline behind these platforms — data collection, NLP classification, and alerting — and can customize analysis beyond what expensive SaaS tools provide. This is directly relevant to brand management, PR, and marketing analytics roles.",
      interviewTips: [
        "Explain how you handle sentiment classification challenges — sarcasm, context-dependent phrases ('sick' can be positive or negative), and why VADER performs well on social media text specifically",
        "Walk through an alert scenario — 'If sentiment drops 30% in 2 hours, what would you recommend the brand's social media team do? How do you distinguish a real crisis from normal noise?'",
        "Discuss how you would validate your sentiment scores — did you manually label a sample of posts and compare against your classifier? What was the accuracy, and where did it fail?",
      ],
    },
    {
      id: "mk-5",
      title: "SEO Audit Tool",
      description:
        "Build an automated website SEO auditor that crawls a site and evaluates on-page SEO factors. Check for missing or duplicate title tags, meta descriptions, H1 tags, image alt text, broken links (internal and external), page load indicators, mobile responsiveness, and structured data. Generate a prioritized report with specific fix recommendations and estimated traffic impact.",
      difficulty: "Intermediate",
      tools: ["Python", "BeautifulSoup", "requests", "Streamlit"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A web crawler that audits up to 100 pages and generates a scored SEO report with issues categorized by severity (critical, warning, info)",
        "A prioritized fix list with specific recommendations — e.g., 'Page /about is missing a meta description; adding one could improve CTR by 5-10%'",
        "A competitive comparison feature that audits a competitor's site alongside yours and highlights SEO gaps",
        "Experience with web scraping, HTTP requests, HTML parsing, and technical SEO fundamentals that are relevant to any digital marketing role",
      ],
      employerValue:
        "Technical SEO audits are a core service at digital marketing agencies and an ongoing need at every company with a website. Tools like Screaming Frog and Ahrefs charge hundreds per month for this functionality. Building your own shows you understand what these tools do under the hood and can customize audits for specific business needs — a valuable skill for SEO specialists, marketing technologists, and growth marketers.",
      interviewTips: [
        "Walk through your crawling approach — how you handled rate limiting to avoid overwhelming servers, how you discovered pages (sitemap.xml vs. link following), and how you handled JavaScript-rendered content",
        "Share a specific finding from auditing a real site — e.g., 'I found that 40% of the site's images were missing alt text, which was hurting both accessibility and image search traffic'",
        "Discuss how you would prioritize fixes for a marketing team with limited engineering resources — explain your framework for estimating which SEO issues have the highest traffic impact",
      ],
    },
    {
      id: "mk-6",
      title: "Content Calendar Generator",
      description:
        "Build an AI-powered content planning tool that generates post ideas, suggests optimal scheduling, and creates content themes based on audience data and trending topics. Use the OpenAI API to generate platform-specific post drafts (Twitter vs. LinkedIn vs. Instagram), incorporate seasonal trends and industry events, and allow marketers to approve, edit, or regenerate suggestions.",
      difficulty: "Advanced",
      tools: ["Python", "OpenAI API", "Streamlit", "pandas"],
      estimatedTime: "3 weeks",
      outcomes: [
        "An interactive content calendar tool that generates a full month of platform-specific post suggestions with AI-written drafts",
        "A trending topics integration that surfaces relevant industry themes and suggests timely content angles",
        "An approval workflow where marketers can accept, edit, or regenerate individual posts and export the final calendar to CSV",
        "Experience with LLM prompt engineering, API integration, content strategy frameworks, and building AI-augmented marketing tools",
      ],
      employerValue:
        "AI-powered content tools are transforming marketing workflows, and companies need people who can build and customize them rather than just use off-the-shelf solutions. This project demonstrates prompt engineering skills, understanding of platform-specific content best practices, and the ability to build practical marketing tools — a combination that is extremely in-demand at agencies, startups, and marketing technology companies.",
      interviewTips: [
        "Walk through your prompt engineering approach — how you structured prompts to generate platform-appropriate content (280 chars for Twitter, professional tone for LinkedIn) and how you iterated on prompt quality",
        "Discuss the human-in-the-loop design — why full automation isn't the goal, and how you designed the approval workflow to keep marketers in control while saving them time",
        "Explain how you would measure whether AI-generated content performs as well as human-written content — what metrics you would track and how you would set up that comparison",
      ],
    },
    {
      id: "mk-7",
      title: "Customer Segmentation",
      description:
        "Perform RFM (Recency, Frequency, Monetary) analysis and K-means clustering on customer transaction data to identify distinct customer segments. Profile each segment with demographic and behavioral characteristics, calculate customer lifetime value (CLV) for each segment, and recommend targeted marketing strategies — retention campaigns for at-risk customers, upsell campaigns for high-value customers, and reactivation campaigns for churned customers.",
      difficulty: "Intermediate",
      tools: ["Python", "scikit-learn", "pandas", "plotly"],
      estimatedTime: "2 weeks",
      outcomes: [
        "A customer segmentation model identifying 4-6 distinct segments with clear behavioral profiles and CLV estimates",
        "A visual segment map using PCA or t-SNE showing how segments separate in feature space with labeled characteristics",
        "A marketing strategy document recommending specific campaigns, messaging, and channel preferences for each segment",
        "Experience with RFM analysis, clustering evaluation (silhouette scores, elbow method), customer analytics, and translating data into marketing strategy",
      ],
      employerValue:
        "Customer segmentation is a foundational skill in marketing analytics, CRM, and growth. Every e-commerce company, SaaS business, and retailer segments their customers for targeted marketing. This project shows you can go from raw transaction data to actionable marketing recommendations — the exact workflow marketing analysts perform daily at companies like Amazon, Spotify, and HubSpot.",
      interviewTips: [
        "Walk through your RFM feature engineering — how you defined recency (days since last purchase), frequency (purchase count), and monetary (total spend), and why these three dimensions capture customer behavior effectively",
        "Discuss your cluster selection process — how you used the elbow method and silhouette scores to choose the number of segments, and why you rejected alternatives (e.g., 3 clusters were too broad, 8 were too granular)",
        "Present a specific segment with a concrete marketing recommendation — e.g., 'Segment 3 contains high-frequency, low-monetary customers who buy cheap items often — a bundling discount campaign could increase their average order value by 20%'",
      ],
    },
    {
      id: "mk-8",
      title: "Influencer Finder",
      description:
        "Build a tool to identify and rank relevant influencers for a given brand niche. Scrape or use APIs to collect follower counts, engagement rates, content topics, and audience demographics. Calculate an influencer score based on relevance, engagement quality (not just follower count), and estimated cost-per-engagement. Flag potential fake followers using engagement-to-follower ratio analysis.",
      difficulty: "Advanced",
      tools: ["Python", "APIs", "pandas", "scikit-learn"],
      estimatedTime: "3 weeks",
      outcomes: [
        "An influencer discovery tool that ranks creators by a composite score balancing relevance, engagement quality, and cost efficiency",
        "A fake follower detection system using statistical anomalies in engagement patterns (uniform like counts, bot-like comment analysis)",
        "A comparison report benchmarking 10 influencers in a specific niche with ROI projections based on historical campaign data",
        "Experience with social media APIs, web scraping, composite scoring systems, and influencer marketing analytics",
      ],
      employerValue:
        "Influencer marketing is a $21+ billion industry, and brands waste significant budget on influencers with fake followers or misaligned audiences. This project shows you can build data-driven influencer selection tools that save companies money and improve campaign ROI. Marketing agencies and brand-side marketing teams both value analysts who can bring quantitative rigor to influencer partnerships.",
      interviewTips: [
        "Explain your scoring methodology — how you weighted engagement rate vs. follower count vs. content relevance, and why engagement rate alone is insufficient (niche micro-influencers vs. broad macro-influencers)",
        "Walk through your fake follower detection — what statistical patterns suggest purchased followers (sudden follower spikes, abnormally uniform engagement, generic comment patterns) and how accurate your detection was",
        "Discuss how you would measure campaign ROI after selecting influencers — what tracking mechanisms (UTM codes, promo codes, post-campaign surveys) you would recommend and how you would attribute conversions",
      ],
    },
  ],
};

const genericRecommendations: Recommendation[] = [
  {
    id: "gen-1",
    title: "Club Website",
    description:
      "Build a professional website for your club using Next.js and Tailwind CSS. Include member profiles with skills and project portfolios, an event listing page with RSVP functionality, a project showcase gallery, and a blog for sharing club updates and tutorials. Deploy it to Vercel and set up a custom domain.",
    difficulty: "Beginner",
    tools: ["Next.js", "Tailwind CSS", "Vercel", "Prisma"],
    estimatedTime: "2 weeks",
    outcomes: [
      "A deployed, responsive club website with member profiles, event listings, and project showcase sections",
      "A content management workflow allowing officers to post updates and members to edit their own profiles",
      "Documentation covering the site architecture, deployment process, and instructions for future officers to maintain it",
      "Experience with modern web development, responsive design, deployment, and building for a real user base (your club members)",
    ],
    employerValue:
      "Building a real website for a real organization — not a tutorial project — shows initiative and the ability to gather requirements from stakeholders (club officers and members). Employers in web development and product roles value candidates who have shipped something people actually use, and a club website with real traffic is a strong portfolio piece.",
    interviewTips: [
      "Discuss how you gathered requirements from club members — what features they wanted, what you prioritized in the MVP, and what you deferred to a later version",
      "Explain a technical decision you made — e.g., why you chose static generation for event pages vs. server-side rendering, and how it affected performance",
      "Talk about the handoff process — how you documented the codebase so future club officers can maintain and update the site without your help",
    ],
  },
  {
    id: "gen-2",
    title: "Event Management System",
    description:
      "Build a digital event management platform for your club with RSVP tracking, QR code check-ins, automated email reminders, post-event feedback surveys, and attendance analytics. Track which members attend regularly, which events have the highest engagement, and generate semester reports for club leadership.",
    difficulty: "Intermediate",
    tools: ["Next.js", "Prisma", "SendGrid", "QRCode.js"],
    estimatedTime: "2-3 weeks",
    outcomes: [
      "A complete event management system with RSVP, QR check-in, automated reminders, and feedback collection",
      "An analytics dashboard showing attendance trends, member engagement scores, and event popularity rankings",
      "Automated email workflows for event reminders (24h before), follow-up surveys (day after), and monthly digest emails",
      "Full-stack development experience including database design, email integration, QR code generation, and building internal tools for a real organization",
    ],
    employerValue:
      "Internal tools and workflow automation are valuable at every company. This project demonstrates you can identify a real operational pain point, build a complete solution, and measure its impact with data. Product management, operations, and software engineering roles all value candidates who build tools that other people actually rely on.",
    interviewTips: [
      "Walk through your database schema — how you modeled the relationship between events, RSVPs, check-ins, and feedback, and what queries power the analytics dashboard",
      "Discuss the email automation architecture — how you trigger reminders, handle bounces, and ensure emails don't go to spam (SPF/DKIM setup)",
      "Share a metric from actual usage — e.g., 'After implementing the system, RSVP-to-attendance rate improved from 60% to 85% because of automated reminders'",
    ],
  },
  {
    id: "gen-3",
    title: "Member Directory",
    description:
      "Build a searchable member directory where club members create profiles with their skills, interests, course history, project experience, and availability for collaboration. Implement fuzzy search, skill-based filtering, and a 'find a collaborator' matching feature that suggests members with complementary skills for a given project idea.",
    difficulty: "Beginner",
    tools: ["Next.js", "Prisma", "Tailwind CSS", "Fuse.js"],
    estimatedTime: "1 week",
    outcomes: [
      "A searchable member directory with profiles, skill tags, and a fuzzy search that handles typos and partial matches",
      "A collaborator matching feature that suggests members with complementary skills based on a project description",
      "An admin panel for club officers to manage members, export contact lists, and view skill distribution analytics",
      "Experience with search implementation, filtering UX, database queries, and building practical internal tools",
    ],
    employerValue:
      "Directory and search features are fundamental to countless products — from LinkedIn to internal company wikis. Building one with fuzzy search and matching algorithms shows you understand information retrieval concepts and can build user-friendly search experiences. This is relevant to any product engineering, full-stack, or UX engineering role.",
    interviewTips: [
      "Explain your search implementation — why you chose fuzzy matching (Fuse.js) over exact search, how you weighted different fields (name vs. skills vs. interests), and how you optimized search performance",
      "Discuss the matching algorithm — how you determine 'complementary skills' and what similarity metric you used to suggest collaborators",
      "Talk about data modeling decisions — how you structured skill tags (free-text vs. predefined taxonomy), and the trade-offs of each approach for search quality",
    ],
  },
  {
    id: "gen-4",
    title: "Knowledge Base",
    description:
      "Build a club wiki and learning resource platform using MDX for content. Let members contribute tutorials, project write-ups, and reference guides. Implement categories, tags, search, and a voting system so the best resources surface to the top. Include a 'learning path' feature that sequences resources from beginner to advanced for specific topics.",
    difficulty: "Intermediate",
    tools: ["Next.js", "MDX", "Prisma", "Tailwind CSS"],
    estimatedTime: "2 weeks",
    outcomes: [
      "A deployed knowledge base with member-contributed articles, categorized by topic with tags and full-text search",
      "A learning path feature that sequences tutorials from beginner to advanced for at least 3 club-relevant topics",
      "A content contribution workflow with Markdown editing, preview, and officer approval before publishing",
      "Experience with content management systems, MDX rendering, search indexing, and building community-driven platforms",
    ],
    employerValue:
      "Knowledge management platforms are used by every engineering organization (Notion, Confluence, GitBook), and building one demonstrates you understand content architecture, search, and community contribution workflows. This is directly relevant to developer experience, technical writing, and product engineering roles where internal tooling is valued.",
    interviewTips: [
      "Discuss your content architecture — how you structured categories, tags, and learning paths, and how you ensured contributors follow consistent formatting and quality standards",
      "Explain the voting and ranking system — how you surface the best resources and prevent low-quality content from cluttering the platform",
      "Talk about adoption — how many members contributed content, what you did to encourage contributions, and how you measured whether the knowledge base was actually useful to members",
    ],
  },
  {
    id: "gen-5",
    title: "Budget Tracker",
    description:
      "Build a club finance management tool that tracks income (dues, fundraisers, university allocations) and expenses (events, supplies, subscriptions). Categorize transactions, generate visual budget reports, compare actual vs. planned spending, and forecast remaining budget through the end of the semester. Include an officer approval workflow for expense requests.",
    difficulty: "Beginner",
    tools: ["Next.js", "Prisma", "Chart.js", "Tailwind CSS"],
    estimatedTime: "1-2 weeks",
    outcomes: [
      "A budget tracking application with transaction entry, categorization, and an officer approval workflow for expenses",
      "Visual reports showing spending by category, actual vs. planned budget, and a semester-end budget forecast",
      "An export feature generating treasurer reports suitable for university club oversight requirements",
      "Experience with financial data handling, role-based access control, approval workflows, and building tools that serve a real organizational need",
    ],
    employerValue:
      "Financial tracking and reporting tools are needed at every organization. Building one demonstrates you can handle sensitive data with proper access controls, create clear financial visualizations, and build approval workflows — skills relevant to fintech, enterprise software, and operations roles. The fact that it serves a real organization adds credibility.",
    interviewTips: [
      "Walk through your role-based access control — how you ensured only officers can approve expenses, how you implemented the approval workflow, and how you handled edge cases (what if an officer submits their own expense?)",
      "Discuss your budget forecasting approach — how you projected remaining spend based on historical patterns and planned events",
      "Talk about real usage — how the treasurer used the tool, what feedback they gave, and what features you added or changed based on that feedback",
    ],
  },
];

// Deterministic shuffle using a seed (Fisher-Yates with seeded random)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Simple LCG for deterministic randomness
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = (s >>> 0) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const club = await prisma.club.findUnique({ where: { slug } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Build pool from domain-specific + generic recommendations
    const pool =
      club.domain && domainRecommendations[club.domain]
        ? [...domainRecommendations[club.domain], ...genericRecommendations]
        : genericRecommendations;

    // Deterministic seed based on club ID + current week number
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const clubSeed = club.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = clubSeed + weekNumber;

    const shuffled = seededShuffle(pool, seed);
    const count = Math.min(shuffled.length, 8);
    const recommendations = shuffled.slice(0, Math.max(count, 5));

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Club recommendations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
