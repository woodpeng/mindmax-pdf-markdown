Draft version November 4, 2026

Typeset using LATEX twocolumn style in AASTeX7

On the Proper 3D Modeling of Orbits in Wide Binary Gravity Tests

[Kyu-Hyun Chae ](http://orcid.org/0000-0002-6016-2736),1, ∗ Hyoseok Park,2 [and Youngsub Yoon ](http://orcid.org/0000-0002-0096-4702)1

1

Department of Physics and Astronomy, Sejong University, 209 Neungdong-ro Gwangjin-gu, Seoul 05006, Republic of Korea

2

Department of Physics, Chungnam National University, 99 Daehak-ro, Yuseong-gu, Daejeon 34134, Republic of Korea

ABSTRACT

A gravitationally-bound system of wide binary stars with precise 3D relative displacement r and velocity v can allow a Keplerian orbit reconstruction for an assumed gravitational parameter G. A

sufficiently large sample of such systems can also be used to directly infer G specific to the sample. A recent study argued that treating the semi-major axis (a) explicitly free with an empirical prior imposed on it can dramatically change the inference of G in the Chae et al. sample of 36 wide binaries. Here we introduce and test a Bayesian Markov chain Monte Carlo algorithm that allows a to be explicitly free (with or without a prior on a), and find using the α-Cen AB - proxima system and the Chae et al. sample that the explicit-a algorithm with an observational constraint is fully equivalent to the implicit-a algorithm with an internal consistency relation involving the sky-projected separation s. For the α-Cen AB - proxima system, we present orbits in Milgromian (MOND) as well as Newtonian gravity models. We show that a recent claim of Newtonian gravity from the Chae et al. sample is a consequence of a fatal error in the code or arbitrarily enlarged errors. We discuss how wide binaries can be properly analyzed and modeled to probe gravity at low acceleration and test gravity models, including the necessity of deriving individual-specific parameters, the importance of follow-up observations for anomalous systems, and the relevance of Bayesian MCMC approaches.

Keywords: Astrodynamics (76) — Bayesian statistics: Posterior distribution (1926) — Markov chain

Monte Carlo (1889) — Wide binary stars (1801) — Gravitation (661)

## [1. INTRODUCTION](http://astrothesaurus.org/uat/1889)

An observed wide binary system of stars is believed to be at a phase of its gravitationally-bound orbit. Although measurements of the 3D relative displacement r and velocity v between the two stars can represent only an instantaneous state, its underlying orbit can, in principle, be reconstructed with a sufficiently precise set of (r, v) assuming that the orbit is Keplerian and gravitational parameter G takes a certain value such as the Newtonian value GN. This is because the number of the set (r, v) equals the number of orbit free parameters. A well-known example is provided by Proxima’s orbit around α-Cen AB (barycenter) as constructed by P. Kervella et al. (2017) and R. Akeson et al. (2021) assuming Newtonian gravity.

While wide binaries can be used to infer Newtonian orbits when the observed value of v(≡ |v|) is less than the Newtonian escape velocity vescN as in the α-Cen ABProxima system, wide binaries may also be used to infer γ(≡ G/GN) as recently introduced by a couple of studies (K.-H. Chae 2025, 2026). These studies use the logarith-

∗

corresponding author: chae@sejong.ac.kr

kyuhyunchae@gmail.com

√ mic parameter Γ([≡ log10](http://astrothesaurus.org/uat/661)

γ), which will also be used throughout in this work. Algorithms to infer Γ are based on the realization that there is a degeneracy between Γ and a set of orbit parameters (i.e., eccentricity e, true anomaly ∆ϕ, and semi-major axis a or 3D separation r) through the vis-viva equation, and the observed set (r, v) constrains the orbit parameters to some extent. Because the constraining power of (r, v) is not strong, the inferred probability density function (PDF) of Γ for an individual wide binary is usually so broad that standard and nonstandard gravities cannot be discriminated.

Nevertheless, the K.-H. Chae (2026) algorithm to infer Γ is useful in two important ways. First, the algorithm can be used to infer boosted gravity in an apparently anomalous pair, which appears to form an isolated binary system gravitationally associated with each other in the 3D space based on its observed characteristics (see K.-H. Chae et al. 2026) but cannot be gravitationally bound with v > vescN in Newtonian gravity. If Γ = 0 is imposed, such an anomalous system does not allow a viable orbit and thus cannot be analyzed in any meaningful way. Second, when a sufficiently large sample of N wide binaries is available, individual PDFs of Γ can be statistically consolidated to derive a much narrower

√ PDF with the width proportional to 1/

N .

The K.-H. Chae (2026) algorithm is a generalization of the standard parameter optimization procedure of fitting six model parameters of ΘNewton = {a, e, i, ϕ0, ∆ϕ, Ω} (in Newtonian gravity) to the observed set (r, v). Here, i is the angle of inclination, ϕ0 is the argument of the periastron, and Ω is the argument of the ascending node, while the other symbols have been defined above. Because the fitting procedure uses the same six mathematical relations (whose parametric forms may vary depending on the author) between the parameters and the measured quantities, the same data should always yield the same values of a, e, and ∆ϕ, but the values of the other angles depend on the frame where r and v are expressed.

When the equatorial coordinate system is used to express r and v (since it is a Cartesian frame to a good approximation for the 3D space containing the binary system once the spherical geometric (perspective) effects are corrected for), the two components rR.A. and rdecl. of r are extremely precisely measured by Gaia and thus they can be used as direct inputs into the mathematical (internal consistency) relations reducing the number of free parameters by two. In particular, the ratio rdecl./rR.A. is essentially exact because the distance factor cancels out while the sky-projected physical separa-

p tion s(≡

r2

R.A.

\+ r2

decl.

) of the second star (component B) from the first star (component A which is at the origin of the frame) inherits the uncertainty of dA (distance of A) which can be sufficiently small (e.g., ≲ 0.1% for the K.-H. Chae et al. (2026) sample). The K.-H. Chae (2026) algorithm directly uses rdecl./rR.A. and s as fixed inputs to the mathematical relations, which determine the semi-major axis a and the argument of the ascending node Ω from the other parameters.

S. M. Saad & Y.-S. Ting (2026) have recently questioned the K.-H. Chae (2026) algorithm for using a mathematical relation of parameters including a fixed s to reduce the number of free parameters. They argue that treating a as a free parameter along with an empirical prior rather than letting it be determined by the mathematical relation can dramatically change gravity inference. Their claim is unexpected because the mathematics of Keplerian orbits is fixed and the tiny measurement error of s ensures that it can be used as a fixed input into the mathematics, as pointed out above.

Considering the unexpected claim by S. M. Saad & Y.-S. Ting (2026), here we consider a purposely extended algorithm in which the semi-major axis is explicitly treated as a free parameter and the measured sky-projected separation s (along with its measurement uncertainty) is included in a likelihood (but not used as a constant in a mathematical relation), and present Bayesian results for example binary systems including the α-Cen - Proxima system and systems from the K.- H. Chae et al. (2026).

In this work, we carefully address the question of what the proper modeling of wide binary orbits should be in the posed problem of inferring gravity at low acceleration and testing gravity models using wide binaries. It will be explicitly shown that the introduction of a free parameter for the semi-major axis has negligible effects in the Bayesian inference of orbit parameters and Γ compared with the implicit-a algorithm of K.-H. Chae (2026). We will then show that the S. M. Saad & Y.-S. Ting (2026) claim of a Newtonian result from the K.-H. Chae et al. (2026) sample is due, in fact, to a fatal error in the code, or a consequence of arbitrarily enlarged errors for the measured quantities, in particular the skyprojected separation between the two stars. In this work, we will also explicitly show that the parameters of Proxima’s orbit inferred with the K.-H. Chae (2026) algorithm fully agrees with the P. Kervella et al. (2017) inference although two studies use completely independent algorithms and work in different reference frames. Then, we will present orbits obtained for MOND (M. Milgrom 1983, 2010) gravities as previous studies considered only Newtonian gravity.

The outline of the paper is as follows. We start with a brief description of the extended algorithm that includes the semi-major axis as a free parameter, highlighting only the difference from the K.-H. Chae (2026) algorithm (Section 2). In Section 3, we present results with the extended algorithm and compare them with other results including those with the K.-H. Chae (2026) algorithm and Proxima’s orbit inferred by P. Kervella et al. (2017). We discuss and conclude in Section 4. In Appendix A, we discuss how the perspective effects of the spherical geometry can be accurately accounted for through coordinate transformations. The extended algorithm treating the semi-major axis as a free parameter is available on Zenodo under an open-source Creative Commons Attribution license [\[DATASET\].](https://doi.org/10.5281/zenodo.23857950)

## 2. AN EXTENDED ALGORITHM WITH A FREE SEMI-MAJOR AXIS

Figure 1 shows a general 3D configuration of an elliptical orbit of a binary system in the equatorial frame. Under the assumption that the system is gravitationally bound and the orbit is Newtonian or pseudo-Newtonian with a general gravitational parameter G, the six components of the relative displacement r = (x′, y′, z′) and the relative velocity v = (vx′ , vy′ , vz′ ) in the observer’s x′y′z′ frame may be related by six mathematical relations to six parameters, i.e., a (semi-major axis), e (eccentricity), ϕ0 (argument of the periastron), and ϕ (phase for which the true anomaly ∆ϕ is given by ∆ϕ = ϕ − ϕ0), and two orientation parameters i (inclination) and θ (rotation about the z′ axis which is related to the argument of the ascending node Ω by Ω = π −θ in the figure). Under the stated assumptions, exact (extremely precise) values of r and v would uniquely determine all six parameters, and realistic values with measurement uncertainties will allow well-determined PDFs of the parameters.

𝑧𝑧

𝑖𝑖

𝑧𝑧′

𝑦𝑦′

𝑦𝑦

𝜓𝜓

𝜙𝜙 𝜙𝜙0

B

r

orbital

v

A

𝑥𝑥′

plane

𝜃𝜃

𝑥𝑥 𝑖𝑖

## Line of nodes

Figure 1. (Adapted from K.-H. Chae (2026)) A 3D geometry of an elliptical orbit of a binary expressed in the equatorial frame. The observer’s frame is described by the x′y′z′ coordinate system, where x′ is in the negative R.A. direction, y′ is in the positive decl. direction, and z′ is in the direction towards the observer.

In generalized(pseudo) Newtonian gravity, the motion of star B relative to star A (brighter) satisfies the orbit equation

a(1 − e2)

r =

, (1)

1 + e cos(ϕ − ϕ0) and the vis-viva equation

r

GNMtot

r

v =

γfM

2 − , (2)

r

a where Mtot(≡ MA + MB ) is the observationally estimated total mass, γ = G/GN, and fM is a factor to take into account the uncertainty of the observational mass.

The six observables of r and v are related to the six free parameters (a, e, i, ϕ0, ϕ, and θ) by the following six mathematical relations (see Appendix A of K.-H. Chae (2025)): 







b(≡ y′/x′)

− tan θ+tan ϕ cos i



p



 p

1+tan ϕ tan θ cos i

 

s

≡

x′2 + y′2

 =

 r

cos2 ϕ + sin2 ϕ cos2 i

 ,

z′

−r sin ϕ sin i

(3) and 







vx′

cos θ + tan ψ cos i sin θ 





 

vy′

 = kv| cos ψ|



− sin θ + tan ψ cos i cos θ

 , (4)

vz′

− tan ψ sin i

where r and v are given by Equations (1) and (2), k(= ±1) indicates the sign of the quantity dx/dϕ or sin ϕ + e sin ϕ0, and the variable ψ satisfies

cos ϕ + e cos ϕ0

tan ψ = −

. (5)

sin ϕ + e sin ϕ0

In Equation (3), two variables b = b(x′, y′) and s = s(x′, y′) are used instead of x′ and y′ themselves for reasons to be clear soon.

Any inference of the orbit and orientation parameters is based on the above six relations or equivalent ones. For ideal data with negligible errors for all six quantities of r and v, the above relations provide the equations that uniquely determine all six parameters and no statistical analysis is necessary. For real data with uncertainties, the only issue is how to implement the six relations. Here, it is important to note that if any of the six quantities in the left side of Equations (3) and (4) is(are) essentially exact (i.e. extremely precise with negligible error(s)), the relation(s) including that quantity(-ies) provide(s) the mathematical constraint(s) (i.e., consistency relation(s)) for the involved parameters, and the quantity(-ies) need(s) not be included in a likelihood of the fitting problem. This means that the mathematical constraint(s) reduce the number(s) of free parameters because one parameter per constraint is automatically determined from the other parameters.

Let αI and δI denote the measured R.A. and the decl. of star I (I = A, B hereafter) in units of degrees and dI denote the measured distance of star I in units of parsec(pc), then we have the observed ratio

−1

∆δ

δA + δB

bobs = −

cos

, (6)

∆α

360/π

and the observed sky-projected separation of B from A in the plane defined in Figure 1

s

18

δA + δB

sobs =

dA

cos2

(∆α)2 + (∆δ)2 kau,

5

360/π

(7) where ∆α ≡ αB − αA and ∆δ ≡ δB − δA. In Equation (7), we use dA (not the error-weighted mean of dA and dB as in K.-H. Chae (2026)) because the actual measurement uncertainty of sobs will be considered. Since the Gaia measured ∆α and ∆δ have negligible errors, bobs can be treated as a constant and the error of sobs is due solely to the error of dA. With bobs the parameter θ is a variable dependent on the other fitted parameters through

tan ϕ cos i − bobs

tan θ =

. (8)

1 + bobs tan ϕ cos i

Now for wide binaries under consideration in 3D orbit modeling (K.-H. Chae et al. 2026), dA from Gaia DR3 has a typical error of ≲ 0.1%. Since this fractional error is at least an order-of-magnitude smaller than those for z′ and the velocity components, one may treat it as a constant: this is the approach taken by K.-H. Chae (2026). However, in this work sobs along with its uncertainty will be treated as an observational constraint rather than a constant. In doing so, the semi-major axis a is treated as an independent variable.

The other observational quantities are given as follows:

z′obs = −(dB − dA)648/π kau, (9)

and



vx′,obs = −4.7404dM (μ⋆

− μ⋆ ) m s−1

 

α,B

α,A

vy′,obs = 4.7404dM (μδ,B − μδ,A) m s−1

, (10)

 

vz′,obs = −1000(RVB − RVA) m s−1

where μ⋆

α,I

and μδ,I are PMs in the R.A. and decl. directions given in units of of mas yr−1, and RVI are the measured RVs given in units of km s−1. Here, PMs and RVs have been corrected for the spherical geometric (perspective) effects using the convenient prescriptions given by Y. Yoon et al. (2025), and thus error-weighted mean distances (dM) are used to derive vx′,obs and vy′,obs for the perspective effect-corrected PMs.

The Bayesian approach of K.-H. Chae (2026) is followed with the adjustments introduced above. The observed quantities to constrain the model parameters are Xobs = {sobs, z′obs, vx′,obs, vy′,obs, vz′,obs}, and their model predictions (Xmod) are given in Equations (3) and (4). The model free parameters for the general case are Θ = {a, e, i, ϕ0, ∆ϕ(≡ ϕ − ϕ0), fM , Γ}. Only the parameter θ is a dependent variable through Equation (8). The posterior probability distribution of the parameters p(Θ) is given by

X

ln p(Θ) = ln L +

ln fpr(Θl), (11)

l

where L is the likelihood function, and fpr(Θl) (l = 1, · · · , 7) is the prior probability density function for the parameter Θl. The likelihood function is defined by

"

\#

X

2

1

Xmod,j(Θ) − Xobs,j

ln L = −

\+ ln(2πσ2j )

,

2

σj

j

(12) where {Xmod,j(Θ)} (j = 1, · · · , 5) are the model predictions while Xobs,j and σj are the observed quantities and their uncertainties. The physical ranges of the angular variables are 0 ≤ i ≤ π, 0 ≤ ϕ0 < 2π, 0 ≤ ∆ϕ < 2π, and −π ≤ θ < π. However, the calculation is actually performed for −π ≤ i ≤ π and −π/2 < θ < π/2 (the range allowed by Equation (8)) using mathematical transformations to the physical ranges described in K.-H. Chae (2026).

The priors on the parameters are given as follows: fpr(e) = 2e (the thermal probability distribution), fpr(i) = | sin(i)|, fpr(ϕ0) = uniform, and

(1 − e2)3/2

1

fpr(∆ϕ) =

. (13)

2π

[1 + e cos(∆ϕ)]2 For fM , a lognormal probability distribution with mean = 0 and s.d. = 5% is assumed. When gravity is free, a flat prior is assumed for Γ in the range −1 < Γ < 1. Finally, for the semi-major axis a, the following prior is considered for A ≡ ln(a/kau):

(

exp(−0.6Abreak) for A ≤ Anreak fpr(A) = c

, (14)

exp(−0.6A) for A > Anreak

where Abreak = ln(5) and c is the normalization factor determined for the range (Amin, Amax) with Amin ≡ −1 + ln(sobs/kau) and Amax ≡ 2.5 + ln(sobs/kau). A prior equivalent to the prior of Equation (14) was introduced by S. M. Saad & Y.-S. Ting (2026) based on J. J. Andrews et al. (2017). This prior will be considered only to test its possible effects in Bayesian inferences. In testing the effects of treating a as a free parameter, the prior of Equation (14) will not be implemented for a consistent comparison with the results based on the algorithm of K.-H. Chae (2026).

The numerical procedure to derive the posterior distribution p(Θ) is the same as described in K.-H. Chae (2026): Markov chain Monte Carlo (MCMC) procedure is performed with the public Python package emcee (D. Foreman-Mackey et al. 2013).

## 3. RESULTS WITH THE EXTENDED ALGORITHM AND COMPARISON WITH OTHER RESULTS

For the purpose of testing the effects of how the semimajor axis a is treated, we consider binary systems for which detailed orbit solutions are available from independent studies. First, we consider the binary of stars HD 189739 and HD 189760 (Binary #24 from R. Saglia et al. (2025)). This is one of the systems from the recent compilation by K.-H. Chae et al. (2026) that does not allow bound Newtonian orbits and indicates Γ > 0 based on the K.-H. Chae (2026) algorithm that uses the sky-projected separation sobs as a numerical constant and treats a as a dependent variable. It is interesting whether the extended algorithm can modify the K.-H. Chae (2026) inference in a meaningful way. Second, we consider the α-Cen AB - Proxima system that has exceptional-quality data and thus provides an ideal system to compare results with various algorithms.

The left panel of Figure 2 shows posterior PDFs of the parameters in the extended algorithm for the binary of HD 189739 and HD 189760. The right panel shows the PDFs of the parameters in the K.-H. Chae (2026) algorithm. In that algorithm, a is a dependent variable that is determined by

1 + e cos(ϕ − ϕ0)

a = sobs

p

(15)

(1 − e2)

cos2 ϕ + cos2 i sin2 ϕ

for the observed sobs (ignoring the tiny measurement error) and the other fitted parameters. The PDFs of the fitted parameters with the extended algorithm are consistent with those of the K.-H. Chae (2026) algorithm. Also, as the inset in the right panel shows, the distribution of directly fitted a agrees well with that inferred with Equation (15) for the parameters fitted with the K.-H. Chae (2026) algorithm. If the prior given by Equation (14) is imposed on a in using the extended algorithm, the inferred distribution is mildly changed as shown by the dotted curve.

Figure 2. This figure shows posterior PDFs of parameters for the binary of HD 189739 and HD 189760. The left panel is based on the extended algorithm of this work in which the semi-major axis (a) is fitted simultaneously with the other parameters, while the right panel is based on the K.-H. Chae (2026) algorithm in which a is not a free parameter but a variable dependent on the other parameters through a mathematical constraint. The inset compares the distributions of a in both cases, which agree well with each other. The dotted curve in the inset shows the distribution of a with the prior of Equation (14) imposed.

Because all parameters are equivalently constrained whether a is fitted explicitly or implicitly, the inference of Γ is also unaffected, as shown in Figure 3. Newton is completely inconsistent with this system because the PDF declines more sharply than a Gaussian curve (the nominal 68% confidence interval does not correctly capture the whole PDF). Thus, as long as systems such as this are not excluded by a prior choice, the K.-H. Chae (2026) sample as a whole cannot agree with Newton simply by treating a as an explicitly free parameter, as shown in the left panel of Figure 4. The consolidated value of Γ = 0.112+0.025

−0.023

is fully consistent with the value of Γ = 0.102+0.028

−0.021

obtained by K.-H. Chae et al. (2026) with the K.-H. Chae (2026) algorithm in which a is implicitly determined.

Figure 3. This figure shows posterior PDFs of Γ from various runs of Bayesian MCMC modeling for the binary of HD 189739 and HD 189760. With the given data (R. Saglia et al. 2025), Newton is completely excluded whether the semi-major axis is fitted implicitly (K.-H. Chae 2026) or explicitly with or without the prior of Equation (14). Newton would be consistent with this system only if some data had much larger errors than reported. Here cases of adding an arbitrary jitter error (σjit) to the relative radial velocity are shown as examples of easing tension with Newton.

In contrast to the above results, which unambiguously prove that whether fitting a implicitly or explicitly is not an issue, S. M. Saad & Y.-S. Ting (2026) claimed that γ ≈ 1.0 resulted for the K.-H. Chae et al. (2026) sample in their baseline model where a is an explicitly free parameter. Then, the question is how they got such a result, as treating a as a free parameter cannot be the cause. In their paper, they state that they correctly use a median error of 0.1% for the projected separation s (the last paragraph of their Section 2). We notice that their modeling introduces jitter errors for the relative velocity components whose values are not specified in their paper. Taking their words in their paper, we first perform some numerical exercises to investigate possible effects of arbitrary jitter errors for the relative radial velocity which has the largest observational uncertainty1: σjit = 100 m s−1, 200 m s−1, and 250 m s−1, which are 2.5, 5.0, and 6.25 times as large as the estimated error. For σjit = 100 m s−1, Newton is still inconsistent, but tension with Newton is significantly lessened with σjit ≳ 200 m s−1. In cases like the latter one, the K.-H. Chae et al. (2026) sample would be consistent with Newton, as shown in the right panel of Figure 4, given that this binary is one of the most anomalous systems based on the reported errors. However, errors of ≳ 200 for this system are not viable based on the available data.

Figure 4. This figure shows posterior PDFs of Γ for all 36 wide binaries from the ‘clean’ sample by K.-H. Chae et al. (2026). The consolidated PDF of the individual PDFs and a QUMOND prediction are also displayed. The left panel shows the result with the measurement errors as given by observations. The right panel shows a hypothetical result with an arbitrary jitter error of 250 m s−1 uniformly added to the relative radial velocities vr (= vz′ ) of all wide binaries.

Given that large uniform jitter errors for vr are not viable for the K.-H. Chae et al. (2026) sample, we have checked their code itself2 and noticed a fatal error in their implementation of s. They set the error of their s as the maximum of 0.05 × s and

q σd

≡ 0.5 ×

σ2dA + σ2dB

1

The nominal uncertainties of radial velocities are extremely small for systems such as the binary of HD 189739 and HD 189760, but the uncertainty of correcting for gravitational redshift and convective blueshift is estimated to be 40 m s−1 (R. Saglia et al. 2025).

2

https://github.com/seratsaad/wb3d-gamma

3

Please see lines 105 and 106 of run gamma analysis.py.

.3 The latter is almost always larger than the former and of the same order as s or even much larger in some cases, as shown in Figure 5. This does not agree with a median error of 0.1% that they quote in their paper. The large errors actually used by their ‘baseline model’ mean that their orbits are essentially independent of the measured velocity components used in the modeling. Their orbits are statistically assigned using their prior on a (Equation (14)) irrespective of the actually observed orbit scale. The agreement of the baseline model results with Newton is not a valid or meaningful result but a consequence of this effective distortion of the data.

Figure 5. This figure shows the distribution of σd/s in 36 wide binaries used by S. M. Saad & Y.-S. Ting (2026). For most wide binaries, σd is the actual error for s used in the baseline model based on the open code.

Then, since their geometric (deprojection) model (in which the observed s is used as a self-consistency relation) returns a correct result agreeing with that by K.-H. Chae et al. (2026), their baseline model with correct errors for s should agree with the geometric model result if all the other calculations are consistent. We therefore recalculated the baseline model by replacing the incorrect errors of s with much smaller errors of 5% or 1%.4 The results are shown in Figure 6. The agreement between the baseline and the geometric results is much better now than in the original results by S. M. Saad & Y.-S. Ting (2026). However, the agreement is not as good as that between the a-implicit result based on the K.-H. Chae (2026) algorithm and the a-explicit result based on the extended algorithm presented here. It is unclear where the difference comes from, as the difference between the baseline and the geometric results should disappear as the error of s gets smaller and smaller. Despite the remaining small difference, this numerical exercise clearly shows that the absurdly large errors of s used by the baseline model were indeed responsible for the Newtonian result by S. M. Saad & Y.-S. Ting (2026).

Figure 6. This figure compares original results by S. M. Saad & Y.-S. Ting (2026) based on extremely large errors of s (as shown in Figure 5) with the results produced in this work with the same code but based on much smaller errors of 5% or 1%.

4

We have also tried a 0.1% error for s, but the numerical procedure did not converge well; however, 5% or 1% error for s seems to constrain the orbit sufficiently well.

All the above tests are based on the six mathematical relations given by Equations (3) and (4) between the six observables and the six parameters, and the tests are mainly concerned with possible effects of how to fit the semi-major axis a. These equations represent a possible formulation (parameterization) of the same astrodynamics that is assumed to be Keplerian with generalized G. It is of interest to further test the extended algorithm presented in this work with a completely independent orbit calculation that does not use the parametrization of this work. For this purpose, the α-Cen AB - Proxima system is ideal as they provide exceptional data for which an independent orbit solution is available (P. Kervella et al. 2017). Although updated (perhaps more reliable) data may be available, we will use only the data presented in P. Kervella et al. (2017) so that the results with the algorithm of this work can be consistently compared with those of P. Kervella et al. (2017).

Because the effects of the spherical geometry are important for the large angular separation of ≈ 2.2◦ between α-Cen AB (barycenter) and Proxima, Equation (10) cannot be used to estimate relative velocity components from measured PMs and RVs. P. Kervella et al. (2017) obtained the components of the relative displacement and velocity between α-Cen AB and Proxima in the Galactic frame and obtained their orbit solutions in that frame. In the algorithms of K.-H. Chae (2026) and this work, the (local) Cartesian framework defined by Figure 1 is used. The components of v in the x′y′z′ frame may be computed taking into account the effects of the spherical geometry using the formulae given in Y. Yoon et al. (2025). Although the precision of the derived components of v based on the Y. Yoon et al. (2025) formulae is adequate for the test, we find that the coordinate transformations described in Appendix A provide slightly more accurate components of v whose transformed components in the Galactic frame match the relative velocity components obtained by P. Kervella et al. (2017).

Since P. Kervella et al. (2017) presented orbit solutions in Newtonian gravity, we first obtain solutions in Newtonian gravity for the purpose of comparing independent statistical inferences for the same data. P. Kervella et al. (2017) and this work are different in three aspects. First, P. Kervella et al. (2017) worked in the Galactic frame while this work uses the local Cartesian frame defined by Figure 1. Second, P. Kervella et al. (2017) used a classical Monte Carlo approach in which 105 sets of {Mtot, r, v} consistent with random fluctuations were used to derive distributions of the parameters, while this work employs the Bayesian MCMC approach and uses 2×106 sets of models to derive the PDFs of the parame-ters. Finally, this work tests cases with or without priors on the parameters while the classical approach does not incorporate priors.

Figure 7. This figure exhibits obit solutions in fixed G = γGN for Proxima (P. Kervella et al. 2017) with the algorithm of this work. The left panel presents the Newtonian solution without any prior on any of the six orbit and orientation parameters. The middle panel shows the Newtonian solution with the standard priors of this work (i.e., all the priors except for the prior of Equation (14) on a). The right panel shows the solution with the standard priors in boosted gravity with γ = 1.4.

As in the binary of HD 189739 and HD 189760, the explicit-a algorithm and the implicit-a algorithm give completely equivalent results for the α-Cen - Proxima system given the same priors. Thus, we show only the explicit-a results. The left panel of Figure 7 shows the PDFs of the parameters in Newtonian gravity without any priors on the orbit and orientation parameters, while the middle panel shows the results with the standard priors of this work. The no-prior case can be more directly compared with the P. Kervella et al. (2017) results. Although this work and P. Kervella et al. (2017) use different frames, we can test whether orientation-independent parameters, i.e., eccentricity (e), semi-major axis (a), and orbit true anomaly (∆ϕ) agree between the two results.

P. Kervella et al. (2017) obtained e = 0.50+0.08

−0.09

, a = 8.7+0.7

−0.4

kau, and ∆ϕ = 177.6+10.4

−15.5

degrees (estimated from their values of period and ‘epoch of periastron’). The no-prior output from this work gives e =

0.45+0.11

−0.13

, a = 9.1+0.9

−0.6

kau, and ∆ϕ = 179.8+6.9

−7.9

degrees. The two results agree within the estimated uncertainties. However, there are some qualitative differences regarding the estimated uncertainties. The MCMC results have somewhat larger uncertainties for e and a but smaller uncertainties for ∆ϕ. In particular, the uncertainties of ∆ϕ from the classical MC procedure are ≈ 2 times as large as those from the MCMC procedure. Uncertainties of orbits can be represented by any parameters but the classical MC procedure tends to assign uncertainties more heavily on ∆ϕ than the MCMC procedure. This shows that how models are sampled (i.e., independent or Markov chain) can somewhat matter for the present problem, although the two results are statistically well consistent. With the standard priors (the middle panel of Figure 7), the MCMC procedure returns e = 0.51+0.10

−0.11

, a = 8.7+0.8

−0.6

kau, and ∆ϕ = 180.2+5.8

−6.4

degrees. Interestingly, the values of e and a with the priors better match the values obtained by P. Kervella et al. (2017).

It is of interest how the inference of orbits is affected if gravity is modified from Newton since the mutual internal Newtonian acceleration is in the MOND (M. Milgrom 1983) regime. The right panel of Figure 7 shows the results for γ = 1.4 which is a typical boost factor predicted by MOND gravity (I. Banik & H. Zhao 2018; K.-H. Chae & M. Milgrom 2022; J. PflammAltenburg 2025): e = 0.64+0.07

−0.08

, a = 7.9+0.6

−0.5

kau, and ∆ϕ = 180.1+3.3

−3.5

degrees. Although not shown in a figure, the results with γ = 1.255 (which corresponds to the specific prediction of J. Pflamm-Altenburg (2025)) are e = 0.60+0.08

−0.09

, a = 8.1+0.6

−0.4

kau, and ∆ϕ = 180.2+3.9

−4.2

degrees. Thus, MONDian boosted gravity predict somewhat more eccentric orbits. Here, it is interesting to note that wide binaries of large separations like the present system statistically prefer more eccentric orbits than e ≈ 0.5 (H.-C. Hwang et al. 2022). A robust prediction of the Bayesian MCMC procedure in all cases of γ considered is that Proxima is almost right at the apastron phase. The P. Kervella et al. (2017) MC procedure also predicts such a phase but with much larger uncertainties.

## 4. DISCUSSION AND CONCLUSIONS

Wide binary gravity tests have been maturing to the point that accurate 3D relative velocities between the two stars have been measured and 3D orbit modeling has been performed, resulting in discoveries of individual anomalous systems (R. Saglia et al. 2025; K.-H. Chae et al. 2026) and statistical inferences of the effective gravitational parameter G or the boost factor γ (or Γ) (K.-H. Chae 2026; K.-H. Chae et al. 2026). While anomalous systems can be detected by comparing the magnitude of the measured 3D relative velocity v with an upper bound on the Newtonian escape velocity even without any detailed 3D orbit modeling, a statistical inference of γ in a sample relies on a correct methodology.

In light of the confusion in the literature (S. M. Saad & Y.-S. Ting 2026), we have carefully examined all key issues of 3D modeling and statistical inference. A 3D modeling of a wide binary system refers to fitting six parameters (four orbit parameters in the orbit plane and two orientation parameters with respect to the observer) to six observable components of r and v (in practice, the total mass of the system is also a free parameter and the measured mass provides the corresponding observable). Once Keplerian orbits are assumed (a completely valid assumption to test Newtonian gravity), the six equations (i.e., the mathematics) are fixed. Various coordinate frames and parameterization can be used for the same mathematics. There are several important points that have been addressed in this work.

First, it does not matter whether an equation involving extremely precise observable(s) is used as a fixed internal mathematical relation to be satisfied by relevant parameters or is used as an explicit observational constraint with the measured uncertainty. This is explicitly tested in this work regarding how to use the observed sky-plane separation sobs between the two stars. In the first option, the fixed equation (Equation (15)) can be used as an internal relation to make the semi-major axis a a variable dependent on the other parameters, while in the second option, it is explicitly used as an observable to be included in the likelihood (Equation (12)), so that a is treated explicitly free and fitted simultaneously together with the other parameters. The two options give equivalent Bayesian results, as demonstrated in Figure 2 and Figure 4. The claim by S. M. Saad & Y.- S. Ting (2026) that treating a explicitly free can change the Bayesian inference dramatically is invalid and logically impossible.

p

Second, a relation in Equation (3) given by s = r

cos2 ϕ + sin2 ϕ cos2 i (or an equivalent equation in any other parameterization) is one of the six fundamental equations that must be used to properly constrain the parameters. S. M. Saad & Y.-S. Ting (2026) describes it as a deprojection5 equation in a misleading way (as if it is an arbitrary or special assumption) when sobs is used in an internal mathematical relation (assuming that the observational uncertainties of ≲ 0.1% can be set to zero). Whether it is used as an input to the likelihood (their baseline model) or as the internal mathematical relation should not make any tangible difference as long as the actual small uncertainties are used, as verified in this work in which the equation is included in the likelihood.

Third, statistical inferences depend critically on the uncertainties of the measured quantities. Arbitrarily enlarging or lowering reported uncertainties (particularly based on observations such as Gaia’s) would be a bad practice. S. M. Saad & Y.-S. Ting (2026) obtained a Newtonian result through their baseline model for the K.-H. Chae et al. (2026) sample. How to treat a or how to use sobs cannot be responsible for such a result as demonstrated in this work. We have then found that their result of γ ≈ 1.0 is actually due to a fatal error in their code regarding the input error of the observed projected separation. Their code effectively distorted the data given by K.-H. Chae (2026) to get the Newtonian result.

Fourth, it is verified that the approximate Cartesian frame centered on a star defined by Figure 1 can be used even for the α-Cen AB - Proxima system although the angular separation is not as small as those in typical wide binaries with distances ≳ 10 pc. This is feasible because the physical components of v in the x′y′z′ frame can be accurately obtained by coordinate transformations (Appendix A). The agreement between this work and P. Kervella et al. (2017) based on the same data provides a crosscheck of two numerical procedures.

Finally, which MC procedure is used to derive PDFs of the parameters can matter for estimating uncertainties of the parameters, as illustrated for the α-Cen AB - Proxima system. Bayesian MCMC procedure (this work) and a classical MC procedure (P. Kervella et al. 2017) return different estimates of uncertainties for the orbit true anomaly although the most likely values match well.

As explicitly proven in this work, the mathematical and statistical framework described in K.-H. Chae (2026) and here can be used to properly model 3D orbits and infer gravity in a wide binary sample. One can take either option of explicitly or implicitly fitting the semi-major axis depending on how the observed skyprojected separation is implemented (the two options are fully equivalent for samples of highest-quality such as that of K.-H. Chae et al. (2026)). It seems that S. M.

5

The concept of deprojection does not apply here as all six parameters are directly fitted to the six observables. The concept of deprojection was introduced by K.-H. Chae (2023) when the sky-plane 2D vectors were statistically deprojected into the 3D space.

Saad & Y.-S. Ting (2026) obtained γ ≈ 1.0 by effectively distorting the data of K.-H. Chae et al. (2026), but made a misleading argument about the modeling procedure. This does not mean that there are no important issues in wide binary gravity tests based on 3D data, and scientific investigations should focus on real issues such as the following (see also K.-H. Chae et al. (2026)):

- It is important to derive individual-specific PDFs of orbit parameters along with Γ for three reasons. First, we can check whether a system is physically plausible with the derived parameters. This is particularly important when a system appears anomalous from a Newtonian point of view. In such a case, we can investigate modified gravity that may allow viable orbits. Second, individual inferences of Γ (in modeling with free gravitational parameter) are needed to investigate the trend of any anomaly with the internal Newtonian acceleration, as such a trend can discriminate various modified gravity predictions (although the current sample size is not sufficient for this purpose). Finally, individual-specific results are important to understand where the signal for (or against) modified gravity comes from. A population-level result through a ‘black box’ without properly understanding where the signal comes from may well produce an incorrect result by tweaking/distorting the modeling procedure and/or data. This is particularly a concern in a sensitive topic such as the present one, as one can easily be tempted to dis-

tort something for “good” reason to get the “right” result.

- For anomalous systems, follow-up observations such as RV monitoring and Speckle interferometric imaging need to be made to verify or disprove the anomalous nature.

- For typical wide binaries with measured radial separations of limited precision (as the radial separations are ≲ 0.1% of the distances), the six observables of r and v, unlike the α-Cen system, cannot constrain well all the parameters without reasonable priors. Thus, Bayesian modeling may be the only reasonable numerical procedure.

In conclusion, the Bayesian general algorithm presented in K.-H. Chae (2026) and extended in this work are extensively verified and can be used to properly infer orbits and Γ in an explicit-a way or more economical implicit-a way. The algorithm is particularly useful in analyzing and understanding individual systems. A proper test of gravity with wide binaries requires properly understanding all individual systems.

ACKNOWLEDGMENTS

The author thanks P. Kervella for helpful communications on the α-Cen system. The author thanks all the collaborators of the ongoing project to measure gravity from wide binary samples based on the algorithms discussed in this work. This work was supported by the National Research Foundation of Korea (NRF) grant funded by the Korea government (MSIT) (RS- 2026-25492976).

REFERENCES

Akeson, R., Beichman, C., Kervella, P., Fomalont, E., &

Benedict, G. F. 2021, AJ, 162, 14,

[doi: 10.3847/1538-3881/abfaff](http://doi.org/10.3847/1538-3881/abfaff) Andrews, J. J., Chanam´e, J., & Ag¨ueros, M. A. 2017,

MNRAS, 472, 675, doi: 10.1093/mnras/stx2000 Banik, I., & Zhao, H. 2018, MNRAS, 480, 2660,

[doi: 10.1093/mnras/sty2007](http://doi.org/10.1093/mnras/sty2007) Chae, K.-H. 2023, ApJ, 952, 128,

[doi: 10.3847/1538-4357/ace101](http://doi.org/10.3847/1538-4357/ace101) Chae, K.-H. 2025, ApJ, 985, 210,

[doi: 10.3847/1538-4357/adce09](http://doi.org/10.3847/1538-4357/adce09) Chae, K.-H. 2026, ApJL, 998, L43,

[doi: 10.3847/2041-8213/ae40ef](http://doi.org/10.3847/2041-8213/ae40ef) Chae, K.-H., Lee, B.-C., Hernandez, X., et al. 2026, arXiv

e-prints, arXiv:2601.21728,

[doi: 10.48550/arXiv.2601.21728](http://doi.org/10.48550/arXiv.2601.21728) Chae, K.-H., & Milgrom, M. 2022, ApJ, 928, 24,

[doi: 10.3847/1538-4357/ac5405](http://doi.org/10.3847/1538-4357/ac5405) Foreman-Mackey, D., Hogg, D. W., Lang, D., & Goodman,

J. 2013, PASP, 125, 306, doi: 10.1086/670067 Hwang, H.-C., Ting, Y.-S., & Zakamska, N. L. 2022,

MNRAS, 512, 3383, doi: 10.1093/mnras/stac675 Kervella, P., Th´evenin, F., & Lovis, C. 2017, A&A, 598, L7,

[doi: 10.1051/0004-6361/201629930](http://doi.org/10.1051/0004-6361/201629930) Milgrom, M. 1983, ApJ, 270, 365, doi: 10.1086/161130 Milgrom, M. 2010, MNRAS, 403, 886,

[doi: 10.1111/j.1365-2966.2009.16184.x](http://doi.org/10.1111/j.1365-2966.2009.16184.x) Pflamm-Altenburg, J. 2025, A&A, 703, A68,

[doi: 10.1051/0004-6361/202555656](http://doi.org/10.1051/0004-6361/202555656) Saad, S. M., & Ting, Y.-S. 2026, The Open Journal of

Astrophysics, 9, 70182, doi: 10.33232/001c.170182 Saglia, R., Pasquini, L., Patat, F., et al. 2025, A&A, 699,

[A151, doi: 10.1051/0004-6361/202555115](http://doi.org/10.1051/0004-6361/202555115)

Yoon, Y., Tian, Y., & Chae, K.-H. 2025, ApJ, 992, 102,

[doi: 10.3847/1538-4357/ae0190](http://doi.org/10.3847/1538-4357/ae0190)

APPENDIX

## A. TAKING INTO ACCOUNT THE PERSPECTIVE EFFECTS IN THE SPHERICAL COORDINATES THROUGH COORDINATE TRANSFORMATIONS

When the angular separation between binary stars is not sufficiently small, the differences in the PMs and RVs of the two stars through Equation (10) do not provide physical relative velocities. The problem is most conspicuous in the binary of α-cen AB and Proxima. Here we describe an accurate and simple method to obtain the correct relative velocities in the local Cartesian frame centered on a star (the x′y′z′ frame in Figure 1).

Let star I (I = A, B) have αI (R.A.), δI (decl.), dI (distance from the Sun), μ⋆

α,I

(PM in the R.A. direction), μδ,I (PM in the decl. direction), and RVI (radial velocity). Let the equatorial frame be described by the spherical polar coordinates (r, θ, ϕ) = (d, π/2 − δ, α) and the Cartesian coordinates (X, Y, Z) defining the frame. The two stars have measured velocities in the spherical coordinates as Vr,I = RVI , Vθ,I = −f × dI × μδ,I , and Vϕ,I = f × dI × μ⋆

α,I

where f is the conversion factor as in Equation (10). These velocities can be transformed to the XY Z frame as







 



VX,I

sin θI cos ϕI cos θI cos ϕI − sin ϕI

Vr,I







 



|  VY,I  =  sinθI sinϕI | cosθI sinϕI | cosϕI |  Vθ,I . | (A1) |
| --- | --- | --- | --- | --- |
| VZ,I cosθI | −sinθI | 0 | Vϕ,I |  |

The relative velocities in this frame are obtained by vX ≡ VX,A − VX,B , vY ≡ VY,A − VY,B , and vZ ≡ VZ,A − VZ,B .

Let the physical relative velocities in the local Cartesian frame centered on star A be denoted by vr , vθ , and vϕ. They can be obtained by







 



vr

sin ¯θ cos ¯ϕ sin ¯θ sin ¯ϕ cos ¯θ

vX







 



|  vθ  =  cosθcosϕ | cosθsinϕ | −sinθ  vY , | (A2) |
| --- | --- | --- | --- |
| vϕ −sinϕ¯ | cosϕ¯ | 0 vZ |  |

where ¯θ = (θA + θB )/2 and ¯ϕ = (ϕA + ϕB )/2. Then, the perspective effects in the observed PMs and RVs can be corrected for by modifying the values of one star, e.g. star A, as follows:



μ⋆

→ μ⋆

\+ vϕ/(f × ¯d)

 

α,A

α,B

μδ,A → μδ,B − vθ /(f × ¯d)

, (A3)

 

RVA → RVB + vr

where ¯d = (dA + dB )/2 (in practice we use the error-weighted mean which makes a negligible difference). This method returns the velocity of Proxima relative to α-Cen AB in the x′y′z′ frame of Figure1 as follows: vx′ = 0.023 ± 0.025 km s−1, vy′ = 0.188 ± 0.027 km s−1, and vz′ = 0.196 ± 0.032 km s−1. The magnitude of the 3D velocity is v = 0.273 ± 0.030 km s−1 that agrees well with v = 0.273 ± 0.049 km s−1 given by P. Kervella et al. (2017). However,

q we note that the error of v quoted by P. Kervella et al. (2017) corresponds to

σ2vx′ + σ2vy′ + σ2vz′ while the error

q estimated here corresponds to

σ2vx′ v2x′ + σ2vy′ vy′ 2 + σ2vz′ vz′ 2/v. This difference is irrelevant because only the velocity components with equivalent errors are used in both modeling procedures.
