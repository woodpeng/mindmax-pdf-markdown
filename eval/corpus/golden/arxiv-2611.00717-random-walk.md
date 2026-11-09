CUTOFF FOR SIMPLE RANDOM WALK ON

PREFERENTIAL ATTACHMENT GRAPHS

ALLAN SLY1 AND SEOYEON YANG1

Abstract. We consider simple random walk on the sequential affine preferential attachment graphs with fixed parameters m ≥ 2 and δ ≥ 0. We prove the walk has total-variation cutoff, and for every fixed ε ∈ (0, 1),

(√ )

log n

t(n)

mix(ε) =

\+ OP

log n ,

νd

where ν > 0 is the walk speed and d > 0 is the entropy per level of harmonic measure on the Pólya–point tree, the local weak limit of the graph. Thus cutoff occurs at the entropic time.

Entropic cutoff was previously established for a range of random graph models including configuration models under mild degree assumptions and on Erdős–Rényi random graphs for typical starting points. We extend the

harmonic-measure approach to preferential attachment, accounting for its age-dependent structure and hubs of polynomial degree. The local weak limit, the Pólya–point tree, provides a more tractable setting for analyzing the walk. The proof combines regeneration estimates on the local limit tree, a quantitative graph–tree coupling on the mixing-time scale, and control of hub excursions. We show that shortly before the cutoff time its distribution is close in total variation distance to a measure with small L∞ distance from stationarity. When m ≥ 2, the spectral gap is bounded away from zero with high probability which completes the upper-bound coupling argument.

## 1. Introduction

Preferential attachment is a widely studied model of growing networks with power-law degree distributions [1, 8]. Vertices arrive successively and connect preferentially to vertices of high degree. We study the mixing time of simple random walk on these graphs. Our main result identifies the worst-case mixing time and proves cutoff: the total-variation distance to equilibrium drops from near one to near zero in a time interval negligible compared with the mixing time. The cutoff time is of order log n, with the leading constant determined by the speed and harmonic-measure entropy of random walk on the local limiting tree.

We consider the sequential affine model, in which each new vertex sends m ≥ 2 edges to older vertices, chosen sequentially with probabilities proportional to their current degrees plus δ ≥ 0. The limiting probability of degree k is asymptotic to a positive constant times k−(3+δ/m) as k → ∞, and fixed early vertices have degrees growing on the polynomial scale nm/(2m+δ) as the number n of vertices increases [6, Lemmas 5.1–5.2]. Thus the parameter range includes the infinite-variance case δ = 0, while polynomial-degree hubs persist when δ > 0 and the limiting variance is finite. These hubs have much greater stationary mass than a typical vertex, since the stationary distribution is proportional to degree. Vertex ages also influence the laws of neighboring vertices and the conditional distribution of unrevealed edges.

2020 Mathematics Subject Classification. Primary 60J10, 05C81; Secondary 05C80, 05C82, 60K37, 05C50.

Key words and phrases. Cutoff phenomenon, mixing time, simple random walk, preferential attachment, Pólya–point tree, local weak convergence, harmonic measure, spectral gap.

The local weak limit around a uniformly chosen vertex is the Pólya–point tree [6]. This is a random branching tree whose offspring laws depend on auxiliary random variables which represent normalized birth times, called ages, and on whether a vertex is older or younger than its parent. Simple random walk on this tree is transient and its loop erasure is an infinite ray. The conditional law of that ray given the tree is its harmonic measure. This measure is far from uniform. The contrast with volume growth is particularly pronounced in the critical case δ = 0: neighborhoods in the Pólya–point tree grow faster than exponentially, and the diameter of the

Vertex degree

2 10 50

Vertex label 0 (early)

299 (late)

Figure 1. An illustrative preferential attachment variant. Vertex area is proportional to degree (hence stationary mass); color indicates birth order, from purple (early) to orange (late).

preferential attachment is O(log n/ log log n) [7]. However, for every δ ≥ 0, the harmonic measure is concentrated on a subtree with only exponential growth. We let d > 0 be the entropy per level of harmonic measure and so informally, a typical ray segment of length k, chosen according to harmonic measure, has harmonic mass exp{−dk + o(k)}. Also, let ν > 0 denote the speed of the walk. The walk reaches depth about νt at time t so its entropy therefore grows at rate νd. Setting exp(νdt) ≈ n suggests the mixing scale.

Let Gn be the preferential attachment graph defined formally in Definition 2.1. Let Pn be its simple random walk transition matrix and πn(v) = deg(v)/(2m(n − 1)) its stationary distribution. For an integer t ≥ 0 and ε ∈ (0, 1), write

dn(t) = max

∥P t

n

(x, ·) − πn∥TV, t(n)

mix

(ε) = min{t ≥ 0 : dn(t) ≤ ε},

x∈V (Gn)

and set dn(t) = dn(⌊t⌋) for real t ≥ 0. We say that the walks exhibit cutoff at t⋆

n

with window wn = o(t⋆

n

) if, for every ε ∈ (0, 1),

(

)

(

)

lim

lim inf

P

dn(t⋆

n

− γwn) ≥ 1 − ε

= 1, lim

lim inf P

dn(t⋆

n

\+ γwn) ≤ ε

= 1. (1)

γ→∞

n→∞

γ→∞

n→∞

Here P denotes the graph law.

Theorem 1.1 (Cutoff for SRW on preferential attachment). Fix m ≥ 2 and δ ≥ 0, and let Gn be the preferential attachment graph of Definition 2.1. Let ν ∈ (0, 1] and d ∈ (0, ∞) be the speed and the entropy per level of harmonic measure of simple random walk on the Pólya–point tree, defined in (24) and (33), and set t⋆

n

:=

√ log n/(νd). Simple random walk on Gn exhibits cutoff at t⋆

n

with a window of order at most

log n. Equivalently, for every fixed ε ∈ (0, 1),

log n

(√ )

t(n)

mix

(ε) =

\+ OP log n

.

νd

The lower bound in Proposition 6.1 already holds for a uniformly chosen starting vertex, whereas the upper bound is uniform over all starting vertices, including the hubs. Thus typical and worst starting vertices have the same leading mixing time. The fluctuation estimates are used to obtain a cutoff window of order at most √

log n.

1.1. Related results. On random regular graphs of fixed degree at least three, simple random walk exhibits cutoff when the distance traveled on the limiting regular tree reaches the typical distance between graph vertices [17]. Conditional on its distance from the root, the tree walk is uniform on that level. For nonregular trees, the distribution of mass within a level also matters. Indeed, conditional on survival, harmonic measure on a supercritical Galton–Watson tree with a nonconstant offspring distribution of finite mean has dimension strictly smaller than that of the tree boundary [18]. The harmonic-measure dimension, together with the walk speed, determines the cutoff location from a typical vertex of the supercritical Erdős–Rényi giant and of configuration models under suitable degree assumptions [5]. A similar harmonic-measure approach is used in [16] to describe the cutoff time by the speed and entropy of random walk for graphs with an added random matching, through an auxiliary quasi-tree.

Entropic methods based on trajectory weights have also been developed for non-backtracking walks on configuration models [4], random walks on directed configuration models [9, 11], and more general sparse random Markov chains [10]. On the forward tree approximations used in these arguments, the probability of reaching a vertex is the product of the original walk’s one-step transition probabilities along its ancestral path. In our undirected setting, returning excursions make harmonic weights depend on escape probabilities in the descendant subtrees.

Passing from a typical starting vertex to the worst one requires additional control of exceptional neighborhoods. Worst-start cutoff was established for configuration models with minimum degree at least three, a finite second degree moment, and a degree-tail condition giving a sufficiently small subpolynomial maximum degree [3]. Their proof uses the degree assumptions to control small neighborhoods around every vertex, then applies tree couplings and concentration estimates to the walk beyond these neighborhoods. In preferential attachment, polynomial-degree hubs violate the neighborhood-size bounds used in this argument. Moreover, uniform pairing of half-edges is replaced by attachment probabilities that depend on ages and previous revelations. The case m = 2 also falls outside the minimum-degree-three hypothesis and requires using the structure imposed by attachment.

For preferential attachment, earlier work establishes several geometric estimates relevant to mixing. Constant conductance was proved for a standard degree-proportional model [19]. A logarithmic mixing bound for the lazy walk is used in the cover-time analysis [13], while large-set expansion for the present model was proved in [15]. We establish an absolute spectral gap with high probability, uniformly over δ ≥ 0, showing that there are no eigenvalues too close to -1.

Shortest-path asymptotics provide a complementary comparison. For the loop-allowing model at δ = 0, the diameter is asymptotic to log n/ log log n [7]. In the sequential model with δ > 0, typical distances are logarithmic, with leading constant determined by the growth rate of the local limit [20]. For every δ ≥ 0, the mixing time in Theorem 1.1 is logarithmic, with leading constant determined by the walk speed and harmonicmeasure entropy.

1.2. Proof ideas. We follow the harmonic-measure approach of [5], beginning with quantitative estimates on the limiting tree. For fixed m ≥ 2 and δ ≥ 0, let X be simple random walk on the Pólya–point tree T with uniform root age, started at its root ρ. Write |Xt| for its distance from the root at time t, and let ξ = (ρ, ξ1, . . .) be its limiting ray. For v ∈ T , define its harmonic information by

W (v) := − log PTρ (v ∈ ξ), Wk := W (ξk), where PTρ denotes the walk law conditional on T . Thus e−Wk is the harmonic mass of rays sharing the first k edges of ξ. Theorems 3.8 and 3.13 give

∣

∣

√

√

max

∣|Xs| − νs

∣ = OP(

t), Wk − dk = OP(

k),

0≤s≤t

√ under the joint law of the tree and the walk. Consequently, W|Xt| = νdt + OP(

t), providing the fluctuation scale used in the mixing argument.

To handle the dependence on age, we construct a regeneration structure with a fixed law for the age and type of the new root. This yields the distance estimate. Harmonic weights still depend on the tree beyond the next regeneration point. Approximating escape probabilities at finite depth controls this dependence and gives the covariance bounds needed for the entropy estimate.

To transfer estimates from the Pólya–Point Tree to Gn we need to construct a coupling between the graphs. We do not attempt to couple the entire ball of radius 1d log n in Gn with the Pólya–Point Tree as the number of vertices in the tree would be much larger than n. Instead, we couple a truncated portion of the tree of depth

1−o(1)

d

log n that with high probability supports almost all of the harmonic measure. We truncate the tree at points where it encounters either high degree vertices, very old vertices or along rays whose probability is too low. We show that few enough vertices are revealed along the way so that the Pólya urn representation of [6] continues to accurately describe the subsequent attachment probabilities.

Establishing the mixing bound from a typical starting point then follows from two consequences of the coupling. For the lower bound, a walk from a uniformly chosen vertex is localized on a set of o(n) vertices with total degree o(n), which has a vanishing stationary mass. For the upper bound, we show that, near the cutoff time, the law of the walk is arbitrarily close in total variation to a probability measure with density relative to

√ πn at most exp{O(

log n)}. The final step uses the uniform absolute spectral gap of Proposition 2.6 which says that for each fixed m ≥ 2, there is c = c(m) > 0 such that the spectral gap is at least c(m). Then, because of

√ the spectral gap, after a further O(

log n) steps, the L2 distance from stationarity will be o(1) which completes the proof.

Proving the result for arbitrary starting vertices requires a separate argument. In [3], they extended the method of [5] from typical starting points to prove cutoff in a configuration model with minimum degree 3 and degree distribution with exponential tails. They showed that after O(log log n) steps, the walk is spread out enough so that with high probability it is at a vertex that serves as a typical starting point. In our setting, we allow a burn-in time of O((log log n)2), treating visits to high-degree vertices separately to control the amount

√ of the graph revealed. This additional time is negligible compared with the

log n cutoff window.

When the walk hits a high degree vertex (greater than logC n) in the burn-in phase, it makes with high probability a bounded expected number of excursions before escaping down one of its subtrees. Since the

√ degree could be as large as

n, revealing all these subtrees would reveal too many vertices. Instead, we sample ⌈(log n)2⌉ incident slots and show that with probability 1 − o(n−1), almost all subtrees will be typical and give the estimates we need. Hence, with high probability it will escape down a typical subtree and we can apply the argument for mixing from a typical starting point.

Several questions remain. The lower bound from a uniformly chosen vertex does not determine whether individual hubs mix earlier: their many possible initial departures may accelerate initial mixing. The optimal window and any limiting cutoff profile also remain to be determined. The regime −m < δ < 0, corresponding to degree exponent between two and three, is outside our scope. In particular, the regularity estimates in Lemma 2.5 are proved only for δ ≥ 0.

Section 2 gives the model, urn estimates and spectral bound. Section 3 develops the tree-walk estimates, and Section 4 constructs the comparison with the finite graph. Section 5 treats arbitrary starting vertices. Section 6 proves the lower bound and combines the estimates to establish Theorem 1.1.

## 2. Preferential Attachment and the Pólya–Point Tree

2.1. The finite preferential attachment graph. Preferential attachment is a growth rule in which vertices with larger current degree are more likely to receive new edges.

Definition 2.1 (Sequential preferential attachment). Fix m ≥ 2 and δ ≥ 0.

The graph G2 consists of vertices 1, 2 joined by m parallel edges. For each k ≥ 3, form Gk from Gk−1 by adding vertex k and then adding m edges from k to older vertices, one at a time. For i = 1, . . . , m, let Fk,i−1 be the history just before the i-th edge is added, and let dk,i−1(v) be the degree of v < k at that time. The older endpoint Jk,i is chosen according to

(

)

dk,i−1(v) + δ

P

Jk,i = v | Fk,i−1

=

, v < k. (2)

2m(k − 2) + δ(k − 1) + (i − 1) Endpoints chosen by different edges may coincide, so Gn is an undirected loopless multigraph. Degrees count edge multiplicity, and simple random walk chooses an incident edge uniformly.

Set α := δ/(2m + δ) ∈ [0, 1) and u := α/(1 − α) = δ/(2m). Thus α = 0 is pure degree-proportional attachment, whereas the older endpoint tends to the uniform law as α ↑ 1. The affine attractiveness is 2mu. We also use the derived parameters

a 1 + α

a := m + 2mu, χ :=

= .

m + a

2 2.2. The Pólya–point tree and the urn representation. We now define the Pólya–point tree (PPT), the local weak limit of Gn.

Definition 2.2 (Pólya–point tree (PPT)). The Pólya–point tree is a rooted random tree (T , ρ) with ages Av ∈ (0, 1] and genealogical types typ(v) ∈ {TL, TR} for non-root vertices. The root has no type and has age Aρ ∼ Unif[0, 1]. Each vertex receives a mark with law





Gamma(a, 1), v = ρ or typ(v) = TR,

Γv ∼



Gamma(a + 1, 1), typ(v) = TL.

Conditional on (Av, Γv), generate the following two families independently.

(i) Left children. There are m left children if v is the root or has type TL, and m − 1 if it has type TR.

Their ages are independent copies of AvV 1/χ, where V ∼ Unif[0, 1], and their type is TL. (ii) Right children. The right-child ages form a Poisson point process on [Av, 1] with intensity

x−χ

ρv(x) dx := (1 − χ)Γv

dx, x ∈ [Av, 1].

A1−χ v

The corresponding children have type TR.

At each step, new variables are sampled independently of the preceding construction, subject to these conditional laws.

Genealogical types and marks are retained when the tree is re-rooted; the new root need not have the original root law.

If V0 is uniform on [n], independently of Gn, then (Gn, V0) converges in the local weak sense to (T , ρ) [6, Theorem 2.2]. More precisely, for each fixed radius and every ε > 0, all sufficiently large n admit a coupling under which, with probability at least 1 − ε, the two rooted balls are isomorphic and every matched pair (k, v) satisfies |k/n−Av| ≤ ε [6, Corollary 2.3]. Quantitative growing-radius comparisons are developed in Section 4.1. Let Nv be the number of right children of v. Conditional on (Av, Γv),

∫ 1

(

)

Nv ∼ Poi(Λv), Λv :=

ρv(x) dx = Γv

A−(1−χ) v

− 1 .

Av

Pólya urn representation. We recall the Pólya urn representation of the sequential preferential attachment graph from [6]. Fix n, set ψ1 = 1, and let {ψj }2≤j≤n be independent random variables with

(

)

ψj ∼ Beta

a, dj

, dj := (2j − 3)m + 2mu(j − 1), cj := a + dj = 2m(1 + u)j − 2m.

For 0 ≤ k ≤ n, define

∏

n

Sk :=

(1 − ψj ),

j=k+1

with the conventions S0 = 0 and Sn = 1. Equivalently, if

φk := Sk − Sk−1, Ik := [Sk−1, Sk), then φk = ψkSk and the intervals I1, . . . , In partition [0, 1).

Conditionally on (ψj )1≤j≤n, let

{Uk,i : 2 ≤ k ≤ n, 1 ≤ i ≤ m} be independent, with Uk,i uniform on [0, Sk−1]. Draw the slot (k, i), the i-th edge of k, to the unique j < k for which Uk,i ∈ Ij , ignoring the null event that Uk,i lies on an interval boundary and retaining multiple edges. Thus, conditionally on {ψj },

φj

k−1

∏

pk→j := P(Jk,i = j | {ψℓ}) =

= ψj

(1 − ψh), j < k.

Sk−1

h=j+1

The resulting multigraph has the same distribution as the sequential preferential attachment graph [6, Theorem 2.1]. The Beta parameters are the two attractiveness masses immediately after vertex j is added: a at j and dj on [j − 1]. Subsequent attachments restricted to [j] reinforce these masses as a two-color Pólya urn. The representation also explains Definition 2.2. On the event of Lemma 2.3, S1/χ

k−1

= (k/n)(1 + O(ε + k−1)). If Uk,i ∈ Ij , the two interval bounds similarly give U 1/χ

k,i

= (j/n)(1 + O(ε + j−1)). Writing Uk,i = Sk−1Vk,i, where Vk,i is uniform, therefore gives the limiting left-child age AvV 1/χ

k,i

. A uniform finite root has limiting age Unif[0, 1]. Future vertices ℓ > k attach to k when their uniform variables fall in Ik, whose length is φk = ψkSk. With A = k/n and s = ℓ/n, the urn estimate and the approximation ψk ≈ Γ/[2m(1 + u)k] give

1

mpℓ→k ≈

(1 − χ)ΓA−(1−χ)s−χ.

n There are n ds prospective younger vertices in ds, yielding the right-child intensity in Definition 2.2 after Poisson approximation. Conditioning a single attachment from a younger vertex to end at k weights the Beta density of ψk by ψk, giving Beta(a + 1, dk) and hence the limiting mark Gamma(a + 1, 1). The outgoing attachments of a younger vertex ℓ do not depend on ψℓ, so a right child retains the base Gamma(a, 1) law, as does the root.

2.3. Quantitative urn and mark estimates. The growing-ball coupling of Section 4 uses three quantitative inputs: Lemma 2.3 controls urn endpoints above a label cutoff; Lemma 2.4 compares Beta and Gamma marks; and Lemma 2.5 controls the ages, volume, and marks in a PPT ball.

Lemma 2.3 (Uniform urn estimate). There is a constant C = C(m, u) < ∞ such that, for every integer q ∈ {3, . . . , n} and 0 < ε ≤ 1,

(

)

C

P

max

|log Sk − χ log(k/n)| > ε

≤ . (3)

q−1≤k≤n

ε2q Consequently, on the complementary event,

(

)χ

( )χ

k

k

e−ε

≤ Sk ≤ eε

, q − 1 ≤ k ≤ n.

n

n

Proof. Let Ψ and Ψ1 denote the di- and trigamma functions. For ψj ∼ Beta(a, dj ),

E log(1 − ψj ) = Ψ(dj ) − Ψ(cj ), Var(log(1 − ψj )) = Ψ1(dj ) − Ψ1(cj ).

Their standard large-argument expansions give, uniformly in j ≥ 2,

∣

∣

∣

χ

∣

C

C

∣

∣

, Var(log(1 − ψj )) ≤

.

∣E log(1 − ψj ) +

j

∣ ≤

j2

j2

The first bound and the harmonic-sum estimate show that the deterministic bias is at most C/q, uniformly for

k ≥ q − 1. Kolmogorov’s maximal inequality, applied to the reversed centered sums, bounds the probability

that their maximum exceeds ε/2 by C/(ε2q). If ε < 2C/q, the same conclusion is trivial after increasing C.

This proves (3). □

For i > 0, let μi denote the Gamma(i, 1) law and let Gi be its distribution function. Let (Zk)k≥1 be

independent with common law μa; the variable Z1 is auxiliary. For k ≥ 2, define the increasing quantile map

fk : [0, ∞) → [0, 1] by

P(ψk ≤ fk(z)) = Ga(z), z ≥ 0.

We henceforth realize ψk = fk(Zk), which has the required Beta(a, dk) law. The following lemma gives the

quantitative beta–Gamma comparison needed below. For k ≥ 2 and s > 0, define the good-mark set

