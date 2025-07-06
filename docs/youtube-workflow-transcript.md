# YouTube Workflow Transcript
## AI and I Podcast - Agentic Coding with Kieran and Natasha from Kora

### Episode Overview
**Hosts:** Dan Shipper  
**Guests:** Kieran (GM) and Natasha (Engineer) from Kora (Every's AI email assistant)  
**Topic:** Compounding Engineering and Agentic Coding Workflows

---

## Episode Start

> "You're figuring out how to do compounding engineering. There's two people on the team but it really feels like there's 15. Coding with AI is more than just the coding part - utilizing it for research, for workflows, it should be used for everything."

---

## Introduction

**Dan:** Kieran, Natasha, welcome to the show. Thank you so much for having us, Tom. I'm psyched to have you. So for people who don't know, both of you work on Kora which is Every's AI email assistant. Kieran, you're the GM, Natasha, you're an engineer. Beyond the fact that Kora is a really cool product and I'm really excited to bring that to everybody who listens to this show or watches this show, I wanted to do an episode with the two of you because I think that you're figuring out a new way to do engineering.

Because really Kora has - you know there's two people on the team but it really feels like there's like 15 because you've got agents who are pulling down PRs and working on branches and then you're like pushing them up and other agents reviewing and it's just like this kind of crazy thing that it's a new way to build software.

And Kieran you said something the other day that really stuck with me which is you're figuring out how to do **compounding engineering** - so with each piece of work you do, you're making it easier to do the next piece of work. I just think that it's really important to bring what you guys are learning to everybody that watches this show because we have new tools and so we need new principles and new workflows for using those tools.

---

## Why Kieran Believes Agents Are Turning a Corner

**Kieran:** Thanks, it's really fun to build Kora, but being part of Every and being in an environment where you get access to tools like access to thinking, access to exciting new ways to work really helps us rethink how we build. It's really an experiment - we're building a product Kora but at the same time we're figuring out how we should build and that's super interesting.

We're right in the middle where people say "What do you think of this new model?" Like how do we use this research tool and we're just trying things out. Natasha and I, we've been really feeling a shift in the last weeks I would say where things are changing and we're not the only ones - we hear other people say that as well, but not a lot of people.

What we've learned is a lot and we want to share a little bit of what we learned and also what we know is we're just barely starting - we're scratching the surface of this and it's a big shift that's happening right now by new models, by how people think, by MCP, by just - it's a lot.

**Dan:** What changed? What do you think changed and what are the broad strokes of what the workflow is that's starting to emerge for you guys?

**Kieran:** For me, obviously it's everything coming together but I think the biggest thing is a realization in myself that **coding with AI is more than just the coding part** and it's really about utilizing it for research, for workflows, for everything - it should be used for everything. And we're now at a point where the agents are good enough that they can actually do everything so we need to rethink again.

Cursor, Windsurf - the old school way of coding was great, more of the vibe coding - that was one step. And then now it's a realization: oh actually we can just give a task and it will do it. But still the work needs to be done by - what do we do, how do we do it - and just the realization that we should lean into that more and really go deep.

It's Claude Code - it's just good coding agent or agents available that actually start to work with new models like Claude 4 - really good at following directions and instructions and it's all that coming together that I realized like oh we're here, the future is here. This thing we've been talking about that was going to be the agentic evolution suddenly it works and it's working in real world, non-experimental, playing thing. It's just like we're building an app and it's working building the app.

---

## Why Claude Code Stands Out from Other Agents

**Dan:** So what I'm hearing is it's not just about developing with AI, it's all the things that go into developing that you're using AI for. And the thing that you're using the most for this is Claude Code, is that right? For people who don't know Claude Code or haven't used it, give us a little introduction to Claude Code and then tell us about exactly how you're using it.

**Kieran:** Claude Code is basically the coding agent version from Anthropic that uses Claude under the hood and it runs in your terminal as a CLI tool. [*Demonstrates on screen*] Claude Code is a tool that you use in your terminal. I know for non-technical people this is scary, but I've converted friends who were not technical to use Claude Code and they were like "oh this is great."

It's really simple - you just hit, you start your terminal, you say Claude and an interface will pop up and basically... [*Shows terminal interface*] there's a little text box for him to type in any command.

**Dan:** Why is this different or what makes this different?

**Kieran:** This has access to the directory or the computer so it can look through files on my computer, it can run things on my computer, it can take screenshots of websites, it can search the web - it has tools but way more tools than available in a normal Claude version.

That's important because engineering work, building stuff, you do need more tools than just the basics. You need GitHub to see what you need to build or what the status is or what the CI pipeline does - do the tests fail - having all these things available in one coding agent actually makes it possible for me to have a workflow or a thing I do actually be done by an agent. That's the important thing.

Really the compound word comes in by doing more than just coding because if you talk to an engineer, most of the work is maybe coding but maybe it's actually 20% - maybe 80% of the work is figuring out what to do next or understanding what people's feedback is and how to interpret it.

### Demo: What Did We Ship This Week?

**Kieran:** What you can do here is, for example, a fun way is to use it to say... let's say "what did we ship in the last week?" So it knows stuff, so I'm asking it what we shipped and it will most likely look at the git log because that's how we track what we did ship.

[*Claude Code examines git log*]

It looks through the git log, it looks at what we merged to main and yeah that's a fun way to use it. For example we can use this for product marketing and it says:

- **Bug fixes:** Brief skip functionality, chat panel state, email summary XML tags
- **Major features:** Brief help monitoring, time zone auto detection  
- **Infrastructure updates:** [Various technical improvements]

It's written in a nice write up that can read technical and it's actually a lot for two people - there's what, like six major features and like five important bug fixes and three infrastructure updates - that's a lot!

**Dan:** It is a lot! This week you've been really leaning into "let's AI do the work for us and we're just managing the AI."

---

## What Makes Agentic Coding Different from Using Tools Like Cursor

**Natasha:** What's the difference between coding and Cursor and agentic coding? Claude Code is such a simple departure from the Cursor and Windsurf that we're used to. Both of those have agentic coding capabilities, but Claude just takes it one step further by simplifying it by I think like a factor of 10.

What Kieran was saying earlier about how Claude Code may feel intimidating because it is a terminal, but in reality it is so much simpler than Windsurf/Cursor because there is nothing except a text box here. There's no command K, no shortcuts, no accept/delete/reject/remove - there's nothing. It's just a text box and it works because the model, the underlying Claude model, is so much more capable now so it's able to work for longer and do tool calls.

It's a simpler UI which makes it at the same time more powerful even though the underlying model behind Cursor and Claude Code is the same.

### Example: Debugging the Missing Form Responses

**Kieran:** An example of this is this morning I was pulling some metrics. I was like "why didn't we get any responses to this form?" For context, we have a form that we ask people how disappointed they would be if they could no longer use Kora so we can tell how well we're doing.

We have a weekly meeting where we go through all the metrics and you noticed that no one had filled out that form. So you're going into Claude Code and you're asking "hey, why is no one filling out this form?"

I was like "there has to be something, this form was not sent" and I asked "hey 14 days ago something went wrong, can you see what went wrong?" And what it did - it made a checklist, to-dos:
- Fetching recent log changes to the controller
- Searching the codebase

So it looked through what changed around that date and it found we removed a piece of code that adds people there. It says "Hey actually you just need to add this" and I said "okay do it for me, create a pull request" and it did that. And I said "oh yeah by the way I'm also going to create a script that will then add everyone that we missed to migrate it" and that was it.

The fun part was it didn't cost me any energy - it was as easy as me writing it down in GitHub to look at later. I don't need to - I just ask it and it does it immediately which is really nice. It's the inbox zero - does it take less than five minutes? Do it kind of thing.

---

## The Kora Team's Workflow to Turn Tasks into Momentum

**Dan:** I think the thing that people may not fully realize is that task could take anywhere from like 30 minutes to a couple hours without AI and it's not just that it would require you to focus on it and put aside time to sit down and do it. Now you just sort of send off requests like that and then you can send off another one and another one - you have a bunch of these working in parallel.

Give me a snapshot of what that looks like concretely - what your actual workflow is, what are you actually doing, how many tabs do you have open, are you actually doing any hand coding yourself, do you have like five in parallel, are you just using Claude Code?

**Natasha:** I'll show you my screen as well. This is one day before the Claude live stream was scheduled. We were like "okay tomorrow, coding is going to change. We'll have a much more capable model which will be able to work for everything that we want. We're basically going to get a coding genie for us."

So the best most productive thing for us to do today instead of doing our regular scheduled programming - we should just jam for a 2-hour call where we make a massive list of issues that we want the future, tomorrow's superior model to solve. We did that - we created like 20 issues in terms of what we want to fix, what were the things that we were planning to work on and prepared the system for the new Claude model.

It was funny because Natasha had prompted ChatGPT to say "hey tomorrow we reached AGI, can you help us come up with everything we need to do and prepare the AGI to solve everything we did?" And then we fed that into the prompt improver of Anthropic and then we used that as a prompt.

### The GitHub Issues System

[*Shows Kanban board in GitHub*]

**Dan:** For people who are listening, you have this sort of Trello board type thing inside of GitHub and for each thing that you've identified as what you want to do, it looks like you have a document that lays out in detail - if it's a feature or bug fix or whatever - it lays out in detail what it is and how to actually do it.

[*Opens feature document*]

So like a feature is you want to generate AI generated synthetic data and it has this document has everything from a problem statement to a solution vision to all the requirements and all the technical requirements and even it has implementation steps with day counts and stuff.

**Kieran:** This is one day is like one second. Yeah, so this we use Claude Code and we have this custom prompt that we generated to create these because it's a lot of work to create these and even with ChatGPT there's a lot of steps - you need to look at all the code, you need to come up, you have to think about it. There's a lot of thinking so it's really hard to do well.

So what we did - we created a command in Claude Code. A command is kind of a custom prompt that you use a lot and ours is like "hey there's a feature." 

[*Demonstrates voice-to-text input*]

So I have this CC command and Natasha and I were just jamming - we're like "Oh what if we do this? Oh that sounds cool." And then voice to text and it starts.

### Voice-to-Text Feature Creation

**Dan:** Let's see how this works. While it's running we can go over the thing.

**Kieran:** [*Speaking into voice-to-text*] "I want infinite scroll in Kora where if I am at the end of a brief, it should load the next brief and it should go until every brief that's unread is read."

**Dan:** I want people to understand - Kieran almost never types anything and does all voice text. He was just doing voice to text into his terminal into Claude Code with I believe an internal as-of-yet unreleased internal Every incubation called Monologue which he is the number four biggest user of.

Basically what it seems like it's doing is taking that - is it turning that into the document that we were looking at earlier or is it actually going and executing it?

**Kieran:** What it does is it will insert whatever I said here in the feature description and then it will follow all these steps:

1. **Research** - Grounding itself in the codebase, researching what exists
2. **Research best practices** - Searching the web, finding open-source patterns, grounding it in best practices in general
3. **Present a plan** - When I say "Yep sounds good" (human in the loop for the plan because sometimes it does it wrong but most of the time it's right)
4. **Create the GitHub issue** - It will put it in the right lane and all that

**Dan:** So you speak your feature into Claude Code and then it does all the research to create that long document and then just adds it into GitHub issues? That's really cool!

**Kieran:** It's an important step because this is different from Cursor coding. In Cursor normally you skip this step because the tool is not really made for it - the tool's made to code. Yes, you can create markdown files and all of that, but let's lean into an issue tracker - it exists and it works well and people use it and it already hooks into existing patterns. We can give this to a developer and they can implement it.

### Running Multiple Agents in Parallel

**Dan:** One of the things that just to point out is you're running this and I think one of the special things that when we saw Opus 4 for the first time we were like "Holy shit" - is that it just runs forever without any intervention and then gives you a pretty good result. We've had sort of agentic type things for a little while but it's just a way different level of autonomy and quality than we've ever had before. It's just checking things off of this to-do list in a way that I think other agent loops are just going to be a lot less thorough.

**Natasha:** Absolutely. Me and Kieran have a fun thing going on where we're trying to see who can have Claude Code running for the maximum amount of time. Kieran is winning the race right now - he ran it for 25 minutes, I'm only at 8 minutes right now.

**Dan:** How did you get it to go so long Kieran?

**Kieran:** A very, very long plan that includes a lot of tests and just make sure that it runs all the tests and fixes all the tests. It goes pretty long.

[*While they're talking, the system completes the research and creates the GitHub issue*]

**Kieran:** So while we were talking we did the research and we created this issue which is cool. We had I think six or seven running at the same time because we were just like "New idea let's go, new idea let's go."

What we also did - we went through user feedback, we read emails, just everything we could, we gathered and we were just brainstorming. It's really fun because if you're in this brainstorming place you can just kick off agents and see what comes up, what they come up with and take another time to then review.

---

## How to Build a Prompt That Turns Ideas Into Plans

**Dan:** I want to understand how did you make that prompt that creates the research document? How did you know which elements to put in? Did you just use the same thing where you used the Claude prompt improver, the Anthropic prompt improver to make that?

**Kieran:** This is part of the compounding effect - having an idea that has a lot of outcomes. This was what Natasha sent me: "We just got AGI, it got delivered and we can write software." That was your initial prompt which is kind of fun - it's very dramatic. And then ChatGPT said "I'm ready, okay so now do this."

I was like "Okay yeah that's fine, but do you know the Anthropic console prompt improver?" [*Shows Anthropic console*] This is great because basically you paste in a prompt or something like that and you can say "Yeah we will have thinking" and you click generate and it will improve the prompt automatically. You think "how good can it be?" It's pretty good because it's also very low friction - it's very easy to just take a minute to see if something comes out, if it works, if it doesn't work, delete it, doesn't matter.

We were just jamming and we were like "well we're going to come up with 30 research tasks so we better have a prompt." So I just copied this prompt and that became the document. [*Shows the custom prompt interface*] And then you can trigger those in Claude by doing slash and we have these two custom prompts here.

**Dan:** That actually gives me a much better idea of what you mean by compounding engineering because what it says to me is what you did first is spent time building a prompt that effectively builds other prompts, because those research documents are effectively prompts for Claude Code. So now that you have a prompt that builds prompts, every time you want to make a new feature you have to specify less - you just say the little feature and then it'll go do the research to build it out into a big document. Versus before, every single time you have to do a feature you have to say "at first I want you to research it and then I want you to think through all these different corner cases or the ways that I like things built" or whatever.

**Kieran:** I think that's so cool! And what's also really interesting to point out is it's working while we've been talking and that's just a different way to code. We were on the phone together last week or the week before and we were testing this out together and I shipped a feature that went to prod while we were talking which I'm not in the codebase at all. So it's kind of crazy that that actually happened and it's a kind of more social way to code - we're coding right now, building stuff which was not possible before.

---

## The New Mental Models for This Age of Software Engineering

**Dan:** What are the problems with this? Basically it sounds like you're moving to a form of coding where you don't touch the code, you're one level above. So what are the problems that come up with that and how are you solving them? What are the new engineering practices that you need to incorporate in order to make sure that things go well?

**Natasha:** For me, the most important realization for me has been this thing that I always keep going back to, especially with Claude Code. I read this in that management book "High Output Management" which the Intel CEO wrote like 50 years ago. The first chapter he mentioned something like how in any production process you should **fix any problem at the lowest value stage**.

I just can't stop thinking about that statement because AI and Claude Code can now do so many things for us, it has become really important to focus on the earliest part of things. What I mean by that is when we are using the workflow that Kieran just showed to create a very detailed GitHub issue, then it's very tempting to start another Claude Code to ask it to "hey go now work on this GitHub issue and fix it."

But that's actually going to be a problem because there are chances that the plan that Claude was able to create in that issue wasn't the direction that you wanted to go and you want to catch that before you ask Claude to go and implement the solution and then you want to fix it over there.

**Dan:** That makes perfect sense. I really like that idea. The thing it reminds me of is all this stuff is like a lever and the further out you get on the lever, the more power you have but also the more power you have to go in the wrong direction. Every little inch makes a big difference at the end. Trying to catch it earlier I think is the thing that makes sure that you're not shooting off into space.

I think that's actually a good lesson for me because I tend to want to rush through the planning stuff - it's just hard for me to look at a document like that and concentrate on it.

**Kieran:** It's kind of boring to read most of the time, but you can make it more fun. You can say "just minimal, this is too much" but then the thing is then it misses things again so it's actually important. For code I like it to focus on user stories or asking questions and answering them. So let's say "hey what are some questions a good PM would ask about this that we should consider and give two options?" That's more fun to read than "week one we'll do this, week two we'll do that." PRDs are boring and you can make them a little bit more fun or give more examples or you can shape that research. That's normally what we do in the human review step - do we see any red flags? Do we need more stuff to be added? Because it will save so much time.

---

## Why Traditional Tests and Evals Still Matter

**Dan:** That actually reminds me of something that we're finding in another part of the business. Danny who's been on this show is the GM of Spiral and inside of Spiral we're building a writing agent. So you can think of it sort of like Claude Code but specifically for writing tasks. I think there's something similar about that where sometimes you want the writing agent to shift into an interview mode where it tries to understand more about who you are and what you want rather than just spitting out a bunch of stuff that you then you have to read through.

It sounds like there's maybe something missing here in Claude Code or these sort of coding workflows where it would be really nice instead of having to read that long document, it's finding ways to ask you questions so that the thing it outputs is more likely to be right without you having to read through the whole thing.

**Kieran:** Absolutely! That's an interesting idea for a custom command - we should totally try that. At the same time it knows a lot because it has access to your codebase and your style and that's very powerful. You have the codebase and it's actually pretty good doing it.

I think in addition to making it very good at the beginning, I think just boring **traditional tests and evals are very important as well**. Because how do you know what you did is actually working? Well you can open a console and click through it but why? Just have it test it, write a test for it. Just a bare minimum smoke tests are great where you just see "does it kind of work?" because otherwise it does way too much but it's a very good way to have it iterate and fix things by itself.

We haven't tried it as much yet but we use the Figma MCP where we say "Hey implement this from Figma" and then now you can have Puppeteer take a screenshot for a mobile version and then say "compare the two." We haven't really tried it out but we want to try more of that out. So there are these checks in place, tests in place that you normally do manually.

The same for prompts - **eval for prompts**. I kind of think of an eval as writing a test for code. An eval is a test for a prompt. What I've seen last week as well - I had Claude Code run an eval and then say "actually it fails four out of 10 times." I said "run it 10 times, does it always pass?" "No, four times it doesn't." I said "Oh look at the output, why didn't it call that tool? It was a tool call test." And it says "Oh yeah it wasn't specific enough." And I said "Okay just keep going and change the prompt until it's passing consistently all the time." And it did it - I just walked downstairs, got a coffee, walked up and that was it.

So evals are also very powerful because they will tell you if a prompt works and similar to writing code, a test says your code works. So leaning into those more boring traditional ways is also very powerful.

---

## Kieran Ranks All the AI Coding Agents He's Used

**Dan:** I have a thought. One of the things I think is really special about you Kieran is that you just test everything. I want to spend five minutes with Kieran doing an S tier through F tier ranking of agents. I'm going to call out an agent and then you tell me where it ranks. Are you game?

**Kieran:** Yeah let's do it!

### The Rankings:

**Cursor:** A-tier
- "It's fun because cursor - what cursor is it? Claude 4? Is it max? Is it cursor on the best possible settings? And is it the background agent or is it the... that's the confusing part about cursor, windsurf - there are like a million versions of it. Why don't you just have the best version? That's what I love about certain agents - they just say look this is the best agent. So that's why it wouldn't be the best. I would say A."

**Windsurf:** C-tier  
- "C because they don't have Claude 4. It's ridiculous because three weeks ago they would be A and now they're not. I switched from cursor to windsurf a few months back but I switched back."

**Devon:** B-tier
- "It's not as integrated, it's a little bit hard to set up and the code quality is - it's not as well-rounded as cursor or Claude Code. I don't know if they use Claude 4 in the background but it's not as usable as the others."

**Charlie:** B-tier as agent, A-tier as code reviewer
- "Charlie is for code reviews so we use Charlie for code reviews mostly. I haven't really used it as an agent as much. I think Charlie as an agent is B but it's A as a code reviewer. I really like the code reviews it does. It's really good at something."

**Friday:** Between S and A-tier
- "I put Friday higher than cursor, maybe between S and A. It's funny because they don't even use Claude 4 yet, they're still working on how they really make it work well. It's 3.7 but why I like it there - it's definitely different than Claude Code but Friday has a very opinionated way of working and I love their opinions and it really works well and it just does it. You give an issue, they make a plan, you approve and it does it, creates a pull request. I've seen it do stuff that I couldn't do with Claude Code - for example, implement this Figma design. It just one-shotted a Figma design for the assistant and I've seen multiple moments like that where it did things where like 'wow okay this I taste the future' which is really unique. It's a small team as well so really cool."

**Codeium:** B-tier

**GitHub Copilot:** D-tier
- "I haven't used Copilot. I mean I used it three years ago but I tried it maybe a half a year ago and after one second I stopped using it. It was not agentic but I should try the new version for sure."

**Factory:** B-tier (below Codeium and Devon)
- "It's interesting - factory with certain things is better than any others but it's not my style. Factory is for more enterprisey people that are very nerdy and want absolute bangers of code and it's actually good - multi-repo stuff like that. It's a little bit hard to use because it's on the web but also local. I rate it B, maybe a little bit below Codeium and Devon. But there's a use for it for sure, there's something good there but it's maybe not for us, it's not my thing."

**AMP:** S-tier (under Claude Code)
- "I would put it S tier under Claude Code, between another S tier. It's very good at just getting work done. The ergonomics are pretty good, good tools already. People that build it, they're dog fooding - you can feel from Claude Code and AMP they're developers that love agents and they're just building the best thing and they're trying new things out."

**Claude Code:** S-tier (top)

### Using Multiple Agents Together

**Dan:** This is exactly why Kieran is the big fish. You're stringing them together - you're using Claude Code and Friday and other stuff all at the same time.

**Kieran:** Yeah! How I think about it more is you're interviewing for a role and you find a developer to solve a certain problem. I think it's similar with coding agents. Friday is good at doing UI now so if I need UI work I will go to Friday. If I need to do research I go to Claude. And yeah, if I want a code review I use Charlie. It's fun and agents work together - you don't need to have one agent.

We have Claude Code and that's because Charlie works in GitHub so you can just CC Charlie and Charlie will do the code review on the PR. So we use GitHub and pull requests and normal developer flows so humans can hook in. So we can hire someone that's very good at specific thing and review code and then Claude Code will just do the work but it's very powerful because it is just an ecosystem that we refined over like 20 years or whatever and it works. So let's lean into that and that's probably why Copilot will probably be fine since it's in there already.

### Bringing in Human Experts

**Dan:** You actually did that recently - we had some infrastructure things where you know we've handled tons and tons and tons of emails at Kora so we had some infrastructure issues to work out and you seemed like you brought in someone who's like a real expert and then worked with them in a specific agentic way that you got what you needed from them but it was less work for them.

**Kieran:** Yeah! There was no issue yet but we wanted more visibility in delivery of the most important things. I'm not very good at it or I know stuff but let's bring in someone. What we did - we just had a conversation, a 2-hour call and I recorded everything and at the end I just fed that into Claude and said "okay can you make two resource issues from this?" And 10 minutes later I said "okay here are the issues, can you review them?" And he was like "holy what?" 

This guy, he's not an AI skeptic but he's very good at what he does and normally what he does AI is not good at yet because there are things AI is not as good at yet. But he was very impressed with it and he had very good comments on it to iterate over it. What we basically did - we just iterated more quickly through ideas because we had something to talk about and then I said the next day when he did the human review "let's go" - I just use Claude Code to implement it and we sat down and did the code review. So it's just accelerated what would have taken 2 weeks maybe is now in a few hours which is really cool.

---

## Final Recommendations

**Dan:** Well there you have it - you've got your tier list of agents. Claude Code takes the cake, we've got AMP coming up in second and GitHub Copilot unfortunately bringing up the rear but with room for improvement once we try out their agentic capabilities. Anything else you guys want to say or talk about before we end today?

**Kieran:** Everyone should use Claude Code or try it out even if you're not technical. Subscribe for their max or pro plan - it's only $100 per month, you have unlimited access. If you're skeptical about being technical, it's very easy and I've seen people - a friend of mine, he used cursor and I said "just use Claude Code, it's better." "How much better can it be?" And he said "yes it's better" and he rebuilt everything he did with cursor vibe coded into Claude Code and he's like "yeah this is great." He felt that next step and everyone should try it and really push their tools.

**Natasha:** Just be sure to check the AI's work at the lowest value stage. You want to catch those problems early.

**Dan:** That's a great one. And also use Kora - Kora.computer, check it out. It's pretty awesome, we're shipping new things all the time. Thank you both for coming on, this is a true pleasure. I cannot wait to see what else you cook up over the next couple months and we'll talk soon.

---

## Episode End

[*Enthusiastic closing about subscribing to AI and I podcast*]

---

### Key Takeaways

1. **Compounding Engineering** - Each piece of work makes the next piece easier
2. **Claude Code > Traditional IDEs** - Terminal-based AI agent with full system access
3. **Voice-to-Text Workflows** - Speaking features directly into development tools
4. **Multi-Agent Orchestration** - Using different agents for different specialties
5. **Early Problem Detection** - Fix issues at the lowest value stage
6. **Traditional Testing Still Matters** - Evals and tests remain crucial
7. **Human Review Loops** - Strategic intervention points for quality control