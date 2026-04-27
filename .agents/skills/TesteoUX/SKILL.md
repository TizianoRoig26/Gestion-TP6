---
name: ux-flow-analyzer
description: Analyze user flows and interfaces to detect friction points, accessibility issues, and UX problems. Use this skill when users ask to evaluate UX, analyze user journeys, check accessibility (WCAG), find usability issues, review interaction flows, detect friction points, or assess interface quality. Triggers on phrases like "analyze the UX", "what friction is in this flow", "check accessibility", "evaluate this interface", "UX review", "usability problems", or when examining wireframes, prototypes, screenshots, or flow descriptions.
---
 
# UX Flow Analyzer
 
Evaluate user flows and interfaces to identify friction points, accessibility barriers, and usability issues with actionable recommendations.
 
## Core Capabilities
 
1. **Flow Friction Analysis** - Identify pain points in user journeys
2. **Accessibility Evaluation** - WCAG 2.1 AA/AAA compliance checking
3. **Heuristic Evaluation** - Nielsen's 10 usability heuristics
4. **Cognitive Load Assessment** - Detect overwhelming or confusing patterns
5. **Dark Pattern Detection** - Flag manipulative UX practices
## Input Types Supported
 
- **Screenshots/Images** - Interface mockups, wireframes, prototypes
- **Text Descriptions** - Written flow descriptions, user stories
- **URLs** - Live websites (fetch and analyze)
- **Videos** - Prototype recordings, user session recordings
- **Multi-screen Flows** - Sequential steps in a journey
## Analysis Framework
 
### Step 1: Context Gathering
 
Before analyzing, establish:
- **User goal** - What is the user trying to accomplish?
- **Flow type** - Onboarding, checkout, authentication, content discovery, etc.
- **Platform** - Web, mobile app, desktop app, kiosk
- **Target audience** - Technical level, accessibility needs, demographics
If not provided, infer from the materials or ask targeted questions.
 
### Step 2: Friction Point Detection
 
Scan for these common friction sources:
 