{

∣

∣ }

∣

fk(z)

∣

GBG

(s) :=

z > 0 :

∣

− 1

∣

.

k

∣

z/[2m(1 + u)k]

∣ ≤ s

Lemma 2.4 (Uniform beta–Gamma approximation). There is a constant C = C(m, u) < ∞ with the following

## property. For any k◦n ∈ {3, . . . , n} satisfying k◦n → ∞, set

εBG

n

:= C(k◦n)− a2a+1 . (4)

Then, for all sufficiently large n, uniformly for k◦n ≤ k ≤ n,

(∣

∣ )

∣

fk(Zk)

∣

P

∣

− 1

∣

≥ 1 − εBG

. (5)

∣

Zk/[2m(1 + u)k]

∣ ≤ εBG

n

n

## The proof also gives the estimate

C

E |ckfk(Zk) − Zk| ≤

, k ≥ 3. (6)

k

Proof. Let pk and ga denote the densities of ckBeta(a, dk) and Gamma(a, 1) respectively. For 0 < y < ck,

( )

pk(y)

Γ(ck)

y

log

= log

\+ y + (dk − 1) log

1 − .

ga(y)

Γ(dk)ca

k

ck

The Gamma-ratio and Taylor expansions give, uniformly for 0 < y ≤ d1/4

k

,

∣

∣

∣

pk(y)

∣

C(1 + y + y2)

∣

∣

.

∣log

ga(y)

∣ ≤

dk

∫ d1/4

Since the right-hand side is o(1), integration against yga(y) bounds

k

y|pk − ga| dy by C/dk. Both laws have

0

uniformly bounded sixth moments, using E[(ckψk)6] = c6k(a)6/(ck)6 ≤ (a)6. Their remaining first moments are

therefore O(d−5/4

k

), so

∫ ∞

(

)

C C

W1

L(ckψk), μa

≤

y|pk(y) − ga(y)| dy ≤

≤ ,

0

dk k

which proves (6).

Since ck/[2m(1 + u)k] = 1 + O(k−1), whenever C/k ≤ s ≤ 1, z /∈ GBG

k

(s) implies |ckfk(z) − z| ≥ csz for some

c = c(m, u) > 0. For 0 < r ≤ 1, Markov’s inequality, (6), and the Gamma small-ball estimate give

(

)

(

)

C

P

Zk /∈ GBG

k

(s)

≤ P(Zk < r) + P

|ckfk(Zk) − Zk| ≥ csr

≤ Cra +

.

ksr

Taking r = (ks)−1/(a+1) gives the bound C(ks)−a/(a+1). For s = C0(k◦n)−a/(2a+1), this is at most s, uniformly

for k ≥ k◦n, when C0 is sufficiently large. Taking this constant in (4) proves (5). □

2.4. Regularity of growing PPT balls. For r ≥ 0, let Br(ρ) denote the radius-r ball in the PPT, and write Pa0 for its law with deterministic root age Aρ = a0.

Lemma 2.5 (Regularity of the PPT). Fix c0, cr, ζ > 0, put

ℓn := log log n, rn := ⌈crℓn⌉.

There are constants C, creg, CΓ > 0 and n0, depending only on m, u, c0, cr, ζ, such that, for every n ≥ n0 and

a0 ∈ [e−c0ℓ2n , 1],





|Brn (ρ)| ≤ a−(1−χ)

0

eζℓ2n ,

|  |  |  |
| --- | --- | --- |
|  | −ζℓ2n  | 2 |
|  min | Av ≥ a0e , | −cregℓn |

Pa0



v∈Brn (ρ)











max

Γv ≤ CΓℓ2n

v∈Brn (ρ)

## Moreover, on this event, every v ∈ Brn (ρ) satisfies

∥ρv∥∞ ≤ (1 − χ)CΓℓ2na−1

0

eζℓ2n , Λv ≤ CΓℓ2na−(1−χ)

0 e(1−χ)ζℓ2n .

Proof. Put β = 1 − χ ≤ χ and b = a0e−ζℓ2n . The weight A−β matches the age dependence of the right-child intensity. Explore the PPT to depth rn, retaining vertices of age below b but revealing none of their offspring. Writê B for the resulting subtree and set

∑

W :=

(Av ∨ b)−β .

v∈̂B

Each vertex contributes at least one, and a vertex crossing the age cutoff contributes exactly b−β .

Consider a vertex of age A ≥ b, before its mark and offspring are sampled. For V ∼ Unif[0, 1], the expected weight of a left child is

(

∫ log(A/b)

)

[

]

(

)

E

(AV 1/χ ∨ b)−β

= A−β

1 + β

e(β−χ)s ds

≤ A−β 1 + β log(A/b)

.

0

There are at most m left children. Since the mark has mean at most a + 1 and right-child ages are at least A, their expected total weight is at most

∫ 1

(a + 1)βA−β

x−χ−β dx = (a + 1)βA−β log(1/A).

A

Thus the expected total child weight is at most C(1 + log(1/b)) times the parent’s weight. Iterating this conditional expectation bound over generations gives

∑

rn

[

]j

Ea0 W ≤ a−β

0

C(1 + log(1/b))

≤ a−β

0

exp{O(ℓn log ℓn)}, (8)

j=0

since log(1/b) ≤ (c0 + ζ)ℓ2n and rn = O(ℓn). All bounds are uniform over the allowed root ages.

If the full ball contains a vertex of age below b, the first such vertex on its ancestral line belongs tô B. Hence Markov’s inequality and (8) give

(

)

Pa0

min

Av < b

≤ bβ Ea0 W ≤ exp{−βζℓ2n + O(ℓn log ℓn)}.

v∈Brn (ρ)

On the complementary event,̂ B = Brn (ρ) and |̂ B| ≤ W . The same estimate therefore bounds the probability that the age bound holds but the volume bound fails by exp{−ζℓ2n + O(ℓn log ℓn)}.

Membership in̂ B is determined before a vertex’s own mark is sampled. Conditional on its age and type, this mark has law Gamma(a, 1) or Gamma(a + 1, 1), so

(

)

Pa0

∃v ∈̂ B : Γv > z

≤ 2a+1e−z/2Ea0 |̂B| ≤ 2a+1e−z/2Ea0 W.

| Since a0 | ≤ e | , taking z = CΓℓn with CΓ > 2βc0 + 2 bounds this probability by e | for large n. | As |
| --- | --- | --- | --- | --- |
|  |  | ℓn logℓn = o(ℓ2n), these three estimates prove (7). |  |  |
|  |  | The remaining bounds follow from ∥ρv∥∞ = (1−χ)Γv/Av and the formula for Λv. |  | □ |

2.5. A uniform spectral gap. Let Pn be the transition matrix of simple random walk on Gn, with eigenvalues 1 = λ1(Pn) ≥ · · · ≥ λn(Pn). Throughout this section, m ≥ 2 is fixed and all edge counts include multiplicity. Let Pα be the law of the model with δ = 2mα/(1 − α), and let Eα denote the corresponding expectation.

Proposition 2.6 (Uniform two-sided spectral gap). There is a constant c = c(m) > 0 such that

(

)

sup

Pα

max

|λi(Pn)| > 1 − c

= o(1).

α∈[0,1)

2≤i≤n

For a graph G and S ⊆ V (G), let bG(S) count the boundary edges with exactly one endpoint in S, and let

| eG(S) count edges with both endpoints in S. Write dG(v) for the degree of v in G and volG(S) = | v∈S dG(v). |
| --- | --- |
| Its conductance is bG(S) h(G) = min c . |  |

∅̸=S⊊V (G)

Write τ (G) for the minimum number of monochromatic edges in a two-coloring of V (G).

Lemma 2.7 (Conductance bound). There is a constant c = c(m) > 0 such that

sup

Pα(h(Gn) < c) = o(1).

α∈[0,1)

Proof. Choose η = η(m) > 0 sufficiently small, with η ≤ 1/100. We first show that, uniformly in α, with probability 1 − o(1),

bGn (S) ≥ η|S| (1 ≤ |S| ≤ n/2). (9)

Connectivity gives this inequality when |S| ≤ 1/η. For a fixed set S of size 1/η < k ≤ n/2 and an integer 1 ≤ a ≤ ηk, we claim that

( ) (mk

)

mn

a

Pα(bGn (S) = a) ≤ (mn)m

(mn−a

) . (10)

a

mk−a

We adapt the crossing-pattern argument of [15, Lemma 3.2 and Appendix A] to keep the bound uniform in α. Treat the seed edges as created by vertex 2, orient them from 2 to 1, and label all m(n − 1) edges in creation order. Fix a set of a labels prescribed to cross (S, Sc); incompatible seed prescriptions have probability zero.

Consider a nonseed edge prescribed not to cross, created by a vertex r in a side C ∈ {S, Sc}. Let i be its rank among the noncrossing edges created by vertices in C, let z, y count the preceding noncrossing and crossing edges, and let h count the preceding edges from r. Let hC ≤ h count those preceding edges from r whose target lies in C. Among the i − 1 preceding noncrossing edges created by vertices in C, the i − 1 − hC created by vertices other than r contribute 2 each to the degree mass in C (both endpoints lie in C), while the hC created by r contribute only their target’s degree, 1 each; the y − (h − hC ) preceding crossing edges created by vertices other than r contribute 1 each, from whichever endpoint lies in C. Summing and cancelling hC : on a history consistent with the prescription, the eligible degree mass in C is 2(i−1−hC )+hC +[y−(h−hC )] = 2(i−1)+y−h, and the same count without restricting to C gives 2(z + y) − h. Also, m|C ∩ [r − 1]| ≤ i − 1 + y − h + m and m(r − 1) = z + y − h + m. Hence the probabilities of staying in C under degree-proportional and uniform attachment are bounded, respectively, by

2(i − 1) + y − h

i − 1 + y

i − 1 + y + m − h

≤

,

.

2(z + y) − h

z + y

z + y + m − h

Since z ≥ i − 1 and y ≤ a, both are at most (i − 1 + a + m)/(z + a + m). Writing Dk,i := 2m(k − 2) + (i − 1) for

∑v\<k

the sum

dk,i−1(v), rule (2) equals βk,i dk,i−1(v)/Dk,i + (1 − βk,i)/(k − 1), with βk,i = (1 − α)Dk,i/[2mα(k −

1) + (1 − α)Dk,i] ∈ [0, 1] depending on (k, i) alone: a convex combination, with history-independent weight, of the degree-proportional and uniform rules above. Its conditional noncrossing probability is therefore at most the same convex combination of the two bounds above, hence at most

i − 1 + a + m

i + a + m

≤

. (11)

z + a + m

z + a + m + 1

Put M = m|S \\ {1}|, and let s be the number of prescribed crossing edges created by vertices in S. Bound

each crossing probability by one and multiply the right-hand bound of (11) over the remaining labels. The

noncrossing seed labels can be included: their ranks satisfy i = z + 1, so their factors equal one. The global

noncrossing ranks run from 1 to m(n − 1) − a, and the ranks on the two sides run from 1 to M − s and from 1

to m(n − 1) − M − a + s. Thus the probability of the prescribed pattern is at most

(M + a − s + m)!(mn − M + s)!

(M + m)!(mn − M )!

(mk)![m(n − k)]!

≤

≤ (mn)m

.

(mn)!(a + m)!

(mn − a)!(a + m)!

(mn − a)!a!

For the first inequality, pair the a extra numerator factors with the last a factors of (mn)!, using a ≤ M and

M + m + a ≤ mn. For the second, use M ∈ {mk − m, mk}; at most m extra numerator factors remain, each

(mn

)

bounded by mn. There are at most

a

prescribed patterns, proving (10).

Vandermonde’s identity gives

(

)

(

)(

)

mn − a

n (m − 1)n − a

≥

.

mk − a

k (m − 1)k − a

The usual binomial bounds therefore imply, for 1 ≤ a ≤ ηk,

(

)(

) (mk

)

[

(

)2a/k (

)m−1−2a/k

]k (

)(m−1)k/2

n

mn

a

emk

k

k

(mn−a

) ≤

≤

.

k

a

a

n

n

mk−a

The last inequality holds for sufficiently small η, uniformly in k/n ≤ 1/2. A union bound over S and a now

gives

∑ (

)(m−1)k/2

k

sup

Pα (∃S : 1 ≤ |S| ≤ n/2, bGn (S) < η|S|) ≤ Cmnm

k

= o(1).

α∈[0,1)

n

1/η\<k≤n/2

√ Indeed, split the sum at

n. Below this point use k/n ≤ n−1/2; above it use k/n ≤ 1/2. The resulting geometric

bounds tend to zero after multiplication by nm when η is sufficiently small. This proves (9).

Every vertex has at most m edges directed toward older vertices, so eGn (U ) ≤ m|U |. For any nontrivial cut,

take its side U of smaller cardinality. On (9),

bGn (U )

bGn (U )

η

≥

≥

.

min{volGn (U ), volGn (U c)}

2m|U | + bGn (U )

2m + η

Taking the minimum over cuts proves the lemma. □

Lemma 2.8 (Distance from bipartiteness). There is a constant c > 0 such that, for all large enough n,

(

)

n

sup

Pα

τ (Gn) ≤

≤ e−cn.

α∈[0,1)

200 Proof. Every older vertex has degree at least m, so (2) gives

1

Pα(Jk,i = v | Fk,i−1) ≥

, v < k. (12)

2(k − 1)

One seed edge and the first edge from each vertex k ≥ 3 form a spanning tree. Fix σ1 = +1. Every two-

coloring is then encoded by a binary sequence (b2, . . . , bn), where bk = 1 precisely when the parent edge of k is

monochromatic. A coloring with at most n/200 monochromatic edges has at most n/200 ones in its code.

Fix such a code and expose the graph sequentially. Once the first edge from k reveals its parent, assign the

color σk prescribed by bk. Let Xk indicate that the second edge from k is monochromatic, and put

|{v < k : σv = σk}|

rk =

.

k − 1

The colors in this expression are known before the second edge is exposed. Thus (12) implies Pα(Xk = 1 |

Fk,1) ≥ rk/2. Every two-coloring of n vertices has at least n(n − 2)/4 monochromatic vertex pairs. Since each

denominator in rk is at most n − 1, omitting the pair {1, 2} gives, pathwise,

∑

n

n

rk ≥

− O(1).

4

k=3

The conditional Bernoulli exponential bound, iterated in the exposure filtration, gives

{

}

∑

n

1 − e−1

∑

n

|  | Eα exp − | Xk + k=3 | 2 | rk ≤ 1. k=3 |  |
| --- | --- | --- | --- | --- | --- |
| Consequently, for this fixed code, Pα | ( n ) ∑ n Xk ≤ k=3 200 | { ≤ exp | n 200 | 1−e−1 − n+O(1) 8 | } . |

If τ (Gn) ≤ n/200, some code with at most n/200 ones satisfies the event in the last display. For large n, the

| number of these codes is at most |  | ( |  | ) |  |
| --- | --- | --- | --- | --- | --- |
|  | ∑ |  | n−1 |  | n/25 |
|  |  |  |  |  | ≤ e . |
|  | 0≤j≤n/200 |  | j |  |  |

Since 1/200 + 1/25 < (1 − e−1)/8, the union bound proves the result. □

Proof of Proposition 2.6. The usual Cheeger inequality [12] gives 1 − λ2(Pn) ≥ h(Gn)2/2. To control the other

end of the spectrum, write G = Gn. We show that for disjoint sets L, R with S = L ∪ R̸ = ∅,

2eG(L) + 2eG(R) + bG(S)

τ (G)

≥ h(G)

. (13)

volG(S)

|E(G)|

If volG(S) ≤ |E(G)|, the left side is at least h(G), which suffices since τ (G) ≤ |E(G)|.

Otherwise put a = eG(L) + eG(R) and b = bG(S). Extending the coloring of S by independent fair colors on

Sc shows that

volG(Sc) + b

τ (G) ≤ a +

, h(G) volG(Sc) ≤ b.

4

Since h(G) ≤ 1, these inequalities give 2h(G)τ (G) ≤ 2a + b. Dividing by volG(S) ≤ 2|E(G)| proves (13).

The minimum of the left-hand side of (13) over such pairs L, R is 1 − ¯h(G), where ¯h(G) is the dual Cheeger

constant. The dual Cheeger inequality [2, Theorem 3.2], applied with edge multiplicities as weights, therefore

yields

(

)2

(1 − ¯h(Gn))2

h(Gn)2

τ (Gn)

1 + λn(Pn) ≥

≥

.

2

2 m(n − 1) Lemmas 2.7 and 2.8 bound both h(Gn) and τ (Gn)/[m(n−1)] away from zero with probability 1−o(1), uniformly in α. The two spectral bounds prove the proposition. □

## 3. Random Walk on the Pólya–Point Tree

Throughout this section, m ≥ 2 and α ∈ [0, 1). Let P denote the annealed law of the PPT of Definition 2.2 and simple random walk X started at its root ρ. Write |v| = distT (ρ, v); after re-rooting, depth is measured from the new root. We prove concentration of the distance and of harmonic information, and derive the estimates used in the logarithmic-time exploration.

3.1. Escape probabilities and harmonic measure. For a fixed realization of T , write PTx for simple random walk started from x, and put τz := inf{n ≥ 0 : Xn = z}. For a child y of z, write y− = z and let hz (y) := PTy (τz = ∞), abbreviated to h(y). We also use descendant trees with an artificial parent attached to their root. The root degree includes this additional edge, and no environment beyond the artificial parent is needed before it is hit.

Lemma 3.1 (Uniform escape). Almost surely, for every parent–child edge z → y, including an artificial parent edge,

1

hz (y) ≥ pesc :=

.

3 In particular, simple random walk on T is transient.

Proof. Choose a left child w of y. Since w has type TL, recursively retaining two left children of each retained vertex gives an infinite binary tree. Its effective resistance from w to infinity is one. Hence the effective conductance from y to infinity within this retained subtree, including the edge yw, is 1/2. Rayleigh monotonicity shows that the effective conductance Cy from y to infinity through all its descendants satisfies Cy ≥ 1/2. Since the edge yz has unit conductance,

Cy 1

hz (y) =

≥ .

1 + Cy

3 The argument is unchanged when z is an artificial parent. The positive effective conductance to infinity also proves transience. □

Set ϱ := 1 − pesc = 2/3. By the strong Markov property, if x is a descendant of z, then

PTx (τz < ∞) ≤ ϱdist(x,z). (14)

By transience and local finiteness, the walk converges to an end. Let ξ = (ρ, ξ1, . . .) be the corresponding terminal ray. For a child y of z, let θz (y) be the conditional probability that this ray follows z → y, given that it contains z, and write θ(y) := θy− (y).

Lemma 3.2 (Harmonic kernel). For every child y of z,

hz (y)

θz (y) =

∑w:w−=z

. (15)

hz (w) Consequently,

− log θz (y) ≤ log degT (z) + log p−1

esc

= log degT (z) + log 3. (16)

Proof. At each visit to z, the probability of stepping to y and never returning is hz (y)/ degT (z). Summing over visits gives the probability that the terminal ray follows z → y. The expected number of visits is a common finite factor, so normalizing over the children proves (15). The bound follows from hz (y) ≥ pesc and hz (w) ≤ 1. □

The harmonic information along the first k levels of the ray is

∑

k

W0 := 0, Wk :=

− log θ(ξj ), k ≥ 1.

j=1

The same notation will be used after re-rooting at a regeneration vertex, with the ray starting from that vertex.

We shall condition the walk to avoid an ancestor b. For x strictly below b, put Hb(x) := PTx (τb = ∞) and

PT ,b

x

:= PTx ( · | τb = ∞). Set Hb(b) = 0; when no ancestor is forbidden, write b = ∂ and H∂ ≡ 1. Avoiding the parent of x prevents a visit to b, so Hb(x) ≥ pesc. The Markov property gives the conditioned transition probabilities

Hb(y)

pb(x, y) =

, y ∼ x.

degT (x)Hb(x) For a child y of x, every path to b passes through x, and hence

Hb(y) = Hb(x) + (1 − Hb(x))hx(y) ≥ Hb(x). (17)

Thus conditioning does not decrease the transition probability to any prescribed child. Moreover,

hx(y)

PT ,b

y

(τx = ∞) =

≥ pesc. (18)

Hb(y)

Conditioning the walk from a descendant root o never to hit its artificial parent b preserves the harmonic kernel (15). Indeed, for each child y of x,

hx(y)

pb(x, y)PT ,b

y

(τx = ∞) =

.

degT (x)Hb(x) The conditioned walk is transient and stays in the descendant tree of o, so the same last-departure argument, normalized over the children of x, applies.

