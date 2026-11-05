# Local Authoring Guide: Slash Commands & Guided Tab-Stops

When writing technical notes inside your editor, type `/` to trigger the in-line block menu. Press `Enter` to insert, then press `Tab` to navigate between guided fields.

---

## Available Slash Commands

| Trigger | Description | Guided Tab-Stops (`Tab` Key Navigation) |
| :--- | :--- | :--- |
| **`/callout`** | Editorial Callout Box | **1.** Box Type Dropdown (`info`, `warning`, `tip`, `danger`) $\rightarrow$ **2.** Title $\rightarrow$ **3.** Body Text |
| **`/code`** | Syntax Highlighted Code Block | **1.** Language Dropdown (`typescript`, `sql`, `java`, `python`, etc.) $\rightarrow$ **2.** Filename Header $\rightarrow$ **3.** Highlight Lines $\rightarrow$ **4.** Code Snippet |
| **`/image`** | Captioned Figure | **1.** Alt Text $\rightarrow$ **2.** Image Filename (`/public/images/content/`) $\rightarrow$ **3.** Figure Number $\rightarrow$ **4.** Detailed Caption |
| **`/table`** | Architectural Comparison Table | **1-2.** Column Names $\rightarrow$ **3-8.** Throughput, P99 Latency, Memory, and Mode metrics |
| **`/checklist`** | Production Takeaways Checklist | **1.** Takeaway #1 Name $\rightarrow$ **2.** Takeaway #1 Detail $\rightarrow$ **3.** Takeaway #2 ... |
| **`/diagram`** | Mermaid Sequence / Flowchart | **1.** Client Ingress $\rightarrow$ **2.** Gateway $\rightarrow$ **3.** Service $\rightarrow$ **4.** Database $\rightarrow$ **5.** Endpoint $\rightarrow$ **6.** Latency |
| **`/formula`** | Sizing Heuristic / LaTeX Math | **1.** Formula Title $\rightarrow$ **2.** Thread Term $\rightarrow$ **3.** Effective Core Term |
| **`/quote`** | Attributed Quotation Block | **1.** Quote Body $\rightarrow$ **2.** Author $\rightarrow$ **3.** Citation Source |
| **`/h2`** / **`/h3`** | Numbered Section Headings | **1.** Section Number $\rightarrow$ **2.** Title $\rightarrow$ **3.** Paragraph |

---

## How Guided Tab-Stops Work in Practice

### Example: `/callout`
1. In your `.md` file, type `/callout` and press `Enter`.
2. A dropdown appears allowing you to select **`warning`** using your arrow keys.
3. Press `Tab` $\rightarrow$ Your cursor lands on `Callout Title`. Type `Connection Pool Starvation`.
4. Press `Tab` $\rightarrow$ Your cursor lands on the body text. Type `Under 5k req/sec surges, exceeding 64 connections exhausts kernel page cache.`.
5. Press `Tab` $\rightarrow$ Your cursor exits the block, ready for your next paragraph.

### Example: `/code`
1. Type `/code` and press `Enter`.
2. Select **`sql`** from the language choices.
3. Press `Tab` $\rightarrow$ Type `pg_stat_activity.sql`.
4. Press `Tab` $\rightarrow$ Specify line highlights (e.g. `1-3`) or delete.
5. Press `Tab` $\rightarrow$ Paste your SQL query.
