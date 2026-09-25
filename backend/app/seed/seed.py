"""
Seed script — populates the SQLite database with 8 realistic meetings.
Run:  python -m app.seed.seed
"""
import sys
import os
import json
import uuid
from datetime import datetime, timedelta

# Make sure the app package is importable when running from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import engine, SessionLocal
from app.models.models import Base, Meeting, TranscriptLine, Summary, ActionItem

# ─── helpers ────────────────────────────────────────────────────────────────

def iso_date(days_ago: int, hour: int = 10, minute: int = 0) -> str:
    dt = datetime.utcnow() - timedelta(days=days_ago)
    return dt.replace(hour=hour, minute=minute, second=0, microsecond=0).isoformat()

def make_lines(raw: list[dict], offset: float = 0.0) -> list[dict]:
    """Assign cumulative timestamps to transcript lines."""
    t = offset
    lines = []
    for i, entry in enumerate(raw):
        duration = entry.get("dur", 8.0)
        lines.append({
            "speaker": entry["speaker"],
            "text": entry["text"],
            "start_time": round(t, 1),
            "end_time": round(t + duration, 1),
            "sequence": i,
        })
        t += duration + 1.5  # 1.5s gap between turns
    return lines

# ─── Seed data ───────────────────────────────────────────────────────────────