3.2. Regeneration. We explore the tree along the walk. On the first visit to a vertex, we reveal its mark and all its children, including their ages and types. Let Hn denote the exploration history immediately before any new data are revealed at time n. Write Tv for the complete marked descendant tree rooted at v. Definition 3.3 (Regeneration times). A step Xn−1 = u → Xn = y is a candidate if u and y are first visited at times n − 1 and n, respectively, y is a child of u, and Au < 1/2 < Ay. It is accepted if the walk never subsequently returns to u. Put r0 = 0, and let r1 < r2 < · · · be the accepted candidate times, with value ∞ if the next accepted candidate does not exist. When finite, write vi = Xri and bi = Xri−1.

The age law at a candidate entrance is

(1 − χ)s−χ

μR(ds) :=

1(1/2,1)(s) ds. (19)

1 − 2−(1−χ)

Indeed, on the first visit to a vertex of age less than 1/2, the right-child intensity on (1/2, 1) is a random constant times s−χ ds. Conditional on the number of children, the walk chooses uniformly among the neighbors, so the degree bias does not change this normalized age density. The selected child has type TR, and, conditional on its age, its own mark and descendant tree have the prescribed type-TR PPT law.

Definition 3.4 (Post-regeneration law). Let PμR be the annealed law of a type-TR PPT rooted at o, with Ao ∼ μR, an artificial parent bo attached to o, and simple random walk started from o. Define

P⋆ := PμR ( · | τbo = ∞).

Lemma 3.1 gives PμR (τbo = ∞) ≥ pesc. Conditioning changes both the tree and the walk: the tree marginal is biased by Hbo (o), and, given the tree, the walk has law PT ,bo

o

. For every nonnegative functional Y of the tree and walk,

E⋆Y ≤ p−1

esc

EμR Y. (20)

Lemma 3.5 (Law at an accepted candidate). Let σ be a finite exploration stopping time at which u = Xσ is visited for the first time and Au < 1/2. The history Hσ records the past walk and all information revealed through this entrance, before Γu and the children of u are exposed. Put Y = Xσ+1.

Under either P or P⋆, conditional on Hσ and on u → Y being an accepted candidate, the marked descendant tree TY , rooted at Y , together with the walk (Xσ+1+k)k≥0, has law P⋆. Here u is replaced by an artificial parent carrying no age or mark.

Proof. First work under the ordinary annealed law, either P or PμR . Conditional on Hσ, expose Γu and the numbers of children of u with ages below and above 1/2. By the Poisson offspring rule and (19), the descendant trees rooted at children of age above 1/2, in an independent random ordering, are i.i.d. with the tree marginal of PμR . The degree of u is fixed by the conditioning data, and the walk chooses uniformly among its neighbors. Conditional on the next step being a candidate, the selected tree therefore has this same law. Since the law does not depend on the exposed data, this remains true conditional only on Hσ and the candidate event.

By the Markov property at σ + 1, the selected tree together with the walk from Y , stopped on hitting u, has law PμR stopped on hitting its artificial parent. Acceptance is precisely the event that this parent is never hit. Thus, writing B for the event that u → Y is an accepted candidate, for every bounded measurable functional F of the selected tree and shifted walk,

EμR [F ; τbo = ∞]

E[F | Hσ, B] =

= E⋆[F ].

PμR (τbo = ∞)

Finally, under P⋆, the past has avoided the initial artificial parent bo, and on B the future remains in TY . Hence, conditional on Hσ and B, the avoidance event defining P⋆ is automatic. The conditional law therefore agrees with that under PμR , to which the preceding argument applies. □

3.3. Concentration of distance.

Proposition 3.6 (Exponential regeneration tails). There exists ε > 0 such that

Eeεr1 + E⋆eεr1 < ∞.

Proof. We first give uniform bounds for a trial started at the first visit to a vertex v. If Av > 1/2, a specified left child has age below 1/2 with probability at least 2−χ. The event that Γv ≤ 1, there are no right children, and this left child has age below 1/2 has uniformly positive probability. On that event the degree is at most m + 1. Thus the next step is to an unvisited child of age below 1/2 with a uniformly positive probability.

If Av < 1/2, restrict to Γv ≥ 1. The number of right children then dominates N ∼ Poi(21−χ − 1); each right child has conditional probability at least 1 − 2−(1−χ) of having age above 1/2. Since the degree is at most m + 1 plus the number of right children, the probability of choosing such a child is at least

[

]

(

)

N

P(Γv ≥ 1)

1 − 2−(1−χ)

E

\> 0,

m + 1 + N uniformly in the age and type, including the original root. These two bounds give a candidate within two steps of the first visit to any vertex, with probability bounded below by a constant. To transfer this bound to P⋆, let σ be a stopping time at which Xσ is visited for the first time, and let E be the corresponding descendant trial event of length ℓ ≤ 2. On histories avoiding bo, conditioning on the tree and the walk through σ + ℓ gives

EμR [1E Hbo (Xσ+ℓ) | Hσ]

P⋆(E | Hσ) =

≥ pescPμR (E | Hσ).

EμR [Hbo (Xσ) | Hσ] Indeed, on E the numerator’s avoidance factor is at least pesc, and the denominator is at most one. At the candidate entrance, the conditional probability of acceptance is at least pesc by (18).

We next control the time lost between trials. Put

1

f (v) := |v| +

1{typ(v)=TL},

where the indicator is interpreted as zero at the untyped original root. In the following drift and hitting-time estimates, the tree is fixed and all expectations and probabilities are quenched. If the current vertex v = Xn has type TL, then under simple random walk

m − 3

2

\+ 1

2

Nv 1

E[f (Xn+1) − f (Xn) | Xn] ≥

≥ .

m + Nv + 1

6 Indeed, a left-child step has increment 1, a right-child step has increment 1/2, and the parent step has increment at least −3/2. If v has type TR, the corresponding bound is

2

(m − 1) + Nv − 1

1

E[f (Xn+1) − f (Xn) | Xn] ≥3

≥ .

m + Nv

4 At the original root every increment is positive. The same holds at the post-regeneration root under the conditioned law, since its artificial parent cannot be visited. Elsewhere under the conditioned law, (17) shows that the Doob transform transfers transition mass from the parent to the children. Since every child step has positive f -increment and the parent step has negative increment, the same lower bounds remain valid. As |f (Xn+1) − f (Xn)| ≤ 3/2, there are constants λ0, c0 > 0, uniform in the tree and the past, such that under either quenched law

[

]

E

e−λ0(f (Xn+1)−f (Xn)) | X0, . . . , Xn

≤ e−c0 . (21)

Suppose that the walk starts from a child v of u. Before τu, the walk stays in the descendant tree of u, where f − f (u) > 0. Applying (21) up to τu gives, for the walk started from any strict descendant w of u,

Pw(τu < ∞) ≤ e−λ0(f (w)−f (u))

and

[

]

Ev

e−λ0(f (Xn)−f (u))1{τu>n}

≤ e−c0ne−λ0(f (v)−f (u)).

The Markov property at time n, with the first bound applied at w = Xn, therefore yields, uniformly in the tree and the past,

Pv(n < τu < ∞) ≤ e−c0n. (22)

If σk is the time to reach a level k above the current height, then on {σk > n} one has f (Xn) − f (X0) ≤ k. Applying (21) before σk gives

P(σk > n) ≤ min{1, eλ0k−c0n}.

Consequently, for 0 < ε < c0, summation of the tail gives

λ0

Eeεσk ≤ Cεecεk, k ≥ 1, cε :=

ε ↓ 0 as ε ↓ 0. (23)

c0 All these bounds hold conditionally at stopping times.

Now test the one- or two-step age pattern at height records. If the finite test fails to produce a candidate, resume at the first level strictly above the maximum visited during the test. The required height increase is at most five, so (23) gives a uniform exponential moment for the time until the next test. The conditional probability of a failed test is bounded away from one. Consequently, for some small ε > 0, its duration D satisfies E[eεD1{failure} | past] < 1, uniformly. Iterating this bound proves that the time S0 of the first tested candidate has a uniform exponential moment.

Let Sj be a tested candidate time, and let Bj be its acceptance event. On Bc

j

, wait for the actual return to the old endpoint u. Its duration τu, measured from Sj , satisfies the defective exponential tail (22). Then wait to reach a level above the maximum visited during this rejected excursion, and resume the same candidate search. The required height increase is at most τu + 2. By (23), the conditional exponential moment of this catch-up time is at most Cεecε(τu+2). The subsequent candidate search has the uniform exponential moment just proved. Decreasing ε so that ε + cε < c0 in (22) therefore yields

[

∣ ]

∣

supjE

eε(Sj+1−Sj )1Bc

∣ HSj < ∞.

j

At exponent zero these expectations are at most 1 − pesc. After decreasing ε further, uniform exponential integrability makes them all at most a constant κ < 1. Iterating at the successive candidate stopping times and summing over the number of rejections gives an exponential moment for the first accepted time of this

| restricted search. Since r1 is no later, the proposition follows under both laws. | □ |
| --- | --- |
| Under P⋆, set v0 = o, b0 = bo, and define |  |
| Ri := ri+1 −ri, Ti := distT (vi, vi+1), i ≥ 0. |  |

Under the original law, use the same definitions for i ≥ 1. The regeneration vertices are successive descendants, so 1 ≤ Ti ≤ Ri. The i-th regeneration slab Ci consists of the marked tree Tvi \\ Tvi+1 , rooted at vi, together with the walk segment (Xri+t)0≤t\<Ri . It includes every side branch attached to the retained tree. We retain an unmarked incoming half-edge at vi and a distinguished unmarked outgoing half-edge at bi+1, recording that the next step crosses the latter. The vertex vi+1, its age and marks, and all its descendants are excluded. We forget the original vertex addresses and child order, while retaining the genealogical types. In particular, the outgoing half-edge carries no age rank. Time is measured from ri. Thus Ri and Ti are determined by Ci.

Under the original law, the initial block I0 consists of Tρ \\ Tv1 , rooted at ρ, the path (Xt)0≤t\<r1 , and the unmarked outgoing half-edge at b1, with the same convention on labels.

ρ (root)

|Xri−1 |

Xri−1−1

Xri−1

|Xri |

Ci−1

Xri−1

Xri

Xri = ξ|Xri |

## Ci

Xri+1

Figure 2. The half-open regeneration slabs separated by the accepted edges (Xri−1, Xri ). The slabs are i.i.d.; the forward descendant trees rooted at Xri are nested and are not independent.

Let Θ re-root the forward tree at v1, shift the walk by r1, and retain b1 only as an artificial forbidden parent. Every regeneration vertex lies on the terminal ray, since the walk never returns across its incoming edge. Thus vi = ξ|vi|.

Theorem 3.7 (Regeneration product structure). Under P⋆, the slabs (Ci)i≥0 are independent and identically distributed. For every k ≥ 1, the forward tree and shifted walk obtained by applying Θ k times have law P⋆ and are independent of C0, . . . , Ck−1. In particular,

(Ri, Ti)i≥0 are i.i.d., E⋆eεR0 < ∞, 1 ≤ T0 ≤ R0 for some ε > 0. Under the original law, the slabs (Ci)i≥1 are i.i.d. with this common law and are independent of I0.

Proof. Under P⋆, inspect the next step whenever the walk first visits a vertex u with Au < 1/2. After a candidate step u → y, suspend the search until the walk returns to u, or forever if it does not. The inspected entrances are stopping times, and this search finds the first accepted candidate: an accepted candidate inside a suspended excursion would prevent the return, making u → y itself accepted.

At an inspected entrance, first work under the ordinary annealed law PμR , or P for the original root. Conditional on the history, the mark of u, and its offspring counts below and above 1/2, the above-half child trees, in an independent random order, are i.i.d. with the tree marginal of PμR . A candidate step selects one uniformly, so the selected tree retains this law independently of all unselected child trees and the tree outside Tu. Here we use that the slab forgets child order and the outgoing half-edge’s age rank. The Markov property gives the same independence jointly with the future walk stopped on returning to u. Conditioning on acceptance therefore gives an independent P⋆ forward pair, as in Lemma 3.5. This accepted factorization also holds under P⋆: on histories avoiding the initial artificial parent, acceptance makes its subsequent avoidance automatic.

At each inspected entrance, all earlier rejections are recorded in the history. At the first successful cut, C0 is determined by the deleted exterior and the preceding path. Proposition 3.6 makes this cut almost surely finite and gives the required exponential moment, since R0 = r1. Thus, summing over the possible first successful entrances, for bounded nonnegative F, G,

E⋆[G(C0) F ◦ Θ] = E⋆[G(C0)]E⋆[F ].

Hence the shifted forward pair has law P⋆ and is independent of C0; iteration proves the product structure. The claims about (Ri, Ti) follow since they are slab functionals and 1 ≤ T0 ≤ R0. The same first-cut factorization under the original law gives a P⋆ forward pair independent of I0, proving the final assertion. □

Theorem 3.8 (Concentration of distance). Let

E⋆T0

ν :=

. (24)

E⋆R0 Then 0 < ν ≤ 1, and

(

)

√

lim

sup

P

max

|dist(ρ, Xt) − ν t| > λ

n = 0 (25)

λ→∞

n≥1

0≤t≤n

Proof. Theorem 3.7 gives 1 ≤ T0 ≤ R0, and hence 0 < ν ≤ 1. Under the original law, the variables Ti − νRi, i ≥ 1, are independent and centered with finite variance. If rj ≤ t < rj+1, then

∑

|Xt| − νt = (|Xr1 | − νr1) +j−1

(Ti − νRi) + (|Xt| − |Xrj | − ν(t − rj )).

i=1

The initial term is at most 2r1 in absolute value, and the last is at most 2Rj . Since rj ≥ j, this gives, also for t < r1,

∣

∣

∣ ∑

∣

∣|Xt| − νt

∣ ≤ 2r1 + max

∣

∣

max

∣k

(Ti − νRi)

∣ + 2 max

Ri.

t≤n

k≤n

1≤i≤n

i=1

Kolmogorov’s maximal inequality and the exponential regeneration tails imply, for λ ≥ 5,

(

)

∣

∣

√

C

P

max

∣|Xt| − νt

∣ > λ

n

≤ Ce−cλ√n +

\+ Cne−cλ√n.

t≤n

λ2 The right-hand side tends to zero uniformly in n ≥ 1 as λ → ∞. □

Corollary 3.9 (Logarithmic-time distance control). For every c > 0,

∣

∣ √

max

∣|Xt| − νt

∣ = OP(

log n).

t≤⌊c log n⌋

Moreover, for every q > 0, there is C < ∞ such that

(

)

P

max

distT (Xt, ξ) > C log log n

≤ (log n)−q (26)

t≤⌊c log n⌋

for all sufficiently large n.

Proof. The first assertion is (25). Every regeneration vertex lies on ξ. Thus the distance from the ray is at most r1 before the first regeneration, and at most Ri during the i-th later interval. The exponential tails and a union bound over at most ⌊c log n⌋ + 1 intervals prove (26). □

3.4. Concentration of entropy. We first work under P⋆, and define

∑

Qi := W|vi+1| − W|vi|, |vj | =j−1

Ti.

i=0

By Theorem 3.7 and the invariance of (15) under nonreturn conditioning,

Qi = Q0 ◦ Θi, Ti = T0 ◦ Θi.

Thus (Qi, Ti)i≥0 is stationary. The variables Qi need not be independent, since their harmonic weights depend on the tree beyond the next regeneration vertex. We control this dependence by computing escape probabilities in finite descendant trees.

For a child y of x, let h(ℓ)x (y) be the probability, starting from y, of reaching descendant level ℓ below y before hitting x. In particular, h(0)x (y) = 1. Define

h(ℓ)x (y)

θ(ℓ)x (y) :=

∑z:z−=x

. (27)

h(ℓ)x (z) For any vertex v, let W (ℓ)(v) be the sum of − log θ(ℓ)x (y) over the edges on the path from the current root to v, and put W (ℓ)

k

= W (ℓ)(ξk). Since each kernel sums to one,

∑

e−W (ℓ)(v) = 1, k ≥ 0. (28)

|v|=k

Lemma 3.10 (Finite-depth approximation). For every descendant edge and every ℓ ≥ 0,

| log θ(ℓ)x (y) − log θx(y)| ≤ 2ϱℓ. (29)

Consequently,

|Wk − W (ℓ)

k

| ≤ 2kϱℓ, |Qi − Q(ℓ)i | ≤ 2ϱℓTi, (30)

where Q(ℓ)i = W (ℓ)

|vi+1|

− W (ℓ)

|vi|

.

Proof. By the strong Markov property at descendant level ℓ and (14),

0 ≤ h(ℓ)x (y) − hx(y) ≤ ϱℓ+1.

Since hx(y) ≥ pesc = 1/3,

h(ℓ)x (y)

1 ≤

≤ 1 + 2ϱℓ.

hx(y) The ratio of the corresponding sums over the children of x satisfies the same bounds. Taking logarithms in (27) proves (29). Summing over the relevant paths proves (30). □

The half-open slabs of Theorem 3.7 include their complete side fringes. Thus

Q(ℓ)i ∈ σ(Ci, . . . , Ci+ℓ).

Indeed, only the terminal ray can leave a slab, and each regeneration crossing advances at least one level. The boundary vertices in the finite escape problem are absorbing, so their offspring need not be included. In particular, (Q(ℓ)i )i≥0 is ℓ-dependent.

Lemma 3.11 (Second moment of harmonic block weights). One has E⋆Q2

0

< ∞.

Proof. At the first visit to a vertex v, conditional on its age Av = s and type, its degree is at most m + 1 + Nv, where Nv, given Γv, is Poisson with mean Λv = Γv(s−(1−χ) − 1). The Poisson moment formula, the logarithmic moments of the Gamma laws, and

log(1 + Nv) ≤ log(1 + Λv) + log(1 + Nv/(1 + Λv)), 1 + Λv ≤ (1 + Γv)s−(1−χ) give

E[log4(deg(v) ∨ 2) | Av = s, typ(v)] ≤ C(1 + | log s|4). (31)

Consider first the walk under PμR , stopped at its artificial parent. By time n, at most n + 1 vertices have been visited, exposing at most m(n + 1) left-child age ratios. Their negative logarithms can be padded to a collection of m(n + 1) independent Exp(χ) variables. Right edges increase age, so the negative logarithm of every visited age is bounded by their sum plus log 2. At a first visit, the mark and offspring of the visited vertex have not been exposed. Applying (31) at these successive visits, and then (20), yields

[

]

E⋆

max

log4(deg(Xj ) ∨ 2)

≤ C(1 + n)5. (32)

0≤j≤n

The artificial parent is omitted from the maximum under the stopped law; it is never visited under P⋆.

Every parent of a ray edge contributing to Q0 is visited by time R0. By (16),

(

)

Q0 ≤ R0

max

log(deg(Xj ) ∨ 2) + log 3

.

j≤R0

Cauchy–Schwarz, (32), and the exponential tail of R0 therefore give

∑

E⋆Q2

0

≤ C

n2(1 + n)5/2P⋆(R0 = n)1/2 < ∞.

n≥1

□

Define the entropy rate per ray level by

E⋆Q0

d :=

∈ (0, ∞). (33)

E⋆T0 Finiteness follows from Lemma 3.11 and the exponential tail of T0. For positivity, the terminal edge b1 → v1 of the first block is a candidate edge. Besides the right child v1, the vertex b1 has a left child w. Hence

hb1 (v1)

1 3

θb1 (v1) ≤

≤

= .

hb1 (v1) + hb1 (w)

1 + pesc

4 Thus Q0 ≥ log(4/3), which proves positivity.

Proposition 3.12 (Variance of harmonic block sums). There are C, c > 0 such that

| Cov⋆(Q0, Qj )| ≤ Ce−cj , j ≥ 1.

In particular,





∑

Var⋆

j−1

Qi  ≤ Cj. (34)

i=0

Proof. Since T0 ≤ R0 and Proposition 3.6 gives T0 ∈ L2(P⋆), (30) gives ∥Qi − Q(ℓ)i ∥2 ≤ Cϱℓ, uniformly in i. For every j ≥ 1, Q(j−1)

depends only on C0, . . . , Cj−1, whereas Qj is measurable with respect to σ(Cj , Cj+1, . . .).

The latter follows by letting ℓ → ∞ in the finite-depth approximations Q(ℓ)j . The product structure of the slabs

| therefore makes Q0 | and Qj independent. By stationarity and Lemma 3.11, |  |
| --- | --- | --- |
|  | (j−1) (j−1) | j−1 |

0

0

Summing the covariances proves (34). □

Theorem 3.13 (Concentration of entropy). Under the original annealed law,

(

√

)

lim

sup

P

|Wk − dk| > λ

k = 0. (35)

λ→∞

k≥1

The same assertion holds under P⋆, with depth measured from its root.

Proof. Work first under P⋆. The regeneration depths and their harmonic weights satisfy

E⋆|vj | = j E⋆T0, E⋆W|vj | = dj E⋆T0, Var⋆(|vj |) + Var⋆(W|vj |) ≤ Cj.

Here the first variance bound uses the independent increments Ti, and the second is (34). For λ ≥ 1, choose the deterministic indices

√

√

j− := max{0, ⌊k/E⋆T0 − λ

k⌋}, j+ := ⌈k/E⋆T0 + λ

