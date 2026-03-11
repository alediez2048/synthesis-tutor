Synthesis Tutor
Building an AI-Powered Interactive Fractions Learning Experience

Before You Start: Pre-Search (2 Hours)
Before writing any code, complete the Pre-Search methodology at the end of this document. This structured process uses AI to explore your repository, agent frameworks, evaluation strategies, and observability tooling. Your Pre-Search output becomes part of your final submission.
This week emphasizes systematic agent development with rigorous evaluation. Pre-Search helps you choose the right framework, eval approach, and observability stack for your domain.
Background
Synthesis Tutor reimagines math education by making learning feel like exploration rather than homework. The original product combines conversational AI with interactive digital manipulatives to teach fraction concepts through guided discovery.
The gap between a working prototype and a production tutor is massive: evaluation frameworks, verification systems, observability, error handling, and systematic testing. This project requires you to build a tutor agent that actually works reliably in a high-stakes domain — children's education — where wrong answers erode trust and bad pedagogy does real harm.
This project requires you to build production-grade AI tutor infrastructure, then extend it with interactive fraction manipulatives and a guided lesson flow. The focus is on AI-first development methodology — using coding agents, MCPs, and structured AI workflows throughout the build process.
You will contribute to the ed-tech space by building a domain-specific agentic tutor on modern AI infrastructure.
Gate: Project completion + interviews required for Austin admission.
Project Overview
One-week sprint with three deadlines:
CheckpointDeadlineFocusPre-Search2 hours after receiving the projectArchitecture, PlanMVPTuesday (24 hours)Basic agent with tool useEarly SubmissionFriday (4 days)Eval framework + observabilityFinalSunday (7 days)Production-ready + polished UX
MVP Requirements (24 Hours)
Hard gate. All items required to pass:

 Conversational chat interface with LLM-powered tutor responses
 At least 3 functional tools the tutor agent can invoke
 Tool calls execute successfully and return structured results
 Agent synthesizes tool results into coherent, child-friendly responses
 Interactive digital workspace for fraction visualization
 Visual fraction blocks that can be created and manipulated
 Conversation history maintained across turns
 Basic error handling (graceful failure, not crashes)
 At least one domain-specific verification check (math correctness)
 Simple evaluation: 5+ test cases with expected outcomes
 Deployed and publicly accessible

A simple agent with reliable tool execution and correct math beats a complex tutor that hallucinates fractions or fails unpredictably.
Core Tutor Architecture
Agent Components
ComponentRequirementsReasoning EngineLLM with structured output, chain-of-thought capability, and function callingTool RegistryDefined tools with schemas, descriptions, and execution logic for fraction operationsMemory SystemConversation history, student progress tracking, lesson state persistenceOrchestratorDecides when to use tools, handles multi-step reasoning, manages lesson flow transitionsVerification LayerMath correctness checks before returning responses to studentsOutput FormatterStructured responses with child-friendly language, encouragement, and visual cuesRAG ModuleRetrieves relevant fraction pedagogy, scaffolding strategies, and common misconceptions
Tutor Persona & Constraints
AspectRequirementsToneWarm, encouraging, curious — like a patient older sibling, not a lecturerLanguage LevelAge-appropriate for 8-12 year olds; avoid jargon, use concrete examplesError HandlingNever say "wrong" — reframe as "let's think about that differently"Math AccuracyAll fraction operations must be mathematically verified before presenting to studentScaffoldingBreak complex concepts into small steps; provide hints before answersExplorationPrefer guiding questions over direct instruction; let students discover patterns
Required Tools (Minimum 5)
Build domain-appropriate tools for fraction manipulation and tutoring. Each tool must have a defined schema, description, and execution logic.
Fraction Manipulation Tools
create_fraction_blocks(numerator, denominator)
  → { visual: BlockRepresentation, fraction: string, decimal: number }

split_fraction_block(fraction, num_parts)
  → { original: Fraction, parts: Fraction[], visual: BlockRepresentation }

combine_fraction_blocks(fractions[])
  → { result: Fraction, visual: BlockRepresentation, steps: string[] }

