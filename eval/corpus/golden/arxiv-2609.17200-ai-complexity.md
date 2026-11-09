# Mapping AI Economic Complexity

### Daeun Moon1, Yeokyung Hwang1,2,3, Junseok Hwang1, and Dawoon Jeong2,3\*

1

Technology Management, Economics and Policy Program (TEMEP), Seoul National University, Seoul, Republic of

Korea

2

Department of Sociology, University of Chicago, Chicago, IL, USA

3

Knowledge Lab, University of Chicago, Chicago, IL, USA

\*

Correspondence: Dawoon Jeong (jdwoon0523@uchicago.edu)

### September 16, 2026

Abstract

Green economic complexity provides a generalizable framework for examining countries’ productive capabilities in a defined product set. We apply this framework to AI-enabling

goods within the full product space, linking current specialization with adjacent diversification opportunities. Using BACI exports for 2007–2023 and 103 AI-enabling goods, we measure complexity-weighted specialization (AECI), product-level adjacent opportunities (AIAP), and average complexity-weighted relatedness of remaining candidates (AECP). In 2023, Japan leads AECI, while China leads AECP; portfolio breadth accounts for much of the variation in raw AECI. Initial raw potential is positively associated with subsequent changes in the AIenabling export share, but its associations with changes in AECI and specialization counts are not statistically significant at the 5% level. Our contribution is a trade-based assessment of AI-enabling productive capabilities and related opportunities. The results and public dashboard provide a preliminary complement to publication and patent indicators, not a comprehensive measure of national AI performance or a validated forecast of diversification.

## 1 Introduction

National AI capability encompasses not only scientific and inventive output but also the productive structures supporting AI’s material infrastructure. Publication and patent counts do not, by themselves, reveal which countries competitively export the equipment, components, and materials enabling AI systems. The WTO’s AI-enabling goods classification provides a basis for examining this production dimension [1]. We ask which productive strengths countries reveal through these exports and how remaining AI-enabling activities relate to their existing specializations.

Economic complexity examines country–product specialization as indirect evidence of productive capabilities [2]. Product-space relatedness connects existing specializations with potential new activities [3]. Together, these approaches distinguish the scale of exports from the breadth and complexity of specialized portfolios, and situate remaining activities relative to those portfolios.

Research on green economic complexity shows how this perspective can be focused on a defined product set. Mealy and Teytelboym [4] distinguish current green capabilities, adjacent opportunities, and diversification potential, and explicitly note that their complexity index can be applied to any subset of products. This provides a generalizable framework: the selected goods define the domain of interest, while the wider product space supplies the information for assessing capabilities and related opportunities.

We apply this framework to AI-enabling goods. Our contribution is to map countries’ revealed AI-enabling productive capabilities and adjacent diversification opportunities within the full product space. AECI characterizes current specialization by its breadth and complexity, AIAP retains product-level candidates, and AECP summarizes their average complexity-weighted relatedness. We first compare current portfolios and remaining opportunities, then examine preliminary conditional associations between initial raw potential and later changes in export composition and specialization. The emphasis is on productive specialization and structurally related opportunities, not a comprehensive ranking of national AI performance.

## 2 Data & Framework

### 2.1 Country–product exports and AI-enabling goods

We use BACI HS 2007, 2007–2023 [5], aggregating exports over foreign destinations. Annual matrices Xcpt cover 228 economies and 5,047 HS6 products in current thousand US dollars. The fixed target set A contains 103 goods (52 HS4 headings) from the project’s HS 2012 (H4) version of the WTO AI-enabling list [1]; all identifiers occur in the HS 2007 matrices. The list is applied retrospectively and does not identify exclusively AI end uses. All products supply the information used to evaluate complexity and relatedness.

### 2.2 Product specialization and AECI

For country c, product p, and year t, revealed comparative advantage and the AI indices’ specialization matrix are

Xcpt/ ∑j Xcjt

RCAcpt =

∑i

, Mcpt = 1{RCAcpt > 1}. (1)

Xipt/ ∑i,j Xijt

All sums in Eq. (1) use the full annual trade matrix. Zero-denominator RCA is stored as zero; M = 0 denotes no revealed specialization, not necessarily no exports. Define the AI-enabling export share as sAIct = ∑p∈A Xcpt/ ∑j Xcjt. For comparison, bundle RCA divides this share by the corresponding share of world exports. It measures relative specialization in the bundle, rather than the breadth of a country’s AI-enabling portfolio.

The Product Complexity Index (PCI) is taken from the full-product-space pipeline. Suppressing the year index, on positive-degree rows and columns write Bcp = 1{RCAcp ≥ 1} and let Dc, Dp be its diagonal degree matrices. The product score uses the second right singular vector of

D−1/2

c

BD−1/2

p

, rescaled by D−1/2

