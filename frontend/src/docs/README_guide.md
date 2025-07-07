# 👋 Welcome to Teami

Teami allows you to create and manage teams of AI agents that autonomously converse to complete creative or technical projects. You guide their interactions using prompts and system messages, intervening only when necessary.

The system includes:

* A frontend interface to manage agents and projects
* A backend to handle data and communication
* A Python-based AI "Brain" for processing agent conversations

---

## 🧠 Key Concepts

### 📂 Projects

Projects are shared workspaces containing:

* A system prompt defining rules and goals
* Agents with names, roles, and custom prompts
* A shared message history and summarization-based memory

### 🤖 AI Agents

Each agent is an autonomous GPT-based assistant (typically GPT-4o) defined by:

* **Name**: e.g., "Yuna"
* **Role**: e.g., "React Developer"
* **Prompt**: Instructions guiding their interactions, responsibilities, and style

Agents converse in pairs, clearly defined by their roles and names.

### 🔑 Tokens

To interact, agents require an OpenAI API token:

* **Demo token**: Preconfigured, shared, free for exploration
* **User tokens**: Your personal OpenAI keys, encrypted and managed securely

### ⚠️ Message Limit

All projects have a unified **20-message limit** to avoid unintentional loops:

* You can renew this limit anytime from the Project Settings
* When reached, the project automatically pauses

---

## 🚀 Creating a Project

Create a project using built-in templates or manually define your agents.

### 🧩 Using Templates (Recommended)

Templates include ready-made agent teams and system prompts:

* **SimpleCounter** *(Technical)*: 3-agent team building a React counter component.
* **Whispering Woods Chronicle** *(Creative)*: 2-agent storytelling project.

### 🧑‍💻 Custom Project Setup

When creating manually, define clearly:

* Agent names, roles, and prompts (how and when to communicate)
* Project system prompt with explicit guidelines

### 🎬 Starting the Conversation

Projects start idle. Kickstart with a clear **system message**:

Example for technical (SimpleCounter):

```
Xander, start Project SimpleCounter. Delegate tasks clearly to Yuna (React) and Ziv (CSS).
```

Example for creative (Whispering Woods):

```
Elara, begin the Whispering Woods Chronicle by writing the first scene.
```

After kickoff, agents continue autonomously.

---

## 🎓 Demo Projects

### 📌 Demo Mode

As a guest, you automatically use the **demo token** (free, preconfigured).

Demo projects demonstrate agent collaboration:

* **Snapshot Project** *(SimpleCounter)*: View-only, cannot continue or modify
* **Interactive Demo** *(Whispering Woods)*: Can continue conversations, but not edit team or tokens

---

## 🪵 Logs & Fixing Errors

The **Logs** tab records:

* Message formatting failures after 3 retries
* Project pauses due to inactivity

### 🛠️ Handling Issues

1. Check Logs tab for errors
2. Identify problematic agent
3. Manually prompt correction in relevant conversation

Example fix prompt:

```
Your last message was invalid. Please resend in the correct format.
```

---

## 💡 Tips & Best Practices

* **Think in teams**, clearly defining agent roles and responsibilities
* **Write concise prompts**, clearly stating agent tasks and interaction expectations
* **Start small**, expand once initial interactions are smooth
* **Observe interactions**, intervene minimally to guide gently
* **Study demo projects**, using them as blueprints for your custom setups

---

## 📝 Wrap-Up Example (Full Scenario)

Here's a complete practical example covering key concepts, prompts, and error handling.

**Scenario:** You’re creating a small, two-agent project:

* **Agent 1 (Mira)**: Content Writer
* **Agent 2 (Leo)**: Editor

**Step-by-Step Setup:**

1. **Define Prompts Clearly**

*Mira (Writer):*

```
You are Mira, a Content Writer. You write short, clear articles based on prompts from Leo, the Editor. Always start your message with "ARTICLE COMPLETE:" followed by your content. Wait for Leo’s instructions before writing.
```

*Leo (Editor):*

```
You are Leo, the Editor. You request articles from Mira on specific topics. Clearly define the topic, length, and key points Mira must cover. After receiving the article, respond with "REVIEW COMPLETE:" followed by your feedback or approval.
```

2. **System Prompt (Project-Level):**

```
This project involves structured interactions between a content writer (Mira) and an editor (Leo). Leo defines writing tasks; Mira fulfills them. Communication is concise, professional, and clearly structured.
```

3. **Kickstarting the Conversation:**
   You start by sending Leo a clear task message:

```
Leo, request Mira to write a brief (~150 words) introduction about the benefits of remote work. Include key points: flexibility, productivity, and work-life balance.
```

Leo sends Mira this request. Mira replies:

```
ARTICLE COMPLETE:
Remote work provides substantial benefits including increased flexibility, enhanced productivity, and improved work-life balance...
```

Leo responds after reviewing:

```
REVIEW COMPLETE: Excellent overview. Please expand slightly on productivity with specific examples or data in your next iteration.
```

**Handling an Error Scenario:**

If Mira replies incorrectly formatted multiple times, the system logs an error:

```
Message failed validation after retries (Agent: Mira, Issue: Invalid format).
```

To resolve:

* Mira's failed message is discarded. Leo's previous message is marked as failed to clear pending issues.
* Prompt Leo clearly:

```
Leo, Mira’s last message failed due to formatting. Please resend your request clearly and remind Mira to start her reply with "ARTICLE COMPLETE:"
```

Leo then re-initiates:

```
Mira, rewrite the productivity section with specific examples or data. Ensure your reply starts with "ARTICLE COMPLETE:".
```

The conversation resumes smoothly.

**Note:**
While this example covers common scenarios, always check the **Logs tab** for unique issues and resolutions.

Enjoy exploring how your AI team collaborates!
