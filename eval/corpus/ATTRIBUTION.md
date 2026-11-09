# Corpus attribution

The files under `eval/corpus/golden/` are Markdown **converted from** the documents
listed below, by the code in this repository. They are not copies of the
originals: only text extraction and structural formatting were applied — no
translation, no editing of wording.

Each document remains under its own licence, as recorded in
[`manifest.json`](./manifest.json). The Apache-2.0 licence of this repository
covers the code, not these converted texts.

Documents were selected only from sources that permit redistribution of derived
text (CC BY, CC0, public domain, or official documents excluded from copyright).
The PDFs themselves are not redistributed: `pnpm eval --fetch` downloads them
from the URLs below and verifies their sha256.

| id | source | url | licence |
|---|---|---|---|
| `arxiv-2201.11903-cot` | arXiv:2201.11903v1 — Wei et al., Chain-of-Thought Prompting Elicits Reasoning in Large Language Models | <https://arxiv.org/pdf/2201.11903v1> | CC-BY-4.0 |
| `arxiv-2312.00752-mamba` | arXiv:2312.00752v1 — Gu & Dao, Mamba: Linear-Time Sequence Modeling with Selective State Spaces | <https://arxiv.org/pdf/2312.00752v1> | CC-BY-4.0 |
| `arxiv-2310.06825-mistral` | arXiv:2310.06825v1 — Jiang et al., Mistral 7B | <https://arxiv.org/pdf/2310.06825v1> | CC-BY-4.0 |
| `arxiv-2302.13971-llama` | arXiv:2302.13971v1 — Touvron et al., LLaMA: Open and Efficient Foundation Language Models | <https://arxiv.org/pdf/2302.13971v1> | CC-BY-4.0 |
| `arxiv-2212.08073-constitutional-ai` | arXiv:2212.08073v1 — Bai et al., Constitutional AI: Harmlessness from AI Feedback | <https://arxiv.org/pdf/2212.08073v1> | CC-BY-4.0 |
| `arxiv-2404.14219-phi3` | arXiv:2404.14219v1 — Abdin et al., Phi-3 Technical Report | <https://arxiv.org/pdf/2404.14219v1> | CC-BY-4.0 |
| `arxiv-2610.40388-wide-binaries` | arXiv:2610.40388v2 — On the Proper 3D Modeling of Orbits in Wide Binary Gravity Tests (AAS journals) | <https://arxiv.org/pdf/2610.40388v2> | CC-BY-4.0 |
| `arxiv-2610.37889-magnetization` | arXiv:2610.37889v1 — GæniceN: a minimal model to relax magnetization states self-consistently | <https://arxiv.org/pdf/2610.37889v1> | CC-BY-4.0 |
| `arxiv-2611.04027-ieee-ral` | arXiv:2611.04027v1 — A Practical Causal Framework for Autonomous Mobile Robots (IEEE RA-L) | <https://arxiv.org/pdf/2611.04027v1> | CC-BY-4.0 |
| `arxiv-2611.06195-detection` | arXiv:2611.06195v1 — Annotator-Free Object Detection via Foundation Model Collaboration | <https://arxiv.org/pdf/2611.06195v1> | CC-BY-4.0 |
| `arxiv-2611.00717-random-walk` | arXiv:2611.00717v1 — Cutoff for Simple Random Walk on Preferential Attachment Graphs | <https://arxiv.org/pdf/2611.00717v1> | CC-BY-4.0 |
| `arxiv-2609.17200-ai-complexity` | arXiv:2609.17200v1 — Mapping AI Economic Complexity | <https://arxiv.org/pdf/2609.17200v1> | CC-BY-4.0 |
| `arxiv-2610.39699-ota` | arXiv:2610.39699v1 — Implementation and Validation of Mismatch-Tolerant High-Gain OTA (IEEE conference) | <https://arxiv.org/pdf/2610.39699v1> | CC-BY-4.0 |
| `arxiv-2609.36736-speech-bci` | arXiv:2609.36736v1 — From Neurons to Conversation: Speech Brain-Computer Interfaces (review) | <https://arxiv.org/pdf/2609.36736v1> | CC-BY-4.0 |
| `arxiv-2608.29558-math-fonts` | arXiv:2608.29558v2 — Qi & Qiao, Luo’s Spectral Large Sieve Inequality on Short Intervals (Sci. Sin. Math.) | <https://arxiv.org/pdf/2608.29558v2> | CC-BY-4.0 |
| `arxiv-2609.27618-bilingual` | arXiv:2609.27618v1 — 中英双语稿（英文全文在前，中文原文在后） | <https://arxiv.org/pdf/2609.27618v1> | CC-BY-4.0 |
| `nist-sp800-63b` | NIST SP 800-63B, Digital Identity Guidelines: Authentication and Lifecycle Management (2017) | <https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63b.pdf> | Public domain (US federal government work, 17 U.S.C. §105) |
| `us-constitution` | The Constitution of the United States, pocket edition (House Document 110-50, GovInfo) | <https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf> | Public domain (US federal government work, 17 U.S.C. §105) |
| `federal-register-2023-28802` | Federal Register 2023-28802, Airworthiness Directives; Airbus SAS Airplanes (2024-01-02) | <https://www.govinfo.gov/content/pkg/FR-2024-01-02/pdf/2023-28802.pdf> | Public domain (US federal government work, 17 U.S.C. §105) |
| `usgs-fs-2018-3025` | USGS Fact Sheet 2018-3025 | <https://pubs.usgs.gov/fs/2018/3025/fs20183025.pdf> | Public domain (US federal government work, 17 U.S.C. §105) |
| `naca-19930091690-ocr-scan` | NACA Report No. 614 (NASA NTRS 19930091690): Pressure distribution over an N.A.C.A. 23012 airfoil — scanned pages with an OCR text layer | <https://ntrs.nasa.gov/api/citations/19930091690/downloads/19930091690.pdf> | Public domain (US federal government work, 17 U.S.C. §105) |
| `gov-cn-gazette-2025-35` | 中华人民共和国国务院公报 2025 年第 35 号（整期） | <https://www.gov.cn/gongbao/2025/issue_12466/material/gwygb202535.pdf> | Not subject to copyright (PRC Copyright Law art. 5: decisions, orders and other legislative, administrative or judicial documents of state organs, and their official translations) |

If you hold rights to one of these documents and want it removed, open an issue
and it will be dropped from the corpus.