k⌉.

Chebyshev’s inequality gives P⋆(|vj− | > k or |vj+ | < k) ≤ C/λ. It also bounds the probability that either

√

√ |W|vj± | − dj±E⋆T0| > λ

k by C/λ. These bounds are uniform in k ≥ 1, since j± ≤ C(k + λ

k); terms with j− = 0 vanish. On the complementary event, monotonicity gives

√

W|vj− | ≤ Wk ≤ W|vj+ |, |Wk − dk| ≤ C(λ + 1)

k.

Letting λ → ∞ proves the assertion under P⋆.

Under the original law, put L = |v1| and let̂ W denote harmonic information measured from v1. Theorem 3.7 and the invariance of (15) under nonreturn conditioning imply that̂ W has the P⋆-law, is independent of L, and satisfies Wk = WL +̂ Wk−L when k ≥ L. Monotonicity also covers k < L, giving

|Wk − dk| ≤ WL + dL + 1{L≤k}|̂ Wk−L − d(k − L)|.

√ Thus the left-hand probability in (35), with threshold 2λ

k, is at most

√

P(WL + dL > λ) + sup

P⋆(|Ws − ds| > λ

s).

s≥1

The first term tends to zero because r1 < ∞ almost surely and the tree is locally finite. The second tends to

| zero by the post-regeneration assertion. |  |  | □ |
| --- | --- | --- | --- |
|  | (ℓ) | −2 |  |

k

√ kn = d−1 log n + O(

log n),

√

√

W (ℓ)

kn

= dkn + OP(

log n), e−Wkn = n−1 exp{OP(

log n)}.

The rate d is per ray level. For the ray vertex ξ|Xt|, distance concentration and monotonicity give W|Xt| =

√

√ νdt + OP(

t). Indeed, on {||Xt| − νt| ≤ K

√

√

t}, sandwich this weight between those at the deterministic levels max{0, ⌊νt − K

t⌋} and ⌈νt + K

t⌉, and apply (35) before letting K → ∞.

3.5. Regularity and truncation. Throughout this subsection, fix c > (νd)−1 and put tn := ⌊c log n⌋ and hn := ⌈chℓn⌉, where ℓn = log log n and the constant ch > 0 is chosen in Proposition 3.15. Write B+r (v) for the radius-r ball in the descendant tree Tv. The following consequence of Lemma 2.5 controls the full neighborhood of the walk.

Proposition 3.14 (Regularity of the walk neighborhood). Fix A, C, ζ, q > 0. Let X start at the root of a PPT with prescribed age s ∈ [e−Aℓ2n , 1], mark 0 < g ≤ Cℓ2n, and type, allowing the ordinary root. Write P for its annealed law; if an entrance parent is attached, condition never to hit it and omit it from all balls. Put

⋃

Wn :=

B2hn (Xt).

0≤t≤tn

There are constants Cg ≥ C and CV < ∞ such that, uniformly over these root data, for all sufficiently large n, with probability at least 1 − (log n)−q,

min

Av ≥ se−ζℓ2n , max

Γv ≤ Cgℓ2n, |Wn| ≤ eCV ℓ2n .

v∈Wn

v∈Wn

Proof. Start the trials at first visits after the first step. The proof of Proposition 3.6 gives a uniform exponential tail for r1, also under nonreturn conditioning, whose density is at most p−1

esc

. The forward tree and shifted walk at each subsequent regeneration time have law P⋆. Thus, for M = Cqℓn with Cq sufficiently large,

(

)

P

r1 ∨ max

Ri > M

≤ 1

2

(log n)−q.

1≤i≤tn

On the complementary event, each B2hn (Xt), t ≤ tn, is contained in a forward ball of radius 4hn + M about ρ or a regeneration vertex. Indeed, choose the latest already reached regeneration vertex vj with |vj | ≤ |Xt| − 2hn. It is an ancestor of Xt, and dist(vj , Xt) ≤ 2hn + M : either it is the current regeneration vertex, or the next regeneration depth exceeds |Xt| − 2hn, with gap at most M . Also dist(vj , Xt) ≥ 2hn, so B2hn (Xt) ⊆ Tvj . If no such vertex exists, |Xt| ≤ 2hn + r1 ≤ 2hn + M , and the ball is covered from ρ. Therefore

⋃

Wn ⊆ B4hn+M (ρ) ∪tn

B+

4hn+M

(vi).

i=1

Apply Lemma 2.5 to the initial ball with relative age cutoff se−ζℓ2n . Its proof applies to a prescribed root type and mark: the first-generation bound gains only a factor C′(1 + g), absorbed by the slack in the exponential estimates. The root itself satisfies the mark bound since Cg ≥ C. Each descendant tree Tvi has the tree marginal of P⋆, with density at most p−1

esc

relative to the tree marginal of PμR , and root age in (1/2, 1). Apply

| the same lemma there with ζ/2; for large n, its age bound is at least 2e | ≥ se | . After increasing Cg, CV , |
| --- | --- | --- |
|  |  | −cregℓ2n −q |

| Their total volume is still at most e | . | These marginal estimates are used without conditioning on the |
| --- | --- | --- |
| regeneration-length event. |  | □ |

We now specify the truncation used in Section 4.2. Choose CA > A and apply Proposition 3.14 with

| ζ = CA −A, so that se | ≥ e | . With the corresponding mark and volume constants, set |
| --- | --- | --- |
|  | −C ℓ2 | 2 C ℓ2 1√ |

2

log n. (36)

For a vertex v, let v[hn] be its ancestor hn edges above it, or the root if |v| < hn. Construct the subtree in a fixed breadth-first order, starting with the root in the queue. For each vertex v taken from the queue, add its children to the queue if

Av ≥ an, Γv ≤ gn, W (hn)(v[hn]) ≤ ωn, |B+hn (v[hn])| ≤ Vn. (37)

If any of these conditions fails, declare v truncated and retain it as a boundary leaf. Denote by ˜T the resulting rooted subtree. All quantities refer to the full PPT; the finite-depth tests can be evaluated by completing the tree through the current level (and through level hn for the initial ball). At depths at least hn, the weight test uses no offspring of v. The age and mark bounds also imply ∥ρv∥∞ ≤ (1 − χ)gn/an, so a separate intensity cutoff is unnecessary. Write Btr(v) for the event that v fails one of the tests in (37).

By (28), at most ne−√log n/2 vertices v of a given level satisfy W (hn)(v) ≤ ωn. Each untruncated vertex of ˜T at level k ≥ hn descends from such a vertex at level k − hn, and at most Vn of these descendants have the same ancestor. The initial levels are bounded by the root-ball test. Thus the number of untruncated vertices through depth tn is at most

√

(tn + 1)eωn Vn = n exp{− 1

2

log n + O((log log n)2)}, tn = O(log n). (38)

This bound excludes truncated boundary vertices; additional PA labels are counted separately in the finite-graph comparison.

Proposition 3.15 (No truncation before the target time). Fix A, C > 0 and use any prescribed-root law of

| Proposition 3.14, with age s ≥ e ⌊ | √ | and mark g ≤ Cℓn. Let ⌋ ⌊ | √ | ⌋ | ⌊ |  | ⌋ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| logn−2γ ℓ0 = d |  | logn logn−γ , ℓ1 = | logn d | , | t0 = | ℓ0 +ℓ1 2ν | . |

The constants ch, CA, Cg, CV , with CA > A and Cg ≥ C, can be chosen so that there is a function η(γ), tending to zero as γ → ∞, for which, for every fixed γ > 0, uniformly over the root data,





⋃

P



Btr(Xt)

 ≤ η(γ) + o(1).

0≤t≤t0

Moreover, for τ := inf{t : |Xt| = ℓ1},





⋃

P

{τ > ⌈t⋆

⌉} ∪

Btr(Xt)  ≤ η(γ) + o(1). (39)

n

0≤t≤τ

Here o(1) is taken as n → ∞ with γ fixed.

Proof. The argument of Lemma 3.11, with initial age s and mark g, gives

EW 2|v1| ≤ C′(1 + | log s| + log(1 + g))2.

√ The initial harmonic information is therefore OP(ℓ2n) = oP(

log n), uniformly. Since r1 has a uniform exponential tail and the forward law after the first regeneration is P⋆, the distance and entropy estimates used below hold uniformly at times and depths of order log n.

For each fixed γ, one has t0 ≤ tn for all sufficiently large n. Choose ch sufficiently large that (26), with q = 1, gives

(

)

P

max

dist(Xt, ξ) > hn

= o(1)

t≤tn

and (log n)ϱhn = o(1). Apply Proposition 3.14 with q = 1 and ζ = CA − A. Its bounds hold on Wn with probability 1 − o(1), and every age there is at least an.

By (25), there is η1(γ) → 0 such that

(

)

P

max

|Xt| > ℓ1

≤ η1(γ) + o(1).

t≤t0

Indeed,

ℓ1 − ℓ0

γ

√

ℓ1 − νt0 ≥

≥ log n − 1.

2

2d

Suppose the preceding regularity, proximity, and height events hold. For t ≤ t0, set v = Xt and u = v[hn]. Then B+hn (u) ⊆ B2hn (v), so v passes the age, mark, and ball tests. Moreover, dist(v, ξ) ≤ hn implies that u ∈ ξ. Since |u| ≤ ℓ1, monotonicity and Lemma 3.10 give

W (hn)(u) ≤ W (hn)

ℓ1

≤ Wℓ1 + 2ℓ1ϱhn = Wℓ1 + o(1).

Consequently,





⋃

(

√ )

P



Btr(Xt)

 ≤ η1(γ) + o(1) + P

W (hn)

\> log n − 1

log n

ℓ1

2

0≤t≤t0

(

( ) √

)

≤ η1(γ) + o(1) + P

Wℓ1 − dℓ1 >

γ − 1

2

log n − o(1)

.

Since ℓ1 ∼ d−1 log n, Theorem 3.13 bounds the last probability by η2(γ) + o(1), where η2(γ) → 0.

For the stopped-time bound, distance concentration gives

P(τ > ⌈t⋆

n

⌉) ≤ P(|X⌈t⋆

| < ℓ1) ≤ η3(γ) + o(1),

n⌉

√ where η3(γ) → 0, since ν⌈t⋆

n

⌉−ℓ1 = γ

log n/d+O(1). On {τ ≤ ⌈t⋆

n

⌉}, the regularity and proximity events apply through τ , as ⌈t⋆

n

⌉ ≤ tn. Since |Xt| ≤ ℓ1 for t ≤ τ , the same comparison with W (hn)

ℓ1

bounds the probability of a truncation on this event by η2(γ) + o(1). Taking η = η1 + η2 + η3 proves both bounds. □

For the ordinary PPT, Aρ is uniform on (0, 1), so P(Aρ < e−Aℓ2n ) = e−Aℓ2n ; the Gamma tail also gives P(Γρ > Cℓ2n) = o(1). Averaging over the remaining root data yields the same no-truncation bound. With an entrance parent, conditioning on reaching depth R before returning, in place of never returning, adds at most ϱR+1 to the error by (14).

## 4. Coupling preferential attachment to the Pólya–point tree

We couple an adaptive sequence of radius-O(log log n) PA explorations to PPT explorations, retaining the information revealed by every trial. We then construct coupled regions that the SRW does not leave until of order mixing time.

Throughout this section, m ≥ 2 and α ∈ [0, 1) are fixed. The symbols v, w denote PPT vertices, Av their ages, Γv their marks, and Kv ∈ [n] their matched PA birth labels.

4.1. Adaptive breadth-first coupling. Put ℓn = log log n and set

rn = ⌈crℓn⌉, bn = e−c0ℓ2n , k◦n = ⌈ne−c1ℓ2n ⌉,

(40)

Bn = ⌈eCB ℓ2n ⌉, Mn = ⌊ne−cM√log n⌋, ¯gn = CG log n.

Each trial starts at a root of age at least bn and adds at most Bn PA labels to the exploration, within a total budget Mn. All matched labels and targets queried during the trials are at least k◦n; the initial record may contain complete stars at smaller labels. The cap gn from (36) controls new PPT marks, while ¯gn bounds jψj at labels j ≥ k◦n whose marks have been exposed.

Fix cr, c0, cM , Ctest > 0, where eCtestℓ2n is the allowed number of local coupling trials. Choose ζ > 0 sufficiently large and then take

c1 > c0 + ζ, CB > (1 − χ)c0 + ζ. (41)

We choose CB first and allow c1 and Cg to be increased below. With the constant Cg in (36) sufficiently large, Lemma 2.5 gives the following bound. A radius-(rn + 1) PPT ball with prescribed root age A ≥ bn has at most Bn/2 vertices, all with ages at least Ae−ζℓ2n > 8k◦n/n and marks at most gn, except with probability Ce−(Ctest+2)ℓ2n . Increasing ζ in the age and volume estimates, and then Cg in the mark estimate, gives the exponent Ctest + 2. The same bound holds for a forward ball with prescribed root type and mark at most gn: the first-generation factor C(1 + gn) is absorbed by the slack in (41).

Set εn = n−1/3, and let εBG

n

be as in (4).

The adaptive exploration. The first coupling trial may start from a nonempty record of earlier PA exploration. Let A record all information revealed so far about the PA graph and its urn marks. Keep this information even when a comparison fails. Let H also contain the revealed PPT data and auxiliary choices. To register a PA vertex is to add its birth label to E; put t = |E|. Register each root and both endpoints of every revealed PA edge. Learning that a slot does not attach to a given target does not by itself register its sender. Once registered, a label remains in E, including after failed comparisons.

A registered vertex is explored once its complete star, consisting of all incident edges with their slot identities and multiplicities, is recorded in A. This depends only on the PA record and does not require a successful PPT comparison. Before its complete star is recorded, a vertex may already have recorded incidences or an exposed mark. The set E includes all registered labels, whether or not their complete stars have been recorded.

While constructing this initial record, we may learn whether a vertex’s degree exceeds a given threshold before recording its complete star. Auxiliary choices use independent randomness. Let E0 consist of the labels below k◦n that were queried as targets before the first coupling trial, and put

φℓ

∏

ϑℓ =

= ψℓ

(1 − ψh), ℓ ∈ E0.

Sk◦n−1

ℓ\<h\<k◦n

These quantities involve only urn variables below k◦n.

A record H of this exploration is admissible if it satisfies the following conditions: (i) Every target queried before the first coupling trial and every vertex whose degree was tested has its complete star recorded. Thus all earlier degree-test answers are determined by A. The values ϑℓ, ℓ ∈ E0, are exposed and satisfy

∑

t¯gn

ϑℓ ≤ .

k◦n

ℓ∈E0

Once the trials begin, no target below k◦n is queried. Low endpoints first disclosed thereafter are registered,

but their complete stars are not recorded and their marks remain unexposed.

(ii) Every queried target j ≥ k◦n has its actual mark Zj exposed. Every exposed high-label mark satisfies

jψj ≤ ¯gn.

(iii) The retained matching is injective, preserves types and PA slots, and has PA labels at least k◦n. Every

retained pair, including boundary pairs, satisfies

8k◦n

Av ≥

, ZKv = Γv ≤ gn, ZKv ∈ GBG

Kv

(εBG

n

).

n Admissibility is determined by the revealed record. The root and label-budget hypotheses are imposed separately in the lemmas below. Since E0 stays fixed and t can only increase, its aggregate bound persists throughout the coupling trials.

During trials, expose Zj before querying a target j ≥ k◦n. Complete any mark coupling before checking jψj ≤ ¯gn. In each star, compare all left positions, then all right positions, and finally all new child marks. Do not query a new child as a target or interleave another star before completing these comparisons. Stop a trial at its first failed comparison or regularity check, or before exceeding its label budget.

Write ∆v = |Kv/(nAv) − 1| for the label discrepancy, and set

 

1, χ > 1/2,

Λn = gn(8k◦n/n)−(1−χ), Hn =

(42)



1 + log(n/k◦n), χ = 1/2.

The effect of the accumulated PA record is controlled by

(t + 1)¯gn

nt¯gn

ηn(t) =

\+ .

k◦n

(k◦n)2 Uniformly for t ≤ Mn, one has ηn(t) = o(1).

Lemma 4.1 (Adaptive BFS coupling). Fix C0 < ∞. From an admissible record H with |E| ≤ Mn − Bn, choose a matched root v0 whose complete PA star has not yet been recorded, before revealing its remaining offspring. Its only recorded PA incidence is its entrance, or none for an initial root. Assume that its coupled mark is good, its prescribed PPT type is consistent with the entrance, and

√

Av0 ≥ bn, ∆v0 ≤ C0

ηn(Mn).

There is a coupling to the forward radius-rn PPT exploration with the prescribed conditional PA and PPT laws, adding at most Bn labels. Uniformly over these records, including after earlier failed comparisons, its conditional probability of success is at least 1 − e−(Ctest+1)ℓ2n for all sufficiently large n. On success:

(1) The extended record is admissible. The matching is injective, preserves types and slots, and matches every edge incident to a vertex at depth less than rn.

(2) Every vertex w in the extension satisfies Aw ≥ Av0 e−ζℓ2n > 8k◦n/n and Kw ≥ k◦n.

(3) Every newly matched vertex, including boundary vertices, satisfies ZKw = Γw ≤ gn and ZKw ∈ GBG

Kw

(εBG

n

). (4) The label discrepancy satisfies

max

∆w ≤ ∆v0 + Crnηn(Mn). (43)

w

All PA data revealed during a failed trial remain in the record.

Proof. We follow the breadth-first exploration of [6, Lemma 3.5 and Proposition 3.6]. Explore vertices of depth less than rn under the preceding comparison and stopping rules. Retain all generated PPT data. Defer completion of any reference subtree that may be used in a later comparison until the adaptive sequence ends.

Each PA answer is sampled conditional on A and retained. Each PPT comparison uses only the preceding record, these answers, and independent auxiliary randomness. Hence, also after failed comparisons,

L(unrevealed PA variables | H) = L(unrevealed PA variables | A).

For the one-trial estimates, write v0 for the current root and M for the bound on |E| during this trial.

∏k◦n≤h\<k

The accumulated PA information. The estimates below use the current value t = |E| and include the initial record and all earlier trials. For ℓ < k◦n ≤ k, pk→ℓ = ϑℓ

(1 − ψh). For each slot whose endpoint has not been revealed, let F be the set of target labels excluded by previous queries of that slot. Hence, for every urn compatible with an admissible record and every sender k ≥ k◦n,

∑

∑

∑

2t¯gn

pk→ℓ ≤

ψℓ +

ϑℓ ≤

= o(1). (44)

k◦n

ℓ∈F

ℓ∈F

ℓ∈E0

ℓ≥k◦n

∑j

Fix an unexposed coordinate x = ψj , j ≥ k◦n, and condition on all other urn variables. Recall that the prior law of ψj is Beta(a, dj ), where dj = (2j − 3)m + 2mu(j − 1). Among slots with revealed endpoints, let sj count those ending at j, and let Nj count those with target label ℓ and sender label k satisfying ℓ < j < k. Every slot with a revealed endpoint has its sender in E, so

sj ≤ mt and Nj ≤ mt; endpoints below k◦n are included in these counts.

For each slot e with sender k > j whose endpoint has not been revealed, write Fe for its excluded target set. Since every queried high target has its mark exposed, j /∈ Fe. Define

∑

∏

αe :=

ψℓ (1 − ψh),

ℓ∈Fe

ℓ\<h\<k

j<ℓ\<k

∑

∏

βe :=

ψℓ

(1 − ψh).

ℓ∈Fe

ℓ\<h\<k

ℓ\<j

h̸=j

These coefficients do not depend on x: αe is the excluded mass above j, and (1 − x)βe is the excluded mass

below j. The avoidance probability factors as

βe

1 − αe − (1 − x)βe = (1 − αe − βe)(1 + bex), be :=

.

1 − αe − βe

The values ϑℓ do not depend on x, and removing the factor 1 − x from either a low- or high-target probability

still leaves αe + βe ≤ 2t¯gn/k◦n. Hence be ≤ Ct¯gn/k◦n. Slots with sender at most j contribute factors independent

of x; products and sums over e below range over slots with sender greater than j whose endpoints have not

been revealed. The likelihood of the PA record gives

hj (x)

∏

L(ψj | A, (ψi)i̸=j )(dx) =

Q(dx), Q = Beta(a + sj , dj ), hj (x) = (1 − x)Nj

(1 + bex).

EQhj (X)

e

∑e

There are at most mn such factors. Put λj =

be and L = t + nt¯gn/k◦n; then Nj + λj ≤ CL and L/k◦n = o(1).

Likelihood-ratio comparison bounds this posterior stochastically between Beta(a + sj , dj + Nj ) and Beta(a +

sj , dj − λj ). For the upper bound, the logarithmic derivative of the density ratio is

Nj + λj

∑

be

−

\+

≤ 0;

1 − x

e

1 + bex

∏e

the lower bound follows because