find_equivalent_fraction(numerator, denominator, target_denominator)
  → { original: Fraction, equivalent: Fraction, explanation: string }

simplify_fraction(numerator, denominator)
  → { original: Fraction, simplified: Fraction, factor: number }
Assessment & Comparison Tools
compare_fractions(fraction_a, fraction_b)
  → { result: "greater" | "less" | "equal", explanation: string, visual: ComparisonVisual }

check_answer(student_answer, correct_answer, problem_context)
  → { correct: boolean, feedback: string, hint?: string, next_step?: string }
Pedagogy & RAG Tools
get_scaffolding_strategy(concept, student_performance)
  → { strategy: string, examples: Example[], common_mistakes: string[] }

retrieve_lesson_context(topic, difficulty_level)
  → { explanation: string, worked_examples: Example[], misconceptions: string[] }
Evaluation Criteria
CommandExpected Result"Show me what 1/2 looks like"Creates visual fraction block for 1/2"Is 2/4 the same as 1/2?"Calls compare_fractions, shows visual equivalence"Split 1/2 into fourths"Calls split_fraction_block, shows 2/4 visual"What's 1/3 + 1/3?"Calls combine_fraction_blocks, returns 2/3 with stepsMulti-step: "Find a fraction equal to 3/6"Plans steps, calls simplify or find_equivalent
Lesson Flow & Pedagogy
Lesson Phases
PhaseRequirementsIntroductionTutor introduces the concept with a real-world scenario (e.g., "Imagine splitting a pizza...")ExplorationStudent freely manipulates fraction blocks with tutor guidance; tutor asks probing questionsGuided PracticeTutor presents specific problems; provides scaffolding based on student responsesAssessmentSeries of problems to check understanding; branching based on performanceWrap-UpSummary of what was learned; positive reinforcement; preview of next concept
Branching Logic
Student PerformanceTutor ResponseCorrect on first tryPraise → increase difficulty → advance to next conceptCorrect after hintAcknowledge growth → provide similar problem to reinforce → then advanceIncorrect onceGentle redirect → provide visual hint → let student try againIncorrect twiceBreak problem into smaller steps → walk through with manipulativesIncorrect three timesSwitch to direct instruction with concrete example → rephrase conceptDisengaged / off-topicGently redirect with an engaging question tied to the concept
RAG Knowledge Base
Build a small but focused knowledge base covering:

Fraction equivalence concepts — what makes fractions equivalent, common representations
Common misconceptions — "bigger denominator means bigger fraction," treating numerator and denominator as separate numbers
Scaffolding strategies — concrete-representational-abstract (CRA) progression, worked examples
Age-appropriate explanations — pizza slices, chocolate bars, measuring cups as fraction contexts
Assessment rubrics — what constitutes understanding vs. memorization at each difficulty level

The RAG pipeline should retrieve relevant pedagogical context before the tutor generates responses, grounding the tutor's teaching strategy in established math education practices.
Evaluation Framework (Required)
Production agents require systematic evaluation. Build an eval framework that tests:
Eval TypeWhat to TestCorrectnessDoes the tutor return mathematically accurate information? Fact-check all fraction operationsTool SelectionDoes the agent choose the right tool for each student query?Tool ExecutionDo tool calls succeed? Are parameters correct?SafetyDoes the agent refuse inappropriate requests? Avoid hallucination?Pedagogical QualityAre explanations age-appropriate? Does the tutor scaffold effectively?ConsistencySame input → same quality of output? Deterministic where expected?Edge CasesHandles missing data, invalid fractions (0/0), ambiguous student input?LatencyResponse time within acceptable bounds for interactive tutoring?
Eval Dataset Requirements
Create a minimum of 50 test cases:

20+ happy path scenarios — standard fraction questions with expected tutor behavior
10+ edge cases — invalid fractions, very large numbers, boundary conditions (0/1, 1/1)
10+ adversarial inputs — attempts to confuse the tutor, off-topic questions, prompt injection attempts
10+ multi-step reasoning scenarios — problems requiring multiple tool calls and sequential reasoning

