# PDF → Markdown

**PDF 的文字层记录了每个字符的位置。这个库用这些几何信息把文档重新拼起来——标题、分栏、表格、列表、链接——输出读起来像原文的 Markdown。**

零依赖 · 约 4,000 行 TypeScript · Node 与浏览器同构 · 无原生代码、无模型、不联网。

> English: [README.md](README.md)

```bash
npm install @mindmax/pdf-markdown
```

不装也能试：[playground](https://woodpeng.github.io/mindmax-pdf-markdown/) 丢进 PDF 直接出 Markdown，周围什么都没有；[完整转换器](https://mindmax.me/tools/pdf-to-markdown/) 用的是同一个库，外面套了编辑器和 Word 导出。

## 在生产里跑着

这不是为了"有个开源项目"而抽出来的示例。它是 [MindMax](https://mindmax.me/) 里的引擎，用户打开过的每一份 PDF 都过过它：

- **[在线 PDF 转 Markdown](https://mindmax.me/tools/pdf-to-markdown/)**：原样在浏览器里跑这个库，文件不出本机。
- **[MindMax Read](https://mindmax.me/read/)**：导入 PDF 用同一份文本映射，所以在应用里高亮的引文，和在 Markdown 里是同一个字符偏移。
- **[网页编辑器](https://mindmax.me/write/)**：转换结果在这里打开、编辑、导出 Word。

外面的产品——OCR、AI 阅读、批注、编辑器、桌面版——闭源，单独授权。Apache-2.0 覆盖的是这个引擎，不含它上面的任何东西。这条线写在这里、写在项目页、也写在应用里，因为"开源"事后被理解为"付费产品的一个模块"时，人有权在投入一个周末之前就知道。

## 它解决什么

从 PDF 里复制文字，得到的是文件里存的样子：每行末尾一个硬换行、页码插在句子中间、双栏被横着读、表格变成一列碎片。字都在，文档没了。

这个库先读几何——字号、基线、x 坐标、marked content——重建结构，再写 Markdown：

- 靠字号和编号（`3.1`、`第三章`）认标题，输出 `#` 到 `######`
- 合并软换行、修复跨行断词、跨页段落接回一段
- 双栏从左栏读到右栏
- 按文字位置重建表格，输出 GFM 表格
- 项目符号、编号、悬挂缩进 → `- ` / `1. `，续行并回条目
- 删除页眉、页脚、页码、水印（Tagged PDF 直接读 `/Artifact`，其余靠几何与跨页重复）
- 链接注释还原成 `[文字](url)`
- 正文里的 `$5`、`*`、`1990. A year` 会转义，不被当成 Markdown 语法

## 它不做什么

- **扫描件**：没有文字层，不猜。返回 `{ ok: false, reason: 'scanned' }`，交给 OCR。
- **公式**：PDF 不存公式结构，`x²` 出来是 `x2`。`assessPdfTextLayer` 会告诉你哪些页受影响。
- **图片、粗体、斜体**：只给文字与结构。
- **异常版式**：海报、表单、幻灯片转的 PDF、没有栏间空白的表格，顺序可能不合预期。

## 用法

库自己不加载 pdf.js：你把打开的 pdf.js 文档传进来，`Pdf*Like` 类型是结构化的，浏览器版、Node legacy 版或测试里的假对象都行。

```ts
import { convertPdfToMarkdown } from '@mindmax/pdf-markdown';

const doc = await getDocument({ data: bytes }).promise;
const result = await convertPdfToMarkdown(doc);
if (result.ok) console.log(result.markdown);
```

Node 下的 cMap / standard fonts 参数、浏览器示例、两段式用法（`readPdfTextLayer` + `pdfTextLayerToMarkdown`）以及完整 API 表见 [README.md](README.md)。

## 质量

- 170 个单元测试，97% 语句覆盖率
- 22 份真实文档的回归语料，带人工核对过的断言：双栏论文、IEEE 与中文期刊版式、表格、脚注、1930 年代 OCR 的 NACA 报告、美国宪法、中国政府公报
- 每份文档记录许可与 sha256；转出的文字与快照、断言一起比对

```bash
pnpm eval --fetch   # 下载语料（82 MB，校验 sha256）
pnpm eval           # 断言 + 快照；有回归退出码 1
```

## 贡献

最有价值的贡献不是代码，是**一份转不好的 PDF**（且许可允许我们再分发转出的文字）：

- [提交语料用例](https://github.com/woodpeng/mindmax-pdf-markdown/issues/new?template=corpus_case.yml)
- [报 bug](https://github.com/woodpeng/mindmax-pdf-markdown/issues/new?template=bug_report.yml)
- 提 PR 前读 [CONTRIBUTING.md](CONTRIBUTING.md)

## 许可

Apache-2.0。语料单独声明：转出的文字仍属各文档原有许可，见 [eval/corpus/ATTRIBUTION.md](eval/corpus/ATTRIBUTION.md)。“MindMax” 为商标，见 [TRADEMARKS.md](TRADEMARKS.md)。

---

由 [MindMax](https://mindmax.me) 构建与维护，产品里的 PDF 阅读与转换即由此驱动。抽出来开源，是因为好的 PDF 解析器不该是竞争壁垒。