(1+bex) is increasing. The beta moment formula therefore gives, for r = 1, 2,

∣

∣ (

)

∣

E[(1 − ψj )r | A, (ψi)i̸=j ]

∣

sj (1 + sj )L

∣

∣

∣

log

∣

≤ C +

,

∣

(dj )r/(cj )r

∣

j j2

where (x)r is the rising factorial. For an exposed coordinate, the corresponding logarithmic error is at most

∑j

∑j≥k◦n

C ¯gn/j. Summing over coordinates gives O(ηn(t)), since

sj ≤ mt and

j−2 ≤ C/k◦n. Successive

conditional expectations consequently yield



∣



∏

∣

∏

∣

(dj )rj

E



(1 − ψj )rj

∣

A

 =

exp{O(ηn(t))}, rj ∈ {1, 2},

∣

(cj )rj

j

∣

j

∏u\<h\<v

for any subset of coordinates above k◦n, without conditional independence. In particular, for Tu,v =

(1 −

ψh) and k◦n ≤ u < v ≤ n,

[ (

)2 ∣

]

∣

Tu,v

∣

E[Tu,v | A] = (u/v)χ(1 + O(ηn(t))), E

− 1

∣

A ≤ Cηn(t). (45)

(u/v)χ

∣

Here the unconditioned first moment is (u/v)χ(1 + O(u−1)), and the ratio of its second moment to the square

of its first is 1 + O(u−1).

Left children. At the current pair (k, v), suppose ∆v ≤ 1/4. Consider a remaining left slot (k, i) with

endpoint J := Jk,i and excluded target set F . Before revealing J, put FA(j) = P(J ≤ j | A). For k◦n ≤ j < k,

conditional on the urn,

Sj

1 − aj

∑

∑

P(J ≤ j | ψ, A) =

, aj =

pj+1→ℓ, qF =

pk→ℓ.

Sk−1

1 − qF

ℓ∈F, ℓ≤j

ℓ∈F

Both excluded masses are bounded by (44). Integrating over the urn and using (45) gives the uniform relative

estimate

FA(j) = (j/k)χ(1 + O(ηn(t))).

Reveal and retain the actual endpoint J, then draw

V | H, J ∼ Unif[FA(J − 1), FA(J)), Aw = AvV 1/χ.

The interval lengths are exactly the conditional endpoint probabilities, so V is uniform given the preceding H.

This kernel uses no hidden urn information beyond the retained J. Register each new endpoint immediately

and repeat for every remaining left slot, omitting the entrance slot for a type-TR vertex.

On the reference age requirement, y = kV 1/χ ≥ 6k◦n. The CDF estimate at 2k◦n forces J > 2k◦n; applying it

at J − 1 and J gives (J − 1)(1 − Cηn(t)) ≤ y ≤ J(1 + Cηn(t)). Consequently

∣

∣

∣

J

∣

∣

− 1

∣

∣

∣ ≤ Cηn(t), ∆w ≤ ∆v + Cηn(t). (46)

kV 1/χ

This position comparison holds for every realization of the urn. An endpoint whose label was in E before

its disclosure causes failure. Its high-label probability is at most Ct¯gn/k◦n: exposed coordinates satisfy their

∑j

caps, while unexposed coordinates have posterior means at most C(1 + sj )/j and

sj ≤ mt. A low endpoint

requires failure of the reference age requirement.

Right children. Let Di = [(i − 1)/n, i/n) and put

∫

∑

(

)

λi =

ρv(s) ds,

λi = Γv

A−(1−χ) v

− 1 ≤ Λn.

Di∩[Av ,1]

i

Condition on the current record H, fixing the parent data. The current mark is coupled and good. Since

pi→k = ψkTk,i, (45), the beta–Gamma estimate, and Cauchy–Schwarz give

∑

∑

(

√

)

1

E[|mpi→k − λi| | H] +

λi ≤ CΛn

∆v + εBG

n

\+ ηn(t) +

. (47)

k◦n

i>k

i≤k

The Riemann-sum error is at most Cgn/k◦n; replacing k/n by Av in the intensity costs CΛn∆v, including the

interval between the two ages.

For a slot with sender i > k whose endpoint has not been revealed, let F be its excluded target set and

suppose k /∈ F . Conditional on the urn and A, the probability that it attaches to k is ˜p = pi→k/(1 − q), where

∑ℓ∈F

q =

pi→ℓ < 1/2 by (44). The mixed product moments above give

E[pi→kpi→ℓ | A] ≤ Cgn ¯gnkχ−1ℓχ−1i−2χ, ℓ ∈ F, ℓ ≥ k◦n.

For the low targets, the same moments give



∣







∑

∑

∣

∑

∑

∣

Ctgn ¯gnHn

E

pi→k

pi→ℓ

∣

A

 ≤ Cgn



ϑℓ

 kχ−1(k◦n)χ

i−2χ ≤

.

| i>k | ℓ∈E0 | ∣ ∣ | ℓ∈E0 | i>k | k◦ n |
| --- | --- | --- | --- | --- | --- |
|  | Consequently the total correction from exclusions is at most |  |  |  |  |
|  |  | ∑∑m |  | Ctgng¯nHn |  |

E[|˜pi,j − pi→k| | A] ≤

. (48)

k◦n

i>k

j=1

Here and below only slots with unrevealed endpoints and k /∈ F enter these sums. For χ > 1/2, the sum of

i−2χ above max{k, ℓ} is at most C max{k, ℓ}1−2χ; for χ = 1/2, it contributes Hn. The same calculation bounds

∑i

the conditional expected sum of squared attachment probabilities, together with

λ2i , by Cg2nHn/k◦n. Edges

to k from senders with labels in E, apart from the entrance, and reference points in cells indexed by E cost at

most Ctgn/k◦n.

Scan the cells in increasing order. In each cell, retain the indicators that eligible PA slots attach to k,

and couple their sum to a Poisson(λi) count, updating exclusions and registering their senders whenever an

attachment is found. Declare failure if the counts differ or exceed one, if an edge to k other than the entrance

has sender in E, or if a reference point has i ≤ k or i ∈ E; membership in E is tested before the query.

Average the urn-conditional coupling of the indicators and reference count over the current urn posterior,

then sample the reference count conditional on the retained indicators using independent auxiliary randomness.

This preserves the posterior identity and the prescribed Poisson law given the preceding full record. Le Cam’s bound and the preceding estimates bound the count and collision errors throughout the block by

[

(

√

)

]

1 M gn ¯gnHn

C

Λn

∆v + εBG

n

\+

ηn(M ) +

\+

. (49)

k◦n

k◦n

√

The estimates hold at each intervening record with t ≤ M . Indeed, the conditional error in replacing mpi→k by (1 − χ)Γvkχ−1i−χ is at most CΓvkχ−1i−χ(εBG

n

\+

∑ℓ∈F, ℓ≥k◦n

ηn(M ) + 1/k◦n). These deterministic intensity envelopes sum to at most CΛn. For exclusions, one may bound

ℓχ−1 ≤ M (k◦n)χ−1 and use the fixed low-target cap before summing over i; labels newly added to E belong to cells already scanned. Thus the same bound applies as the record grows.

For each reference point, draw its age in Di ∩ [Av, 1] with density ρv/λi, still without exposing child marks. In a cell with exactly one PA slot attaching to k and one reference point, set Kw = i and retain that slot as the entrance. The reference positions have exactly the prescribed Poisson-process law, and matched pairs satisfy

1 C

∆w ≤

≤ . (50)

nAw

k◦n

After successful position comparisons, all outgoing slots of k have revealed endpoints, and every slot with a younger sender either has a revealed endpoint or has been tested for attachment to k. Thus the complete incident-edge multiset at k is matched. The vertex k is now explored, while the complete stars of its newly registered children have not yet been recorded.

New marks. Condition on the completed left and right geometry and all retained PA answers of the star. On a successful position comparison, a newly registered child with label j has sj = 1 if it is a left child and sj = 0 if it is a right child. Write ι for this value; an initial root without a recorded incidence also has ι = 0. For Q = Beta(a + ι, dj ),

EQ|hj (X) − 1| ≤ Nj EQX + EQ(eλj X − 1) ≤ CL/j, EQhj (X) ≥ 1 − CL/j. Here the beta moments give EQeλj X ≤ (1 − λj /(a + ι + dj ))−(a+ι). Thus the posterior is within CL/j of Q in total variation. Under f −1

j

, Q becomes μa when ι = 0; when ι = 1, its density relative to μa is cj fj (z)/a, whereas that of μa+1 is z/a. Equation (6) bounds this additional error by C/j. These bounds are uniform in the other urn variables and hence remain valid after integrating them out.

Before exposing each Zj , let H− be the full record, including the completed positions and all earlier mark comparisons. Maximally couple L(Zj | H−) to μa+ι. Implement this coupling by revealing and retaining the actual Zj , then drawing Γw from its conditional coupling kernel using independent auxiliary randomness. Thus L(Γw | H−) = μa+ι. Successive reference marks therefore have the prescribed product law conditional on the positions. After failure, keep generated values and apply these same target laws to remaining marks under the completion convention above. For G = GBG

j

(εBG

n

), μa+1(Gc ∩ (0, gn]) ≤ (gn/a)εBG

n

, so

[

]

((

)

∣ )

t + 1 nt¯gn

P

{Zj̸ = Γw} ∪ {Zj /∈ G}

∩ {Γw ≤ gn}

∣ H− ≤ C

gnεBG

\+ +

. (51)

n

k◦n

(k◦n)2 On mark agreement and goodness, the definition of GBG

j

gives jψj ≤ Cgn < ¯gn. Thus the new target cap costs no further exceptional event.

Errors within a trial. Every run of left edges starts at v0 or a right child. Equations (46) and (50) give maxw ∆w ≤ ∆v0 + Crnηn(M ) < 1/4, proving (43) and justifying the comparisons. Stop before a query could exceed the label budget. On matching records, an overflow is a PPT volume failure. The PPT age, mark, and volume requirements cost at most Ce−(Ctest+2)ℓ2n . There are at most mBn left slots, Bn right blocks, and Bn new marks. Summing their bounds therefore gives, for the trial failure F ,

[

(

√

)

]

M gn ¯gnHn

P(F | H) ≤ Ce−(Ctest+2)ℓ2n + CBn

Λn

∆v0 + rnηn(M ) + εBG

n

\+ ηn(M )

\+

. (52)

k◦n

For M = Mn,

√

√

cM

log n+O(ℓ2n)

ηn(Mn) = e− 1

2

, BnΛnεBG

= n−a/(2a+1)+o(1).

n

√

| Since rnηn(Mn) = o( | ηn(Mn)), the root hypothesis makes the right-hand side at most e | test | n for large |
| --- | --- | --- | --- |
| n. |  |  | □ |

Repeated applications. Apply Lemma 4.1 at at most N ≤ eCtestℓ2n adaptively chosen roots, stopping when fewer than Bn labels remain in the budget. Initiation is measurable from the preceding record Hi, which retains all earlier failures. With Fi = ∅ for an uninitiated trial,





⋃

∑

[

]

P



Fi

 ≤

E

1{i initiated}P(Fi | Hi)

≤ N e−(Ctest+1)ℓ2n ≤ e−ℓ2n = o(1). (53)

i≤N

i≤N

To initialize from an empty record, fix k0 ∈ {⌈nbn⌉, . . . , n}, set Kv0 = k0, Av0 = k0/n, and Γv0 = Zk0 . This mark has law μa and ∆v0 = 0; its tail and beta–Gamma goodness errors add o(1). Later roots retain their previously assigned data. Along at most N rn left steps,

(

) √

∆v ≤ C

εn + N rnηn(Mn)

= o(

ηn(Mn)), (54)

where the εn term also allows an initial discrepancy O(εn). Thus the root hypothesis persists throughout the sequence. No urn exceptional probability is used in these bounds.

4.2. Coupling the walks of mixing time order. Fix C0 < ∞. Let H be admissible with |E| ≤ Mn/2, and let V0, matched to a PPT root ρ, satisfy the root hypotheses of Lemma 4.1.

Let b be the parent at the entrance, and put σi = inf{t : |Xt| = rn + i} for i ≥ 0 and τb = inf{t : Xt = b}, with τb = ∞ if there is no entrance. Use ℓ0, ℓ1 from Proposition 3.15, and write τ = inf{t : |Xt| = ℓ1}. Time and depth are measured from V0 and ρ throughout; when an entrance is present, root degrees include its edge to b. Choose the constants so that hn = rn, an ≥ bn, Vn ≤ Bn, cM < 1/2, and (log n)ϱhn = o(1).

We construct a subgraph ˜Γ ⊆ Gn and an injective map Φ : ˜Γ → ˜T . First compare the radius-(rn + 1) ball by the proof of Lemma 4.1, setting ˜Γ = ∅ on failure. On success, apply the PPT truncation tests to the initial ball. Retain in ˜Γ the vertices of depth at most rn whose ancestral lines, including the vertices themselves, pass these tests. Record the initial matching in Φ′, with Φ′(Kv) = v. Queue the depth-(rn + 1) pairs whose parents are retained, in a fixed breadth-first order, retaining their ages, marks, and entrance slots.

For a queued pair (k, z), declare the pair truncated if Btr(z) occurs. Otherwise, if an additional incidence at k has already been recorded, declare the pair mismatched. Otherwise compare the remaining PA incident slots with the PPT offspring of z as in Lemma 4.1, stopping the comparison once Bn labels have been added to E in this comparison. The coupling gives a type-preserving bijection and every new pair (j, y) must satisfy Ay ≥ 8k◦n/n, Zj = Γy ≤ gn, and Zj ∈ GBG

j

(εBG

n

). On success, add k to ˜Γ, extend Φ′ by the new pairs, and queue its children; on failure, declare the pair mismatched. If an exposed value satisfies jψj > ¯gn, stop the entire construction and set ˜Γ = ∅. Do not continue PA–PPT comparisons below a truncated or mismatched pair, or compare stars at depth ℓ1 + 1. Thus complete stars are compared through depth ℓ1 along the remaining branches. For the finite-depth tests in (37), use the already generated data through the current level in active branches; complete missing data only in truncated or mismatched branches, without PA queries. No future offspring of a queued pair are thereby revealed. Once this continuation ends, its reference tree is not used for further PA comparisons and may be completed with its conditional law.

Truncated and mismatched pairs remain in Φ′, but only explored vertices whose complete stars were successfully compared enter ˜Γ. Keep the edges between these retained vertices and put Φ = Φ′|

˜Γ

. The matching is injective, the matched labels are at least k◦n, and

| deg (x) = deg (Φ(x)), Gn T | x ∈ Γ˜. |
| --- | --- |
| Defining |  |
| Πt := {Xs ∈ Φ(Γ) for all˜ s ≤ t}, |  |

we have coupling of SRW X on Gn from V0 with SRW X on the PPT from ρ until time t on Πt. Proposition 4.2. Fix γ > 0. Uniformly over the admissible histories and root data, including records of earlier failed comparisons, the construction has the prescribed conditional PA and PPT laws and satisfies



∣



⋃

∣ ∣

P (Πc

| σ0 < τb, H) ≤ P



Btr(Xs)

∣

σ0 < τb, H

 + o(1). (55)

τ

∣

s≤τ

∣

Proof. Lemma 4.1 bounds failure of the initial comparison by o(1), uniformly in H. We first check the bound on |E|. By (38), at most (tn + 1)eωn Vn stars are compared. Each comparison adds at most Bn labels to E, even on failure. Thus the number of labels added to E after the initial ball is at most

{ √

}

CBn(tn + 1)eωn Vn = n exp

− 1

2

log n + O(ℓ2n)

= o(Mn), (56)

since cM < 1/2. Thus the initial record leaves enough room for the construction. Before the first violation of jψj ≤ ¯gn, each newly exposed mark has only its entrance recorded. The posterior stochastic bound Beta(a + ι, dj − λj ), ι ∈ {0, 1}, and its exponential moments give, uniformly in the current record,

P(jψj > ¯gn | Hcurrent) ≤ Ce−c¯gn .

At most Mn marks are exposed. Increasing CG therefore bounds the probability of any such global stop by CMne−c¯gn = O(n−8).

Apart from initialization failure, a cap stop, and an entrance return, the first exit by time τ visits a truncated or mismatched vertex. We bound the latter possibility by exposing the walk as in [5], while keeping the fixed breadth-first order and coupling kernels. Before exploring a later level rn + i, i ≥ 1, reveal the walk through σi, stopping earlier at an entrance return or a previously detected defect. This path uses only complete stars at smaller depths and independent walk randomness, so it gives no further information about unqueried PA variables or unrevealed PPT offspring.

For σi ≤ τ , let ui be the ancestor of Xσi at distance rn − 1. Let Fi be the reached matched candidates in ∂B+rn−1(ui), including candidates subsequently truncated or mismatched, and let Li be the children reached when the stars of vertices in Fi are successfully compared. At σ0, take L0 to be the initially queued children of F0; their parents’ star comparisons are covered by the initialization estimate. For i ≥ 1, Fi is selected before its comparisons, and each new child is added to Li upon completion of its parent’s star comparison. Stop the analysis at a visit to a truncated vertex, a return to a previously selected uj after σj , or the first charged failure. The volume bound at Xσi gives |Fi| ≤ Vn ≤ Bn; at most Bn labels are added per star comparison, so |Li| ≤ CB2n. The truncation checks use PPT data only through the current level, so the offspring of candidates about to be compared remain unrevealed.

Unless the walk returns to ui after σi, its first visit to depth rn + i + 1 lies below ui, and ui+1 is a child of ui. Consequently Fi+1 ⊆ Li until a truncated or mismatched vertex is visited. By (14), all such ancestor returns have total probability at most (ℓ1 + 1)ϱrn−1 = o(1). Thus it suffices to control comparisons in the selected lists and additional incidences recorded at their children before their complete stars are recorded.

Track each vertex in Li from σ0 if i = 0, and from completion of its parent’s star comparison otherwise, until its own comparison begins. Its mark is already exposed and capped when tracking begins. Within the parent’s comparison, a label already in E before the query or two or more attachments from the same sender to the current target already cause failure; the whole left–right–mark comparison finishes before another star’s queries interleave. Subsequent contacts are charged when first disclosed, using membership in the current list. For a slot (u, s) whose endpoint has not been revealed and an exposed target j, the conditional query law gives

¯gn/k◦n

2¯gn

P(Ju,s = j | ψ, current record) ≤

≤ .

1 − 2Mn ¯gn/k◦n

k◦n

The endpoints of at most mMn outgoing slots are revealed while exploring their senders; their contacts with Li cost at most C|Li|Mn ¯gn/k◦n. Conversely, each listed sender has at most m slots, each tested at most once against any given target in E, giving the same bound for contacts from listed senders to other targets. Hence the total contact cost per list is at most CB2nMn ¯gn/k◦n. This includes queries in failed off-list comparisons. Before the first charged failure, every selected root therefore has only its entrance recorded, as required by Lemma 4.1.

Every star compared after initialization has root age at least an and mark at most gn. Its remaining offspring contain a left child below 8k◦n/n with probability at most Ce−χ(c1−CA)ℓ2n ; right children cannot cross this cutoff. The probability of a child mark exceeding gn is at most C(m + gne(1−χ)CAℓ2n )e−gn/2. Choose c1 and then Cg, after CB , so that both bounds are o(B−2

n

e−2ℓ2n ). The number of right children is Poisson with mean at most gne(1−χ)CAℓ2n = o(Bn), so its probability of exceeding Bn/2 is smaller still. Thus the summed age, mark, and label-budget overflow errors per frontier are at most Ce−2ℓ2n .

The left-edge recursion and the right-child bound give

√

∆v ≤ ∆ρ + C(ℓ1 + 1)ηn(Mn) ≤ (C0 + 1)

ηn(Mn) for all sufficiently large n, since ℓ1 = O(log n). Each generation has at most Bn selected stars and CB2n slot, block, and mark comparisons. Summing the conditional estimates from Lemma 4.1 and adding the contact bound gives error at most Cqn per frontier, where

[

√

]

(

)

Mngn ¯gnHn

qn := e−2ℓ2n + B2n

Λn

εBG

n

\+ ηn(Mn)

\+

.

k◦n

All charges use the record before the relevant query or comparison; future comparison success and future nonreturn are not added to the conditioning. There are at most ℓ1 + 1 selected generations. The terms

√ containing Mn are at most exp{− 1

2

cM

log n + O(ℓ2n)}, and the remaining comparison term is n−a/(2a+1)+o(1). Hence (ℓ1 + 1)qn = o(1), and summing over the selected frontiers gives

P(a cap stop or a selected comparison or contact failure | H) ≤ C(ℓ1 + 1)qn + O(n−8) = o(1). (57)

An entrance return after σ0 costs at most ϱrn . Since P(σ0 < τb | H) ≥ pesc, conditioning on σ0 < τb multiplies the preceding error bounds by at most p−1

esc

. Thus Πc

τ

requires a visit to a truncated vertex apart from an error o(1), uniformly in H. □

