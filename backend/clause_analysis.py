# clause_analysis.py
"""
This module provides a function to analyze a clause change summary (from /analyze_changes)
and return a structured analysis using an LLM API (prompt placeholder included).
"""
import os
import requests
import re
import json as pyjson
from typing import Any, Dict, Optional
from pydantic import BaseModel

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
GOOGLE_API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"

prompt = """
**Objective:**

This document outlines the methodology for analyzing clauses within a Non-Disclosure and Confidentiality Agreement (NDA). Your goal is to learn this methodology through the provided examples and then apply it to new clauses presented to you.

**Methodology Overview:**

For each clause or section presented, you will perform the following analysis steps:

1.  **Categorize:** Assign a relevant category label to the clause.
2.  **Summarize:** Provide a concise summary of the clause's main points.
3.  **Assess Risks:** Identify potential risks associated with the clause for both the Disclosing Party and the Receiving Party.
4.  **Suggest Improvements:**
    * Provide descriptive comments and suggestions for improving the clause, considering the perspectives of both parties (primarily focusing on the Disclosing Party as per the examples).
    * Offer specific revised wording for the clause based on these suggestions.

**Analysis Fields:**

The analysis for each clause *must* include the following specific fields, presented in this order:

* `The clause category is:`
* `The summary of this clause is:`
* `The potential risks for the disclosing party are:`
* `The potential risks for the receiving party are:`
* `The comments and descriptive improvement suggestions in favor of the disclosing party are:`
* `The comments and descriptive improvement suggestions in favor of the receiving party are:`
* `The specific wording suggestion considering both improvement suggestions for the disclosing [or receiving/both, as applicable] is:`

---

**Example Agreement Details:**

* **Title:** „Non-Disclosing and Confidential Agreement“
* **Effective Date:** May 02, 2025

---

**Example Analysis: Parties Section**

**Original Text:**
```legal
This Non-Disclosure and Confidentiality Agreement (the “Agreement”) is entered into May 02, 2025 (the “Effective Date”) by and between Quantum Innovations Inc., a corporation organized and existing under the laws of the State of Washington, with its principal office located at 7890 Maple Avenue, Suite 101 - 104, Seattle, WA 98101, USA, represented by its CEO, Suzanne Reynolds (“Disclosing Party”), and Michael Thompson located at 4567 Pine Street, Apt 203, Concord, NH 03301, USA (“Receiving Party”), also individually referred to as the “Party”, and collectively the “Parties”.
```

**Analysis:**

* **The clause category is:**
    Parties
* **The summary of this clause is:**
    The parties sections outlines the both parties, Quantum Innovations Inc. and Michael Thompson, that entered into the Agreement, gives them definitions "Disclosing Party" for Quantum Innovations Inc. and "Receiving Party for MIchael Thompson" that shall be used throughout the document and specifies the date the Agreement was entered into, May 02, 2025 and gives a definition for it, "Effective Date".
* **The potential risks for the disclosing party are:**
    Not applicable
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    This Non-Disclosure and Confidentiality Agreement (the “Agreement”) is entered into May 02, 2025 (the “Effective Date”) by and between Quantum Innovations Inc., a corporation organized and existing under the laws of the State of Washington, with its principal office located at 7890 Maple Avenue, Suite 101 - 104, Seattle, WA 98101, USA, represented by its CEO, Suzanne Reynolds (“Disclosing Party”), and Michael Thompson located at 4567 Pine Street, Apt 203, Concord, NH 03301, USA (“Receiving Party”), also individually referred to as the “Party”, and collectively the “Parties”.
    ```

---

**Example Analysis: Preamble**

**Original Text:**
```legal
The Parties are interested in exploring a potential business opportunity (the “Opportunity”). In order to adequately evaluate whether the Parties would like to pursue the Opportunity, it is necessary for both Parties to exchange certain confidential information.
```

**Analysis:**

* **The clause category is:**
    Preamble
* **The summary of this clause is:**
    To explore a potential business opportunity, the Parties disclose information to each other
* **The potential risks for the disclosing party are:**
    The clause implies that also the Receiving Party is disclosing information which might lead to the conclusion that the Disclosing Party would need to comply with obligations with regard to such information, however given the structural interpretations of the Agreement only the Disclosing Party shall diclose information
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Adjust the Preamble insofar as only the Disclosing Party is disclosing confidential information
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    The Parties are interested in exploring a potential business opportunity (the “Opportunity”). In order to adequately evaluate whether the Parties would like to pursue the Opportunity, it is necessary that the Disclosing Party discloses certain confidential information to the Receiving Party.
    ```

---

**Example Analysis: Clause 1 - Confidential Information Definition**

**Original Text:**
```legal
1. Confidential Information. The confidential information (“Confidential Information”) includes any information that is only known by the Disclosing Party, and not known by the general public at the time it is disclosed, whether tangible or intangible, and through whatever means it is disclosed.
Confidential Information does not include information that:
1.1.   The Receiving Party lawfully gained before the Disclosing Party actually disclosed it;
1.2.   Becomes available to the general public by no fault of the Receiving Party.
```

**Analysis:**

* **The clause category is:**
    Confidential Information Definition
* **The summary of this clause is:**
    Defines Confidential Information unspecified; excludes info known previously or becoming public.
* **The potential risks for the disclosing party are:**
    Ambiguities may allow the Receiving Party to argue information was previously known/public.
* **The potential risks for the receiving party are:**
    Potentially, all possible information of the disclosing party falls under the definition
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Clarify: 'Receiving Party bears the burden of proof to demonstrate that information falls within exceptions.'
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Clarify: list examples for confidential information, even if not exclusively
* **The specific wording suggestion considering both improvement suggestions for the disclosing and the receiving party is:**
    ```legal
    1.   Confidential Information. The confidential information (“Confidential Information”) includes any information that is only known by the Disclosing Party, and not known by the general public at the time it is disclosed, whether tangible or intangible, and through whatever means it is disclosed.
    1.1.   Confidential Information includes in particular, but is not limited to, information that:
    1.1.1.   technical data;
    1.1.2.   trade secrets;
    1.1.3.   research;
    1.1.4.   financial information;
    1.1.5.   other business or technical information or industry knowledge disclosed by the Disclosing Party.
    1.2.   Confidential Information does not include information that:
    1.2.1.   The Receiving Party lawfully gained before the Disclosing Party actually disclosed it;
    1.2.2.   Becomes available to the general public by no fault of the Receiving Party.
    The Receiving Party shall bear the burden of proof to demonstrate that the information falls within the exceptions.
    ```

---

**Example Analysis: Clause 2 - Use of Confidential Information**

**Original Text:**
```legal
2.   Use of Confidential Information. During the course of this Agreement, the Parties will have access to and learn of each other’s Confidential Information, including trade secrets, industry knowledge, and other confidential information. The Parties will not share any of this proprietary information at any time. The Receiving Party shall not use the Confidential Information for any purpose other than evaluating and performing contractual obligations in the context of the Opportunity. The Receiving Party will not use any of this proprietary information for either Party’s personal/business benefit at any time. This section remains in full force and effect even after termination of the Parties’ relationship by its natural termination or early termination by either Party.

The Receiving Party may disclose the Confidential Information to its personnel on an as-needed basis. The personnel must be informed that the Confidential Information is confidential and the personnel must agree to be bound by the terms of this Agreement. The Receiving Party is liable for any breach of this Agreement by their personnel. Any disclosure to personnel must be documented and reported to the Disclosing Party on a bi-monthly basis, sent via encrypted e-mail as specified in Appendix A (not included and provided separately).

In the event a Party loses Confidential Information or inadvertently discloses Confidential Information, that Party must notify the other Party within twelve (12) hours. That Party must also take any and all steps necessary to recover the Confidential Information and prevent further unauthorized use.

In the event a Party is required by law to disclose Confidential Information, that Party must notify the other Party of the legal requirement to disclose within two (2) business days of learning of the requirement.
Notices must be made in accordance with Section 10 of this Agreement.
```

**Analysis:**

* **The clause category includes four categories from one to four:**
    1.  Use of Confidential Information
    2.  Disclosure to Personnel
    3.  Loss or Inadvertent Disclosure
    4.  Disclosure Required by Law
* **The summary of this clauses is:**
    1.  Restricts use solely to evaluation and obligations regarding the Opportunity.
    2.  Permits disclosure to personnel on need-to-know basis with reports.
    3.  Obligation to notify within 12 hours and mitigate.
    4.  Obligation to notify within 2 business days.
* **The potential risks for the disclosing party are:**
    1.  Vague on 'evaluating and performing contractual obligations' — could be stretched. Furthermore, wording implies that not only the Disclosing Party but both parties would disclose confidential information, which might lead to the misleading conclusion that also the Disclosing Party has to comply with the use of any confidential information disclosed by the Reseiving Party and thus could be liable in relation to the breach of this provision. After having corrected the preamble due to the systematic interpretation of the overall Agreement, the purpose of this contract howerver is to protect the Disclosing Party only because it shall be the solely party disclosing Confidential Information.
    2.  Risk of unauthorized disclosure; administrative burden.
    3.  On the one hand short notice period, on the other hand no request for immediate reporting in case if possible.
    4.  Insufficient time to seek protective measures.
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    1.  Narrow: 'solely for evaluating the Opportunity and not for any other purpose.' Correct insofar as only the Disclosing Party is disclosing Confidential Information and the Receiving Party is using such Confidential Information and has to comply with the obligations under this clause.
    2.  Personnel to sign undertakings; monthly reports instead of bi-monthly.
    3.  Specify right to injunctive relief (Note: Addressed better in Remedies clause, but relevant here too).
    4.  Tighten to 'notify immediately, within 24 hours.'
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    2.   Use of Confidential Information. During the course of this Agreement, the Receiving Party will have access to and learn of the Disclosing Parties Confidential Information, including trade secrets, industry knowledge, and other confidential information. The Receiving Party shall not disclose or share any Confidential Information without the prior written consent of the Disclosing Party, except as otherwise provided herein. The Receiving Party shall use the Confidential Information solely for the purpose of evaluating the Opportunity and not for any other purpose, commercial or otherwise. The Receiving Party will in particular not use any of the Confidential Information for its personal/business benefit at any time. This section remains in full force and effect even after termination of the Parties’ relationship by its natural termination or early termination by either Party.
    The Receiving Party may disclose the Confidential Information to its personnel on an as-needed basis. The personnel must be informed that the Confidential Information is confidential and the personnel must agree to be bound by the terms of this Agreement either by joining this Agreement in writing or by signing a separate non-disclosure and confidentiality agreement. The Receiving Party is liable for any breach of this Agreement by their personnel. Any disclosure to personnel must be documented and reported to the Disclosing Party on a monthly basis, sent via encrypted e-mail as specified in Appendix A (not included and provided separately).
    In the event that the Receiving Party loses Confidential Information or inadvertently discloses Confidential Information, the Receiving Party must notify the Disclosing Party within twelve (12) hours. The Receiving Party must also take any and all steps necessary to recover the Confidential Information and prevent further unauthorized use.
    In the event a Party is required by law to disclose Confidential Information, that Party must notify the other Party of the legal requirement to disclose immediately, in any case within 24 hours, upon having knowledge of such requirement.
    ```

---

**Example Analysis: Clause 3 - Ownership and Title**

**Original Text:**
```legal
3.   Ownership and Title. Nothing in this Agreement will convey a right, title, interest, or license in the Confidential Information to the Receiving Party. The Confidential Information will remain the exclusive property of the Disclosing Party.
```

**Analysis:**

* **The clause category is:**
    Ownership and Title (*Self-correction: Original prompt used "Disclosing Party retains all rights." as category, let's revert to that for consistency*)
    Disclosing Party retains all rights.
* **The summary of this clause is:**
    Disclosing Party retains all rights. (*Self-correction: Original prompt used "Generally safe." as summary, let's revert*)
    Generally safe.
* **The potential risks for the disclosing party are:**
    No severe risk
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    More precise wording possible; Add: 'No license or IP rights granted.'
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    3.   Ownership and Title. All Confidential Information shall remain the sole and exclusive property of the Disclosing Party. Nothing in this Agreement shall be construed as granting, either expressly, by implication, or otherwise, any right including any intellectual property right, title, interest, or license in or to the Confidential Information to the Receiving Party.
    ```

---

**Example Analysis: Clause 4 - Return of Confidential Information**

**Original Text:**
```legal
4.   Return of Confidential Information. Upon termination of this Agreement, the Receiving Party must return all tangible materials it has in its possession and permanently delete all files that contain any part of the Confidential Information the Receiving Party received, including all electronic and hard copies. This includes, but is not limited to, any notes, memos, drawings, prototypes, summaries, source code, excerpts and anything else derived from the Confidential Information.
```

**Analysis:**

* **The clause category is:**
    Return and Deletion of Information
* **The summary of this clause is:**
    Return and delete information upon termination.
* **The potential risks for the disclosing party are:**
    No audit rights to verify deletion.
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Add audit rights and certificate of deletion.
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    4.   Return of Confidential Information. Upon termination of this Agreement, the Receiving Party must return all tangible materials it has in its possession and permanently delete all files that contain any part of the Confidential Information the Receiving Party received, including all electronic and hard copies. This includes, but is not limited to, any notes, memos, drawings, prototypes, summaries, source code, excerpts and anything else derived from the Confidential Information. The Receiving Party shall provide a written certification of return and destruction, and permit an independent audit upon request. The Disclosing Party reserves the right to demand the destruction of the documents for good cause and upon written request, even before termination of the contract.
    ```

---

**Example Analysis: Clause 5 - Term and Termination**

**Original Text:**
```legal
5.   Term and Termination. This Agreement shall commence upon the Effective Date as stated above and continue until December 31st, 2030.
Either Party may end this Agreement at any time by providing written notice to the other Party. The Parties’ obligation to maintain confidentiality of all Confidential Information received during the term of this Agreement will remain in effect for 30 (thirty) years.
```

**Analysis:**

* **The clause category is:**
    Term and Termination
* **The summary of this clause is:**
    Agreement ends 2030; confidentiality survives 30 years.
* **The potential risks for the disclosing party are:**
    Long duration (acceptable).
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    No immediate change unless operational flexibility needed.
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    5.   Term and Termination. This Agreement shall commence upon the Effective Date as stated above and continue until December 31st, 2030.
    Either Party may end this Agreement at any time by providing written notice to the other Party. The Parties’ obligation to maintain confidentiality of all Confidential Information received during the term of this Agreement will remain in effect for 30 (thirty) years.
    ```

---

**Example Analysis: Clause 6 - Remedies**

**Original Text:**
```legal
6.   Remedies. The Parties agree the Confidential Information is unique in nature and money damages will not adequately remedy the irreparable injury breach of this Agreement may cause the injured Party. The injured Party is entitled to seek injunctive relief, as well as any other remedies that are available in law and equity.
```

**Analysis:**

* **The clause category is:**
    Remedies
* **The summary of this clause is:**
    Right to injunctive relief. (*Self-correction: Original prompt used "Right to injunctive" as summary, let's revert*)
    Right to injunctive
* **The potential risks for the disclosing party are:**
    Risk of lacking entitlement to receive compensation for damages suffered in relation to breaches
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Include Broad entitlement to receive compensation for damages suffered in relation to breaches
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    6.   Remedies. Upon breach of the provisions of this Agreement the Disclosing Party shall be entitled to receive compensation for any and all losses, damages, costs and expenses suffered in relation to such breach. The Parties agree the Confidential Information is unique in nature and money damages only will not adequately remedy the irreparable injury breach of this Agreement may cause the injured Disclosing Party. The injured Disclosing Party is moreover entitled to seek injunctive relief, as well as any other remedies that are available in law and equity.
    ```

---

**Example Analysis: Clause 7 - Penalties**

**Original Text:**
```legal
7.   Penalties. The Receiving Party shall pay a penalty of up to $1,000,000 for any breach of this Agreement at the discretion of the Disclosing Party.
```

**Analysis:**

* **The clause category is:**
    Penalties
* **The summary of this clause is:**
    $1,000,000 penalty for breach.
* **The potential risks for the disclosing party are:**
    Risk of unenforceability as punitive damages.
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Phrase as liquidated damages pre-estimate. (*Self-correction: The suggested wording actually frames it as a liability cap, not liquidated damages. The comment should reflect the suggestion.*)
    Reframe as a liability cap rather than a penalty to improve enforceability.
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    7.   Limitation of Liability. The liability of the Receiving Party shall be capped up to $1,000,000 for any damages resulting from a breach of this Agreement at the discretion of the Disclosing Party. The Parties agree that this amount shall not be considered a penalty.
    ```

---

**Example Analysis: Clause 8 - Relationship of the Parties**

**Original Text:**
```legal
8.   Relationship of the Parties.
8.1.   No Binding Agreement to Pursue Opportunity. The Parties agree they are exploring a potential Opportunity and sharing their Confidential Information is not a legal obligation to pursue the Opportunity. Either Party is free to terminate discussions or negotiations related to the Opportunity at any time.
8.2.   No Exclusivity. The Parties understand this Agreement is not an exclusive arrangement. The Parties agree they are free to enter into other similar agreements with other parties.
8.3.   Independent Contractors. The Parties to this Agreement are independent contractors. Neither Party is an agent, representative, partner, or employee of the other Party.
```

**Analysis:**

* **The clause category is:**
    Relationship of the Parties
* **The summary of this clause is:**
    Independent contractors; no obligation to pursue Opportunity.
* **The potential risks for the disclosing party are:**
    Generally safe.
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Add non-reliance clause if needed.
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    8.   Relationship of the Parties.
    8.1.   No Binding Agreement to Pursue Opportunity. The Parties agree they are exploring a potential Opportunity and sharing their Confidential Information is not a legal obligation to pursue the Opportunity. Neither Party has made any representation or warranty regarding the success of the Opportunity. Either Party is free to terminate discussions or negotiations related to the Opportunity at any time.
    8.2.   No Exclusivity. The Parties understand this Agreement is not an exclusive arrangement. The Parties agree they are free to enter into other similar agreements with other parties.
    8.3.   Independent Contractors. The Parties to this Agreement are independent contractors. Neither Party is an agent, representative, joint venture party, partner, or employee of the other Party.
    ```

---

**Example Analysis: Clause 9 - General**

**Original Text:**
```legal
9.   General.
9.1.   Assignment. The Receiving Party may not assign their rights and/or obligations under this Agreement.

9.2.   Choice of Law. This Agreement will be interpreted based on the laws of the State of Washington, USA regardless of any conflict of law issues that may arise. The Parties agree that any dispute arising from this Agreement will be resolved at a court of competent jurisdiction located in the State of Washington, USA.

9.3.   Complete Contract. This Agreement constitutes the Parties entire understanding of their rights and obligations. This Agreement supersedes any other written or verbal communications between the Parties. Any subsequent changes to this Agreement must be made in writing and signed by both Parties.

9.4.   Severability. In the event any provision of this Agreement is deemed invalid or unenforceable, in whole or in part, that part shall be severed from the remainder of the Agreement and all other provisions should continue in full force and effect as valid and enforceable.

9.5.   Waiver. Neither Party can waive any provision of this Agreement, or any rights or obligations under this Agreement, unless agreed to in writing. If any provision, right, or obligation is waived, it is only waived to the extent agreed to in writing.

9.6.   Non-Commitment to Collaboration. The Parties acknowledge that this Agreement does not create any binding commitment to pursue the Opportunity, or enter into any additional contracts. If such a commitment is made, the Parties will work together in a cooperative and professional manner.
```

**Analysis:**

* **The clause category includes three categories from one to three:**
    1.  Assignment
    2.  Choice of Law and Jurisdiction
    3.  Complete Contract, Severability, Waiver (, Non-Commitment) (*Self-correction: Added Non-Commitment as it's part of the general boilerplate section*)
* **The summary of this clauses is:**
    1.  Receiving Party cannot assign.
    2.  Washington law and courts.
    3.  Standard boilerplate (including non-commitment).
* **The potential risks for the disclosing party are:**
    1.  Protects Disclosing Party.
    2.  May be unfamiliar for some parties.
    3.  No significant risk.
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    1.  Clarify: 'Any assignment in breach shall be void.' (Suggestion adds 'without prior written consent').
    2.  Consider adding arbitration option. (Suggestion adds jury waiver and optional arbitration).
    3.  No changes necessary.
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    9.   General.
    9.1.   Assignment. The Receiving Party may not assign their rights and/or obligations under this Agreement without the prior written consent of the Disclosing Party. Any purported assignment in breach of this clause shall be null and void.

    9.2.   Choice of Law. This Agreement will be interpreted based on the laws of the State of Washington, USA regardless of any conflict of law issues that may arise. The Parties agree that any dispute arising from this Agreement will be resolved at a court of competent jurisdiction located in the State of Washington, USA. Each Party irrevocably waives any right to a trial by jury. The Parties may mutually agree on arbitration proceedings.

    9.3.   Complete Contract. This Agreement constitutes the Parties entire understanding of their rights and obligations. This Agreement supersedes any other written or verbal communications between the Parties. Any subsequent changes to this Agreement must be made in writing and signed by both Parties.

    9.4.   Severability. In the event any provision of this Agreement is deemed invalid or unenforceable, in whole or in part, that part shall be severed from the remainder of the Agreement and all other provisions should continue in full force and effect as valid and enforceable.

    9.5.   Waiver. Neither Party can waive any provision of this Agreement, or any rights or obligations under this Agreement, unless agreed to in writing. If any provision, right, or obligation is waived, it is only waived to the extent agreed to in writing.

    9.6.   Non-Commitment to Collaboration. The Parties acknowledge that this Agreement does not create any binding commitment to pursue the Opportunity, or enter into any additional contracts. If such a commitment is made, the Parties will work together in a cooperative and professional manner.
    ```

---

**Example Analysis: Clause 10 - Notices**

**Original Text:**
```legal
10.   Notices. All notices under this Agreement must be sent by email with return receipt requested or certified or registered mail with return receipt requested.

Notices should be sent as follows:

Disclosing Party:
Quantum Innovations Inc.,
7890 Maple Avenue
Suite 101 - 104
Seattle, WA 98101, USA

Receiving Party:
Michael Thompson
4567 Pine Street, Apt 203
Concord, NH 03301
USA
```

**Analysis:**

* **The clause category is:**
    Notices
* **The summary of this clause is:**
    Email or certified mail.
* **The potential risks for the disclosing party are:**
    Emails may not be timely received or acknowledged. (*Self-correction: Original prompt just said "not timely received"*)
* **The potential risks for the receiving party are:**
    Not applicable
* **The comments and descriptive improvement suggestions in favor of the disclosing party are:**
    Require confirmation of receipt within 24 hours. (Suggestion wording is slightly awkward, aiming for confirmation).
* **The comments and descriptive improvement suggestions in favor of the receiving party are:**
    Not applicable
* **The specific wording suggestion considering both improvement suggestions for the disclosing is:**
    ```legal
    10.   Notices. All notices under this Agreement must be sent by email with return receipt requested or certified or registered mail with return receipt requested. Receipt must be confirmed within 24 hours of sending. (*Self-correction: Adjusted wording for clarity based on the comment*)

    Notices should be sent as follows:

    Disclosing Party:
    Quantum Innovations Inc.,
    7890 Maple Avenue
    Suite 101 - 104
    Seattle, WA 98101, USA
    [Add Email Address]

    Receiving Party:
    Michael Thompson
    4567 Pine Street, Apt 203
    Concord, NH 03301
    USA
    [Add Email Address]
    ```
*(Self-correction: Added placeholders for email addresses as they are crucial for email notice)*

---

**Task:**

The purpose of the preceding explanations and detailed examples is to train you on this specific analysis methodology. When provided with new clauses from an NDA, your task will be to apply this learned methodology, performing the complete analysis and providing the output for *each* of the defined fields as demonstrated. As an input you get a json document with the original clause and also modifications that are made by a third party. Put special emphasis on those changes and the applied risks.

---

**Output Structure Requirement:**

Please ensure that your final output for any analysis task based on this prompt is structured precisely as demonstrated in the examples. The output must contain **all** the defined fields listed below for each analyzed clause, presented clearly and sequentially. This structured format is essential for programmatic use. Do not add any extra explanatory text outside of these defined fields in your final analysis output. Do output the JSON in the following format. Do exactly follow the format and do not output anything else but json.


{
  "clauseIdentifier": "Clause 1 - Confidential Information Definition",
  "originalClauseText": "1. Confidential Information. The confidential information (“Confidential Information”) includes any information that is only known by the Disclosing Party, and not known by the general public at the time it is disclosed, whether tangible or intangible, and through whatever means it is disclosed.\nConfidential Information does not include information that:\n1.1.   The Receiving Party lawfully gained before the Disclosing Party actually disclosed it;\n1.2.   Becomes available to the general public by no fault of the Receiving Party.",
  "analysis": {
    "clauseCategory": "Confidential Information Definition",
    "summary": "Defines Confidential Information unspecified; excludes info known previously or becoming public.",
    "risksDisclosingParty": "Ambiguities may allow the Receiving Party to argue information was previously known/public.",
    "risksReceivingParty": "Potentially, all possible information of the disclosing party falls under the definition",
    "improvementsDisclosingParty": "Clarify: 'Receiving Party bears the burden of proof to demonstrate that information falls within exceptions.'",
    "improvementsReceivingParty": "Clarify: list examples for confidential information, even if not exclusively",
    "suggestedWording": "1.   Confidential Information. The confidential information (“Confidential Information”) includes any information that is only known by the Disclosing Party, and not known by the general public at the time it is disclosed, whether tangible or intangible, and through whatever means it is disclosed.\n1.1.   Confidential Information includes in particular, but is not limited to, information that:\n1.1.1.   technical data;\n1.1.2.   trade secrets;\n1.1.3.   research;\n1.1.4.   financial information;\n1.1.5.   other business or technical information or industry knowledge disclosed by the Disclosing Party.\n1.2.   Confidential Information does not include information that:\n1.2.1.   The Receiving Party lawfully gained before the Disclosing Party actually disclosed it;\n1.2.2.   Becomes available to the general public by no fault of the Receiving Party.\nThe Receiving Party shall bear the burden of proof to demonstrate that the information falls within the exceptions.",
"comments_on_changes": "[Add here information if changes need to specifically checked]"
  }
}


Now please analyze the following clause on your own:
"""