Each test case must include: input query, expected tool calls, expected output characteristics, and pass/fail criteria.
Observability Requirements
Implement observability to debug and improve your tutor agent:
CapabilityRequirementsTrace LoggingFull trace of each request: student input → reasoning → tool calls → verification → outputLatency TrackingTime breakdown: LLM calls, tool execution, RAG retrieval, total response timeError TrackingCapture and categorize failures, stack traces, contextToken UsageInput/output tokens per request, cost tracking per sessionEval ResultsHistorical eval scores, regression detection across iterationsStudent Interaction LoggingTrack lesson progress, answer patterns, time-on-task, hint usage
Observability Dashboard
Build or configure a dashboard showing:

Request traces with full tool call chains
Latency percentiles (p50, p95, p99)
Error rates by category
Token usage and cost trends
Eval pass rates over time

Verification Systems
High-stakes domains (children's education) require verification before responses are returned:
Required Verification (Implement 3+)
Verification TypeImplementationMath CorrectnessProgrammatically verify all fraction operations (addition, equivalence, simplification) before presenting to studentFraction ValidationEnsure fractions are valid (no zero denominators, proper form where expected)Pedagogical AppropriatenessCheck that language is age-appropriate, explanations match difficulty levelConfidence ScoringQuantify certainty of responses; surface low-confidence answers for reviewOutput ValidationSchema validation, format checking, ensure all required response fields are presentHuman-in-the-LoopEscalation triggers for edge cases the tutor can't handle confidently
Performance Targets
MetricTargetEnd-to-end latency<3 seconds for single-tool queriesMulti-step latency<8 seconds for 3+ tool chainsTool success rate>95% successful executionEval pass rate>80% on your test suiteMath accuracy100% — no incorrect fraction operations presented to studentsHallucination rate<5% unsupported claimsVerification accuracy>90% correct flags
AI Cost Analysis (Required)
Understanding AI costs is critical for production applications. Submit a cost analysis covering:
Development & Testing Costs
Track and report your actual spend during development:

LLM API costs (reasoning, tool calls, response generation)
Total tokens consumed (input/output breakdown)
Number of API calls made during development and testing
RAG embedding costs (if applicable)
Observability tool costs (if applicable)

Production Cost Projections
Estimate monthly costs at different user scales:
100 Users1,000 Users10,000 Users100,000 Users$___/month$___/month$___/month$___/month
Include assumptions: queries per user per day, average tokens per query (input + output), tool call frequency, RAG retrieval frequency, verification overhead.
Technical Stack
Recommended Path
LayerTechnologyAgent FrameworkLangChain or LangGraphLLMClaude Sonnet, GPT-4o, or open source (Llama 3, Mistral)ObservabilityLangSmith, Langfuse, or BraintrustEvalsLangSmith Evals, Braintrust Evals, or customRAGLangChain document loaders + vector store (Chroma, Pinecone, or in-memory FAISS)BackendPython/FastAPI or Node.js/ExpressFrontendReact, Next.js, or Streamlit for rapid prototypingDeploymentVercel, Railway, Modal, or cloud provider
Observability Tools
ToolCapabilitiesLangSmithTracing, evals, datasets, playground — native LangChain integrationBraintrustEvals, logging, scoring, CI integration, prompt versioningLangfuseOpen source tracing, evals, datasets, promptsWeights & BiasesExperiment tracking, prompts, traces, model monitoringArize PhoenixOpen source tracing, evals, drift detectionCustom LoggingBuild your own with structured logs + dashboards
Use whatever stack helps you ship. Complete the Pre-Search process to make informed decisions.
Build Strategy
Priority Order

Basic agent — Single tool call working end-to-end
Fraction tools — Build remaining tools, verify each works independently
Conversational UI — Chat interface with streaming responses
Lesson flow — Guided exploration + assessment phase transitions
RAG pipeline — Pedagogical knowledge base with retrieval
Observability — Integrate tracing, see what's happening
Eval framework — Build test suite, measure baseline
Verification layer — Math correctness checks on all outputs
Iterate on evals — Improve agent based on failures
Polish — Child-friendly UX, animations, encouraging feedback

Critical Guidance

Get one tool working completely before adding more
Add observability early — you need visibility to debug agent behavior
Build evals incrementally as you add features
Test adversarial inputs throughout, not just at the end
Document failure modes — they inform verification design
Math must be correct. Verify programmatically. No exceptions.
Keep the tutor's personality consistent — warm, patient, curious

AI-First Development Requirements
This week emphasizes learning AI-first development workflows. You must document your process.
Required Tools
Use at least two of:

Claude Code
Cursor
Codex
MCP integrations

Agent Architecture Documentation (Required)
Submit a 1-2 page document covering:
SectionContentDomain & Use CasesWhy fractions tutoring, specific problems solvedAgent ArchitectureFramework choice, reasoning approach, tool designRAG PipelineKnowledge base design, retrieval strategy, embedding approachVerification StrategyWhat checks you implemented, whyEval ResultsTest suite results, pass rates, failure analysisObservability SetupWhat you're tracking, insights gainedTracing Examples2-3 annotated traces showing agent reasoning chains
AI Development Log (Required)
Submit a 1-page document covering:
SectionContentTools & WorkflowWhich AI coding tools you used, how you integrated themMCP UsageWhich MCPs you used (if any), what they enabledEffective Prompts3-5 prompts that worked well (include the actual prompts)Code AnalysisRough % of AI-generated vs hand-written codeStrengths & LimitationsWhere AI excelled, where it struggledKey LearningsInsights about working with coding agents
Open Source Contribution (Required)
Contribute to open source in ONE of these ways:
Contribution TypeRequirementsNew Agent PackagePublish your tutor agent as reusable package (npm, PyPI)Eval DatasetRelease your test suite as public dataset for others to useFramework ContributionPR to LangChain, LlamaIndex, or similar with new feature/fixTool IntegrationBuild and release a reusable fraction-tools libraryDocumentationComprehensive guide/tutorial published publicly
Submission Requirements
Deadline: Sunday 10:59 PM CT
DeliverableRequirementsGitHub RepositorySetup guide, architecture overview, deployed linkDemo Video (3-5 min)Agent in action, eval results, observability dashboardPre-Search DocumentCompleted checklist from Phase 1-3Agent Architecture Doc1-2 page breakdown using template aboveAI Development Log1-page breakdown using template aboveAI Cost AnalysisDev spend + projections for 100/1K/10K/100K usersEval Dataset50+ test cases with resultsOpen Source LinkPublished package, PR, or public datasetDeployed ApplicationPublicly accessible tutor agent interfaceSocial PostShare on X or LinkedIn: description, features, demo/screenshots, tag @GauntletAI
Interview Preparation
This week includes interviews for Austin admission. Be prepared to discuss:
Technical Topics

Why you chose your agent framework
Tool design decisions and tradeoffs
RAG pipeline design and retrieval strategy
Verification strategy and failure modes
Eval methodology and results interpretation
How you'd scale this agent to production

Mindset & Growth

How you approached domain complexity (fractions pedagogy)
Times you iterated based on eval failures
What you learned about yourself through this challenge
How you handle ambiguity and pressure

Final Note
A reliable tutor with correct math, solid evals, and good pedagogy beats a flashy tutor that hallucinates fractions in production.
Project completion + interviews are required for Austin admission.

Appendix: Pre-Search Checklist (With Recommended Answers)
Complete this before writing code. Save your AI conversation as a reference document.
Phase 1: Define Your Constraints
1. Domain & Use Cases

Which domain: healthcare, insurance, finance, legal, or custom?

→ Education / Math Tutoring. Specifically fraction equivalence for ages 8-12. This is a well-scoped domain with clear correctness criteria (math is either right or wrong) and established pedagogical frameworks to draw from.


What specific use cases will you support?

→ Three core use cases: (1) Interactive fraction exploration with visual manipulatives, (2) Guided lesson on fraction equivalence with scaffolded difficulty, (3) Assessment with adaptive branching based on student responses.


What are the verification requirements for this domain?

→ Math correctness is non-negotiable. Every fraction operation must be programmatically verified before being shown to a student. Pedagogical appropriateness should be checked via prompt constraints and output validation. No hallucinated math.


What data sources will you need access to?

→ A curated knowledge base of fraction pedagogy: common misconceptions, scaffolding strategies (CRA framework), age-appropriate explanations, and worked examples. Sources include NCTM standards, common core fraction progressions, and established math education research. 15-25 documents, chunked and embedded.



2. Scale & Performance

Expected query volume?

→ Low for demo: 10-50 concurrent users max. A single student session generates ~20-40 queries over a 15-minute lesson. Plan for burst during demo day.


Acceptable latency for responses?

→ <3 seconds for single-tool responses, <8 seconds for multi-step reasoning. Children have lower patience thresholds than adults. Streaming responses help — show partial output while tools execute.


Concurrent user requirements?

→ 10 concurrent users for demo. Each user has an independent session with their own conversation history and lesson state.


Cost constraints for LLM calls?

→ <$50/month total for development and demo. Use Claude Sonnet or GPT-4o-mini for the tutor (good quality/cost ratio). Reserve GPT-4o/Claude Opus for eval runs only.



3. Reliability Requirements

What's the cost of a wrong answer in your domain?

→ High. A tutor that teaches incorrect fraction math directly harms learning. Children internalize wrong patterns quickly. Mathematical correctness must be 100% — this is the single most important requirement.


What verification is non-negotiable?

→ Programmatic math verification. Every fraction operation (addition, equivalence check, simplification) must be verified by deterministic code, not trusted from LLM output alone. The LLM generates the pedagogical framing; the math engine provides the truth.


Human-in-the-loop requirements?

→ Not for MVP. But design for it: log all sessions, flag low-confidence responses, and build an admin review interface as a stretch goal.


Audit/compliance needs?

→ COPPA awareness. Do not collect PII from minors. No account creation required. Session data should be anonymized. Camera/microphone access is not needed.



4. Team & Skill Constraints

Familiarity with agent frameworks?

→ Moderate. Comfortable with LangChain basics but haven't built production agents. LangGraph is new but the state machine model maps well to lesson flows.


Experience with your chosen domain?

→ Not a math teacher, but fraction equivalence is well-documented. The RAG knowledge base compensates for domain expertise gaps. Focus on implementing established pedagogical frameworks rather than inventing new ones.


Comfort with eval/testing frameworks?

→ Familiar with unit testing (Jest/pytest) but new to LLM evals. Plan to start with simple deterministic evals (math correctness) and add LLM-as-judge evals for pedagogical quality.



5. Budget & Cost Ceiling

Monthly spend limit?

→ $50/month hard cap for demo period. This covers LLM API calls, embedding generation, and hosting.


Pay-per-use acceptable or need fixed costs?

→ Pay-per-use is fine for a 1-week sprint. Use free tiers aggressively: Langfuse free tier for observability, Vercel free tier for frontend, Railway free tier for backend.


Where will you trade money for time?

→ Use managed services everywhere. Vercel for frontend deployment, Railway for backend, Langfuse cloud for observability. Don't self-host anything during the sprint.



Phase 2: Architecture Discovery
6. Agent Framework Selection

LangChain vs LangGraph vs CrewAI vs custom?

→ LangGraph. The lesson flow (introduction → exploration → guided practice → assessment → wrap-up) maps perfectly to a state machine. LangGraph gives you explicit control over state transitions, which is critical for pedagogical flow. LangChain alone lacks the structured flow control needed for a multi-phase lesson.


Single agent or multi-agent architecture?

→ Single agent with multiple tools. Multi-agent is overkill for a 1-week sprint. One agent with well-designed tools and a clear system prompt handles all use cases. Add a "lesson orchestrator" as a separate LangGraph node, not a separate agent.


State management requirements?

→ Per-session state: current lesson phase, student performance history (correct/incorrect per concept), hint count, difficulty level. Store in LangGraph state object. Persist to Redis or in-memory for the sprint.


Tool integration complexity?

→ Moderate. 7-9 tools, all deterministic (fraction math). No external API dependencies — all tools are pure functions. This makes testing and verification straightforward.



7. LLM Selection

GPT-5 vs Claude vs open source?

→ Claude 3.5 Sonnet (primary). Best function calling reliability, strong at following system prompts for persona consistency, and excellent at child-friendly language. GPT-4o-mini as fallback if cost is a concern.


Function calling support requirements?

→ Critical. The tutor must reliably select and call the right fraction tool. Claude and GPT-4o both have strong function calling. Test both during pre-search and pick the one with higher tool selection accuracy on your eval set.


Context window needs?

→ 16K tokens minimum. A full lesson session with conversation history, tool call results, and RAG context fits within 16K. No need for 128K+ context windows.


Cost per query acceptable?

→ Target <$0.01 per student interaction. Claude Sonnet at ~$3/MTok input, $15/MTok output: a typical interaction (~1K input, ~500 output tokens) costs ~$0.01. Acceptable.



8. Tool Design

What tools does your agent need?

→ 9 tools across three categories: Fraction Manipulation (5): create, split, combine, find_equivalent, simplify. Assessment (2): compare_fractions, check_answer. Pedagogy (2): get_scaffolding_strategy, retrieve_lesson_context.


External API dependencies?

→ None. All fraction tools are pure math functions. RAG retrieval uses local vector store. This eliminates external failure modes and keeps the system fast.


Mock vs real data for development?

→ Real math from day one. Fraction operations are deterministic — no need to mock. The RAG knowledge base uses real pedagogical content. Use mock student interactions for eval dataset construction.


Error handling per tool?

→ Every tool returns a structured result with a success boolean and optional error message. Invalid inputs (e.g., denominator of 0) return helpful error messages that the tutor can relay to the student in an encouraging way.



9. Observability Strategy

LangSmith vs Braintrust vs other?

→ Langfuse. Open source, generous free tier (50K observations/month), good tracing UI, and works with both LangChain and custom code. LangSmith is excellent but ties you to the LangChain ecosystem more tightly.


What metrics matter most?

→ In priority order: (1) Math correctness rate, (2) Tool selection accuracy, (3) Response latency p95, (4) Token cost per session, (5) Eval pass rate trend.


Real-time monitoring needs?

→ Not for MVP. Batch analysis of traces is sufficient. Add real-time alerting as a stretch goal for production.


Cost tracking requirements?

→ Track tokens per request and per session. Langfuse does this automatically. Use it to fill in the AI Cost Analysis deliverable.



10. Eval Approach

How will you measure correctness?

→ Two-tier evaluation: (1) Deterministic evals for math correctness — programmatically verify every fraction operation in the response. (2) LLM-as-judge evals for pedagogical quality — does the response use age-appropriate language? Does it scaffold effectively? Is the tone encouraging?


Ground truth data sources?

→ Hand-crafted eval dataset. Create 50+ test cases covering: standard fraction problems, common misconceptions, edge cases (0/0, 100/100), adversarial inputs, and multi-step lessons. Each case includes expected tool calls and expected output characteristics.


Automated vs human evaluation?

→ 80% automated, 20% human spot-check. Automated evals run on every code change. Human review for pedagogical quality on a sample of 10-15 cases.


CI integration for eval runs?

→ GitHub Actions workflow that runs the eval suite on push to main. Fail the build if math correctness drops below 100% or overall eval pass rate drops below 75%.



11. Verification Design

What claims must be verified?

→ All mathematical claims. Every fraction comparison, equivalence assertion, simplification, and arithmetic result must be verified by deterministic code before being included in the response.


Fact-checking data sources?

→ Programmatic math verification. No external fact-checking needed — fraction math is deterministic. Build a FractionVerifier class that validates every mathematical statement in the tutor's output.


Confidence thresholds?

→ Block responses with <0.8 confidence on tool selection. If the agent isn't sure which tool to use, ask the student a clarifying question rather than guessing wrong.


Escalation triggers?

→ Three triggers: (1) Student asks about topics outside fraction scope → politely redirect. (2) Agent fails to select a tool after 2 attempts → provide a generic encouraging response and log for review. (3) Math verification fails → do not show response, regenerate with explicit tool call.



Phase 3: Post-Stack Refinement
12. Failure Mode Analysis

What happens when tools fail?

→ Graceful degradation. If a tool call fails, the tutor says "Let me think about that a different way" and retries with a simpler approach. After 2 failures, provide a pre-written fallback response for the concept and log the failure for review.


How to handle ambiguous queries?

→ Ask clarifying questions. "When you say 'bigger,' do you mean which fraction represents more, or which has a bigger number on top?" Frame clarifications as genuine curiosity, not correction.


Rate limiting and fallback strategies?

→ Client-side rate limiting: max 2 requests per second per session. Server-side: queue requests if LLM API is slow. Fallback: if LLM is completely down, show pre-written lesson content with interactive manipulatives only (no AI chat).


Graceful degradation approach?

→ Three tiers: (1) Full AI tutor with tools + RAG. (2) AI tutor with tools only (no RAG, faster). (3) Static lesson content with interactive blocks (no AI). Automatically drop tiers based on latency and error rates.



13. Security Considerations

Prompt injection prevention?

→ System prompt hardening: explicit instructions to stay in tutor persona, refuse non-math topics, never reveal system prompt. Input sanitization: strip HTML, limit message length to 500 chars. Output filtering: reject responses that don't relate to fractions.


Data leakage risks?

→ Low. No PII is collected. Conversation history is session-scoped and ephemeral. RAG knowledge base contains only public pedagogical content.


API key management?

→ Environment variables only. Never committed to repo. Use Vercel/Railway secrets management. Rotate keys weekly during development.


Audit logging requirements?

→ Log all interactions (anonymized) for eval improvement. Retention: 30 days. No student-identifiable information in logs.



14. Testing Strategy

Unit tests for tools?

→ Yes. Every fraction tool gets comprehensive unit tests: happy path, edge cases (0 denominator, very large numbers, negative fractions), and boundary conditions. Target 100% coverage on tool functions.


Integration tests for agent flows?

→ Yes. Test complete conversation flows: student asks question → agent reasons → calls tool → verifies → responds. Use recorded conversations as test fixtures.


Adversarial testing approach?

→ 10+ adversarial test cases: prompt injection attempts, off-topic questions, attempts to make the tutor give wrong answers, very long inputs, empty inputs, special characters.


Regression testing setup?

→ Eval suite runs on every PR. Compare eval scores to main branch baseline. Flag any regression >5% for manual review.



15. Deployment & Operations

Hosting approach?

→ Split deployment: Frontend (Next.js) on Vercel free tier. Backend (FastAPI) on Railway free tier or Render. Vector store: Chroma in-process on the backend server (simplest for MVP).


CI/CD for agent updates?

→ GitHub Actions: lint → test → eval suite → deploy. Auto-deploy to staging on PR merge. Manual promotion to production.


Monitoring and alerting?

→ Langfuse for agent-level monitoring. Railway/Render built-in health checks for infrastructure. Uptime monitoring via a free ping service (e.g., UptimeRobot).


Rollback strategy?

→ Git revert + redeploy. Vercel and Railway both support instant rollback to previous deployment. Keep the last 3 deployments available.



16. Iteration Planning

How will you collect user feedback?

→ Thumbs up/down on each tutor response. Optional free-text feedback field. Log all feedback alongside the trace for that interaction.


Eval-driven improvement cycle?

→ Daily cycle during the sprint: Run evals → identify lowest-scoring categories → improve system prompt / tool logic → re-run evals → compare. Track improvement in a simple spreadsheet.


Feature prioritization approach?

→ Eval scores drive priority. If math correctness is below 100%, that's the only priority. Once correctness is solid, focus on pedagogical quality evals. UX polish comes last.


Long-term maintenance plan?

→ Out of scope for 1-week sprint. But design for it: modular architecture, comprehensive tests, documented system prompts, and a growing eval dataset that serves as the specification.