p

, oriented negatively with ubiquity, and standardized across products. Thus PCI uses RCA ≥ 1, whereas Eq. (1) uses the strict rule. We retain and disclose this implementation difference. Let P ∗t contain all products with finite PCI and define

|  | PCIpt −minj∈P∗ PCIjt | ∑ | Fct −F¯t |
| --- | --- | --- | --- |
| qpt = | t , maxj∈Pt∗ PCIjt −minj∈Pt∗ PCIjt | Fct = Mcptqpt, p∈A | AECIct = . (2) sF,t |

Normalization of q is across all finite-PCI products, not only AI goods. The AI Economic Complexity Index (AECI) uses binary membership weights and standardizes the sum of normalized complexity across specialized AI goods [4]. Its decomposition is Fct = DAIct ¯qAIct , where DAIct =

∑p∈A

Mcpt and ¯qAIct is mean complexity among those goods when DAIct > 0.

### 2.3 AIAP and AECP

Let upt = ∑c Mcpt be product ubiquity. Following the product-space approach [3], proximity and country-specific relatedness density are

∑c

McjtMcpt

Mcjtϕjpt

ϕjpt =

(j̸ = p), ρcpt =∑j̸ =p

∑j̸ =p

. (3)

max(ujt, upt)

ϕjpt

Self-links are excluded and zero-denominator proximities are set to zero. Density measures relatedness to the country’s entire specialized portfolio, including non-AI goods; it is not a geometric distance in a plotted network. Undefined density is left missing.

The AI Adjacent Possible (AIAP) is a set of candidate products with density and complexity coordinates, not a scalar score:

AIAPct = {(p, ρcpt, qpt) : p ∈ A, Mcpt = 0}. (4)

No density cutoff is imposed. Let Vct index candidate products with finite density and complexity. The raw potential G and its standardized AI Economic Complexity Potential (AECP) are

1

∑

Gct − ¯Gt

Gct =

ρcptqpt, AECPct =

. (5)

|Vct|

p∈Vct

sG,t

AECP summarizes the average complexity-weighted relatedness of remaining opportunities, rather than their total [4]. It is undefined when Vct is empty. In the reported results, all AI products have finite complexity and all candidate densities are finite, so |Vct| = 103 − DAIct .

### 2.4 Reporting population and interpretation

For AECI and AECP, annual means and sample standard deviations (n − 1 denominator) use countries with at least US\$1 billion of total exports and at least one specialized product. This reporting and normalization rule does not screen the matrices used for RCA or relatedness. The valid sample contains 140–163 economies annually, including 162 in 2023. Scores are relative to each year’s reference population and complexity scale; they are not absolute units of AI capability. Numerical consistency checks reconstruct listed-product RCA, q, F , G, and their standardizations from the derived tables. They do not independently verify the underlying BACI ingestion, full-space PCI or proximity estimation, or the substantive validity of the measures.

### 2.5 Descriptive comparisons and longitudinal associations

Whole-space ECI is the country-level complexity score from the full-product-space pipeline; it is a comparator and control, not a component of AECI. We compare AECI with its components, ECI, bundle RCA, and AECP. Country-level correlations use paired observations within the eligible annual sample. For a separate descriptive HS6 network, proximity is computed using Bcp = 1{RCAcp ≥ 1} and averaged over 2007–2023. The fixed backbone combines a maximum spanning tree with the union of up to four strongest links selected per node whose mean proximity is at least 0.60. Louvain communities summarize this backbone. Neither the pooled backbone nor its layout or communities enters the annual AECP calculation, which uses the full annual proximity matrix based on the strict specialization rule in Eq. (1).

For the longitudinal comparison, the outcomes Yct are the AI-enabling export share sAIct , standardized AECI, and specialization count DAIct . We compare baseline (2007–2011) and follow-up (2019–2023) means using

∆ ¯Yc = α + β ¯Gc0 + γECIc0 + δlog yc0 + η ¯Yc0 + εc, (6)

where ∆ ¯Yc = ¯Yc1 − ¯Yc0 and subscripts 0 and 1 denote the two periods. The regressor ¯Gc0 is mean baseline raw potential, not standardized AECP. Annual real GDP per capita yct is output-side real GDP divided by population (rgdpo/pop) in Penn World Table 11.0 [6]; log yc0 is the mean of annual log income, not the log of mean income. Baseline means use eligible years with jointly observed outcomes and regressors; follow-up means use eligible years with observed outcomes. Each regression requires at least three usable years per period and uses ordinary least squares with HC1 heteroskedasticity-robust standard errors. These are exploratory, in-sample associations rather than causal or out-of-sample tests.

## 3 Preliminary Results

### 3.1 Scale, complexity, and country portfolios

