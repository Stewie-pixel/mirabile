export function buildStructurePrompt(
  careerGoal: string,
  targetCompany: string,
  timeline: string
): string {
  return `You are a senior technical career advisor. Generate a career roadmap structure.

## CONTEXT
- Career Goal: ${careerGoal}
- Target Company: ${targetCompany}
- Timeline: ${timeline}

## COMPANY-SPECIFIC REASONING
Before generating, reason internally about:
- ${targetCompany}'s known tech stack and which technologies are actively used
- ${targetCompany}'s engineering culture, values, and interview format
- The most in-demand skills for ${careerGoal} roles at ${targetCompany} specifically
- Do NOT recommend technologies that are outdated, rarely used, or peripheral to the role at ${targetCompany}

## STRUCTURE RULES
- Generate EXACTLY 6 phases in this fixed order:
  1. Foundation
  2. Intermediate
  3. Advanced
  4. Data Structures & Algorithms
  5. System Architecture
  6. Interview Preparation
- Each phase must have EXACTLY 3 steps (18 steps total)
- Difficulty per phase:
  - Foundation → beginner
  - Intermediate → intermediate
  - Advanced, DSA, System Architecture → advanced
  - Interview Preparation → advanced
- Distribute the ${timeline} proportionally across all 6 phases
- Return ONLY valid JSON, no markdown, no explanation

## OUTPUT FORMAT
{
  "phases": [
    {
      "name": "Phase Name",
      "description": "2-3 sentences on what this phase covers and what success looks like at ${targetCompany}",
      "duration": "Proportional duration from ${timeline}",
      "order": 1
    }
  ],
  "steps": [
    {
      "phase": "Foundation",
      "title": "Step title",
      "description": "3 sentences: what to learn, why it matters at ${targetCompany}, and one concrete deliverable",
      "difficulty": "beginner|intermediate|advanced",
      "estimated_time": "Specific estimate",
      "step_order": 1
    }
  ]
}`;
}