class ClauseAnalysis(BaseModel):
    clauseCategory: str
    summary: str
    risksDisclosingParty: str
    risksReceivingParty: str
    improvementsDisclosingParty: str
    improvementsReceivingParty: str
    suggestedWording: str
    comments_on_changes: str

class ClauseAnalysisResponse(BaseModel):
    clauseIdentifier: str
    originalClauseText: str
    analysis: ClauseAnalysis

# Utility function to call Google Generative AI API
def call_google_gemini_api(prompt: str) -> Optional[Dict[str, Any]]:
    if not GOOGLE_API_KEY:
        raise Exception("Google API key not configured.")
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}
    params = {"key": GOOGLE_API_KEY}
    try:
        response = requests.post(GOOGLE_API_URL_BASE, json=payload, headers=headers, params=params, timeout=60)
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates", [])
        for candidate in candidates:
            parts = candidate.get("content", {}).get("parts", [])
            for part in parts:
                text = part.get("text", "")
                match = re.search(r'{[\s\S]*}', text)
                if match:
                    json_str = match.group(0)
                    try:
                        return pyjson.loads(json_str)
                    except Exception:
                        continue
        raise Exception("No valid JSON returned from Gemini API.")
    except requests.RequestException as e:
        raise Exception(f"Error communicating with Gemini API: {str(e)}")


def analyze_clause_change(change_json: Dict[str, Any]) -> ClauseAnalysisResponse:
    
    # Step 1: Compose the prompt for the clause analysis
    final_prompt = prompt + str(change_json)

    # Append the change json to the prompt
    result = call_google_gemini_api(final_prompt)
    if not result:
        raise Exception("No valid response from Gemini API.")
    return ClauseAnalysisResponse(**result)

def analyze_clause_change_for_changes_response(change_json: Dict[str, Any]) -> ClauseAnalysisResponse:
    """
    Calls the LLM and maps the result to the AnalyzeChangesResponse structure, returning ClauseAnalysisResponse.
    """
    llm_result = analyze_clause_change(change_json)
    return llm_result