**Cognitive Friction**
- Unclear labels or CTAs
- Too many choices (Hick's Law violation)
- Inconsistent terminology or navigation
- Hidden or hard-to-find critical actions
- Ambiguous error messages
- Lack of progress indicators in multi-step flows
**Interaction Friction**
- Excessive form fields (especially asking for info the system should already have)
- Poor input validation (only on submit vs. inline)
- Unresponsive or laggy interactions
- Requiring precise interactions (tiny tap targets, drag-and-drop on mobile)
- Forcing mode switches (keyboard → mouse → keyboard)
**Emotional Friction**
- Anxiety-inducing language ("Are you SURE?")
- Lack of reassurance in high-stakes actions
- Unclear consequences of actions
- Missing undo/cancel options
- Progress loss without warning
**Technical Friction**
- Slow load times
- Broken responsive design
- Compatibility issues
- Session timeouts without warning
- Data loss on errors
### Step 3: Accessibility Audit
 
Check against WCAG 2.1 Level AA (and flag AAA opportunities):
 
**Perceivable**
- Text alternatives for non-text content (images, icons, videos)
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- No information conveyed by color alone
- Text can be resized to 200% without loss of functionality
- Sufficient spacing between interactive elements (min 44×44px touch targets)
**Operable**
- All functionality available via keyboard
- No keyboard traps
- Visible focus indicators
- Sufficient time to read/use content (or allow time extension)
- No content that flashes more than 3 times per second
- Clear navigation and skip links
**Understandable**
- Readable text (language identified, unusual words explained)
- Predictable interface behavior
- Input assistance (labels, error identification, error suggestions)
- Error prevention for legal/financial/data deletion actions
**Robust**
- Valid HTML/markup
- ARIA labels where needed
- Compatible with assistive technologies
### Step 4: Heuristic Evaluation (Nielsen)
 
Rate each heuristic (0-4 scale: 0=no problem, 4=catastrophic):
 
1. **Visibility of system status** - Does the user always know what's happening?
2. **Match between system and real world** - Familiar language and concepts?
3. **User control and freedom** - Easy undo/redo, clear exits?
4. **Consistency and standards** - Follows platform conventions?
5. **Error prevention** - Prevents problems before they occur?
6. **Recognition rather than recall** - Visible options vs. memorization?
7. **Flexibility and efficiency** - Shortcuts for experts, forgiving for novices?
8. **Aesthetic and minimalist design** - No irrelevant information?
9. **Help users recognize, diagnose, and recover from errors** - Plain language error messages with solutions?
10. **Help and documentation** - Available, searchable, contextual?
### Step 5: Dark Pattern Check
 
Flag any manipulative patterns:
 
- **Confirmshaming** - Guilt-tripping users into actions ("No thanks, I hate saving money")
- **Forced continuity** - Silent subscription renewals, hard-to-cancel trials
- **Hidden costs** - Surprise fees at checkout
- **Bait and switch** - User intends one action, gets another
- **Disguised ads** - Ads that look like content or navigation
- **Trick questions** - Confusing wording to get unintended consent
- **Roach motel** - Easy to get in, hard to get out
- **Privacy zuckering** - Tricking users into sharing more data than intended
- **Sneak into basket** - Adding items without explicit consent
- **Misdirection** - Drawing attention away from important info
## Output Format
 
Deliver findings in this structure:
 
### Executive Summary
- **Flow analyzed**: [Name/description]
- **Overall UX score**: [X/10] with brief justification
- **Critical issues found**: [Number]
- **Priority**: [High/Medium/Low] based on impact to user goals
### Friction Points
 
For each issue found:
 
```
🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW
 
[ISSUE TITLE]
Screen/Step: [Where it occurs]
Heuristic violated: [Which principle]
User impact: [How this affects the user]
Evidence: [What specifically is wrong]
 
Recommendation:
[Specific, actionable fix]
 
Success metrics:
[How to measure if the fix works - e.g., "Reduce form abandonment by 15%", "Decrease time-on-task by 20s"]
```
 
### Accessibility Issues
 
Group by WCAG principle (Perceivable/Operable/Understandable/Robust):
 
```
❌ WCAG 2.1 [Level AA/AAA] - [Criterion number]
 
Issue: [Description]
Location: [Where]
Impact: [Who is affected - screen reader users, keyboard-only, color blind, etc.]
 
Fix: [Specific code/design change needed]
```
 
### Heuristic Evaluation Scorecard
 
| Heuristic | Score | Key Issue |
|-----------|-------|-----------|
| 1. Visibility of system status | 2/4 | No loading state shown |
| 2. Match between system and world | 1/4 | Uses jargon "SLA" without explanation |
| ... | | |
 
### Positive Patterns
 
Also highlight what's working well:
- Good use of progressive disclosure
- Clear visual hierarchy
- Excellent error recovery flow
- Thoughtful micro-interactions
### Prioritized Action Plan
 
1. **Quick Wins** (Low effort, high impact)
   - [Specific changes that can be done immediately]
2. **Strategic Improvements** (Medium effort, high impact)
   - [Changes requiring design iteration]
3. **Long-term Enhancements** (High effort, medium impact)
   - [Bigger redesigns or feature additions]
## Multi-Screen Flows
 
For complex journeys (5+ screens):
 
1. **Segment the flow** into logical phases (e.g., "Account creation", "Profile setup", "First task")
2. **Analyze each phase separately** with its own friction report
3. **Create a flow-level summary** identifying cross-phase issues:
   - Inconsistent patterns across phases
   - Missing transitions or context loss between phases
   - Overall journey time and cognitive load
   - Drop-off risk points
## Edge Case Handling
 
**Incomplete flows**: Note missing states (loading, error, empty, success) and analyze what's provided
 
**Ambiguous elements**: Call out assumptions made and request clarification if critical
 
**Mobile vs. Desktop**: If not specified, analyze for both and note responsive design issues
 
**Complex enterprise flows**: Focus on the 20% of friction causing 80% of user pain
 
## Tone and Language
 
- **Be specific**: "The CTA 'Submit' is vague" not "The button is bad"
- **Be constructive**: Always pair criticism with actionable solution
- **Be empathetic**: Frame issues from user perspective ("Users may feel anxious when...")
- **Be evidence-based**: Reference standards (WCAG, Nielsen) not personal preference
- **Quantify when possible**: "7 form fields" vs "many fields"
## Tools to Use
 
- **image_search**: When you need visual examples of better patterns
- **web_fetch**: To analyze live sites
- **view**: To read uploaded wireframes, screenshots, or flow diagrams
- **visualize:show_widget**: To create interactive before/after comparisons or annotated screenshots showing issues
## Final Checklist
 
Before delivering the report, verify:
- [ ] Every critical issue has a specific, actionable recommendation
- [ ] Accessibility issues cite WCAG criteria
- [ ] Findings are prioritized by user impact
- [ ] At least one success metric per major recommendation
- [ ] Positive patterns are acknowledged
- [ ] Language is clear and jargon-free
- [ ] Visual examples or annotations are included where helpful
## Example Usage
 
**User uploads checkout flow screenshots**
 
1. Identify it's an e-commerce checkout (high-stakes, conversion-critical)
2. Check for common checkout friction (forced account creation, surprise fees, complex forms)
3. Audit accessibility (color contrast on CTAs, form labels, error states)
4. Run heuristic evaluation (error prevention, user control)
5. Deliver structured report with prioritized fixes and expected impact on conversion rate
**User describes a confusing onboarding flow**
 
1. Ask clarifying questions (what's confusing, what's the goal, platform)
2. Map out the flow from description
3. Identify cognitive load issues (too much upfront, unclear value prop)
4. Suggest progressive onboarding alternatives
5. Provide metrics to track improvement (completion rate, time-to-value)
 