MEETINGS = [
    # ── 1 Product Strategy ─────────────────────────────────────────────────
    {
        "title": "Product Strategy Meeting",
        "date": iso_date(2, 10, 0),
        "duration": 3600,
        "participants": ["Priya Sharma", "Arjun Mehta", "Sunita Rao", "Vikram Nair"],
        "summary": {
            "overview": (
                "The team reviewed Q4 product priorities, focusing on the new onboarding flow "
                "and mobile-first redesign. Priya outlined the vision for the AI-powered feature "
                "tier. The group agreed to deprioritise the legacy export module and redirect "
                "engineering bandwidth to the core workflow improvements. Key metrics and "
                "success criteria were debated and finalised."
            ),
            "key_topics": ["Q4 Roadmap", "AI Features", "Onboarding Flow", "Mobile Redesign", "Success Metrics"],
        },
        "action_items": [
            {"task": "Finalise onboarding wireframes", "assignee": "Priya Sharma", "due_date": "2026-10-05"},
            {"task": "Benchmark competitor AI features", "assignee": "Arjun Mehta", "due_date": "2026-10-03"},
            {"task": "Draft Q4 OKRs document", "assignee": "Sunita Rao", "due_date": "2026-10-07"},
            {"task": "Share mobile redesign mockups with stakeholders", "assignee": "Vikram Nair", "due_date": "2026-10-06"},
        ],
        "transcript": make_lines([
            {"speaker": "Priya Sharma", "text": "Good morning everyone. Let's kick off our Q4 product strategy session. I'll start by sharing the updated roadmap draft.", "dur": 9},
            {"speaker": "Arjun Mehta", "text": "Thanks Priya. Before we dive in, I wanted to flag that the AI feature tier has been getting a lot of traction in user interviews this week.", "dur": 10},
            {"speaker": "Sunita Rao", "text": "Agreed, the NPS scores from the beta cohort are pointing in that direction too. Users specifically called out the smart tagging as a must-have.", "dur": 11},
            {"speaker": "Vikram Nair", "text": "From the engineering side, we have capacity to take on one major initiative in Q4. We need to pick between the onboarding overhaul and the mobile redesign.", "dur": 10},
            {"speaker": "Priya Sharma", "text": "I think those two aren't mutually exclusive if we scope the mobile piece tightly. What does the design team say about a phased approach?", "dur": 9},
            {"speaker": "Arjun Mehta", "text": "Phased makes sense. We could do the onboarding first since it directly impacts activation rate, then layer in mobile in the second half of Q4.", "dur": 11},
            {"speaker": "Sunita Rao", "text": "That aligns with the funnel data. We're seeing a 28% drop-off at the account setup step, so fixing onboarding would have an immediate impact.", "dur": 10},
            {"speaker": "Vikram Nair", "text": "Let's also talk about the legacy export module. We've been carrying that tech debt for two quarters. Can we finally deprioritise it?", "dur": 9},
            {"speaker": "Priya Sharma", "text": "Yes, let's table the export module. Redirect those two engineers to the onboarding squad. Arjun, can you benchmark what competitors are doing with AI features this week?", "dur": 11},
            {"speaker": "Arjun Mehta", "text": "Absolutely, I'll have a benchmarking report ready by Wednesday.", "dur": 6},
            {"speaker": "Sunita Rao", "text": "I'll put together the Q4 OKR doc based on today's discussion and share it for review by end of week.", "dur": 8},
            {"speaker": "Vikram Nair", "text": "And I'll prepare the mobile mockups and get stakeholder sign-off before we finalise the scope.", "dur": 8},
            {"speaker": "Priya Sharma", "text": "Perfect. Let's reconvene next Thursday for a checkpoint. Thanks everyone, great session.", "dur": 7},
        ]),
    },

    # ── 2 Weekly Engineering Sync ───────────────────────────────────────────
    {
        "title": "Weekly Engineering Sync",
        "date": iso_date(5, 9, 30),
        "duration": 1800,
        "participants": ["Vikram Nair", "Deepa Krishnan", "Rohan Joshi", "Ananya Patel"],
        "summary": {
            "overview": (
                "Weekly engineering standup covering sprint progress, blockers, and infrastructure "
                "updates. The team reviewed CI/CD pipeline improvements and discussed the upcoming "
                "database migration. Deepa flagged a memory leak in the notification service "
                "that needs urgent attention. Sprint velocity was on track at 92%."
            ),
            "key_topics": ["Sprint Progress", "CI/CD Pipeline", "Database Migration", "Bug Fixes", "Infrastructure"],
        },
        "action_items": [
            {"task": "Fix memory leak in notification service", "assignee": "Deepa Krishnan", "due_date": "2026-09-26"},
            {"task": "Complete database migration script", "assignee": "Rohan Joshi", "due_date": "2026-09-28"},
            {"task": "Update API documentation for v2 endpoints", "assignee": "Ananya Patel", "due_date": "2026-09-30"},
            {"task": "Review and merge pending pull requests", "assignee": "Vikram Nair", "due_date": "2026-09-25"},
        ],
        "transcript": make_lines([
            {"speaker": "Vikram Nair", "text": "Morning team. Let's run through the sprint board. We're at day 7 of 10. How is everyone tracking?", "dur": 8},
            {"speaker": "Deepa Krishnan", "text": "I'm about 80% done with the notification refactor, but I hit a memory leak that's been tricky to isolate. It's in the WebSocket handler.", "dur": 10},
            {"speaker": "Rohan Joshi", "text": "The database migration script is drafted. I need another day to test the rollback procedure in staging before I'm comfortable.", "dur": 9},
            {"speaker": "Ananya Patel", "text": "API documentation is about 60% updated. The new v2 endpoints are all documented, but I still need to add the authentication examples.", "dur": 9},
            {"speaker": "Vikram Nair", "text": "Deepa, the memory leak sounds critical. Can you block time today to dig into it? I'll pull in Rohan to pair if needed.", "dur": 8},
            {"speaker": "Deepa Krishnan", "text": "Yes, I've already got a profiling session scheduled for 2pm. I should have a fix or at least a workaround by EOD.", "dur": 9},
            {"speaker": "Rohan Joshi", "text": "Happy to join that session. Also, the CI pipeline is much faster now — build times dropped from 14 minutes to 6 minutes after the caching changes.", "dur": 10},
            {"speaker": "Ananya Patel", "text": "That's a huge improvement! The slow builds were really killing developer flow. Is there anything left to optimise?", "dur": 8},
            {"speaker": "Vikram Nair", "text": "There's some low-hanging fruit in the test parallelisation, but let's not touch that this sprint. Stability over speed right now.", "dur": 9},
            {"speaker": "Deepa Krishnan", "text": "Agreed. Let's lock down what we have. Vikram, there are 4 PRs waiting for your review in the queue.", "dur": 8},
            {"speaker": "Vikram Nair", "text": "I'll block this afternoon for reviews. Overall velocity is at 92%, which is great. Let's keep pushing. See everyone tomorrow.", "dur": 9},
        ]),
    },

    # ── 3 Client Requirements Discussion ────────────────────────────────────
    {
        "title": "Client Requirements Discussion",
        "date": iso_date(8, 14, 0),
        "duration": 2700,
        "participants": ["Sunita Rao", "Karan Malhotra", "Meera Iyer", "Ravi Pillai"],
        "summary": {
            "overview": (
                "Discovery session with the Karan from FinTech client to capture requirements "
                "for their enterprise dashboard. The client needs real-time portfolio analytics, "
                "role-based access control, and a custom reporting module. Compliance and audit "
                "logging were flagged as non-negotiable requirements. Timeline pressure was high — "
                "the client wants an MVP by end of October."
            ),
            "key_topics": ["Enterprise Dashboard", "Real-time Analytics", "RBAC", "Compliance", "MVP Timeline"],
        },
        "action_items": [
            {"task": "Send requirements specification document", "assignee": "Sunita Rao", "due_date": "2026-09-28"},
            {"task": "Prototype RBAC module", "assignee": "Meera Iyer", "due_date": "2026-10-02"},
            {"task": "Confirm audit logging compliance standards", "assignee": "Ravi Pillai", "due_date": "2026-09-27"},
            {"task": "Schedule weekly check-in cadence with client", "assignee": "Karan Malhotra", "due_date": "2026-09-26"},
        ],
        "transcript": make_lines([
            {"speaker": "Sunita Rao", "text": "Thank you for joining us today Karan. The goal of this session is to deeply understand your requirements before we begin scoping.", "dur": 9},
            {"speaker": "Karan Malhotra", "text": "Absolutely. We've been looking for a partner who can deliver a real-time portfolio dashboard for our wealth management arm. Speed and accuracy are critical.", "dur": 12},
            {"speaker": "Meera Iyer", "text": "Could you walk us through the types of data streams you're working with? Are we talking equities, derivatives, or mixed portfolios?", "dur": 9},
            {"speaker": "Karan Malhotra", "text": "Mixed portfolios — equities, bonds, and some alternative assets. We need P&L updates every 30 seconds minimum during market hours.", "dur": 11},
            {"speaker": "Ravi Pillai", "text": "From a technical standpoint, that's achievable with WebSocket connections. What about access control? How many roles are you envisioning?", "dur": 10},
            {"speaker": "Karan Malhotra", "text": "At minimum: viewer, analyst, portfolio manager, and admin. The admin needs full access including the ability to export audit logs.", "dur": 11},
            {"speaker": "Sunita Rao", "text": "Audit logging — is that for internal use or regulatory compliance? That changes how we approach the implementation significantly.", "dur": 9},
            {"speaker": "Karan Malhotra", "text": "Both. We're under SEBI regulations and we need tamper-proof audit trails for all data access events. Non-negotiable.", "dur": 10},
            {"speaker": "Meera Iyer", "text": "Understood. We'll need to factor in immutable log storage. That could push the timeline a bit. Speaking of which, what's your target go-live date?", "dur": 10},
            {"speaker": "Karan Malhotra", "text": "We'd like an MVP by end of October. It doesn't need to be perfect, but the core dashboard and RBAC must be solid.", "dur": 9},
            {"speaker": "Ravi Pillai", "text": "That's about six weeks. Tight but possible if we scope the MVP correctly and defer the custom reporting module to phase two.", "dur": 9},
            {"speaker": "Sunita Rao", "text": "Let's agree on that approach. I'll send over a formal requirements doc for your review by end of week, and Ravi will confirm the compliance standards tomorrow.", "dur": 10},
            {"speaker": "Karan Malhotra", "text": "Sounds good. Can we set up weekly check-ins to stay aligned throughout the build?", "dur": 7},
            {"speaker": "Sunita Rao", "text": "Absolutely. We'll get that in the calendar. Thanks everyone, great discussion today.", "dur": 7},
        ]),
    },

    # ── 4 Marketing Campaign Review ──────────────────────────────────────────
    {
        "title": "Marketing Campaign Review",
        "date": iso_date(12, 11, 0),
        "duration": 2400,
        "participants": ["Neha Gupta", "Aditya Shah", "Pooja Verma", "Sanjay Kumar"],
        "summary": {
            "overview": (
                "Quarterly review of the October digital marketing campaigns. The LinkedIn ads "
                "outperformed benchmarks with a 3.2% CTR, while the Google Display campaign "
                "underperformed. The team decided to reallocate budget from Display to LinkedIn "
                "and explore a content partnership with two industry newsletters. Influencer "
                "collaboration shortlist was narrowed to three creators."
            ),
            "key_topics": ["Campaign Performance", "LinkedIn Ads", "Budget Reallocation", "Content Partnerships", "Influencer Marketing"],
        },
        "action_items": [
            {"task": "Reallocate ₹2L from Display to LinkedIn campaign", "assignee": "Aditya Shah", "due_date": "2026-09-27"},
            {"task": "Draft partnership proposal for newsletters", "assignee": "Pooja Verma", "due_date": "2026-10-01"},
            {"task": "Finalise influencer shortlist and outreach", "assignee": "Neha Gupta", "due_date": "2026-10-03"},
            {"task": "Create October campaign calendar", "assignee": "Sanjay Kumar", "due_date": "2026-09-29"},
        ],
        "transcript": make_lines([
            {"speaker": "Neha Gupta", "text": "Let's start with the September campaign numbers. Overall the month was mixed — some strong wins and a couple of things we need to course-correct.", "dur": 10},
            {"speaker": "Aditya Shah", "text": "I'll start with paid. LinkedIn campaigns crushed it — 3.2% CTR against our 1.8% benchmark. The thought leadership content really resonated.", "dur": 11},
            {"speaker": "Pooja Verma", "text": "The organic side had a good month too. Blog traffic is up 40% month-on-month. The two long-form pieces on product analytics drove a lot of it.", "dur": 10},
            {"speaker": "Sanjay Kumar", "text": "Email open rates are holding steady at 24%, but click-through on the product feature emails dropped. We need to look at the CTA copy.", "dur": 10},
            {"speaker": "Neha Gupta", "text": "What about the Google Display campaign? I noticed the numbers looked soft in the dashboard.", "dur": 7},
            {"speaker": "Aditya Shah", "text": "Yeah, Display was a disappointment. 0.4% CTR and cost per lead was three times what we're getting from LinkedIn. I'd recommend we pull back there.", "dur": 11},
            {"speaker": "Pooja Verma", "text": "Agreed. If we move that budget to LinkedIn, we can scale the top-performing ad sets and probably get to 500 qualified leads by end of October.", "dur": 10},
            {"speaker": "Sanjay Kumar", "text": "One thing I want to raise — I've been talking to two industry newsletters about content partnerships. The audience overlap with our ICP is excellent.", "dur": 10},
            {"speaker": "Neha Gupta", "text": "That's promising. Let's get a partnership proposal drafted. What's the typical cost structure for those placements?", "dur": 8},
            {"speaker": "Sanjay Kumar", "text": "Sponsored content slots run between ₹80K and ₹1.5L per issue. For the audience size, the CPM is actually quite competitive.", "dur": 9},
            {"speaker": "Aditya Shah", "text": "Let's pilot one newsletter and measure. If the leads quality holds, we can expand. Also, should we circle back to the influencer shortlist?", "dur": 10},
            {"speaker": "Neha Gupta", "text": "Yes. We've narrowed it to three creators in the B2B SaaS space. I'll handle outreach and have responses by next week.", "dur": 9},
            {"speaker": "Pooja Verma", "text": "Great. I'll get the October campaign calendar drafted and share it by end of the week.", "dur": 7},
        ]),
    },

    # ── 5 Sprint Planning ────────────────────────────────────────────────────
    {
        "title": "Sprint Planning Meeting",
        "date": iso_date(16, 9, 0),
        "duration": 3900,
        "participants": ["Vikram Nair", "Deepa Krishnan", "Rohan Joshi", "Ananya Patel", "Priya Sharma"],
        "summary": {
            "overview": (
                "Sprint 23 planning session. The team committed to 47 story points across 14 "
                "tickets. Key deliverables include the new search infrastructure, notification "
                "centre v2, and onboarding step improvements. Tech debt from the authentication "
                "module was allocated 8 points. The sprint goal is to ship the search feature "
                "to beta users by sprint end."
            ),
            "key_topics": ["Sprint 23", "Search Infrastructure", "Notification Centre", "Onboarding", "Tech Debt"],
        },
        "action_items": [
            {"task": "Set up Elasticsearch cluster for search", "assignee": "Rohan Joshi", "due_date": "2026-09-22"},
            {"task": "Design notification centre UI", "assignee": "Ananya Patel", "due_date": "2026-09-20"},
            {"task": "Write acceptance criteria for onboarding tickets", "assignee": "Priya Sharma", "due_date": "2026-09-19"},
            {"task": "Refactor auth module token refresh logic", "assignee": "Deepa Krishnan", "due_date": "2026-09-24"},
            {"task": "Create sprint 23 Jira board and assign tickets", "assignee": "Vikram Nair", "due_date": "2026-09-18"},
        ],
        "transcript": make_lines([
            {"speaker": "Vikram Nair", "text": "Good morning. Sprint 22 wrapped up at 94% completion — solid effort. Now let's plan Sprint 23. Priya, can you share the prioritised backlog?", "dur": 10},
            {"speaker": "Priya Sharma", "text": "Sure. Top priority is the search infrastructure. Users have been asking for full-text search for two quarters and we can't push it further.", "dur": 10},
            {"speaker": "Rohan Joshi", "text": "I scoped it last week. If we go with Elasticsearch, the indexing pipeline is about 13 points. The search API itself is another 8. So 21 total.", "dur": 11},
            {"speaker": "Deepa Krishnan", "text": "That's a lot for one sprint. Can we break the Elasticsearch setup into two phases? Index setup in this sprint, relevance tuning in the next?", "dur": 10},
            {"speaker": "Vikram Nair", "text": "Good thinking. Let's commit to the core indexing and basic search in Sprint 23, and defer relevance tuning. Rohan, is 13 points realistic?", "dur": 9},
            {"speaker": "Rohan Joshi", "text": "Yes, if I start setting up the cluster on day one. I'll need access to the production infra account though.", "dur": 8},
            {"speaker": "Ananya Patel", "text": "Can we also slot in the notification centre? I have all the designs ready and it's been sitting in the backlog for two sprints.", "dur": 9},
            {"speaker": "Priya Sharma", "text": "Notification centre is 12 points. Combined with search that's 25, plus 8 for auth tech debt. That puts us at 33 and we still have onboarding tickets.", "dur": 10},
            {"speaker": "Vikram Nair", "text": "Let's cap the sprint at 47 story points to give us some buffer. We can take 3 of the 5 onboarding tickets — the highest priority ones.", "dur": 9},
            {"speaker": "Deepa Krishnan", "text": "Works for me. The auth refactor is important — we had two production incidents last sprint related to token refresh. We can't keep kicking that can.", "dur": 11},
            {"speaker": "Ananya Patel", "text": "I'll have the notification centre UI designs ready for handoff by Monday so engineering can start immediately.", "dur": 8},
            {"speaker": "Priya Sharma", "text": "I'll write acceptance criteria for the three onboarding tickets today so they're ready to go.", "dur": 7},
            {"speaker": "Vikram Nair", "text": "Let's set the sprint goal as: ship search to beta users. Everything else is supporting that. I'll set up the Jira board by end of day. Great planning session.", "dur": 10},
        ]),
    },

    # ── 6 Project Demo ───────────────────────────────────────────────────────
    {
        "title": "Q3 Project Demo Day",
        "date": iso_date(20, 15, 0),
        "duration": 4500,
        "participants": ["Arjun Mehta", "Priya Sharma", "Sunita Rao", "Karan Malhotra", "Neha Gupta"],
        "summary": {
            "overview": (
                "Internal demo day showcasing Q3 deliverables to stakeholders. Four teams "
                "presented: the analytics dashboard, the mobile app beta, the new integrations "
                "framework, and the AI summarisation feature. Stakeholder feedback was strongly "
                "positive for analytics and AI features. The mobile app received detailed UX "
                "feedback. Budget approval for Q4 scaling was confirmed in the meeting."
            ),
            "key_topics": ["Q3 Deliverables", "Analytics Dashboard", "Mobile Beta", "AI Features", "Stakeholder Feedback"],
        },
        "action_items": [
            {"task": "Address mobile UX feedback items before public launch", "assignee": "Arjun Mehta", "due_date": "2026-10-10"},
            {"task": "Prepare Q4 budget breakdown document", "assignee": "Sunita Rao", "due_date": "2026-10-05"},
            {"task": "Share demo recording with all stakeholders", "assignee": "Priya Sharma", "due_date": "2026-09-22"},
            {"task": "Collect written feedback from client stakeholders", "assignee": "Karan Malhotra", "due_date": "2026-09-24"},
        ],
        "transcript": make_lines([
            {"speaker": "Priya Sharma", "text": "Welcome to our Q3 Demo Day. We're excited to showcase what our teams have built this quarter. We have four demos lined up today.", "dur": 10},
            {"speaker": "Arjun Mehta", "text": "I'll kick off with the analytics dashboard. This quarter we shipped real-time cohort analysis and the funnel builder. Let me walk you through a live demo.", "dur": 12},
            {"speaker": "Karan Malhotra", "text": "This is impressive. The funnel builder is exactly what we discussed in our requirements session. Can you show multi-step funnels with date comparison?", "dur": 11},
            {"speaker": "Arjun Mehta", "text": "Absolutely. You can see here — I'm comparing this week's signup funnel against last month. The conversion rate delta is highlighted automatically.", "dur": 10},
            {"speaker": "Sunita Rao", "text": "The AI summarisation feature is next. Over the past quarter we've been training a model on meeting transcript data. I'll show you what it produces.", "dur": 11},
            {"speaker": "Neha Gupta", "text": "The summaries look remarkably clean. Are these coming from a fine-tuned model or prompt engineering on a foundation model?", "dur": 9},
            {"speaker": "Sunita Rao", "text": "It's prompt engineering on GPT-4 with a structured output schema, plus some post-processing for action item extraction. No fine-tuning yet.", "dur": 10},
            {"speaker": "Priya Sharma", "text": "We're evaluating fine-tuning for Q4 if the quality bar holds with scale. Now let's look at the mobile app beta.", "dur": 9},
            {"speaker": "Arjun Mehta", "text": "The mobile beta has been running for 3 weeks with 200 users. Session length is up 40% compared to the web app on the same tasks.", "dur": 10},
            {"speaker": "Karan Malhotra", "text": "The UI feels polished, but I noticed the navigation feels a bit buried on the home screen. The main action button could be more prominent.", "dur": 10},
            {"speaker": "Neha Gupta", "text": "We got similar feedback in user testing. The team has a redesigned home screen in progress that addresses this with a floating action button.", "dur": 9},
            {"speaker": "Sunita Rao", "text": "On the budget front — today's demos confirm we're on track. I'll prepare the Q4 scaling budget document for executive review.", "dur": 9},
            {"speaker": "Priya Sharma", "text": "Budget approval confirmed for Q4. I'll make sure the demo recording goes out to all stakeholders by tomorrow. Great work everyone.", "dur": 9},
        ]),
    },

    # ── 7 Monthly Business Review ────────────────────────────────────────────
    {
        "title": "Monthly Business Review",
        "date": iso_date(30, 10, 0),
        "duration": 5400,
        "participants": ["Priya Sharma", "Sunita Rao", "Aditya Shah", "Vikram Nair", "Neha Gupta", "Sanjay Kumar"],
        "summary": {
            "overview": (
                "September MBR covering revenue, growth metrics, and team health. ARR grew 18% "
                "month-on-month to reach ₹4.2Cr. Churn rate improved from 3.1% to 2.4%. Sales "
                "pipeline is healthy at 3.2x coverage. Engineering velocity is strong. Marketing "
                "CAC decreased by 12%. Key concern: support ticket volume is up 35% due to a "
                "known bug in the export feature — fix is prioritised for next week."
            ),
            "key_topics": ["ARR Growth", "Churn Rate", "Sales Pipeline", "Engineering Velocity", "Support Issues"],
        },
        "action_items": [
            {"task": "Fix export feature bug causing support ticket spike", "assignee": "Vikram Nair", "due_date": "2026-09-27"},
            {"task": "Share MBR deck with board members", "assignee": "Priya Sharma", "due_date": "2026-09-26"},
            {"task": "Investigate churn reasons from September exits", "assignee": "Sunita Rao", "due_date": "2026-09-30"},
            {"task": "Reduce CAC further by optimising top-of-funnel", "assignee": "Neha Gupta", "due_date": "2026-10-15"},
            {"task": "Hire two senior engineers to support scaling", "assignee": "Vikram Nair", "due_date": "2026-10-20"},
        ],
        "transcript": make_lines([
            {"speaker": "Priya Sharma", "text": "Welcome to the September MBR. Let's start with the headline numbers — ARR is at ₹4.2 Crore, up 18% month-on-month. That's above our internal target of 15%.", "dur": 12},
            {"speaker": "Sunita Rao", "text": "Revenue quality is also improving. Churn dropped from 3.1% to 2.4%. The customer success initiatives from last quarter are clearly working.", "dur": 11},
            {"speaker": "Aditya Shah", "text": "Sales pipeline looks healthy. We have 3.2x coverage, which gives us confidence for Q4 targets. The enterprise segment is particularly strong.", "dur": 10},
            {"speaker": "Vikram Nair", "text": "On the engineering side, velocity is up. We shipped 12 customer-facing features in September. However, I need to flag a serious issue — support ticket volume is up 35%.", "dur": 12},
            {"speaker": "Neha Gupta", "text": "What's driving the support spike? I've noticed more customer success escalations this week.", "dur": 7},
            {"speaker": "Vikram Nair", "text": "There's a bug in the export feature introduced in the v2.4.1 release. PDF exports are failing for files over 50MB. We have a fix ready and will deploy it Monday.", "dur": 12},
            {"speaker": "Sanjay Kumar", "text": "Has customer communication gone out to affected users? We should be proactive about this rather than waiting for tickets.", "dur": 9},
            {"speaker": "Sunita Rao", "text": "CS team sent an email yesterday with a workaround. We'll follow up once the fix is live. On a positive note — NPS is holding at 42.", "dur": 10},
            {"speaker": "Priya Sharma", "text": "Good. NPS of 42 is solid for our stage. Neha, how did marketing perform in September?", "dur": 8},
            {"speaker": "Neha Gupta", "text": "Marketing CAC decreased 12% to ₹8,400. We've been getting better leads from LinkedIn and the content programme is compounding. Blog traffic hit 28K monthly visitors.", "dur": 12},
            {"speaker": "Aditya Shah", "text": "On hiring — we're at 48 employees. We need to add at least two senior engineers and a data scientist in Q4 to hit our scaling targets.", "dur": 10},
            {"speaker": "Vikram Nair", "text": "I have two strong senior engineer candidates in final rounds. If offers go out this week, we could onboard by November.", "dur": 9},
            {"speaker": "Priya Sharma", "text": "Let's make those offers. I'll share the MBR deck with the board tomorrow. Overall, a strong month with one operational issue to resolve. Great work team.", "dur": 10},
        ]),
    },

    # ── 8 Team Retrospective ────────────────────────────────────────────────
    {
        "title": "Sprint 22 Team Retrospective",
        "date": iso_date(35, 16, 0),
        "duration": 2700,
        "participants": ["Vikram Nair", "Deepa Krishnan", "Rohan Joshi", "Ananya Patel"],
        "summary": {
            "overview": (
                "Sprint 22 retrospective. The team celebrated strong sprint velocity (94%) and "
                "successful delivery of the notification service. Key improvement areas: "
                "PR review turnaround time (averaging 2.5 days vs 1 day target) and staging "
                "environment stability issues that caused two days of lost testing time. "
                "Team morale is high. Three process improvements were agreed for Sprint 23."
            ),
            "key_topics": ["Sprint Retrospective", "PR Review Process", "Staging Environment", "Team Morale", "Process Improvements"],
        },
        "action_items": [
            {"task": "Set up PR review SLA and rotation schedule", "assignee": "Vikram Nair", "due_date": "2026-09-19"},
            {"task": "Fix staging environment Docker config", "assignee": "Rohan Joshi", "due_date": "2026-09-20"},
            {"task": "Document deployment process for new joiners", "assignee": "Ananya Patel", "due_date": "2026-09-22"},
            {"task": "Schedule team lunch for Sprint 22 celebration", "assignee": "Deepa Krishnan", "due_date": "2026-09-21"},
        ],
        "transcript": make_lines([
            {"speaker": "Vikram Nair", "text": "Let's start with what went well in Sprint 22. I'll kick it off — 94% velocity and we shipped the notification service. That was a hard one.", "dur": 10},
            {"speaker": "Deepa Krishnan", "text": "The notification service shipping was a big win. We had three major design pivots but the team stayed focused. Really proud of how we handled the ambiguity.", "dur": 11},
            {"speaker": "Rohan Joshi", "text": "The CI/CD improvements also went well. Cutting build times in half made a real difference to how fast we could iterate during the sprint.", "dur": 9},
            {"speaker": "Ananya Patel", "text": "I want to call out the design-engineering collaboration. We used Figma comments for async feedback and it cut our sync meetings by 30%.", "dur": 10},
            {"speaker": "Vikram Nair", "text": "Great points. Now for what could be better. I'll say it — PR review time. We're averaging 2.5 days per PR. The target is 24 hours.", "dur": 10},
            {"speaker": "Deepa Krishnan", "text": "It's a capacity issue. When everyone is heads-down building, reviews fall through the cracks. We need a structured rotation or SLA.", "dur": 9},
            {"speaker": "Rohan Joshi", "text": "The staging environment was also really painful. It went down for two full days mid-sprint. I lost almost a full day waiting to test my migration scripts.", "dur": 10},
            {"speaker": "Ananya Patel", "text": "Same for me on the UI side — I couldn't do integration testing for most of Tuesday. The Docker compose config keeps drifting from production.", "dur": 9},
            {"speaker": "Vikram Nair", "text": "Rohan, can you own fixing the Docker config this week? Let's get staging rock solid before Sprint 23 starts.", "dur": 8},
            {"speaker": "Rohan Joshi", "text": "I'll tackle it first thing tomorrow. Should be a half-day fix once I have the right base image sorted.", "dur": 7},
            {"speaker": "Deepa Krishnan", "text": "For the PR review issue, how about a daily 15-minute review block at 9am where we all look at open PRs together?", "dur": 9},
            {"speaker": "Ananya Patel", "text": "I love that idea. Even just having a shared ritual would help keep the queue from building up.", "dur": 7},
            {"speaker": "Vikram Nair", "text": "Let's do it. I'll also document a formal review SLA so expectations are clear for when we bring on new team members. Also — we should celebrate this sprint. Team lunch?", "dur": 11},
            {"speaker": "Deepa Krishnan", "text": "I'll organise the lunch. Great sprint everyone. Let's carry this energy into Sprint 23.", "dur": 8},
        ]),
    },
]

