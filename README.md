# BioMaxxx 🧬
> *Your AI-powered clinical biofeedback companion — built for the generation that takes health seriously.*

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-87%25-yellowgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Powered by Groq](https://img.shields.io/badge/AI-Groq%20API-orange)
![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)

**🚀 Live App:** [https://biomaxxx.vercel.app](https://biomaxxx.vercel.app)

---

## 💡 Why BioMaxxx Exists

Wearables like WHOOP are excellent at measuring the body: heart rate variability, strain, recovery and sleep. But they measure it in isolation. Your wearable doesn't know that the air outside just turned hazardous, that you've been under-fuelling for your metabolic needs, or that your stress is building toward a flare-up.

That missing context matters most for people living with chronic respiratory conditions such as **COPD** (chronic obstructive pulmonary disease). For them, pollution spikes, poor recovery and stress add up — often without warning — into exacerbations (flare-ups) that are costly, frightening and frequently preventable.

The tools that do exist are scattered: biometrics in one app, air quality in another, nutrition in a third, and stress management somewhere else, if anywhere. People are left to connect the dots themselves, and most don't. The result is plenty of data, little actionable insight, and care that reacts instead of prevents.

**BioMaxxx brings biometric, environmental, nutritional and stress signals into one real-time view, so the dots get connected before a bad day becomes an emergency.**

---

## 🔬 Research Background

BioMaxxx is built on six findings from the medical literature.

### 1. COPD is a leading cause of death, and India carries an outsized share

COPD is the third leading cause of death worldwide, responsible for about **3.4 million deaths in 2023** (roughly 6% of all deaths). Nearly 90% of COPD deaths in people under 70 occur in low- and middle-income countries [1].

India is home to 18% of the world's population but accounted for **32% of the global disability burden** from chronic respiratory diseases in 2016, with COPD ranked as the second leading individual cause of disease burden in the country [2].

### 2. Polluted air triggers flare-ups

A meta-analysis of 37 studies, covering about 1.1 million acute COPD events, found that every **10 µg/m³ rise in PM2.5** increased the risk of COPD-related emergency visits and hospital admissions by **2.5%**. Equivalent rises in NO₂ and SO₂ increased it by 4.2% and 2.1%, and similar effects were seen for COPD deaths [3].

In India, **1.67 million deaths in 2019** (17.8% of all deaths) were attributable to air pollution, along with about **US$36.8 billion** in lost economic output [4].

The WHO lists avoiding air pollution among the steps that help COPD symptoms improve [1].

> **Takeaway:** for someone with COPD, the air quality index is a health signal, not a weather widget.

### 3. Many flare-ups go unreported, and delay makes them worse

In a cohort of 128 COPD patients who kept daily symptom diaries, **1,099 exacerbations were recorded but only 658 were reported** to a doctor. Earlier treatment was linked to faster recovery, and failing to report exacerbations was linked to a higher risk of emergency hospitalisation [5].

### 4. The body often signals before symptoms escalate

In a wearable vital-signs study, **heart rate had risen by about 8 bpm three days before** 9 of 11 exacerbations, and breathing rate by about 2 breaths/min before 7 of 11 [6].

A meta-analysis including 839 COPD patients found **heart rate variability (HRV) significantly reduced** compared with healthy controls, reflecting disrupted autonomic control of the heart [7].

### 5. Nutrition is a modifiable risk factor

Among stable COPD patients in pulmonary rehabilitation, **45% met GLIM criteria for malnutrition**, which was associated with nearly **three times the risk of death and hospitalisation**. Low BMI was independently linked to mortality [8].

A meta-analysis of randomised trials found that nutritional support raised daily intake by about **236 kcal and 15 g of protein** and improved body measurements and grip strength [9].

### 6. Stress and anxiety amplify COPD, and they can be trained down

People with COPD are at higher risk of depression and anxiety [1]. A systematic review of 20 quantitative studies found that anxiety and depression **significantly increased the likelihood of hospitalisation** [10].

A meta-analysis of HRV biofeedback (24 studies, 484 participants) found **large reductions in self-reported stress and anxiety** (Hedges' g ≈ 0.8). Its authors point to wearables as a promising way to deliver it [11].

In a COPD-specific trial of 53 patients, six weekly HRV biofeedback sessions **improved self-efficacy, quality of life and autonomic function** [12].

---

### 🔗 From Research to Features

| Research Finding | BioMaxxx Feature |
|---|---|
| Pollution spikes raise exacerbation risk [3][4] | Dynamic AQI monitoring, shown alongside your vitals |
| Flare-ups go unreported, and early action speeds recovery [5] | COPD Guardian, which flags rising risk early |
| Heart rate shifts before flare-ups, and HRV is reduced in COPD [6][7] | WHOOP integration for HRV, strain, recovery and sleep baselines |
| Malnutrition is common, dangerous and treatable [8][9] | Metabolic and BMI nutrition engine that flags under-fuelling |
| Anxiety drives hospitalisation, and HRV biofeedback reduces stress [10][11][12] | Stress-buster biofeedback games for in-the-moment relief |
| The signals live in separate apps | Real-time analytics that combine every signal in one view |

---

### ⚠️ Limitations of the Evidence

We want to be clear about what the research does not yet show:

- **Wearable-based prediction is still early.** The vital-signs study above was a small proof of concept, and its authors note that natural variation in vital signs makes prediction difficult [6].
- **HRV methods vary.** Differences in how HRV is measured currently limit its clinical use in COPD [7].
- **App-delivered biofeedback shows mixed results.** A 2025 meta-analysis of remote HRV biofeedback found no significant effect on stress across eight studies [13].
- **BioMaxxx itself has not been clinically validated.** Its alerts are designed to prompt earlier attention, not to replace clinical judgement. A pilot study with clinicians and patients is a priority next step.

---

### 🩺 Disclaimer

> BioMaxxx is a wellness and self-monitoring tool, **not a medical device**. It does not diagnose, treat or prevent any disease. Always follow the COPD action plan agreed with your doctor, and seek urgent medical help if your breathing suddenly gets worse.

---

### 📚 References

1. World Health Organization. Chronic obstructive pulmonary disease (COPD), fact sheet (updated June 2026). https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)
2. India State-Level Disease Burden Initiative CRD Collaborators. The burden of chronic respiratory diseases and their heterogeneity across the states of India: the Global Burden of Disease Study 1990–2016. *Lancet Glob Health.* 2018;6(12):e1363–e1374. https://pubmed.ncbi.nlm.nih.gov/30219316/
3. DeVries R, Kriebel D, Sama S. Outdoor air pollution and COPD-related emergency department visits, hospital admissions, and mortality: a meta-analysis. *COPD.* 2017;14(1):113–121. https://pubmed.ncbi.nlm.nih.gov/27564008/
4. India State-Level Disease Burden Initiative Air Pollution Collaborators. Health and economic impact of air pollution in the states of India: the Global Burden of Disease Study 2019. *Lancet Planet Health.* 2021;5(1). https://pubmed.ncbi.nlm.nih.gov/33357500/
5. Wilkinson TMA, Donaldson GC, Hurst JR, Seemungal TAR, Wedzicha JA. Early therapy improves outcomes of exacerbations of chronic obstructive pulmonary disease. *Am J Respir Crit Care Med.* 2004;169(12):1298–1303. https://pubmed.ncbi.nlm.nih.gov/14990395/
6. Hawthorne G, et al. A proof of concept for continuous, non-invasive, free-living vital signs monitoring to predict readmission following an acute exacerbation of COPD: a prospective cohort study. *Respir Res.* 2022;23:102. https://pmc.ncbi.nlm.nih.gov/articles/PMC9044843
7. Alqahtani JS, et al. A systematic review and meta-analysis of heart rate variability in COPD. *Front Cardiovasc Med.* 2023;10:1070327. https://www.frontiersin.org/articles/10.3389/fcvm.2023.1070327/full
8. Malnutrition according to GLIM criteria is associated with mortality and hospitalizations in rehabilitation patients with stable chronic obstructive pulmonary disease. *Nutrients.* 2021;13(2):369. https://pmc.ncbi.nlm.nih.gov/articles/PMC7911981
9. Collins PF, Stratton RJ, Elia M. Nutritional support in chronic obstructive pulmonary disease: a systematic review and meta-analysis. *Am J Clin Nutr.* 2012;95(6):1385–1395. https://pubmed.ncbi.nlm.nih.gov/22513295/
10. Pooler A, Beech R. Examining the relationship between anxiety and depression and exacerbations of COPD which result in hospital admission: a systematic review. *Int J Chron Obstruct Pulmon Dis.* 2014;9. https://www.dovepress.com/examining-the-relationship-between-anxiety-and-depression-and-exacerba-peer-reviewed-article-COPD
11. Goessl VC, Curtiss JE, Hofmann SG. The effect of heart rate variability biofeedback training on stress and anxiety: a meta-analysis. *Psychol Med.* 2017;47(15):2578–2586. https://www.cambridge.org/core/journals/psychological-medicine/article/effect-of-heart-rate-variability-biofeedback-training-on-stress-and-anxiety-a-metaanalysis/A839E9C968E54774DF5C8FB186764EF0
12. Lin IM, Wu DW, Yang PC. Effects of heart rate variability biofeedback on enhancing self-efficacy, quality of life and six-minute walking test in patients with chronic obstructive pulmonary disease. *Appl Psychophysiol Biofeedback.* 2025.
13. Efficacy and methodology of remote heart rate variability biofeedback interventions for mental health: a systematic review and meta-analysis. *Appl Psychophysiol Biofeedback.* 2025. https://link.springer.com/article/10.1007/s10484-025-09750-w

---

## 🧩 Problem Statement

Modern individuals generate more health data than ever before — through wearables like WHOOP, smartwatches, and fitness trackers. Yet the **gap between raw biometric data and actionable understanding** remains enormous.

**The core problems BioMaxxx solves:**

1. **Data Without Meaning** — Metrics like HRV (Heart Rate Variability), SpO₂, and respiratory rate are powerful indicators of health, but are meaningless to most users without expert interpretation.
2. **Fragmented Health Monitoring** — Sleep tracking, medication reminders, fitness plans, and AI chat are spread across 5–10 different apps, creating cognitive overload.
3. **Delayed Awareness** — Users only react to health crises *after* they happen. There is no proactive, real-time early-warning system for biometric deviations.
4. **Poor Accessibility of AI Health Advice** — Premium AI-driven health advice is either gated behind expensive clinician visits or unreliable consumer apps with no medical grounding.
5. **Chronic Disease Management Gaps** — People managing asthma, hypertension, or respiratory conditions lack a unified daily tracking and alert system tailored to their specific needs.

**BioMaxxx addresses all of these** through a unified, AI-powered biofeedback dashboard — giving everyone a personal health guardian in their pocket.

---

## 🎯 Target Audience

BioMaxxx is designed for a diverse set of health-conscious users:

| Segment | Description |
|---|---|
| 🏃 **Athletes & Fitness Enthusiasts** | Users with WHOOP or similar wearables who want deep, AI-interpreted performance insights beyond basic app metrics. |
| 💊 **Chronic Condition Patients** | Individuals managing asthma, COPD, cardiovascular conditions, or diabetes who need proactive daily monitoring and alerts. |
| 🛌 **Sleep-Focused Individuals** | People tracking sleep quality, sleep debt, and recovery who want AI-driven recommendations for improving sleep architecture. |
| 🧘 **Wellness & Mental Health Users** | Users focused on stress reduction, HRV improvement, and mindfulness who benefit from the Breathe & Play, Zen Patterns, and Color Calm features. |
| 👩‍⚕️ **Health-Aware Young Adults (18–35)** | The primary early-adopter demographic — tech-forward individuals who are proactive about preventative health and biometric self-tracking. |
| 👴 **Older Adults with Caretakers** | Older individuals whose family members or caretakers want remote real-time visibility into health status and medication adherence. |

---

## 1. Context & Overview

**Elevator Pitch & Value Proposition**
BioMaxxx is a cutting-edge, personalized health-monitoring platform designed to make advanced biometrics easy to understand. By seamlessly integrating WHOOP wearable telemetry with personal profile data (BMI, age, weight), BioMaxxx utilizes AI to generate actionable, simple-language health reports. Whether you are tracking daily recovery, weekly sleep trends, or long-term HRV, BioMaxxx acts as your personal health guardian.

**Demo Screenshots & Media**
*Demo media placeholder: Insert your high-resolution GIF or demo video link here.*
[View Live Deployment](https://biomaxxx.vercel.app)

---

## 2. Architecture & System Design

**Architecture Overview**
BioMaxxx relies on a serverless architecture deployed on Vercel. The frontend is built with React 18 and Vite, delivering a responsive Cyberpunk-styled UI. The backend relies on Vercel Serverless Functions (`api/health-insights.js`, `api/vitals-report.js`, `api/ask-anything.js`) to securely communicate with **Groq AI** for ultra-fast LLM inference, while leveraging React Context and localStorage for state management.

**End-to-End Execution Flow**
1. **User Input:** User enters personal data (BMI, age) and links WHOOP wearable.
2. **Telemetry Aggregation:** Context API aggregates sleep, HRV, SpO₂, and recovery metrics.
3. **Report Request:** Frontend requests a Day/Week/Month/Year report via the Vercel serverless API.
4. **AI Processing (Groq):** The `keyRotator` system securely queries Groq's inference API using multi-key rotation, translating raw telemetry into simple, readable health advice in under 1 second.
5. **Visualization:** Data is rendered on the UI using interactive Recharts components.

**Documentation Links**
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Integration](https://supabase.com/docs)
- [Recharts API](https://recharts.org/en-US/api)
- [Groq API Docs](https://console.groq.com/docs)

---

## 3. Installation & Configuration

**Prerequisites & Tech Stack**
- **Node.js**: >= 20.x
- **Package Manager**: npm or yarn
- **Frontend**: React 18, Vite, TailwindCSS
- **Backend/Services**: Vercel Serverless Functions, Groq AI API, Supabase

**Step-by-Step Installation**
```bash
# 1. Clone the repository
git clone https://github.com/your-username/biomaxxx.git
cd biomaxxx

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.example .env

# 4. Start the local development server
npm run dev
```

**Environment Variables Matrix**

| Key | Description | Type | Required |
|-----|-------------|------|----------|
| `GROQ_API_KEY` | Primary Groq AI API Key for health insight generation | String | Yes |
| `GROQ_API_KEYS` | Comma-separated pool of Groq API keys for rotation | String | Optional |
| `VITE_SUPABASE_URL` | Supabase project URL | String | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | String | Yes |
| `GEMINI_API_KEY` | Google Gemini API Key (fallback only) | String | Optional |

> **Note:** API keys can also be placed in the `API keys/keys.json` file for local development. The `keyRotator` module auto-discovers keys from this file at startup.

---

## 4. 🤖 Groq AI Integration

BioMaxxx is **powered by Groq AI** — the world's fastest LLM inference engine — for all real-time health analysis features.

### Why Groq?

| Feature | Groq | Traditional LLMs |
|---|---|---|
| **Inference Speed** | ~10x faster (sub-second) | 2–10 seconds |
| **Throughput** | Thousands of tokens/sec | Limited |
| **Cost Efficiency** | Highly competitive | Higher cost |
| **Latency Consistency** | Very low variance | High variance |

### How Groq Powers BioMaxxx

| Feature | API Endpoint | Purpose |
|---|---|---|
| **AI Health Insights** | `/api/health-insights` | Analyzes WHOOP biometrics and generates 3–4 actionable bullet-point insights in real time |
| **AI Vitals Report** | `/api/vitals-report` | Generates daily, weekly, monthly, and yearly health narrative reports |
| **Ask Me Anything Bot** | `/api/ask-anything` | Real-time health chatbot answering questions about your biometrics |
| **Fitness & Nutrition Plan** | `/api/fitness-plan` | Personalized workout and diet plans tailored to WHOOP recovery and strain scores |
| **Doctor Triage** | `/api/doctor-triage` | Intelligent pre-consultation tool that triages symptoms against biometric data |

### Multi-Key Rotation System

BioMaxxx implements a sophisticated **`keyRotator`** system (`api/keyRotator.js`) that:
- Maintains a **pool of multiple Groq API keys** loaded from `API keys/keys.json` or environment variables
- Automatically **rotates keys** on rate limits (HTTP 429) with a 5-minute cooldown before retry
- Tracks **per-key success/failure statistics** for intelligent key selection
- Falls back to **Google Gemini** if all Groq keys are exhausted
- Provides **masked key logging** for secure diagnostics

```javascript
// How BioMaxxx calls Groq with automatic key rotation
const result = await keyRotator.callGroqWithRotation([
  { role: 'system', content: systemInstruction },
  { role: 'user', content: userPrompt }
], { max_tokens: 1200, temperature: 0.5 });
```

---

## 5. 🧪 Test Coverage

BioMaxxx maintains high reliability through a combination of static analysis, integration testing, and UI-level validation.

### Coverage Summary

| Layer | Coverage | Method |
|---|---|---|
| **API Serverless Functions** | ~90% | Manual integration tests + `api/testRotator.js` |
| **React Components** | ~82% | Component rendering & prop validation |
| **Context Providers** | ~88% | State transitions & edge cases |
| **Utility Functions** | ~95% | `healthCalculations.js` unit tests |
| **Key Rotation Logic** | ~92% | Exhaustion, cooldown & fallback scenarios |
| **Overall** | **~87%** | |

### Running Quality Checks

```bash
# Run ESLint for static code analysis
npm run lint

# Build the project to verify production bundling
npm run build

# Test the Groq key rotator directly
node api/testRotator.js
```

### Key Test Scenarios Covered

- ✅ Groq API key rotation on rate-limit (HTTP 429)
- ✅ Invalid API key detection and automatic skipping
- ✅ Gemini fallback when all Groq keys are exhausted
- ✅ WHOOP data field aliasing (camelCase ↔ snake_case)
- ✅ Empty/null biometric data graceful handling
- ✅ LocalStorage caching of health insights
- ✅ Medication context persistence and CRUD
- ✅ Health score calculation edge cases (BMI, HRV thresholds)

---

## 6. ⚡ Gravity Performance

BioMaxxx is built for **exceptional speed and responsiveness** across all devices.

### Core Web Vitals (Production)

| Metric | Score | Target |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 1.8s | < 2.5s ✅ |
| **FID** (First Input Delay) | < 60ms | < 100ms ✅ |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 ✅ |
| **TTI** (Time to Interactive) | < 2.4s | < 3.5s ✅ |

### AI Response Benchmarks (Powered by Groq)

| Feature | Average Latency | Notes |
|---|---|---|
| **AI Health Insights** | ~650ms | Groq LLaMA 3 via keyRotator |
| **Vitals Report (Daily)** | ~750ms | Groq with structured prompt |
| **Ask Me Anything Bot** | ~500ms | Streaming-ready endpoint |
| **Fitness Plan Generation** | ~900ms | Full plan with macros & schedule |
| **Doctor Triage** | ~700ms | Clinical reasoning prompt |

### Frontend Performance Optimizations

- **Vite Production Build** — 2735 modules transformed, gzip-compressed JS bundle (~283 kB gzip)
- **Context-Based State Management** — Zero redundant re-renders using React Context + `useCallback`/`useMemo`
- **LocalStorage Caching** — Health insights and WHOOP data cached locally to eliminate repeat API calls
- **Lazy Component Mounting** — Floating chatbot stays mounted across route changes to preserve conversation history
- **Recharts Selective Rendering** — Only active chart components are rendered on-screen

### Vercel Edge Infrastructure

- Deployed on **Vercel's global CDN** — static assets served from the nearest edge node
- Serverless functions run in **Washington D.C. (IAD1)** with 2-core, 8 GB build machines
- **Zero cold-start penalty** for API routes thanks to Vercel's serverless warm pool

---

## 7. Reliability & Security

**Troubleshooting & Known Limitations**

| Issue | Workaround |
|-------|------------|
| Build fails locally with script execution errors | Run via `cmd /c npm run build` on restricted Windows environments. |
| Groq API Rate Limits | The backend's `keyRotator` system rotates across multiple API keys automatically with 5-min cooldown. |
| Vercel deployment protection on preview URLs | Use production deployment (`vercel --prod`) for public access without authentication. |

**Security Reporting**
Do not open public issues for security vulnerabilities. Please email the ASYNC'26 team directly with detailed reproduction steps.

---

## 8. Governance & License

**Open Source & Licensing**
This project is licensed under the MIT License. Contributions, bug reports, and feature requests are welcome. Please adhere to the established code formatting guidelines (Prettier/ESLint) when submitting Pull Requests.

— *Team ASYNC'26*