We now define a continuation from one entrance. Fix an integer testing depth R ≤ rn with R → ∞, keeping the explored region ˜Γ constructed above. Run X until its first entrance return, first other exit from ˜Γ, or first visit to a retained vertex at depth R. These outcomes are called return, defect, and penetration, respectively. A defect or penetration is a resolution. Write ξ for the duration of this test. If ˜Γ = ∅, declare an immediate defect and put ξ = 0. After penetration within R2 steps, continue until the first exit from ˜Γ, the first visit to matched depth ℓ1, or time ⌈t⋆

n

⌉ measured from V0. On the coupled event, the visit to depth ℓ1 occurs at time τ . Let τexit be the first exit from ˜Γ, including an entrance return, and for a retained vertex y put

h

˜Γ

(y) = P Gn

V0

(τy < τexit).

This probability is determined by the recorded incident slots. Fix Ccap > 2γ and put κn = n−1eCcap√log n. The continuation is accepted if the test penetrates within R2 steps, the walk reaches depth ℓ1 before exiting and by time ⌈t⋆

n

⌉, and its depth-ℓ0 ancestor y satisfies h

˜Γ

(y) ≤ κn/pesc. All these conditions are measurable from the finite exploration and the walk at its stopping time.

For a fixed record, let r be the resolution probability and put

q(z) = P Gn

V0

(continuation accepted at z).

Thus r − q(V (Gn)) is the probability of a defect or a penetration with a rejected continuation.

Lemma 4.3 (Continuation from one entrance). For every realization of the construction,

κn

r ≥ pesc, EGn

V0

ξ ≤ CmR, q(z) ≤

r (z ∈ V (Gn)).

p 2

esc

Fix A, C > 0 and ε ∈ (0, 1). In addition to the preceding coupling hypotheses, suppose that, conditional on H, the unexposed forward PPT has its prescribed-root law, with Aρ ≥ e−Aℓ2n and Γρ ≤ Cℓ2n. Choose γ, then Ccap sufficiently large, and the truncation and coupling constants with A < CA ≤ c0 and Cg ≥ C. Uniformly over these histories and root data, for all sufficiently large n,

E [r − q(V (Gn)) | H] ≤ ε2pesc. (58)

Consequently, the event E = {q(V (Gn)) ≥ (1 − ε)r} is measurable from the finite exploration record and satisfies

P(Ec | H) ≤ ε.

Proof. An immediate defect has r = 1, ξ = 0, and q = 0. Otherwise compare the test with the completed PPT walk. Never hitting the entrance forces a resolution, so Lemma 3.1 gives r ≥ pesc. The type-corrected depth used in (21) has drift at least 1/6 before the test stops and is at most R + 1/2 at that time. Optional stopping gives EGn

V0

ξ ≤ CmR.

If q(z) > 0, the endpoint has a unique depth-ℓ0 ancestor y in the matched tree. Every accepted path ending at z hits y before exiting. Hence

κn κn

q(z) ≤ h

˜Γ

(y) ≤

≤ r.

pesc

p 2

esc

For the probability estimate, let μ be the law of the limiting ray in the completed forward PPT, conditioned never to hit the entrance parent. By the coupling and uniform escape,

μ(Φ(y))

h

˜Γ

(y) ≤ P Tρ (τΦ(y) < τb) ≤

.

pesc

Indeed, after hitting Φ(y), the probability of never returning to its parent is at least pesc. Thus the condition μ(Φ(y)) ≤ κn suffices for the hitting-probability condition in the acceptance rule.

Let Es be the event that the completed PPT walk reaches depth s before the entrance parent. Since R ≤ rn, the strong Markov property and (14) give

Ern ⊆ ER, P(ER \\ Ern | ER, H) ≤ ϱR+1 = o(1).

Thus the coupling estimate conditioned on Ern also holds conditioned on ER, with an additional error ϱR+1. The duration bound discards {ξ > R2} at cost Cm/R. For a defect before penetration, the completed PPT walk reaches depth rn from the defect location before the entrance with probability at least pesc. Such a defect forces Πc

τ

, so its probability is at most p−1

esc

times the coupling-failure probability conditioned on Ern . For an immediate defect, use the PPT root as the defect location.

Proposition 4.2 bounds the coupling loss by the truncation loss through τ and o(1). The stopped-time estimate (39) bounds this loss and the deadline failure {τ > ⌈t⋆

n

⌉} by η(γ)+o(1), uniformly over the prescribed root data. Apply Proposition 3.14 with relative age parameter CA − A > 0. Its age bound gives Aρe−(CA−A)ℓ2n ≥ an ≥ bn.

At time τ , the depth-ℓ0 ancestor of Xτ can differ from the corresponding vertex of the limiting ray only if the walk subsequently hits that ancestor’s parent. By (14), this has probability at most Cϱℓ1−ℓ0+1 = o(1), also under nonreturn conditioning. Outside this event, its harmonic mass is e−Wℓ0 , and

√

dℓ0 − log κ−1n = (Ccap − 2γ)

log n + O(1).

Theorem 3.13 makes failure of the harmonic-mass bound arbitrarily small by increasing Ccap − 2γ. The proof of Proposition 3.15 gives the same estimate for the prescribed root data: the initial harmonic contribution is

√ OP(ℓ2n) = oP(

log n). Replacing nonreturn conditioning by ER changes the error by at most ϱR+1.

Together these estimates bound the conditional expected rejected mass in (58). Choose γ, then Ccap, and finally n to make their sum at most ε2pesc. The event E is measurable because the killed transition probabilities and acceptance rule are determined by the finite record. Its probability bound follows from Markov’s inequality and r ≥ pesc. □

The conditional loss bounds hold at every admissible retained record. Section 5 verifies the conditions on the initial record and the budget bounds on a common event, and applies these conditional loss bounds at the initiated couplings. The common exceptional probability is excluded once, after combining the estimates over starting vertices.

## 5. Upper bound on the worst-case mixing time

We extend the good-start analysis of Proposition 4.2 to arbitrary initial states. For each exploration below, we use the registered label set E from Section 4, relative to the current record.

5.1. Good roots and common events. Throughout this section, write β = 1 − χ, fix A > 0 and a sufficiently large cR, and set

L = log log n, R = ⌈cRL⌉, D = ⌈(log n)3⌉, a = ⌊ne−AL2⌋ + 1.

Labels below a are called old; the remaining labels are called young. The set of hubs is Cn = {v < a : degGn (v) > D}. For r ≥ 0, form the stopped neighborhood Bstop

r

(x) by breadth-first search from x, retaining every edge incident to a nonhub vertex at depth less than r. The search stops at hubs and at depth r, retaining these vertices. If x ∈ Cn, the neighborhood is {x}. Call x a good root if Bstop

R

(x) is a tree. In particular, every hub is good.

SRW reaches a good root quickly because each larger stopped neighborhood has at most one cycle. For a connected multigraph H, write tx(H) = |E(H)|−|V (H)|+1 for its tree excess, counting edges with multiplicity. Lemma 5.1. With probability 1 − o(1),

(

)

{1, 2} ⊆ Cn, tx

Bstop

6R

(x)

≤ 1 for every x ∈ [n]. (59)

For every realization G of Gn satisfying (59),

(

)

sup

P G

x

XτCn ∧5R is not a good root

≤ e−cR,

x∈V (G)

where τCn is the first hitting time of Cn and c > 0 depends only on the model parameters.

Proof. We first prove (59). Put k = ⌊nβ/2⌋, so k < a for large n. The attractiveness of a vertex is its current degree plus δ. Before the j-th edge of vertex t is attached, the sum of these weights over vertices v < t is

T = 2m(t − 2) + δ(t − 1) + j − 1.

A vertex of attractiveness d is selected with probability d/T . The reciprocals 1/T sum to β log(t/i) + O(1) over slots between birth times i and t, with seed times interpreted as 2. For a vertex of attractiveness d ≥ m + δ ≥ 2, the weight 1/(d − 1) has conditional multiplier 1 − 1/T . Iterating from birth and applying Markov’s inequality gives

1

(

)

E

≤ C(i/n)β , P

degGn (i) ≤ D

≤ CD(i/n)β .

degGn (i) + δ − 1

Consequently,

(

)

P

[k] ⊈ Cn

≤ CDn−β k1+β ≤ CDn−βχ/2 = o(1).

We use the edge-set estimate of Garavaglia–Stegehuis [14, Lemma 1] in a form uniform over graphs of maximum degree at most four. For such a directed multigraph F , with distinct birth labels iv, edges directed from younger to older vertices, and no deterministic seed edges,

∏

∏

P(F ⊆ Gn) ≤ C|E(F )|

i−χ u

i−β v

≤ C|E(F )|

i− degF (v)/2 v

. (60)

u→v∈E(F )

v∈V (F )

The last inequality uses χ ≥ 1/2 and iu > iv. Since the cited statement fixes the number of edges, we verify the dependence of the constant. Fix an injective assignment of the prescribed outgoing edges to birth slots. After each vertex’s birth, give its attractiveness d the weight fs(d) = d(d + 1) · · · (d + s − 1), with f0 = 1, where s ≤ 4 is the number of its prescribed arrivals still pending. The identities

fs(d + 1)

s

= 1 +

, dfs−1(d + 1) = fs(d)

fs(d)

d

∑v

show that the product of weights, killed at the first failed prescription, has conditional multiplier 1 +

sv/T at an unprescribed slot and 1/T at a prescribed slot; the sum is over eligible tracked vertices. Its initial factors cost at most C|E(F )|, and its final value is the indicator of the prescribed attachments. Using 1 + x ≤ ex and sv ≥ 0, we may include all slots in the exponent sum. Each pending edge u → v then contributes at most β log(iu/iv) + O(1), while its prescribed slot contributes at most C/iu. Partial birth blocks and seed times change only the constant per edge. Summing over at most m|E(F )| slot assignments proves (60).

Suppose [k] ⊆ Cn and some Bstop

6R

(x) has excess at least two. Take two non-tree edges and the paths in the breadth-first tree from their endpoints to x. Their union has excess two and at most 24R + 2 edges. Deleting leaves gives a connected witness F of minimum degree two and excess two. Let I consist of the nonhub vertices of F at depth less than 6R in the stopped search from x, and put K = V (F ) \\ I. The paths in the breadth-first tree connect I, and deleting leaves preserves this property. Every edge of F has an endpoint in I, so K is independent. Thus

∑

∑

(degF (v) − 2) = 2, 2 = tx(F [I]) +

(degF (z) − 1).

v∈V (F )

z∈K

The first identity gives either one degree-four vertex or two degree-three vertices. They cannot all lie in K, by the second identity. Hence some w ∈ I has degree at least three and label iw > k. Also, F contains no seed edge, since both seeds are hubs.

Write q = |E(F )| ≤ 24R + 2. By (60), summing over labels with iw > k, and dropping all other label restrictions, gives at most





( n

)|V (F )|−1

∑

∑

Cq



i−3/2



i−1

≤ Cqk−1/2(1 + log n)|V (F )|−1.

i>k

i=1

There are at most (Cq)Cq choices of witness shape, orientation, partition I ⊔ K, and vertex w. Summing over them gives

(

)

P

[k] ⊆ Cn, max

tx(Bstop

6R

(x)) ≥ 2

≤ k−1/2 exp{CR[log(R + 1) + log log n]} = n−β/4+o(1) = o(1).

x

Together with the early-vertex degree bound, this proves (59).

For the walk estimate, fix a realization satisfying (59), x /∈ Cn, and put H = Bstop

6R

(x). On {τCn > 5R},

Bstop

R

(X5R) ⊆ H: every nonhub vertex at depth less than R in this stopped search is reachable from x by a path avoiding hubs of length less than 6R. If H is a tree, the result follows. Otherwise, let C be its unique cycle and, for 0 ≤ t ≤ 5R ∧ τCn , put

1

Yt = distH (Xt, C ) −

1{degG(Xt)=2}.

4 Every vertex visited before the first hub hit and through time 5R has all its incident edges in H. A degree-two nonhub vertex has no arrivals, so both neighbors have degree at least three. The distance has mean increment zero there, and the correction gives drift 1/4. At a vertex of degree d ≥ 3, the sum of the distance increments over its incident edges is d − 2, whether or not it lies on C . At most d − m ≤ d − 2 incident edges lead to degree-two vertices, since each such edge is an arrival. The corrected drift is therefore at least

(d − 2) − 1

4

(d − 2)

1

≥ .

d

4 These estimates include transitions to hubs. Thus Yt∧τCn − 1

4

(t∧τCn ) is a submartingale with increments bounded in absolute value by 3/2. Since Y0 ≥ −1/4, Azuma–Hoeffding gives

(

)

P G

x

τCn > 5R, Y5R ≤ R

≤ e−cR.

If no hub has been hit and X5R is not good, its stopped neighborhood contains C , so Y5R ≤ R. Every hub is

| good, completing the proof. |  |  |  |  | □ |
| --- | --- | --- | --- | --- | --- |
| For the subsequent explorations, set |  |  |  |  |  |
|  | −AL2/2 b = ⌊ne | ⌋, | χ Λ = n(b/n) , | −2 ρ = L . |  |

Retain the urn notation of Section 2. Let Ω be the event that (59) and the following bounds hold:

(j/n)χ

≤ Sj ≤ C(log n)3(j/n)χ (1 ≤ j ≤ n),

C(log n)3

(61)

ψj ≤ C log n/j (2 ≤ j ≤ n), φv ≤ CD/n (v < a, v /∈ Cn);

∑

#{(k, i) : k ≥ b, Jk,i < b} ≥ cΛ,

degGn (v) ≤ Cn(a/n)χ, max

degGn (v) ≤ C(n/a)β log n; (62)

| v\<a | v≥a |  |
| --- | --- | --- |
|  | stop | CvolL2 |

degGb−1 (h) ≤ ρ degGn (h) (h ∈ Cn), max

R

x

Lemma 5.2. For suitable fixed constants in these bounds,

P(Ωc) = o(1). (64)

Proof. The factorial-weight calculation in the preceding proof, with a fixed integer s ≥ 1, gives E[degGn (i)s] ≤ (Cs)s(n/i)βs. Taking s = ⌈log n⌉, Markov’s inequality and a union bound prove the last bound in (62) with failure probability at most n−2.

The maximal-inequality argument in Lemma 2.3, using the summable variances of log(1−ψj ), gives max1≤j≤n | log Sj − χ log(j/n)| = OP(1). Together with the exponential moments of jψj and a union bound, this proves the first two bounds in (61) with probability 1 − o(1). The same lemma gives Sj ≍ (j/n)χ uniformly for j ≥ a − 1 with high probability. Fix urn variables satisfying these bounds. Conditional on them, the attachment slots are independent.

∑n

For v < a, arrivals from labels at least n/2 have mean at least cnφv. By Chernoff’s inequality, the last bound in (61) fails with probability at most ne−cD. For s = a, b, the number of edges from [s, n] to [s − 1] has conditional mean mSs−1

k=s

S−1

k−1

≍ n(s/n)χ. Chernoff’s inequality gives the first two bounds in (62), since the edges within [a − 1] contribute only O(a) to its total degree.

For h < a, let μ−h and μ+h be the conditional means of degGb−1 (h) and degGn (h) − degGb−1 (h). The urn bounds give

∑

n

μ+h = mφh

S−1

k−1

≍ nφh, μ−h ≤ m + C(log n)3(b/n)β μ+h .

k=b

Since (log n)3(b/n)β = o(ρ) and ρD ≫ log n, if μ+h ≥ D/4, Chernoff’s inequality gives

degGn (h) − degGb−1 (h) ≥ μ+h /2, degGb−1 (h) ≤ ρμ+h /2, except with probability Ce−cρD. If μ+h < D/4, then P(degGn (h) > D | ψ) ≤ Ce−cD. A union bound over all h < a, without conditioning on whether h is a hub, bounds the conditional probability that the first inequality in (63) fails by Cne−cρD = o(1).

For the volume bound, fix urn variables satisfying the first two bounds in (61). The attachment probabilities then satisfy

φj

pi→j =

≤ C(log n)7i−χjχ−1 (j < i).

Si−1

√

√

Put f (v) =

n/(v ∨ a), F =

n/a, K = (log n)10 and

⌈

⌉

Q =

4(R + 1)F KR log n

= exp{(A/2 + 10cR)L2 + O(L + log L)}.

From a fixed root, run breadth-first search to depth R, stopping when |E| = Q. Examine each vertex at depth less than R once, revealing its complete star if it is young; at an old vertex, stop when its star is complete or D + 1 incidences have been recorded. Only vertices with complete recorded stars become explored. If the search finishes before reaching Q labels, it contains the stopped neighborhood: every old nonhub vertex at depth less than R has its complete star recorded, and queries at hubs only add vertices.

Reveal outgoing slots by their endpoints and test incoming slots one target at a time, retaining every answer. Conditional on this record and the urn, the urn uniforms for slots whose endpoints have not been revealed remain independent and uniform outside their excluded target intervals. All excluded targets belong to E. Their total relative mass at a sender i ≥ a is at most

∑

C(log n)7i−χ

jχ−1 ≤ C(log n)7(Q/a)χ = o(1).

j≤Q

For such a slot with a young sender, each conditional attachment probability is at most twice its value given the urn alone. Neither membership in Cn nor final degrees are included in this conditioning.

For a young vertex v ≥ a, the expected weight of its neighbors is bounded by

∑

∑

(

)

m

f (j)pv→j + m

f (i)pi→v ≤ C(log n)7

1 + log(n/a)

f (v). (65)

j\<v

i>v

Indeed, after division by C(log n)7f (v), the contribution from j < a is at most C(a/v)χ−1/2, and the remaining sums are bounded by

∑

(j/v)χ−1/2

∑

(v/i)χ−1/2

(

)

C

\+ C

≤ C 1 + log(n/a)

.

j

i

a≤j\<v

i>v

This includes χ = 1/2. At an old vertex, the total weight of neighbor labels added to E is at most (D + 1)F = (D + 1)f (v).

Let Wj be the total f -weight of labels added to E at depth j, and let Fj be the record before that generation is examined. Each new label has weight at most F . Using eθu − 1 ≤ (e − 1)θu for 0 ≤ θu ≤ 1, the conditional attachment bound and (65) give, by successive exposure within the generation,

E[eθWj+1 | Fj , ψ] ≤ eKθWj , 0 ≤ θ ≤ F −1.

The deterministic contribution from old vertices is absorbed by K; collisions and the Q-label stop only reduce the added weight. Iteration yields E[eWj /(F Kj ) | ψ] ≤ ef (x)/F ≤ e. If the search reaches Q labels, some generation j ≤ R has weight at least Q/(R + 1) ≥ 4F Kj log n. Exponential Markov inequality and a union bound over j ≤ R give probability at most e(R + 1)n−4. Choose Cvol > A/2 + 10cR, so that Q ≤ eCvolL2for large n. A union bound over the roots bounds the conditional probability of failure of the volume bound by CRn−3. Integrating over the urn and using the preceding estimates and Lemma 5.1 proves (64). □

With the scales of Section 4.1, let Un be the event on which all the following bounds hold:

max

|log Sk − χ log(k/n)| ≤ εn, max

(Zj + jψj ) ≤ ¯gn; (66)

k◦n−1≤k≤n

k◦n≤j≤n

(

)

max

degGn (v) ≤ n3/4, φv ≤ C

degGn (v) + D

/n (v < a), (67)

v

where C is a fixed constant. For CG and C sufficiently large,

P(Uc

n

) ≤ 2ne−cε2nk◦n + O(n−8) + ne−cD = O(n−8).

Indeed, the beta moment formula gives

d2

log E(1 − ψj )θ = Ψ1(dj + θ) − Ψ1(cj + θ) ≤ Cj−2, |θ| ≤ cj.

dθ2 Here cj − dj = m + δ is fixed and dj ≍ j. Independence therefore yields

log E exp{θ(log Sk − E log Sk)} ≤ Cθ2/k, |θ| ≤ ck.

Since E log Sk = χ log(k/n) + O(k−1), Chernoff’s bound and a union bound give the first term. It is smaller than every fixed negative power of n, because ε2nk◦n = n1/3−o(1). The Gamma exponential moments and Eedj ψj /2 ≤ 2m+δ bound failure of the second inequality in (66) by O(n−8) after increasing CG. The degreemoment bound above with s = 40 gives failure probability O(n−9) for the first inequality in (67). Conditional on the urn, arrivals to v < a from labels at least n/2 have mean at least cnφv. If the second inequality fails, this mean exceeds both 2 degGn (v) and cD, after increasing C. Chernoff’s inequality and a union bound give failure probability at most ne−cD.

Graph-level error bounds below retain their intersection with Ω ∩ Un until the union over starting vertices in Proposition 5.4. The bounds (61) are determined by (ψ, Cn), and (62) by the final degree sequence. The remaining argument controls ∥P t

G

(x0, ·) − πG∥TV uniformly over good roots.

