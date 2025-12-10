# MANDATORY: Continuation & Zero-Trust Verification Protocol

You are receiving a handoff document to continue an ongoing mission. Your predecessor's work is considered **unverified and untrustworthy** until you prove it otherwise.

**Your Core Principle: TRUST BUT VERIFY.** Never accept any claim from the handoff document without independent, fresh verification. Your mission is to build your own ground truth model of the system based on direct evidence.

---

## **Phase 1: Handoff Ingestion & Verification Plan**

- **Directive:** Read the entire handoff document provided below. Based on its contents, create a structured **Verification Plan**. This plan should be a checklist of all specific claims made in the handoff that require independent verification.
- **Focus Areas for your Plan:**
  - Claims about the environment (working directory, services).
  - Claims about the project structure and technology stack.
  - Claims about the state of specific files (content, modifications).
  - Claims about what is "working" or "not working."
  - The validity of the proposed "Next Steps."

---

## **Phase 2: Zero-Trust Audit Execution**

- **Directive:** Execute your Verification Plan. For every item on your checklist, you will perform a fresh, direct interrogation of the system to either confirm or refute the claim.
- **Efficiency Protocol:** Execute verification checks simultaneously when independent (environment + files + services in parallel).
- **Evidence is Mandatory:** Every verification step must be accompanied by the command used and its complete, unedited output.
- **Discrepancy Protocol:** If you find a discrepancy between the handoff's claim and the verified reality, the **verified reality is the new ground truth.** Document the discrepancy clearly.

---

## **Phase 3: Synthesis & Action Confirmation**

- **Directive:** After completing your audit, you will produce a single, concise report that synthesizes your findings and confirms your readiness to proceed.
- **Output Requirements:** Your final output for this protocol **MUST** use the following structured format.

### **Verification Log & System State Synthesis**

```
**Working Directory:** [Absolute path of the verified CWD]

**Handoff Claims Verification:**
- [✅/❌] **Environment State:** [Brief confirmation or note on discrepancies, e.g., "Services on ports 3330, 8881 are running as claimed."]
- [✅/❌] **File States:** [Brief confirmation, e.g., "All 3 modified files verified. Contents match claims."]  
- [✅/❌] **"Working" Features:** [Brief confirmation, e.g., "API endpoint `/users` confirmed working via test."]
- [✅/❌] **"Not Working" Features:** [Brief confirmation, e.g., "Confirmed that test `tests/auth.test.js` is failing with the same error as reported."]
- [✅/❌] **Scenario Type:** [API Development/Frontend Migration/Database Schema/Security Audit/Performance Debug/Other]

**Discrepancies Found:**
- [List any significant differences between the handoff and your verified reality, or state "None."]

**Final Verified State Summary:**
- [A one or two-sentence summary of the actual, verified state of the project.]

**Next Action Confirmed:**
- [State the specific, validated next action you will take. If the handoff's next step was invalid due to a discrepancy, state the new, corrected next step.]
```

---

> **REMINDER:** You do not proceed with the primary task until this verification protocol is complete and you have reported your synthesis. The integrity of the mission depends on the accuracy of your audit.

**The handoff document to be verified is below. Begin Phase 1 now.**

$ARGUMENTS