# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for Ledger Flow. Session Replay, Error Tracking, and Support were already enabled, and the health, error, support, and scout signal routes are enabled for the inbox. The scout coordinator will pick up the refreshed configuration within about 30 minutes; findings will appear in the [Self-driving inbox](https://us.posthog.com/project/607370/inbox) as data arrives.

## AI data processing

Approved.

## GitHub

The GitHub App was already connected before this setup. No GitHub Issues responder was enabled because no external tool was selected.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | Already enabled | This Expo / React Native app uses `posthog-react-native`; no recordings exist yet. The server toggle is on, but replay becomes useful as the mobile SDK sends sessions. |
| Error Tracking | Already enabled | The mobile SDK captures exceptions. |
| Support (Conversations) | Already enabled | Tickets will arrive only after an inbound email, inbox, or Slack channel is connected in PostHog. |

This is a mobile app, not a `posthog-js` web app, so there is no browser initialization override to review.

## Signal sources

| Signal source | Action |
|---|---|
| `health_checks` / `health_issue` | Already enabled — config `01a09baa-62a9-7553-b2dc-dad54accdc89`. |
| `error_tracking` / `issue_created` | Already enabled — config `01a09baa-6220-7810-b8f8-96fea7f2c4e7`. |
| `error_tracking` / `issue_reopened` | Already enabled — config `01a09baa-61dd-7667-8d1e-ba067bba6eab`. |
| `error_tracking` / `issue_spiking` | Already enabled — config `01a09baa-61d4-7d63-9e9f-154c12e66745`. |
| `conversations` / `ticket` | Already enabled — config `01a09baa-61c7-77d1-93f5-e2017cf11c46`. |
| Scout gate | On by default; no opt-out row was created. |
| Session Replay | Deliberately routed through Replay Vision scanners; no retired source row was created. |
| Connected-tool responders | Skipped because no tool was selected. |

## Connected tools

No external tool was selected in the connected-tools step. The GitHub App remains connected, but GitHub Issues and all other external responders are not used by this setup.

## Scout troop

**Enabled (8 of 32)**

| Scout | Reason |
|---|---|
| `signals-scout-general` | Watches cross-product patterns and product surfaces without a dedicated specialist. |
| `signals-scout-health-checks` | Watches actionable PostHog instrumentation health issues. |
| `signals-scout-product-analytics` | Watches core lifecycle, funnel, retention, and path regressions. |
| `signals-scout-signin-liveness` | Watches returning-user password sign-in availability. |
| `signals-scout-signup-completion` | Watches account creation and email-verification completion health. |
| `signals-scout-subscription-detail-liveness` | Watches subscription-detail engagement becoming silent. |
| `signals-scout-subscription-browsing-mix` | Watches sustained shifts in subscription browsing behavior. |
| `signals-scout-subscription-creation-liveness` | Watches subscription creation becoming unexpectedly unavailable while broader activity remains healthy. |

**Disabled (24)**

The remaining built-in scouts stay disabled to keep the troop selective: AI observability, anomaly detection, APM, conversations, CSP, customer analytics, data pipelines, warehouse, experiments, feature flags, inbox validation, insight alerts, logs, MCP tools, observability gaps, Replay Vision trends, revenue, skills, surveys, tasks, web analytics, and web vitals do not have active, repo-supported surfaces to prioritize. The Error Tracking and Session Replay specialists remain disabled because their findings are covered by the native error source and Replay Vision monitors respectively.

| Run budget | Value |
|---|---:|
| Maximum runs per day | 100 |
| Runs used today | 13 |
| Runs remaining today | 87 |

> Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.

## Custom scouts

| Scout | What it watches | Discriminator | Why it is distinct |
|---|---|---|---|
| `signals-scout-subscription-creation-liveness` | Completed subscription creation from `components/CreateSubscriptionModal.tsx`. | It reports only a sustained, broad-reach drop in completed creations while signed-in app activity remains steady. | Existing custom scouts cover sign-in, sign-up, subscription-detail liveness, and browsing mix; this owns the add-subscription path. |

The approved subscription-creation scout is configured with a quick close-out, comparison against broader activity, checks for instrumentation gaps, and noise disqualifiers. Existing custom scouts continue to cover account access, account creation, subscription-detail liveness, and browsing mix. Generic error bursts and replay friction were ruled out because their native error and Replay Vision routes already cover them; revenue, LLM, survey, feature-flag, web, and support specialists lack confirmed active surfaces.

If any custom scout becomes noisy, set `emit: false` on its config in PostHog to switch it to dry-run.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes qualifying visual defects to the inbox. These are the only setup items that spend Replay Vision quota; findings arrive at half weight and need independent corroboration before they are promoted into a report.

| Scanner | Result | What it watches | Query scope | Sampling | Estimated monthly spend |
|---|---|---|---|---:|---:|
| Account creation breakage | Updated an earlier signal-emitting monitor | Visible failures during account creation and email verification. | Current URL contains `/sign-up`, the app’s account-creation completion flow. | 50% | 0 credits (0 observations) |
| Subscription management frustration | Updated an earlier signal-emitting monitor | Clear struggle while creating an account, verifying email, or managing subscriptions and account settings. | Recordings containing `$rageclick`; no URL filter. | 100% | 0 credits (0 observations) |

Both monitors are armed with `emits_signals: true`. No recordings were present when sized, so they will start observing as mobile Replay data arrives. The organization has 2,500 Replay Vision credits remaining for the current period and is not exhausted.

## Follow-ups

- [ ] Connect an inbound email, inbox, or Slack channel to PostHog Support so the enabled ticket responder can receive tickets.
- [ ] Run the mobile app through sign-up, sign-in, subscription creation, and subscription navigation, then confirm Session Replay recordings and mobile exception coverage arrive as expected.
- [ ] Re-authorize the PostHog MCP connection with `property_definition:read` if direct event-schema verification is needed; the project profile is also not built yet, so current product ranking is based on repository evidence and the existing roster.
- [ ] If an external tracker or support tool should automatically open draft PRs for fixable records, deliberately select and connect it from [new data warehouse sources](https://us.posthog.com/project/607370/pipeline/new/source), then rerun this setup.

## What happens next

The scout coordinator picks up fresh configurations within roughly 30 minutes. Scout runs draw from the verified daily budget, and findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/607370/inbox). Immediately actionable reports can start coding tasks.

## Files modified or created

- Updated `posthog-self-driving-report.md`.
- No application source files, dependency manifests, or environment files were modified.