5.2. Reduction to a successful continuation. Work on Ω and fix a good root x0 in the realized graph G. Put T = Bstop

R

(x0). We follow the walk to a terminal of T and try to continue it through a young vertex using the coupling of Section 4. A return allows another attempt; a defect ends the current walk procedure. We bound the probability that an accepted continuation ends at a prescribed vertex. Together with control of the duration and the spectral gap, this reduces the mixing estimate to bounding the probability of failure.

The terminal set is

∂T = ∂regT ˙∪ ∂badT ˙∪ ∂hubT, where the first two sets contain, respectively, the young and old nonhub vertices at depth R, and the third contains the hubs of T , at any depth. Write v− for the parent of a nonroot vertex and H0 for the exploration record of T ; see Figure 3. To explore T and its old nonhub terminals, first reveal the hub-status indicator of each encountered old vertex. At this stage scan incoming slots only at nonhubs, postponing all hub scans until the old nonhub terminals have been explored. The auxiliary search stopped at D + 1 incidences above is used only for the volume bound.

For an oriented incident slot g = (u, w) with w ≥ a, assign the finite matched region ˜Γ constructed in Section 4.2, retaining u as the entrance parent. The forward test is the test of Lemma 4.3 with testing depth R, started at w. It stops at the first entrance return, first other exit from ˜Γ (a defect), or first visit to depth R in the retained region (a penetration). An empty region gives an immediate defect. Let ξg be the test duration from w.

The rule at a terminal is as follows. All choices are uniform over incident slots, with parallel edges counted separately.

(i) At a young terminal v, run the forward test with entrance (v−, v). A return ends the procedure at v−.

depth R

∂regT : young, at depth R

∂hubT : hubs, at any depth,

x0

retained as terminals

∂badT : old, degG ≤ D, at depth R

Figure 3. The stopped neighbourhood T = Bstop

R

(x0) of a good root: hubs and vertices at

depth R are retained as terminals. Circles are young vertices, squares old nonhub vertices and the shaded circle a hub; the blue path ends at the first terminal hit by the walk.

(ii) At an old nonhub terminal v, take one SRW step. A step through the entrance ends the procedure by a return to v−. A forward step to a young vertex starts a forward test; if that test returns to v, choose again. A forward step to a hub starts the hub procedure below. A forward step to another old nonhub vertex gives a defect.

(iii) At a hub h, take one SRW step. A young slot with an assigned coupling starts a forward test; a return to h is followed by another choice. Every other departure gives a defect. In particular, entrances from the initial stopped exploration or an old nonhub terminal are excluded.

These rules are illustrated in Figure 4. A penetration or defect is called a resolution. Thus a nonhub procedure either returns to its parent or resolves, whereas a hub procedure continues until it resolves. A test declared defective in the explorations below stops immediately. The coupled environments and matching assigned to each slot are kept fixed on repeated visits. The threshold a governs the exploration of T and its old nonhub terminals, as well as the terminal rules. Within a forward test or continuation, use the regularity and collision rules of Section 4, with label cutoff k◦n < a; old vertices newly added to E, including hubs, require no degree classification.

After penetration within R2 steps, continue in the same retained region as in Lemma 4.3, with time and depth measured from the entrance root. Use Ccap > 2γ and

κn = n−1eCcap√log n

from that lemma. The continuation is accepted if it reaches matched depth ℓ1 before exiting and by time ⌈t⋆

n

⌉, and its depth-ℓ0 ancestor y satisfies

h

˜Γ

(y) ≤ κn/pesc.

Here h

˜Γ

is the killed hitting probability defined there, using the recorded incident slots of the entire retained region. Acceptance is determined by this finite record and the walk at its stopping time.

Starting at x0, run the appropriate procedure whenever the walk hits ∂T , and resume the walk in T after a return. Let τj be the start of the jth procedure, N the first resolving index, and σ its completion time, before the continuation. Define E to be the event that this resolution is a penetration with an accepted continuation.

| (a) v ∈ ∂regT: forward test | (b) y ∈ ∂badT: old nonhub | (c) h ∈ ∂hubT: hub |
| --- | --- | --- |
|  | forward test |  |
| return penetration | return | forward test |
| then to depth ℓ1 v− v | hub procedure y− y | h |
|  | defect | non-young: defect |

defect

depth R

Figure 4. The terminal procedures, one for each class of terminal in Figure 3. (a) The forward test at a young terminal; the shaded sector indicates the forward test up to depth R. (b) An old nonhub terminal chooses an incident slot and follows the indicated rule. (c) At a hub, young slots with assigned couplings start forward tests; all other departures give a defect. In (b) and (c), a returning forward test is followed by another slot choice.

Let S be the time of acceptance, with S = ∞ on Ec. Acceptance is determined at that time, and S ≤ σ + ⌈t⋆

n

⌉

on E.

Lemma 5.3. Uniformly over these choices and all good roots,

EG

x0

σ ≤ CmR, P G

x0

(E, XS = z) ≤ Cmκn (z ∈ V (G)). (68)

Proof. For a procedure starting at v, let ξv be its duration, rv its resolution probability, and qv(z) its accepted

endpoint mass. We prove

pesc

1

rv ≥ p :=

=

, EG

v

ξv ≤ CmR, qv(z) ≤ Cmκnrv. (69)

1 + pesc

4

For a forward test at g = (u, w), let rg be its resolution probability and qg(z) its accepted endpoint mass.

Lemma 4.3 gives rg ≥ pesc = 1/3, EG

w

ξg ≤ CmR, and

κn

qg(z) ≤

rg. (70)

p2

esc

These bounds also hold for a declared defect, with rg = 1, ξg = 0, and qg = 0.

At a hub h, let re and qe(z) be the resolution probability and accepted endpoint mass after departure through

slot e. Set re = 1 and qe(z) = 0 for a defective departure. Summing over successive excursions that return to h

gives

∑e

qe(z) κn

qh(z) =

∑e

≤ .

re p2

esc

∑e

The expected number of departures is degG(h)/

re ≤ p−1

esc

. Each departure takes expected time at most

1 + CmR, so EG

h

ξh ≤ CmR and rh = 1.

∑e̸=ev

At an old nonhub terminal v, put Sv =

re, where ev is its entrance and re, qe(z) refer to the corre-

sponding forward departure. A departure into a hub includes the entire hub procedure, so it has re = 1 and

satisfies the same endpoint bound. Every forward slot has re ≥ pesc, and therefore

∑e̸=ev

Sv

qe(z) κn

rv =

≥ p, qv(z) =

≤ rv.

1 + Sv

1 + Sv

p2

esc

The expected number of choices is degG(v)/(1 + Sv) ≤ p−1

esc

, proving the duration bound and hence (69).

It follows that EG

x0

N ≤ p−1. Between procedures, the potential distT (x0, Xt) − 1

4

1{degG(Xt)=2} has drift at

least 1/4 until ∂T is hit, by the calculation in Lemma 5.1. Here Ω ensures that the seed vertices are hubs.

Thus the expected time to reach ∂T is at most 4(R + 1) from any point of T . Together with (69), this gives EG

x0

σ ≤ CmR.

Finally, the strong Markov property at the procedure starts gives

∑

∑

P G

x0

(E, XS = z) =

P G

x0

(N ≥ j, Xτj = v)qv(z)

j≥1

v∈∂T

∑

∑

≤ Cmκn

P G

x0

(N ≥ j, Xτj = v)rv = Cmκn,

j≥1

v∈∂T

| since the last sum is PxG0(N < ∞) = 1. |  |  |  |  | □ |
| --- | --- | --- | --- | --- | --- |
| Proposition 5.4. Fix ε > 0. Suppose the couplings can be chosen so that, uniformly in x0, ( | G | c | ) | −1 |  |

P

x0

Then, for a sufficiently large fixed C, with high probability,

√

dn(⌈t⋆

n

⌉ + R2 + 5R + sn) ≤ ε + o(1), sn = ⌈C

log n⌉.

Proof. Construct all root experiments on one common realization of the PA graph, urn, and marks. Each experiment uses only its own retained record in the conditional estimates. By (71),

(

)

P

∃x0 good : P G

x0

(Ec) > ε

≤ P(Ωc) + P(Uc

n

)

∑

n

(

)

\+

P

Ω ∩ Un ∩ {x0 is good, P G

x0

(Ec) > ε}

= o(1).

x0=1

Thus the common event Uc

n

is excluded once, outside the union over roots; independence of the root experiments is not needed. Fix such a realization and a good root, and set

ν(z) = P G

x0

(E, σ ≤ R2, X⌈t⋆

= z).

n⌉+R2

By (68), ν ≤ P ⌈t⋆

n⌉+R2

(x0, ·) and ν(V (G)) ≥ 1−ε−Cm/R. For each j ≤ ⌈t⋆

G

n

⌉+R2, the event E ∩{σ ≤ R2, S = j} is measurable at time j, and its endpoint measure has atoms at most Cmκn. Since πmin(G) ≥ 1/[2(n − 1)], this measure is bounded by CmeCcap√log nπG. Applying the Markov property for the remaining ⌈t⋆

n

⌉ + R2 − j steps, using stationarity, and summing over j gives

ν ≤ Cm(⌈t⋆

n

⌉ + R2 + 1)eCcap√log nπG.

By Proposition 2.6, the absolute spectral gap is at least some fixed g > 0 with high probability. Consequently,

√

∥νP snG − ν(V (G))πG∥TV ≤ Cm

⌈t⋆

n ⌉ + R2 + 1 eCcap√log n/2−gsn = o(1)

when C > Ccap/(2g), since t⋆

n

\+ R2 = O(log n). Including the discarded mass gives the required bound from every good root.

From an arbitrary vertex, stop at the first hub hit or at time 5R. Lemma 5.1 places the walk at a good root except with probability e−cR. The strong Markov property and contraction of total variation give the additional 5R in the statement. The resulting bound depends only on G, so it also holds with high probability under the graph law. □

Sections 5.3 and 5.4 estimate the failures in (71), at nonhub terminals and hubs, respectively.

5.3. Nonhub terminals. We estimate failures at nonhub terminals by their first hitting masses. Let η be the first hitting distribution on ∂T from x0.

Lemma 5.5. For every nonhub terminal v,

P G

x0

(XτN = v) ≤ Cη(v), η(v) ≤ w∗ := e−cbdR, cbd = 1

2

log 5

4

. (72)

Proof. If x0 is a hub, there are no nonhub terminals. Otherwise, fix the graph and all assigned coupled environments. Each terminal procedure can be replaced by absorption with probability rv and a return to its parent otherwise. For a nonroot vertex u, let h(u) be the probability of absorption below u before reaching its parent, and let h1(u) be the same probability when every terminal absorbs. At terminals, h(v) = rv and h1(v) = 1. At internal vertices, summing excursions that return to u gives

∑z:z−=u

h(z)

h(u) =

∑z:z−=u

,

1 +

h(z) with the same recursion for h1.

By (69) and its proof, rv ≥ 1/4, with rv ≥ 1/3 when degG(v) ≥ 3. Since degree-two vertices are not adjacent, the recursion extends these bounds to every nonroot vertex: a degree-two internal vertex has one child of degree at least three, and every other internal nonroot vertex has at least two children. Thus h(u) ≥ 1/4, with h(u) ≥ 1/3 when degG(u) ≥ 3.

We compare the two absorption rules as in the proof of Lemma 3.10. A contribution to h1(u) − h(u) requires hitting a terminal before u− and then reaching u− without absorption. This terminal must be a nonhub, since hubs absorb surely. It has depth R, so the return to u− crosses R − |u| + 1 successive parent edges. At each of these vertices, the probability of reaching its parent before absorption is at most 3/4. The strong Markov property gives

h1(u)

0 ≤ h1(u) − h(u) ≤ (3/4)R−|u|+1,

≤ 1 + 3(3/4)R−|u|.

h(u)

∑y:y−=u

The excursion calculation in Lemma 3.2 gives the conditional probability h(z)/

h(y) that absorption occurs below child z, given absorption before reaching u−. The same formula holds at the root and with h1 in place of h. At depth j, the ratio of these child probabilities is therefore at most 1 + 3(3/4)R−j−1. Multiplying along the path to v gives





P G

(XτN = v)

∏

(

) 

∑



x0

≤R−1

1 + 3(3/4)R−j−1

≤ exp 3

(3/4)j = e12.

η(v)





j=0

j≥0

For the first hitting distribution, each choice of a prescribed child at a vertex with at least two children has probability at most 1/(1 + 1/4) = 4/5. The root has at least two children, and degree-two vertices are not adjacent, so the path to v contains at least ⌈R/2⌉ such choices. Hence η(v) ≤ (4/5)⌈R/2⌉ ≤ w∗. □

Explore the old nonhub terminals. Throughout this subsection, y ranges over these terminals, and cy is the number of their forward slots leading to old nonhub vertices. Forward slots exclude the entrance. Couplings are assigned to the young entrances at young terminals and those reached from old nonhub terminals. Give them weights





η(v), g = (v−, v), v a young terminal,

wg =



η(y)/(degG(y) − 1), g a young forward slot at y.

∑g

∑g

Then

wg ≤ 1, maxg wg ≤ w∗,

w2g ≤ w∗.

The required hubs are the hub terminals of T and the hubs reached from its old nonhub terminals. Once those terminals have been explored, complete the stars of every old vertex classified while exploring T and its old nonhub terminals, including all required hubs, before starting any PA–PPT coupling. No further degree classifications are made when these additional neighbors are disclosed. Retain every slot answer, expose the marks of queried targets at least k◦n, and reveal the normalized masses ϑℓ of the queried targets below k◦n as in Section 4.1. Every earlier hub-status indicator is now determined by the recorded stars and adds no information to the PA record.

Before its own coupling begins, an entrance with a young endpoint is reserved relative to the current record if the endpoint’s complete star has not been recorded, its mark is unexposed, and the entrance is its only recorded incidence. We also call the endpoint reserved for that entrance. An entrance is spoiled if, before its own coupling begins, another incidence at its endpoint has been recorded; this includes incidences recorded before the entrance itself. Its coupling is omitted. Reserved endpoints’ marks are exposed only when their own couplings begin, which ends the reservation without spoiling the entrance. Construct the couplings for the young entrances weighted by wg in a fixed order, starting each only if its entrance is still reserved. Complete each coupling before starting the next. A spoiled entrance gives an immediate defect.

For each coupling, retain the entrance, the root type and its age (its label divided by n), together with the entire preceding exploration record. Initialize the root mark and apply the collision rules of Section 4.1. Defer couplings at the reserved young entrances of required hubs until the audits in Section 5.4; intervening disclosures may still spoil them. Write H∂ for the completed boundary record.

With the graph and assigned coupled environments fixed, put bg = rg − qg(V (G)), the probability of a defect or a penetration with a rejected continuation. The retained region, its recorded incident slots, and the finite hitting-probability rule determine bg. Retain these data before the next coupling.

Set bg = 1 at spoiled entrances and define

∑

∑

η(y)cy

BT :=

wgbg +

.

g

y

degG(y) − 1 Let Ghub be the event that every required hub procedure has quenched failure probability at most ε/2, uniformly over these original entrances. For roots that are not good, construct no couplings, set BT = 0, and declare Ghub to hold.

For a good root, the terminal rules and (72) give

P G

x0

(Ec) ≤ CmBT + ε/2 on Ghub.

Indeed, at a young terminal the failure probability conditional on resolution is at most bg/p. At an old nonhub terminal y, summing excursions that return to y shows that, conditional on resolution, the probability of failure without starting a hub procedure is at most

∑g at y

cy +

bg ,

p(degG(y) − 1) since each forward excursion resolves with probability at least p. Multiplying by the resolving-terminal probabilities and using (72) gives CmBT , with p−1 absorbed into Cm. The strong Markov property at the first hub procedure bounds the remaining failures by ε/2. Consequently, (71) follows once we prove, for every fixed εB > 0 and uniformly in x0,

P(Ω ∩ Un, BT > εB ) = o(n−1), P(Ω ∩ Un ∩ Gchub) = o(n−1), and choose CmεB ≤ ε/2. We prove the first estimate here and the second in Section 5.4.

We impose |E| ≤ Mn, with Mn as in (40), with cM < 1/2, cr ≥ cR, and c0 > A, so k◦n < a. This bound includes all labels added before the couplings and counts vertices whether or not their complete stars have been recorded. Every required hub is in T or adjacent to an old nonhub terminal, and at most C(D + 1)(|T | + 1) old vertices have their status queried. On Ω ∩ Un, completing their stars adds at most C(D + 1)(|T | + 1)n3/4 = n3/4+o(1) labels. Each hub samples k = ⌈(log n)2⌉ slots. Thus the number of boundary couplings plus the number of slots sampled at hubs is at most

Ck(D + 1)(|T | + 1) ≤ eCtestL2, (73)

for any fixed Ctest > Cvol and large n. Choose this constant before the regularity constants in Section 4.1, so that (53) applies. By (56), the size of E, including all labels added before the couplings, is at most

√

n exp{− 1

2

log n + CL2} = o(Mn). (74)

Stop the exploration if either budget is exceeded. Before initiating an entrance coupling, also stop if |E| > Mn/2. This coupling supplies the environment for the forward test and its continuation. The count budget is not exceeded on Ω; (74) rules out the stops imposed on |E| on Ω ∩ Un.

On Un, the initial PA record completed before the couplings satisfies the history conditions of Section 4.1. Every queried target in E0 has its complete star recorded. Put t = |E|. Their nonhub degrees sum to at most tD, and their hub degrees to at most 2mt: all senders have labels in E and at most m birth slots each, and every edge contributes at most twice to the degree sum. Thus (67) and (66) give

∑

CtD

Ct

|  |  | ℓ∈E 0 | ϑℓ ≤ | ◦ n(kn/n) | χ = ◦ D(kn/n) kn | = o(tg¯n/kn). |
| --- | --- | --- | --- | --- | --- | --- |
| ◦ Here D(kn/n) | β | 2 /g¯n = O((logn) e | −βc1L2 |  | ) = o(1), verifying the aggregate cap. | Before starting the couplings, |

check this observable bound and jψj ≤ ¯gn for every j ≥ k◦n whose mark has been exposed. Check the latter bound at every subsequent mark exposure. A failed check stops the entire exploration; these stops cannot occur on Un. Other mark and comparison failures remain local, with all PA answers retained. No new low target is queried during the couplings. At any of the preceding stops, set BT = 1 and declare Gchub; subsequent charges and loss variables in the estimates are zero. We bound the losses on Ω ∩ Un, where these stops do not occur. The common Uc

n

is excluded only in Proposition 5.4.

We first bound old nonhub departures revealed while exploring the old nonhub terminals, before the deferred stars are completed. Fix a record of T with η(v) ≤ w∗ at every nonhub terminal, as holds on Ω. Let Gj be the record after j queries in this exploration, enlarged by (ψ, Cn). The bounds (61) are measurable in G0; throughout this calculation suppose they hold. During this exploration, for a slot (k, i) whose endpoint has not been revealed and a nonhub target v < k whose complete star has not been recorded,

(

)χ

φv

n

P(Jk,i = v | Gj−1) ≤

∑h\<k, h∈Cn

≤ C(log n)3φv

. (75)

φh

min{k, a} The probability is zero if v has already been excluded. Otherwise, redirecting the slot from v to a hub h < k preserves the record: v remains a nonhub, h remains a hub, and no negative query has a hub as its target. The likelihood ratio is φh/φv, proving the first inequality. For the second, put r = min{k − 1, a − 1} and use

∑

φh ≥ Sr − CDr/n ≥ c(log n)−3(min{k, a}/n)χ,

h\<k, h∈Cn

since (log n)3D(a/n)β = o(1). We also have

∑

φv ≤ C(log n)4n−χv−β ,

φv ≤ C(log n)4(|F |/n)χ. (76)

v∈F

Every original boundary entrance is reached from x0 by a nonhub path of length at most R + 1. An additional incidence at its endpoint disclosed before the first PA–PPT coupling therefore lies in Bstop

5R

(x0), including incidences found in a hub’s star. On Ω, at most one such edge lies outside the breadth-first tree. It spoils at most two of these entrances, with total weight at most 2w∗.

∑y

Before exploring the old nonhub terminals, assign λy = η(y)/(m − 1) to each such terminal, and zero to other labels. At the first disclosure of an edge joining two old nonhub vertices, charge λy for each endpoint y at which this edge is a forward slot. These charges dominate

η(y)cy/(degG(y) − 1), and each is at most 2w∗. For r < s < a, (75) is at most C(log n)3Dn−β s−χ. Since each slot–target pair is queried at most once, the sum of the conditional expected charges is at most

∑

C(log n)3Dn−β

(λr + λs)s−χ ≤ C(log n)3D(a/n)β ,

r\<s\<a

∑y

where we used

λy ≤ 1/(m − 1).

During the subsequent couplings, condition on the urn variables and the current full exploration record. The degree classifications and all hub neighbor lists are determined by its slot answers; samples from these lists use independent auxiliary randomness. For a sender u ≥ a, the total relative mass of previously excluded targets is at most