export function buildResourcesPrompt(
  careerGoal: string,
  targetCompany: string,
  stepsSummary: string
): string {
  return `You are a senior technical career advisor. Generate learning resources for a career roadmap targeting ${targetCompany} for the role: ${careerGoal}.

## STEPS TO GENERATE RESOURCES FOR
${stepsSummary}

## RULES
- For each step_order, generate EXACTLY 4 resources: one article, one course, one documentation, one video
- Resources must be specific to ${targetCompany}'s tech stack and the step topic
- NEVER fabricate URLs. Only use URLs you are highly confident are real and accessible
- For Data Structures & Algorithms steps: link to LeetCode tag pages (e.g., https://leetcode.com/tag/dynamic-programming/) or NeetCode (https://neetcode.io)
- For Interview Preparation steps: include ${targetCompany} engineering blog, Glassdoor, and verified YouTube interview prep channels
- Resources must not be older than 5 years unless timeless (e.g., CLRS, official RFCs)
- Return ONLY valid JSON, no markdown, no explanation

## CRITICAL RESOURCE DIVERSITY RULES — READ BEFORE GENERATING ANYTHING
These rules are mandatory. Violating any of them makes the output invalid.

1. PLATFORM UNIQUENESS PER STEP: For each step, all 3 resources must come from 3 completely different platforms. Never use the same platform twice in the same step (e.g. two YouTube videos, or two Coursera courses = invalid).

2. GLOBAL PLATFORM SPREAD: Across all 54 resources, no single platform may appear more than 2 times total. Count as you go. If a platform has hit its limit, skip it and pick another.

3. TYPE UNIQUENESS PER STEP: Each step's 3 resources must have 3 different resource_type values. No two resources in the same step may share the same type.

4. NO FALLBACK REPEATING: If a URL or resource cannot be confirmed, do NOT reuse a resource from a previous step as a substitute. Pick a completely different platform and source instead.

5. COMPANY CHANNEL PRIORITY: If ${targetCompany} has an official YouTube channel or engineering blog, it must appear at least once across the full roadmap. Do not use it more than 3 times.

## APPROVED SOURCES ONLY
Only use sources from this list. If a source doesn't have what you need, move to the next one — never fabricate.

### Practice & Algorithms
- https://leetcode.com
- https://neetcode.io
- https://www.hackerrank.com
- https://www.codewars.com
- https://exercism.org

### System Design
- https://github.com/donnemartin/system-design-primer
- https://www.hellointerview.com
- https://bytebytego.com
- https://highscalability.com
- https://martinfowler.com

### Learning Platforms
- https://www.coursera.org
- https://frontendmasters.com
- https://egghead.io
- https://www.freecodecamp.org
- https://cs50.harvard.edu
- https://missing.csail.mit.edu
- https://www.codecademy.com
- https://www.khanacademy.org
- https://www.datacamp.com

### Official Documentation
- https://developer.mozilla.org
- https://docs.python.org
- https://go.dev/doc
- https://www.typescriptlang.org/docs
- https://react.dev
- https://nodejs.org/en/docs
- https://kubernetes.io/docs
- https://docs.docker.com
- https://aws.amazon.com/documentation
- https://cloud.google.com/docs
- https://learn.microsoft.com/en-us/azure

1. Frontend Engineer
- https://react.dev
- https://www.typescriptlang.org/docs
- https://developer.mozilla.org
- https://vitejs.dev/guide
- https://nextjs.org/docs
- https://tailwindcss.com/docs
- https://redux.js.org
- https://tanstack.com/query/latest
- https://graphql.org/learn
- https://jestjs.io/docs/getting-started
- https://testing-library.com/docs
- https://playwright.dev/docs/intro
- https://webpack.js.org/concepts
2. Backend Engineer
- https://nodejs.org/en/docs
- https://docs.python.org
- https://go.dev/doc
- https://docs.oracle.com/javase
- https://docs.spring.io/spring-boot/docs/current/reference/html
- https://fastapi.tiangolo.com
- https://expressjs.com/en/guide/routing.html
- https://www.django-rest-framework.org
- https://grpc.io/docs
- https://kafka.apache.org/documentation
- https://rabbitmq.com/documentation.html
- https://redis.io/docs
3. Data Scientist / ML Engineer
- https://docs.python.org
- https://pytorch.org/docs/stable/index.html
- https://www.tensorflow.org/api_docs
- https://scikit-learn.org/stable/documentation.html
- https://pandas.pydata.org/docs
- https://numpy.org/doc
- https://spark.apache.org/docs/latest
- https://airflow.apache.org/docs
- https://dbt-labs.com/docs
- https://huggingface.co/docs
- https://mlflow.org/docs/latest/index.html
4. DevOps / Platform Engineer
- https://kubernetes.io/docs
- https://docs.docker.com
- https://aws.amazon.com/documentation
- https://cloud.google.com/docs
- https://learn.microsoft.com/en-us/azure
- https://www.terraform.io/docs
- https://docs.ansible.com
- https://prometheus.io/docs/introduction/overview
- https://grafana.com/docs
- https://www.jenkins.io/doc
- https://docs.github.com/en/actions
- https://helm.sh/docs
5. Mobile Engineer
- https://developer.apple.com/documentation
- https://developer.android.com/docs
- https://reactnative.dev/docs/getting-started
- https://docs.flutter.dev
- https://swift.org/documentation
- https://kotlinlang.org/docs/home.html
6. Database Engineer
- https://www.postgresql.org/docs
- https://dev.mysql.com/doc
- https://www.mongodb.com/docs
- https://redis.io/docs
- https://cassandra.apache.org/doc/latest
- https://clickhouse.com/docs
- https://www.elastic.co/guide/index.html
7. CyberSecurity Engineer
- https://owasp.org/www-project-top-ten
- https://cheatsheetseries.owasp.org
- https://nvd.nist.gov
- https://docs.snyk.io
- https://www.vaultproject.io/docs

### Company Engineering Blogs
- https://engineering.fb.com
- https://blog.google/technology
- https://www.amazon.science/blog
- https://netflixtechblog.com
- https://eng.uber.com
- https://slack.engineering
- https://dropbox.tech

### Video Learning (YouTube only)
- https://www.youtube.com/@TechWithTim
- https://www.youtube.com/@Fireship
- https://www.youtube.com/@NeetCode
- https://www.youtube.com/@WebDevSimplified
- https://www.youtube.com/@husseinalnasser
- https://www.youtube.com/@ByteByteGo
- https://www.youtube.com/@FreeCodeCamp
- https://www.youtube.com/@TechLead
- https://www.youtube.com/@CSDojo
- https://www.youtube.com/@Statquest
- https://www.youtube.com/@MIT
- https://www.youtube.com/@Harvard
- https://www.youtube.com/@Stanford
- https://www.youtube.com/@Google
- https://www.youtube.com/@AmazonWebServices
- https://www.youtube.com/@MicrosoftAzure
- https://www.youtube.com/@AWS
- https://www.youtube.com/@CloudGoogle
- https://www.youtube.com/@Microsoft
- https://www.youtube.com/@Apple

#### Google
- https://www.youtube.com/@GoogleDevelopers          — Google tech, AI, cloud, mobile, web
- https://www.youtube.com/@Android                   — Android platform updates and best practices
- https://www.youtube.com/@Google                    — Google product announcements and engineering
- https://www.youtube.com/@ChromeDevelopers          — Chrome, web standards, and browser APIs
- https://www.youtube.com/@GoogleCloudTech           — Google Cloud architecture and tutorials
- https://www.youtube.com/@TensorFlow                — TensorFlow and ML engineering
- https://www.youtube.com/@googledeepmind            — DeepMind AI research

#### Meta
- https://www.youtube.com/@MetaDevelopers            — Meta platform, AR/VR, AI tools

#### Microsoft
- https://www.youtube.com/@MicrosoftDeveloper        — Azure, .NET, VS Code, TypeScript, DevOps
- https://www.youtube.com/@visualstudio              — Visual Studio tooling and productivity
- https://www.youtube.com/@AzureDevOps               — CI/CD, pipelines, and Azure DevOps

#### Amazon / AWS
- https://www.youtube.com/@awsdevelopers            — Hands-on AWS tutorials and builder content
- https://www.youtube.com/@AmazonWebServices         — AWS announcements and architecture deep dives

#### Apple
- https://www.youtube.com/@AppleDeveloper            — WWDC sessions, Swift, SwiftUI, Xcode

#### Netflix
- https://www.youtube.com/@WeAreNetflix        — Chaos engineering, infra, scale, experimentation

#### LinkedIn
- https://www.youtube.com/@LinkedInEngineering       — Engineering talks, data infra, distributed systems

#### GitHub
- https://www.youtube.com/@GitHub                    — GitHub Actions, Copilot, open source, DevOps

#### Vercel / Next.js
- https://www.youtube.com/@VercelHQ                  — Next.js, frontend performance, edge computing

#### Cloudflare
- https://www.youtube.com/@CloudflareDevelopers      — Edge networking, Workers, security engineering

### Interview Prep
- https://www.youtube.com/@LifeatGoogle
- https://www.youtube.com/@awsdevelopers
- https://www.youtube.com/@WorkingAtMicrosoft
- https://www.glassdoor.com.au/Reviews/index.htm?
- https://interviewing.io
- https://www.pramp.com
- https://techinterviewhandbook.org

### Books
- https://www.crackingthecodinginterview.com
- https://dataintensive.net
- https://bytebytego.com

## OUTPUT FORMAT
{
  "resources": [
    {
      "step_id": 1,
      "resource_type": "article|course|documentation|video",
      "media_platform": "YouTube|Learning Platform|Official Docs|LeetCode|etc.",
      "title": "Specific Resource Title",
      "url": "https://approved-source.com/specific-path",
      "description": "2 sentences: what this covers and exactly how it helps with this step at ${targetCompany}."
    }
  ]
}`;
}