AI-enabling goods account for 11.31% of world exports in 2007 and 12.44% in 2023, with nominal exports rising from US\$1.52 trillion to US\$2.82 trillion. In 2023, the five largest exporters account for 55.2% of these exports. Among the 5,026 products with finite PCI in 2023, the 103 AI-enabling goods have a mean PCI of 0.837, compared with approximately zero for the full product set; 58.3% lie in the highest complexity quartile. These values describe trade in the listed categories, not exports used exclusively for AI.

Table 1: Leading AECI economies and selected comparators, 2023

Economy DAI ¯qAI AECI |V | AECP

Japan 64 0.691 3.996 39 1.516

China 66 0.623 3.666 37 4.144

Germany 61 0.654 3.535 42 3.382

United States 53 0.656 2.991 50 1.918

Taiwan 52 0.666 2.977 51 0.836

South Korea 40 0.692 2.241 63 0.802

Italy 35 0.629 1.643 68 3.442

Notes: The first five rows are the five highest-AECI economies in 2023; South Korea and Italy are included as selected comparators. DAI is the number of AI-enabling goods in which an economy has revealed specialization, and ¯qAI is their mean normalized product complexity. |V | is the number of remaining AIAP candidates. AECI and AECP are standardized annually across the eligible country sample.

Japan leads AECI despite specializing in fewer listed goods than China, reflecting the higher average complexity of its specialized portfolio (Table 1). AECI also differs from bundle-level trade specialization: the United States has a bundle RCA of 0.858 in 2023 but ranks fourth in AECI.

Across the 162 valid economies, AECI correlates with whole-space ECI at Pearson r = 0.744 and Spearman rs = 0.822. Raw AECI, F , correlates with the number of AI-enabling specializations at r = 0.997. Thus, although complexity weights can affect individual rankings, portfolio breadth accounts for much of the cross-country variation in this specification.

### 3.2 Adjacent opportunities and product-space structure

Remaining opportunities do not reproduce the ordering of current portfolios. China has the highest AECP, followed by Italy and Germany, whereas Japan leads AECI (Table 1). AECI and AECP nevertheless correlate positively across the 162 valid economies in 2023 (r = 0.806; rs = 0.892). This is a comparison of related measures sharing specialization data and complexity weights, not independent validation.

AIAP retains the product-level detail summarized by AECP. For South Korea in 2023, optical instruments for semiconductor inspection (HS 903141) are the highest-ranked remaining good by ρq (ρ = 0.257, q = 0.825). For Vietnam, memory integrated circuits (HS 854232) rank highest (ρ = 0.163, q = 0.756). These scores order candidates by the product of relatedness and complexity, not an estimated probability of future entry.

In the descriptive HS6 backbone, the 103 AI-enabling goods are distributed across 27 of 71 Louvain communities. Their induced subgraph contains 53 retained links and 46 isolated nodes. Isolation here means no retained AI-to-AI backbone edge, not an absence of connections to non-AI goods or in the full proximity matrix. Under this descriptive network’s RCA ≥ 1 convention, mean 2023 proximity is 0.212 among AI-enabling goods and 0.138 among non-AI goods. Higher average within-set proximity therefore coexists with dispersion across several backbone communities. These statistics describe the specified network representation; they do not identify the contribution of particular industries to subsequent diversification.

### 3.3 Initial potential and subsequent change

Table 2 reports the coefficient on baseline raw potential in Eq. (6). Each outcome has 141 usable economies after the period and data-availability requirements, compared with 162 in the 2023 descriptive comparisons.

Table 2: Association of baseline raw potential with subsequent outcome changes

Coefficient on

| Outcome change | G¯0 | HC1 SE | p-value |
| --- | --- | --- | --- |
| AI-enabling export share (0–1) AECI (standardized) AI specialization count (DAI) | 0.1596 0.8645 16.4811 | 0.0625 0.8211 10.9136 | 0.0106 0.2924 0.1310 |

Notes: One observation per economy; N = 141 in each regression. The dependent variable is the difference between the 2019–2023 and 2007–2011 period means. Each model includes an intercept, baseline full-space ECI, the baseline mean of annual log real GDP per capita, and the baseline value of the corresponding outcome. The explanatory variable is raw G, not standardized AECP.

Higher initial raw potential is positively associated with the subsequent change in the AIenabling export share (β = 0.1596, p = 0.0106). The coefficients for changes in standardized AECI and the specialization count are also positive, but are not statistically distinguishable from zero at the 5% level (p = 0.2924 and p = 0.1310, respectively).

The association is therefore documented for export composition, but not established for every outcome in this specification. A change in export share need not coincide with entry into additional specialized products or an improvement in relative AECI. The estimates are in-sample conditional associations and do not identify causal effects, entry probabilities, or out-of-sample predictive performance.

## 4 Discussion

