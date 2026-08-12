# SeeAI SEO + Generative Search Strategy — v0.2

## 1. Core principle

SeeAI does **not** treat GEO as a separate bag of hacks.

For Google, current official guidance says generative-search visibility still depends on the normal Search index, ranking systems, crawlability, useful original content, page experience, and established SEO practices.

This means SeeAI should optimize for:

1. humans learning the concept;
2. search engines understanding the page;
3. AI search systems being able to retrieve and accurately cite the same public content.

## 2. What v0.2 implements

### Crawlability

Each lesson has a stable public HTML URL and does not require login:

```text
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
```

The conceptual explanation is present in the server-delivered HTML. JavaScript is used to enhance the simulation, not to hide the core knowledge.

### Answer-first content

Every lesson begins with:

```text
In one sentence
```

This is written for humans first, while also making the main concept unambiguous and easy to retrieve.

### Non-commodity content

The unique value is not another definition article. Each page combines:

```text
visual model
+ interactive simulation
+ engineering trade-offs
+ build challenge
+ durable concept guide
```

That combination is the primary content moat.

### Clear semantic structure

Each lesson contains:

```text
H1
Quick answer
Interactive lab
Key takeaways
Build challenge
Concept guide
Common questions
Review / simulation note
```

### Structured data

v0.2 uses:

- Organization
- WebSite
- WebPage
- LearningResource (semantic schema; not a guaranteed Google rich-result feature)
- BreadcrumbList
- ItemList

#### Why Course markup was removed

Google's Course-list feature has stricter eligibility requirements than simply having an educational page. The MVP lessons are interactive learning resources, not yet a formal instructor-led course with the full commercial/educational structure described in Google's Course guidelines.

We should re-evaluate `Course` markup only when SeeAI has an actual structured course/program that satisfies the relevant requirements.

### Canonicals + hreflang

All public pages have:

- canonical
- `hreflang=en`
- `x-default`

When additional languages ship, each locale should point to its translated equivalents.

### Sitemap

`/sitemap.xml` contains the six public MVP URLs and last-modified dates.

### Robots

`robots.txt` allows normal public crawling and advertises the sitemap.

## 3. llms.txt policy

`llms.txt` remains in the project only as an optional machine-readable index for systems that may voluntarily use it.

It is **not** treated as a Google GEO requirement or ranking mechanism.

The canonical HTML pages remain the source of truth.

## 4. Bing / AI citations

Bing Webmaster Tools now exposes AI Performance metrics such as citation counts, cited pages, and grounding query phrases.

After launch we should track:

- which lesson URLs are cited;
- which grounding queries retrieve them;
- whether cited pages have stronger clarity/depth than uncited pages;
- whether AI referral traffic completes lessons or joins early access.

## 5. Content template for future lessons

Every new lesson should answer:

```text
What is it?
How does it work?
What can I change?
What happens when I change it?
What trade-off does this create?
Where does this appear in a production AI system?
What is commonly misunderstood?
```

Then provide a genuinely interactive or visual experience that cannot be reproduced by a generic definition page.

## 6. Future content clusters

Potential clusters:

### LLM Foundations

- tokenization
- next-token prediction
- sampling
- temperature
- structured output

### Context Engineering

- context windows
- memory
- summarization
- prompt caching
- context compression

### RAG

- embeddings
- chunking
- vector search
- retrieval
- reranking
- evaluation

### Agents

- tool calling
- agent loop
- ReAct
- planning
- error recovery
- MCP
- multi-agent

### Production AI

- evaluation
- observability
- guardrails
- cost
- latency
- model routing
- caching

Do not generate hundreds of thin query-variant pages. Build one strong interactive resource per important concept and expand only when user demand supports it.

## 7. Post-launch checklist

### Google

- verify production domain in Search Console;
- submit sitemap;
- inspect each lesson URL;
- test structured data;
- monitor Core Web Vitals;
- monitor Search / Generative AI performance where available.

### Bing

- verify production domain in Bing Webmaster Tools;
- submit sitemap;
- optionally configure IndexNow only after the public verification key file has been deployed;
- monitor AI Performance citations and grounding queries.

### Product analytics

Connect organic/AI acquisition to:

```text
lesson_started
lesson_completed
second_lesson_started
pricing_intent
waitlist_submit
```

Visibility without learning or conversion is not product validation.

## 8. Official references reviewed for v0.2

- Google Search Central — Optimizing for generative AI features on Google Search
- Google Search Central — Introduction to structured data
- Google Search Central — Course list structured data
- Google Search Central — Sitemaps / SEO Starter Guide
- Bing Webmaster Blog — AI Performance in Bing Webmaster Tools

Review these again before major SEO architecture changes because search guidance evolves quickly.