C(log n)7(Mn/a)χ = o(1).

The conditional query bound from Section 4.1 therefore gives, for each slot (u, i) whose endpoint has not been revealed and every target x < u, including hubs,

2φx

P(Ju,i = x | ψ, record) ≤

≤ C(log n)3φx(n/u)χ.

Su−1

Before the couplings begin, the unspoiled entrances weighted by wg have distinct young endpoints. Charge an entrance’s weight when another incidence at its endpoint is first revealed before its own coupling begins. We do not explore a reserved endpoint before its own coupling begins, so a full endpoint disclosure can spoil its entrance only by reaching that vertex as a target. The preceding bound and (76) give expected charge at most C(log n)7/a per disclosure; there are at most mMn disclosures. Alternatively, a younger-neighbor query Ju,i = x may reveal an incidence at a reserved endpoint u > x. For its entrance g, sum over the m slots of u and the at most Mn distinct targets in E queried before its coupling begins. The conditional expected charges total at most

∑

C(log n)3wg(n/a)χ max

φx ≤ C(log n)7wg(Mn/a)χ.

|F |≤Mn

x∈F

The bound holds for every target set and hence also for adaptive queries. Summing over entrances uses

∑g

wg ≤ 1.

Apply the exponential-moment bound separately to the charges from exploring old nonhub terminals and to the subsequent spoiled-entrance charges. In either case, write ∆j for the charge and Gj−1 for the corresponding conditioning record. The preceding estimates give

∑

[

]

0 ≤ ∆j ≤ 2w∗,

E[∆j | Gj−1] ≤ C

(log n)3D(a/n)β + (log n)7{Mn/a + (Mn/a)χ}

= o(1).

j

√ Here Mn/a = exp{−cM

log n + O(L2)}. The inequality ex ≤ 1 + (e − 1)x for 0 ≤ x ≤ 1 gives

{

}

e − 1

E[e∆j /(2w∗) | Gj−1] ≤ exp

E[∆j | Gj−1]

.

2w∗ For each sum, iteration and exponential Markov inequality bound the probability of exceeding εB /4 − 2w∗ by e−cεB /w∗ for large n. Integrating over the respective initial records and including the at most 2w∗ weight of entrances spoiled before the couplings gives





∑

η(y)cy

∑

P

Ω ∩ Un,

\+

wg > εB /2

 ≤ 2e−cεB /w∗ .

y

degG(y) − 1

g spoiled

For the remaining contribution, let F −g be the full record immediately before the coupling at g, including its entrance, all revealed PA and PPT data, and auxiliary choices already made, including those from failed couplings. No conditioning on the full graph, the urn, or Un is added. Uniformly over these records and couplings started at reserved young entrances, including eligible hub samples,

E[bg | F −g ] ≤ εY (77)

for any fixed εY > 0, after choosing the constants and taking n sufficiently large. Since the completed coupling record determines the quenched loss bg, the tower property identifies this conditional expectation with the annealed test-loss probability.

Indeed, the entrance root has only its recorded entrance and an unexposed mark. Its age is its label divided by n, at least e−AL2, and its initial discrepancy is zero. Initialize its type-dependent Gamma mark by (51), declaring an immediate defect on failure. The initialization error, mark goodness failure, and event Γρ > CL2 have total conditional probability o(1) for a fixed C > 0. Outside these events, the pretrial check |E| ≤ Mn/2 and the retained record give the hypotheses of Lemma 4.3, with testing depth R ≤ rn. Apply (58) with its error parameter chosen so that the bound is at most εY /2. Averaging over initialization gives E[bg | F −g ] ≤ εY /2+o(1), which proves (77).

Condition on an initial PA record H completed before the couplings and satisfying the displayed weight bounds. Order the initiated boundary couplings by execution time, padding unused positions with zero contributions, and include all intermediate disclosures in the filtration. The weights are known before each coupling. Put μg = E[bg | F −g ]. Conditional Hoeffding gives

[

]

E

eλwg (bg −μg ) | F −g

≤ eλ2w2g /8.

| Since | g wgμg ≤ εY | and | g wg ≤ w∗, the exponential martingale bound, averaged over these initial records, |
| --- | --- | --- | --- |
| yields |  |  |   |
|  |  |  | ∑ −2t2/w PΩ∩ Un, wgbg > εY +t ≤ e ∗. |
|  |  |  | g with a coupling |

Choose εY ≤ εB /4 and t = εB /4. Combining this with the bounds for old departures and spoiled entrances gives

P(Ω ∩ Un, BT > εB ) ≤ 3e−cεB /w∗ = o(n−1), provided cRcbd > 1, since w−1

∗

= ecbdR ≥ (log n)cRcbd .

## 5.4. Hub continuations. We prove

P(Ω ∩ Un ∩ Gchub) ≤ e−c(log n)5/2+ CeCL2−cεk

(78)

= o(n−1).

After completing the boundary couplings, we audit the required hubs sequentially. Their complete incidentslot lists are already recorded. At each hub, sample k = ⌈(log n)2⌉ distinct incident slots uniformly without replacement, completing each eligible coupling before taking the next sample. Write ej for the jth sampled slot. A sample is eligible if its endpoint is at least b and is still reserved for that entrance immediately before sampling; rejected samples are not replaced.

Fix a required hub h, write d = dG(h) > D, and let F0 be the full exploration record at the start of its audit. Write Z = (Zv)v∈[n] for the PA marks. For the fixed realization (G, ψ, Z), call an incident slot good if its endpoint is at least b, is reserved in F0, and admits a coupled forward test and continuation compatible with this realization and record for which be ≤ εre/4. Let θh be the fraction of nongood slots. Conditional on (G, ψ, Z, F0), this population is fixed.

## Step 1: Comparison with the sample mean. Let

θh be the fraction of nongood slots among the k samples.

̂

Conditional on (G, ψ, Z, F0), the sample is uniform without replacement. Hoeffding’s inequality gives

(

∣

)

pε

∣

P

θh >

θh +

̂

∣

≤ e−cεk.

∣ G, ψ, Z, F0 Averaging over the PA realization gives the same bound conditional on F0. If a stop interrupts the audit, complete the sample uniformly from the remaining slots only for this calculation; the additional slots are neither recorded nor used for couplings.

Thus, to bound θh by pε/4, it remains to bound

θh by pε/8.

̂

Step 2: Control of the sample mean. Let Rj indicate that sample j is rejected because its endpoint is below b or is not reserved. Let Dj indicate an eligible sample with bej > εrej /4, with Dj = 0 on rejected samples. After a global stop, keep the full record fixed and set Rj = Dj = 0 for the remaining indices. An eligible sample satisfying bej ≤ εrej /4 witnesses goodness relative to F0, since its coupling respects that record. Thus, for a completed audit, every sampled nongood slot is counted by Rj + Dj , and

1

∑

k

1

∑

k

θh ≤

̂

Rj +

Dj .

k

k

j=1

j=1

We first control entrances spoiled by the additional old stars. For an old vertex h, let Kh count slots u → h, u ≥ b, for which another birth slot of u has an old target, including h. Conditional on urn variables satisfying the first two bounds in (61), the contributions from distinct senders are independent and bounded by m, and

E[Kh | ψ] ≤ Cnφh(log n)C (a/b)χ ≤ nφhe−cL2.

On Un, a hub satisfies dG(h) ≥ max{D, cnφh}. Chernoff’s inequality at the urn-measurable threshold max{D, cnφh}/(2 log followed by a union bound over all old vertices, gives

P (Ω ∩ Un, ∃h ∈ Cn : Kh > dG(h)/(2 log n)) ≤ e−c(log n)2L2.

On Ω, at most two slots at a required hub lead to young vertices already in T : three such slots would give two cycles in Bstop

5R

(x0). Apart from these slots and those counted by Kh, every endpoint at least b disclosed at that hub is reserved before the first PA–PPT coupling.

Fix the initial PA record just before the first PA–PPT coupling. Track the endpoints v ≥ b reserved for entrances at h, removing each when its entrance is spoiled or its own coupling begins. While an endpoint v remains reserved, its mark is unexposed and sv = 0 in the posterior calculation of Section 4.1, since v → h is outgoing. Thus E[ψv | F ] ≤ C/v for the current full exploration record F . The excluded-mass bound gives

P(an endpoint disclosure hits the reserved set | F ) ≤ Cd/b,

(79)

P(Jv,i = x | F ) ≤ C ¯gn/k◦n for a birth slot (v, i) whose endpoint has not been revealed, with v reserved and x ≥ k◦n a queried target. The latter target has its capped mark exposed. Keep the process stopped at the record caps and the bound |E| ≤ Mn. There are at most mMn endpoint disclosures and Mn distinct queried targets, each tested against at most md birth slots of these reserved endpoints. Let Nh count only removals caused by spoiling. The sum of its conditional expected increments is at most CdMn ¯gn/k◦n. The at most k removals at the start of couplings sampled at h are counted separately. Successive slot answers give increments at most one, so the conditional exponential-moment bound yields, uniformly over the completed initial records,

(

)cd/ log n

CMn ¯gn log n

P (Nh > d/(2 log n) | initial record) ≤

≤ e−c(log n)5/2.

k◦n

√ Here d > D and Mn ¯gn log n/k◦n = exp{−cM

log n + O(L2)}.

Let Q be the event that, before every hub sample, the fraction of slots leading below b or to an endpoint not reserved is at most ζ := ρ + (2 + k)/D + 1/ log n = o(1). On Ω, the low endpoints contribute at most ρ. The preceding bounds and the at most k samples at a hub imply

after summing over the at most eCL2required hubs.

Let Fj be the full record after sample j and any associated coupling. Conditional on (G, ψ, Z, Fj−1), the

next sample is uniform among the d − j + 1 remaining slots. On Q,

ζd

pε

E[Rj | G, ψ, Z, Fj−1] ≤

≤ 2ζ ≤

d − j + 1

32

∑k

for sufficiently large n. Therefore, on Q, the event

j=1

Rj > pεk/16 forces the sum of the centered rejection

indicators to exceed pεk/32. Azuma–Hoeffding, conditional on (G, ψ, Z) and then averaged over this realization,

gives



∣ 

∑

k

∣

pεk

∣

P

Q,

Rj >

∣

F0  ≤ e−cεk.

16

∣

j=1

∣

The event Q is intersected with the deviation event, not added to the conditioning.

For Dj , let F −j be the full record after identifying sample j and before its coupling, without further condi-

tioning on (G, ψ, Z) or Un. Since rej ≥ p, we have Dj ≤ 4bej /(pε) on eligible samples. By (77),

4εY

E[Dj | F −j ] ≤

(1 − Rj ).

pε

Choose εY ≤ p2ε2/512, so these conditional means are at most pε/64. The increments Dj − E[Dj | F −j ] are

martingale differences by the tower property. Azuma–Hoeffding gives



∣ 

∑

k

∣

pεk

∣

P



Dj >

∣

F0  ≤ e−cεk.

16

∣

j=1

∣

Combining this bound with the rejected-sample bound, the domination of

θh, and Step 1 gives

̂

(

∣ )

pε

∣

P

Ω ∩ Un ∩ Q, θh >

∣

≤ Ce−cεk.

4 ∣ F0

Enumerate the audits in execution order, assigning zero contributions to unused positions. The bound (73)

gives at most exp(CL2) positions, and on Ω ∩ Un every required hub is audited. Average over each starting

record and take a union bound to obtain

(

)

pε

P

Ω ∩ Un ∩ Q, θh >

for some required hub h

≤ CeCL2−cεk.

4

Finally, suppose θh ≤ pε/4. For each good slot, sampled or not, fix separately a witnessing coupled forward test

and continuation compatible with (G, ψ, Z, F0). These choices need not arise from one simultaneous adaptive

exploration and make no further PA revelations in the audit. Each chosen finite record defines a walk procedure

with the resolution, duration, and endpoint bounds of Lemma 4.3, and is kept fixed on repeated visits.

Declare a departure through a nongood slot an immediate defect, setting be = re = 1 there. Summing the

excursions that return to h, the probability of eventual failure is

∑e

be

ε θh

ε

∑e

≤

\+ ≤

,

re

4 p

2

where the sums run over all incident slots and re ≥ p. Each original entrance to h leads either to an old vertex

or to a vertex already explored in the initial stopped exploration, so it is excluded from the good slots. The

bound is therefore uniform over these entrances. Combining the preceding bounds with (80) proves (78).

Together with the boundary estimate of Section 5.3, this proves (71).

## 6. Lower bound on the mixing time

Let V0 be uniform on [n], independently of Gn. For γ > 0, set

⌊

√

⌋

log n − 3γ

log n

t−(γ) :=

.

νd

We use the retained subgraph from Proposition 4.2 to localize the walk on a set of vanishing stationary mass.

Proposition 6.1. For every ε ∈ (0, 1),

(∥

∥

)

∥

∥

lim

lim sup

PGn,V0

∥P t−(γ)

n

(V0, ·) − πn

∥TV < 1 − ε

= 0. (81)

γ→∞

n→∞

Consequently,

lim

lim sup

PGn (dn(t−(γ)) < 1 − ε) = 0. (82)

γ→∞

n→∞

Proof. Fix γ > 0 and write t = t−(γ). Take Aρ uniform on (0, 1), independently of the PA construction, and set

V0 = ⌈nAρ⌉ and Γρ = ZV0 . These have the required PA and PPT root laws. On {Aρ ≥ bn}, the root satisfies

the age and label cutoffs, with discrepancy ∆ρ ≤ (nbn)−1 = o(εn). Lemma 2.4 and the Gamma tail bound give

the mark requirements except with probability o(1). Since P(Aρ < bn) = bn = o(1), initialization fails with

probability o(1).

Run the construction of Proposition 4.2 without an entrance, setting ˜Γ = ∅ on initialization failure, and

complete both environments with their conditional laws. Keep the notation X, Πs, and τ from that construction.

Since Πc

t

⊆ Πc

τ

∪ {τ < t}, the coupling proposition and Proposition 3.15 bound failure by P(τ < t) + η(γ) + o(1),

after averaging over the root data and including the initialization and urn exceptions. The early hit requires

√ maxs≤t(|Xs| − νs) ≥ ℓ1 − νt = 2γ

log n/d + O(1). Thus (25), enlarging η if necessary, gives

P(Πc

t

) ≤ P(Πc

τ

) + P(τ < t) ≤ η(γ) + o(1), (83)

where η(γ) → 0 as γ → ∞ and o(1) is taken as n → ∞ with γ fixed. These probabilities average over the

environments, root, and walks.

Let F = V (˜Γ). Only explored vertices whose complete stars were successfully compared belong to F ;

truncated and mismatched boundary vertices are excluded. The size bound (38) and the bound of Bn labels

added to E per comparison in Section 4.2 therefore give

|F | ≤ (tn + 1)eωn Vn, degGn (v) ≤ CBn (v ∈ F ).

Consequently, using πn(v) = degGn (v)/(2m(n − 1)),

CBn(tn + 1)eωn Vn

{ √

}

πn(F ) ≤

= exp

− 1

2

log n + O((log log n)2)

= o(1). (84)

2m(n − 1)

This bound is uniform over all outcomes of the construction; the degrees are those in the full graph Gn.

Let En be the sigma-field generated by the completed environments, the root, the retained subgraph ˜Γ, and its

matching Φ. The set F is En-measurable. Sample the coupled walks using transition randomness independent

of En. Conditional on En, the finite walk has kernel Pn from V0; on Πt, its endpoint lies in F . Hence

∥

∥

∥

∥

∥P t

n

(V0, ·) − πn

∥TV ≥ P t

n

(V0, F ) − πn(F ) ≥ 1 − P(Πc

t

| En) − πn(F ).

For fixed ε ∈ (0, 1) and all sufficiently large n, (84) gives πn(F ) ≤ ε/2. Markov’s inequality and (83) yield

(∥

∥

)

2

2η(γ)

∥

∥

| PGn,V0 ∥Pn(V0,·)−πn∥ < 1−ε ≤ P(Πt) ≤ TV ε | ε | +o(1). |  |
| --- | --- | --- | --- |
| Taking n → ∞ and then γ → ∞ proves (81). |  |  |  |
| The worst-start bound (82) follows from dn(t) ≥ ∥Pnt(V0,·)−πn∥TV. |  |  | □ |

Proof of Theorem 1.1. Fix ε ∈ (0, 1). Proposition 6.1 gives the first limit in (1) after rescaling γ. For the second limit, apply Proposition 5.4 and the boundary estimates of Section 5 with error ε/2. The resulting time

√ is ⌈t⋆

n

⌉ + R2 + 5R + sn. As R = O(log log n) and sn = Oε(

log n), there is a constant Cε < ∞ such that

(

√

)

P

dn(t⋆

n

\+ Cε

log n) ≤ ε

−→ 1.

Monotonicity gives the second limit in (1). □

Declaration of generative AI use. The authors used generative AI tools solely to assist with checking notation, identifying potential errors in proofs, and preparing figures. All proofs were developed by the authors, who take full responsibility for the final manuscript.

## References

[1] Albert-László Barabási and Réka Albert. Emergence of scaling in random networks. Science, 286(5439):509–512, 1999.

[2] Frank Bauer and Jürgen Jost. Bipartite and neighborhood graphs and the spectrum of the normalized graph Laplace operator. Communications in Analysis and Geometry, 21(4):787–845, 2013.

[3] Anna Ben-Hamou, Eyal Lubetzky, and Yuval Peres. Comparing mixing times on sparse random graphs. Annales de l’Institut Henri Poincaré Probabilités et Statistiques, 55(2):1116–1130, 2019.

[4] Anna Ben-Hamou and Justin Salez. Cutoff for nonbacktracking random walks on sparse random graphs. The Annals of Probability, 45(3):1752–1770, 2017.

[5] Nathanael Berestycki, Eyal Lubetzky, Yuval Peres, and Allan Sly. Random walks on the random graph. The Annals of Probability, 46(1):456–490, 2018.

[6] Noam Berger, Christian Borgs, Jennifer T. Chayes, and Amin Saberi. Asymptotic behavior and distributional limits of preferential attachment graphs. The Annals of Probability, 42(1):1–40, 2014.

[7] Béla Bollobás and Oliver Riordan. The diameter of a scale-free random graph. Combinatorica, 24(1):5–34, 2004.

[8] Béla Bollobás, Oliver Riordan, Joel Spencer, and Gábor Tusnády. The degree sequence of a scale-free random graph process. Random Structures & Algorithms, 18(3):279–290, 2001.

[9] Charles Bordenave, Pietro Caputo, and Justin Salez. Random walk on sparse random digraphs. Probability Theory and Related

Fields, 170(3-4):933–960, 2018.

[10] Charles Bordenave, Pietro Caputo, and Justin Salez. Cutoff at the “entropic time” for sparse Markov chains. Probability Theory

and Related Fields, 173(1-2):261–292, 2019.

[11] Xing Shi Cai, Pietro Caputo, Guillem Perarnau, and Matteo Quattropani. Rankings in directed configuration models with

heavy tailed in-degrees. The Annals of Applied Probability, 33(6B):5613–5667, 2023.

[12] Fan R. K. Chung. Spectral Graph Theory, volume 92 of CBMS Regional Conference Series in Mathematics. American Mathe-

matical Society, Providence, RI, 1997.

[13] Colin Cooper and Alan Frieze. The cover time of the preferential attachment graph. Journal of Combinatorial Theory, Series

B, 97(2):269–290, 2007.

[14] Alessandro Garavaglia and Clara Stegehuis. Subgraphs in preferential attachment models. Advances in Applied Probability,

51(3):898–926, 2019.

[15] Rajat Subhra Hazra, Remco van der Hofstad, and Rounak Ray. Percolation on preferential attachment models. arXiv preprint

arXiv:2312.14085, 2023.

[16] Jonathan Hermon, Allan Sly, and Perla Sousi. Universality of cutoff for graphs with an added random matching. The Annals

of Probability, 50(1):203–240, 2022.

[17] Eyal Lubetzky and Allan Sly. Cutoff phenomena for random walks on random regular graphs. Duke Mathematical Journal,

153(3):475–510, 2010.

[18] Russell Lyons, Robin Pemantle, and Yuval Peres. Ergodic theory on Galton–Watson trees: Speed of random walk and dimension

of harmonic measure. Ergodic Theory and Dynamical Systems, 15(3):593–619, 1995.

[19] Milena Mihail, Christos Papadimitriou, and Amin Saberi. On certain connectivity properties of the internet topology. Journal

of Computer and System Sciences, 72(2):239–251, 2006.

[20] Remco van der Hofstad and Haodong Zhu. Logarithmic typical distances in preferential attachment models. The Annals of Applied Probability, 2025. To appear; arXiv:2502.07961.

1

Department of Mathematics, Princeton University, Princeton, NJ 08540, USA

Email address: allansly@princeton.edu

Email address: syeon.y@princeton.edu