The results show how a domain-focused economic complexity framework distinguishes aspects of AI-enabling trade that aggregate output measures combine. Japan’s position relative to China in Table 1 illustrates the interaction of portfolio breadth and product complexity. The United States’ high AECI despite a bundle RCA below one distinguishes a broad complexity-weighted portfolio from aggregate relative specialization in the bundle. These are differences among tradebased measures, not evidence that AECI outperforms publication or patent indicators in measuring national AI capability.

The positive correlation with whole-space ECI links the domain-focused ranking to broader export specialization, but is not external validation because the measures share trade inputs. The same results qualify the contribution of complexity weighting. The near-unit correlation between raw AECI and specialization counts (Section 3.1) indicates that breadth dominates the observed cross-country variation. Complexity weights can alter particular rankings, as in the Japan–China comparison, without providing a large independent source of variation. AECI should therefore be interpreted together with its specialization count and mean-complexity components, rather than as evidence of a separately validated capability dimension.

Current portfolios and remaining opportunities also need to be distinguished. The different AECI and AECP leaders, and the different leading AIAP candidates for South Korea and Vietnam, show why an existing-portfolio ranking cannot substitute for a candidate-level assessment. The distribution of AI-enabling goods across multiple backbone communities is consistent with evaluating these candidates in the wider product space rather than treating them as a self-contained cluster. However, this description does not establish a capability-transfer mechanism or quantify the role of individual non-AI industries. AECP remains an average over each country’s remaining candidates, not their number, aggregate value, or probability of entry.

The longitudinal results provide a limited additional observation. Initial raw potential is associated with subsequent changes in the AI-enabling export share, but the estimates do not establish corresponding associations for changes in AECI or specialization counts (Table 2). This supports reporting an outcome-specific association with export composition, not a general validation of future capability growth. The non-significant coefficients do not establish that no relationship exists, and none of the regressions identifies a causal effect or tests out-of-sample prediction.

Interpretation remains bounded by the data and measurement design. Gross exports may include re-exports and imported inputs, while the listed categories include non-AI uses; they do not identify domestic AI-specific value added. Annual normalization and changing eligibility make AECI changes relative rather than absolute, and the retrospective product list does not identify historical AI demand. The measures also omit model performance, software and services, access to computing resources, and adoption. The study therefore offers a defined trade-based assessment, descriptive comparisons, and preliminary conditional associations within a generalizable framework. External validation and robustness to alternative classifications and complexity estimators remain separate tasks, not established properties of this version.

## Data Availability

The results are publicly available through the AI economic complexity tab of the Economic Complexity Explorer: https://dawoon-jeong0523.github.io/EC_dashboard/dashboard.html. The dashboard presents country-year indicators, AIAP candidates, product-space views, and project figures. This note documents the product-only 2007–2023 results; Tables 1 and 2 summarize the country portfolios and preliminary longitudinal associations. The AI results use unscreened input matrices with the reporting eligibility rule in Section 2, unlike the dashboard’s separately screened datasets. Original trade and classification sources are BACI and the WTO [5, 1]; the dashboard is a dissemination site for derived results, not a complete archive of the raw input data.

## References

[1] World Trade Organization. AI-enabling products. WTO Data Portal, 2025. URL [https:](https://data.wto.org/dataset/wto_ai)

[//data.wto.org/dataset/wto_ai](https://data.wto.org/dataset/wto_ai). Classification used in the World Trade Report 2025. Accessed September 14, 2026.

[2] C´esar A. Hidalgo and Ricardo Hausmann. The building blocks of economic complexity.

Proceedings of the National Academy of Sciences, 106(26):10570–10575, 2009. doi: 10.1073/pnas.0900943106.

[3] C´esar A. Hidalgo, Bailey Klinger, Albert-L´aszl´o Barab´asi, and Ricardo Hausmann. The

product space conditions the development of nations. Science, 317(5837):482–487, 2007. doi: 10.1126/science.1144581.

[4] Penny Mealy and Alexander Teytelboym. Economic complexity and the green economy. Research Policy, 51(8):103948, 2022. doi: 10.1016/j.respol.2020.103948.

[5] Guillaume Gaulier and Soledad Zignago. BACI: International trade database at the productlevel. The 1994–2007 version. Working Paper 2010-23, CEPII, 2010. URL [https://cepii.](https://cepii.fr/CEPII/en/publications/wp/abstract.asp?NoDoc=2726) [fr/CEPII/en/publications/wp/abstract.asp?NoDoc=2726](https://cepii.fr/CEPII/en/publications/wp/abstract.asp?NoDoc=2726).

[6] Robert C. Feenstra, Robert Inklaar, and Marcel P. Timmer. The next generation of the Penn World Table. American Economic Review, 105(10):3150–3182, 2015. doi: 10.1257/aer. 20130954.