# ─── Main ────────────────────────────────────────────────────────────────────

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Meeting).count() > 0:
            print("Database already seeded. Skipping.")
            return

        for m_data in MEETINGS:
            meeting = Meeting(
                id=str(uuid.uuid4()),
                title=m_data["title"],
                date=m_data["date"],
                duration=m_data["duration"],
                participants=json.dumps(m_data["participants"]),
                audio_url=None,
            )
            db.add(meeting)
            db.flush()

            for line_data in m_data["transcript"]:
                line = TranscriptLine(
                    meeting_id=meeting.id,
                    speaker=line_data["speaker"],
                    text=line_data["text"],
                    start_time=line_data["start_time"],
                    end_time=line_data["end_time"],
                    sequence=line_data["sequence"],
                )
                db.add(line)

            s = m_data["summary"]
            summary = Summary(
                meeting_id=meeting.id,
                overview=s["overview"],
                key_topics=json.dumps(s["key_topics"]),
                notes="",
            )
            db.add(summary)

            for ai_data in m_data["action_items"]:
                ai = ActionItem(
                    meeting_id=meeting.id,
                    task=ai_data["task"],
                    assignee=ai_data.get("assignee"),
                    due_date=ai_data.get("due_date"),
                    completed=False,
                )
                db.add(ai)

        db.commit()
        print(f"✓ Seeded {len(MEETINGS)} meetings with transcripts, summaries, and action items.")
    except Exception as e:
        db.rollback()
        print(f"✗ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
