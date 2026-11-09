### A PRACTICAL CAUSAL FRAMEWORK FOR AUTONOMOUS MOBILE ROBOTS: FROM SIMULATION TO REAL-WORLD HUMAN ENVIRONMENTS

| Luca Castri University of Padua, Italy lucacastri94@gmail.com | Gloria Beraldo University of Padua, Italy National Research Council of Italy gloria.beraldo@cnr.it | Nicola Bellotto University of Padua, Italy nbellotto@dei.unipd.it |
| --- | --- | --- |
|  | ABSTRACT |  |

Causal inference has emerged as a powerful paradigm enabling robots to make safe, efficient decisions

by reasoning about the “why” behind events. However, its real-world application is hindered by the difficulty of collecting causal data, especially in human-populated environments where training takes time, while users expect immediate operation. To this end, we tackle the challenge of transferring simulation-learnt causal relations to the real world with minimal effort. While retaining the invariant high-level causal structure, we empirically demonstrate the system adapts efficiently to real-world situations by updating only the causal model parameters with a limited set of new observations. Our results show that the parameter update enables rapid sim-to-real transfer. The framework runs efficiently onboard of a mobile robot and significantly outperforms a non-causal baselines navigating successfully and safely in complex human-shared scenarios.

Keywords Causal Inference, Sim-to-Real, Human-Aware Motion Planning, AI-enabled Robotics

### 1 INTRODUCTION

Deploying autonomous mobile robots in human-populated environments (e.g., warehouses, hospitals, airports, malls) requires safe and efficient interaction with humans. Understanding how robot actions causally affect their surroundings enables better action selection, motivating methods that reason about causal relationships in the environment and human-robot interactions. Accordingly, the robotics community has increasingly embraced causal approaches in various fields [1], including robot manipulation [2, 3, 4], explainable robotics and HRI [5, 6], spatial interactions [7], planning [8], and robot understanding [9]. However, transitioning these algorithmic frameworks from theoretical formulation to real-world deployment remains a challenge. Even in purely robotic scenarios, this process is hindered by the need for extensive and time-consuming data collection [10]. This difficulty is amplified in human-populated settings, where long-term data collection is often impractical.

Despite these constraints, users typically expect robots to be immediately functional. To meet this operational demand, a robust strategy must leverage simulation for extensive data collection and subsequent causal discovery, while enabling rapid adaptation to real-world dynamics. This necessitates a modular, end-to-end causal inference framework—spanning from raw sensor data acquisition and structure learning directly to online reasoning. Crucially, such a framework must be capable of efficient sim-to-real transfer, retaining the high-level logic learnt in simulation while seamlessly updating its parameters to the physical environment. Prior work [11] laid the groundwork for our approach with a modular, causality-enhanced decision-making framework supporting both causal discovery and reasoning. However, the authors evaluated task execution efficiency and human safety only in simulation, leaving real-world deployment and validation unaddressed. This paper bridges the gap between simulated and real applications by proposing an improved framework with a data-efficient adaptation process that tunes the initial simulation-learnt causal model to work equally well on a physical mobile robot in human environments (Fig. 1). We validate this approach in two real-world scenarios – a poster session and a social event – proving that the causal framework operates as expected onboard of a robot for solving challenging navigation tasks, outperforming a non-causal alternative while maintaining low inference time. Our main contributions include:

Figure 1: Framework overview.

- A new data-efficient sim-to-real transfer that exploits structural causal invariance to adapt the framework via rapid parameter update on limited real-world data.

- The first real-world deployment and validation of an end-to-end causality-based framework applied to robot navigation tasks in human environments, made publicly available1 for reproducibility and future applications.

- An experimental evaluation across challenging simulated and real-world group encounters, focusing on task success, operational safety and inference time.

### 2 RELATED WORK

In recent years, the synergy between robotics and causality has gained increasing attention [1]. However, learning causal models (i.e. causal discovery) requires extensive datasets that are costly and potentially unsafe to collect on physical robots in human-shared environments. Simulation offers a practical alternative, but transferring learned models to the real world is hindered by mismatches in environment and human dynamics. Standard transfer approaches include domain randomisation, which varies simulation parameters to improve robustness to real-world variations [12], and domain adaptation, which aligns feature representations between simulation and reality [13]. While effective for perception and reactive control, these methods often learn “black-box” policies based on spurious correlations rather than underlying causal mechanisms. Their lack of interpretability and reliance on real-world data limit adaptation to novel environments.

Causality has therefore emerged as a promising mechanism for robust transfer learning. The key assumption is that, although statistical correlations may change across domains, the underlying causal mechanisms remain invariant [14, 15]. In our setting, this means that causal relationships between semantically meaningful variables, reflecting underlying physical and interaction mechanisms, are preserved across simulation and reality, while their conditional distributions may change. This assumption is not specific to our approach, but is also adopted by established causal learning methods such as Invariant Risk Minimization (IRM)[16] and causal reinforcement learning[17], which seek to identify relationships that remain stable across environments, with applications to motion forecasting [18], intention prediction [19], and simulation-to-real adaptation [15]. Previous work showed, in a more limited scenario, that causal models learned independently from scratch in simulation and in the real world exhibited consistent structures [20]. Building on these findings, the proposed approach explicitly transfers the graphical—and therefore explainable—causal model from simulation to the real world. By retaining the graph topology and calibrating only the required parameters, it enables rapid, data-efficient adaptation from limited real-world observations, avoiding extensive retraining.

In robotics, causal discovery methods such as PCMCI [21] and F-PCMCI [22] have been used to forecast human spatial behaviour from time-series data. ROS-Causal [7] further enables onboard causal discovery from robot sensor data. However, these works primarily focus on causal discovery and do not address online causal reasoning. Conversely, causal reasoning has been incorporated into POMDPs for safe planning [8], probabilistic programming for uncertain manipulation [3], and proactive guidance [6]. However, these approaches typically rely on pre-defined, static causal structures, rather than learning them from sensor data.

1

https://lcastri.github.io/causal-sim2real/

Figure 2: Causal framework: A rapid sim-to-real adaptation calibrates only the conditional probability parameters (green vs. blue histograms), preserving the causal model learned in simulation and enabling efficient robot deployment.

An end-to-end real-world application that learns causal models and updates their parameters directly from onboard sensors for online decision-making is currently missing. Building on the simulation-based architecture in [11], this work presents the first real-world deployment of such an integrated framework, validating its feasibility and effectiveness for human-aware robot navigation.

### 3 CAUSAL ROBOT FRAMEWORK

The proposed simulation-to-real approach is shown in Fig. 2. It includes a two-stage process: first, the causal model is learnt and validated by simulated navigation experiments; second, the framework is adapted to the real world via parameter calibration and deployed on a physical robot.

#### 3.1 Causality-Enhanced Decision-Making

The system described in [11] and adopted in this work enables autonomous robots to learn and reason about cause-andeffect relations to take decisions in dynamic, human-shared environments. Its core causal inference engine allows the robot to balance various objectives—such as minimising battery consumption while maximising human safety—by inferring how contextual factors and robot actions causally affect the human behaviour and the robot’s internal dynamics. The architecture consists of three pipelines:

Data Extraction: This pipeline extracts raw time-series data on robot state (e.g., speed, battery level), human spatial behaviours (e.g., crowd density at specific waypoints over time), and environmental context (e.g., time slot, waypoint). To ensure computational efficiency and compatibility with discrete causal algorithms, the data undergoes two preprocessing steps: Nyquist-Shannon subsampling, and quantile-based discretisation for suitable inference.

Learning: This pipeline constructs the causal inference engine via causal discovery, powered by CausalFlow2, and parameter learning, where Maximum Likelihood Estimation (MLE) is used to learn the Conditional Probability Distributions (CPDs) for each node of the identified structure.

Inference: This final pipeline drives real-time decision-making via causal interventions (e.g., “What if I travel to the goal now at speed s?”). The engine applies do-calculus [23] to estimate the effects of these actions, embedding them into an A∗ heuristic function, as detailed in Sec. 4.3.

#### 3.2 Simulation-Based Learning

To facilitate rapid deployment, we leverage the notion of causal structural invariance, in line with prior work [14, 15]. Specifically, we consider high-level causal mechanisms to be relatively stable across simulation and real-world, while their parameters (e.g., congestion probabilities) may vary across environments.

To learn this invariant structure, we used PeopleFlow3, our Gazebo-based social simulator [11], which models humanrobot spatial interactions based on context (e.g. time, location, people density), alongside the robot’s internal dynamics, including battery drain adjusted for speed and obstacles.

#### 3.3 Real-World Adaptation via Data-Efficient Update

To transfer the simulation-learnt causal model to the real world, we fine-tune its parameters under the previously discussed causal invariance assumption. Learning the causal structure from scratch would require extensive real-world data across diverse contexts, which is costly and time-consuming. Thus, since the underlying physical and operational mechanisms remain largely invariant, the adaptation process becomes a parametric problem, updating the CPDs with minimal real-world data. In practice, we equip the physical robot with the (invariant) causal graph learnt in simulation, and update its CPDs via MLE using limited real-world data. The robot is deployed for a brief observational phase to record real-world contextual drivers (e.g., location, time) and their resulting effects on system variables (e.g., actual crowd density). As our framework employs discrete tabular CPDs and the causal dependencies are already fixed by the invariant graph, the MLE procedure computes the empirical conditional frequencies from this new data. Specifically, for each node Xi and its parent set P a(Xi), the updated parameters ˆP (Xi | P a(Xi)) are directly estimated from the observed real-world data. For instance, while the simulation dictates that a specific waypoint at a particular time slot influences crowd density, this update rapidly calibrates the precise probability of congestion based on the physical venue’s actual crowd behaviour. This avoids data- and computationally-expensive structure learning, calibrating only the parameters across all variables to reflect the probability distributions of the physical environment.

### 4 EXPERIMENTAL SETUP

This section details the experimental setup adopted in our two-stage evaluation strategy (Secs. 5 and 6).

Objective: To evaluate the framework’s navigation performance in simulation and reality, alongside its sim-to-real adaptability and real-time viability on a TIAGo robot.

Scenarios: Four social scenarios across two environments:

- Conference: poster session (S1), with queues forming along a main corridor; buffet event (S2), where groups gather around food stations.

- Airport: passenger crowds queuing at baggage reclaim belts upon flight arrivals (S3 and S4).

Across all scenarios, the robot must navigate through the context-dependent crowds to reach a designated goal.

Baselines: standard ROS 1 move_base with shortest-path A∗ (base), and a socially-aware variant integrating human proxemic costs into path planning [24] (social), both using TIAGo’s default TEB local planner (max speed 0.5 m/s).

#### Hypotheses:

2

CausalFlow: https://github.com/lcastri/causalflow [4]

3

PeopleFlow: https://github.com/lcastri/PeopleFlow [11]

| Poster session (S1) |  | Buffet event (S2) | Baggage Reclaim 1 (S3) | Baggage Re |
| --- | --- | --- | --- | --- |
|  | (a) Conference |  | (b) Airport |  |

Figure 3: Simulated scenarios. (a) Conference: [Row 1] Topological map with navigation waypoints (yellow nodes).

[Row 2] Snapshots of S1 (poster session) and S2 (buffet event). [Row 3] Baseline shortest path. [Row 4] Causal proactive planning. (b) Airport: [Row 1] Snapshot of S3 (baggage reclaim). [Row 2] Baseline shortest path. [Row 3] Causal clear route.

- Effectiveness: The system yields safer paths and higher task success rates than the baselines across both simulated and physical environments.

- Adaptability & Generalization: The invariant causal structure transfers effectively to new topological layouts with unseen human activities (sim-to-sim) and physical environments (sim-to-real) through lightweight parameter adaptation, avoiding structural discovery from scratch.

- Efficiency: The system is efficient, utilising a light-data parameter update process for rapid real-world adaptation and performing causal inference fast enough for real-time onboard execution.

Metrics: Task Success (binary), Safety (human-robot proxemics compliance), Inference Time.

Hardware: Lenovo Legion (i7-10875H, RTX 2060, 16 GB RAM), Ubuntu 20.04, ROS Noetic.

#### 4.1 Learning Scenarios

Based on simulated conference-like environments (S1 and S2), we learn a causal structure that captures the main physical and operational dependencies (i.e. edges as shown in Fig. 4 [left]). Context (T , W ) governs human presence D, while density D and obstacles O force deceleration in speed S, which subsequently modulates battery consumption L. Following causal invariance principles [14, 15], these high-level mechanisms remain stable across environments, whereas environment-specific variations are captured by updating the CPD parameters. This structural invariance assumption holds as long as underlying dynamics and variables remain consistent, whereas unmodeled physical factors (e.g., battery temperature) or qualitative behavioral shifts (e.g., adversarial human obstruction) would require online Figure 4: [Left] Retrieved causal model with context (red) and system (green) variables; edge thickness/borders mark dependency strength, and numbers show time lags (0 if unlabelled). [Right] TIAGo avoiding an unexpected obstacle.

causal structure re-learning. By freezing this underlying structure, sim-to-real transfer only requires a rapid parameter update, avoiding data-hungry causal discovery in the physical world.

#### 4.2 Data Generation and Causal Learning

For training data, we collected one hour of simulated data per scenario, during which the robot navigated the simulated environment using a standard A\* baseline planner. We recorded the robot’s internal state (S, L), and contextual data (T , W , O). The raw data was post-processed to derive people density for each waypoint W as D = (People in W )/(πr2W ), where rW is the waypoint radius scaled to the local navigable space (e.g., narrower for doors, wider for corridors). From CausalFlow2, we used J-PCMCI+ [25] to learn the causal model using the combined data from both scenarios. This method was chosen for its ability to correctly model contextual variables as external drivers (T, W, O) that influence the system (S, L, D) without being influenced by it. Assuming a first-order Markov process—consistent with human spatial modelling literature [26]—we ran conditional independence tests using RegressionCI4 with a standard significance threshold (α = 0.05). The resulting graph (Fig. 4, left) matched our expected dependencies (Sec. 4.1).

Finally, continuous variables were discretised for parameter learning via MLE using the pyAgrum5 library.

#### 4.3 Causality-Driven Path Planning

To route the robot proactively, the expectations inferred from the causal model (Fig. 4 [left]) are embedded into the A∗ global planner as edge costs. The cost for traversing an edge (u, v) between two consecutive waypoints is defined as:

c(u, v) = λδ · δ(u, v) + λD · ˆD(v) + λL · ˆL(u, v) (1)

where δ(u, v) is the Euclidean distance between u and v, ˆD(v) = E[D | do(T = t), W = v] is the expected human density at waypoint v at time t, and ˆL(u, v) = E[L | do(S = smax)] is the expected battery drain across (u, v) at maximum cruising speed smax = 0.5 m/s. The coefficients λδ , λD , and λL balance path length, crowd avoidance, and energy consumption. The search is guided by the heuristic h(u) = λδ · δ(u, g), i.e., the weighted Euclidean distance from u to the goal g. Because ˆD and ˆL are non-negative and δ satisfies the triangle inequality, h is admissible and consistent; A∗ therefore returns the path of minimum expected cost. Note that this optimality holds with respect to the forecasted costs, not the costs actually incurred during execution. Path planning is evaluated at the start of each navigation run. We set (λδ , λD , λL) = (1, 10, 5) [11], to weight Euclidean distance (λδ ), crowd density (λD), and battery loss (λL), prioritizing proactive crowd avoidance as detailed.

### 5 SIMULATION RESULTS

4

Tigramite: https://github.com/jakobrunge/tigramite

5

pyAgrum: https://pyagrum.gitlab.io/

This section presents the first stage of our experimental evaluation, i.e., the simulation results. Specifically, we validate the navigation performance of the proposed causality-enhanced framework and demonstrate the causal model outperforms a standard Bayesian network for inference tasks. To assess the effectiveness of our path planning and task execution, we evaluated the robot’s navigation behaviour using our Gazebo-based social simulator (Fig. 2, left). A topological map (Fig. 3 top) was employed to facilitate both TIAGo and the simulated humans spatial navigation. To test the sim-to-sim transfer capabilities of our approach, we evaluate whether the invariant causal graph structure Figure 5: Navigation performance across 200 trials per method in the simulated Conference (a) and Airport (b) environments. (Top) Success and failure distributions for base, social, and causal planners. (Bottom) Human-robot proxemic compliance distributions across Hall’s proxemic zones [27]: Intimate (red), Personal (orange), Social (blue), and Public (green).

(a) Conference (b) Airport

learned from the conference scenarios (S1 and S2) can be directly applied to a completely new, unseen simulated airport environment (S3 and S4). Specifically, the airport model is adapted using a 2-minute observational data window to recalibrate the tabular CPD parameters over the invariant structure, mirroring the real-world adaptation protocol. The robot acts as a service agent tasked with completing a series of waypoint-to-waypoint navigation tasks. For each task, the robot must travel from a designated start node to a goal node across the topological graph. To emulate the unpredictability of physical human environments, each edge connecting two waypoints carries a predefined probability of static obstacle appearance P (O)—simulating items such as backpacks temporarily left in corridors by conference attendees (Fig. 4 right). Unexpected obstacles forces the robot to execute sudden avoidance manoeuvres, which directly alters its speed profile and increases its overall battery consumption.

As shown in Fig. 3, the system correctly anticipated context-driven congestion trends during the poster session (S1) and buffet event (S2), as well as around the baggage reclaim belts (S3). The causal planner (bottom row) proactively inferred these high-density zones and selected detours to avoid them, maintaining smooth and safe navigation. In contrast, the base planner (middle row), being blind to the causal drivers of density, consistently attempted to traverse the congested areas.

#### 5.1 Navigation Performance

We evaluated the framework against the base and social baselines across 200 simulated navigation trials per scenario.

##### 5.1.1 Task Success

For both the Conference (Fig. 5a, top) and Airport (Fig. 5b, top) domains, the causal planner consistently outperformed the baselines across all scenarios (S1, S2, S3, and S4). This confirms parameter recalibration across distinct topologies and crowd dynamics performing lightweight tabular CPD adaptation over the invariant structure.

Figure 6: MAE of Bayesian and causal battery predictions for varying obstacle probabilities.

##### 5.1.2 Proxemic Compliance

In both environments (Figs. 5a–5b, bottom), while all methods operate mainly within the “Public” zone (> 3.6 m), the causal planner minimizes personal and social space intrusions by proactively taking detours.

#### 5.2 Causal vs. Bayesian Prediction

A core advantage of our framework is its ability to disentangle true causation from spurious correlation. We demonstrate this via a confounded inference task: predicting battery consumption (L). As shown in Fig. 4 (left), the selected speed S directly affects L, but this relationship is confounded by unexpected obstacles O.

Standard Bayesian inference would simply estimate the depletion probability based on observed speed as follows:

X

P (L | S) =

P (L | S, O)P (O | S). (2)

This approach though implicitly introduces some bias due to confounding obstacle O. Our framework instead uses the do-operator [23] to predict the causal effect of a hypothetical speed on the battery consumption, regardless of any obstacle:

X

P (L | do(S)) =

P (L | S, O)P (O), (3)

which adjusts for the confounder O by marginalising over its prior distribution rather than its conditional one.

To evaluate these approaches, we ran a series of simulated experiments with our Gazebo-based social simulator, where the robot performed a navigation task at a maximum speed SMAX = 0.5 m/s, while varying the probability of encountering unexpected obstacles P (O) from 10% to 50% in steps of 10%. For each obstacle probability, 50 navigation tasks were executed to measure empirically the ground truth LGT. We then queried the Bayesian model, LBN = E[L | SMAX], and the causal one, LCM = E[L | do(SMAX)], using (2) and (3).

Fig. 6 shows the causal prediction consistently yielded a lower Mean Absolute Error (MAE) across all P (O) values. This result demonstrates that the causal model is more robust within confounded environments.

### 6 REAL-WORLD RESULTS

Next, we deploy the invariant causal structure on a physical TIAGo robot to assess rapid sim-to-real adaptation via light-data parameter updates and navigation performance against a non-causal baselines. Videos of the real-world experiments are publicly available online1. The real-world setting includes the S1 corridor (orange) and S2 breakout Figure 7: Real-world experiments: (a) parameter update setup, (b) S1 corridor, and (c) S2 area. In each navigation column: [Top] Task map with Start (S) and Goal (G). [Middle] The baseline planner fails by cutting through crowded areas (blue paths). [Bottom] The causal planner anticipates congestion and takes an unobstructed detour.

S

G

S

G

(a) Parameter update setup

(b) S1—Poster Session

(c) S2—Buffet Event

space (pink) (see the environmental map in Fig. 7a, top). Participants were instructed to behave as naturally as possible while forming semi-static queues facing walls in S1 to replicate an academic event, and interacting while moving between mock food stations in S2.

To adapt the simulation-trained causal structure (Fig. 4 left) to the real world, we updated its parameters using limited observational data: speed, location, and human trajectories captured by an onboard 3D LiDAR tracker [28] and anonymously recorded (Fig. 7a, middle and bottom). We collected data (2 min per scenario at 10 Hz) from 20 volunteers6. This duration aligns with prior work [7] showing a 120 s window captures representative spatial dynamics while minimizing participant burden. This window provides sufficient samples for calibrating tabular CPDs over the fixed invariant structure.

These observations were subsequently used to update the CPDs of our causal model, ensuring the robot adapted to the actual people density of the physical venue, while preserving the simulation-learnt causal graph.

#### 6.1 Adaptability and Sim-to-Real Transfer

A core advantage of the proposed framework is its ability to rapidly adapt the simulation-trained model to a physical environment. A standard real-world pipeline—requiring comprehensive data collection for both causal discovery and parameter learning—would have necessitated approximately 2 hours of continuous data recording and 6 minutes for causal discovery, plus 100 ms for parameter learning. By avoiding a new causal discovery and its heavy data requirements, data collection is reduced to just 2 minutes per scenario, reducing deployment time by approximately 98.4%.

#### 6.2 Navigation Performance

##### 6.2.1 Task Success

In both scenarios, the robot was tasked with navigating from the start node (S) to goal (G) (Figs. 7b–7c, top). The shortest-path baseline cut directly through crowds (corridor in S1, social gathering in S2), causing navigation failures and halting near attendees before replanning (Figs. 7b–7c, middle). Quantitatively, treating the path waypoints as sequential subtasks, the baseline reached only a ∼ 33% completion rate in both tasks (3/9 in S1 and 2/6 in S2), planning shorter nominal paths (21.47 m in S1 and 19.18 m in S2) but traveling only 15.26 m and 6.29 m before aborting due to congestion. In contrast, our causal framework anticipated congestion and proactively generated longer but unobstructed detours (36.79 m in S1 and 30.58 m in S2 (Figs. 7b–7c, bottom), achieving a 100% completion rate

6

Study approved by the Ethics Committee of the University of Lincoln (ref. 6379), and informed consent was obtained from all participants.

Human-Robot Proxemic Compliance

12

10

8

6

Public

4

Social

2

Personal

Intimate

0

base-S1 causal-S1 base-S2 causal-S2

Figure 8: [Top] Real-world proxemic compliance across Hall’s zones [27]: Intimate, Personal, Social, and Public. [Bottom] Density prediction MAE ( ˆD vs. D) across sampling rates.

(10/10 waypoints in S1 and 9/9 in S2) without getting stuck. Over these short runs, physical battery depletion was negligible; evaluating long-term energy trade-offs is left for future work.

##### 6.2.2 Proxemic Compliance

The path planning improvement is also confirmed by a human-robot proxemic compliance analysis. Fig. 8 [top] reports the distribution of the minimum distance between the robot and the central waypoints of the activity clusters. The baseline frequently intruded into the participants’ “Social” (1.2–3.6 m) space, particularly in S1, with occasional situations of “Intimate” distance. Conversely, the causal planner consistently maintained a safer and more socially acceptable “Public” distance (> 3.6 m).

#### 6.3 Data and Computational Efficiency

Besides rapid adaptability, the framework demonstrates strict operational efficiency, both in terms of data requirements and computational load. To quantitatively assess the data efficiency of the parameter update, we performed a sensitivity analysis on the amount of observational data used. We subsampled the original 10 Hz 3D LiDAR stream to collect less data at lower frequencies (0.1, 0.5, 1, 3, 5 Hz) and computed the MAE of the causal people density prediction ˆD against the ground truth D. As Fig. 8 [bottom] shows, the performance stabilises rapidly, reaching satisfactory levels even at low sampling rates, as typical human speeds in these scenarios are easily tracked without high-frequency sensing.

Finally, to validate the onboard viability of the framework for actual robot deployment, we measured the inference time required to query the causal engine during the physical experiments. As the system estimates battery cost and people density per topological node, inference time scales directly with map size. For our 29-node real-world environment, the average inference time recorded across both scenarios was ∼ 0.12 s per query. This result closely aligns with the scalability analysis shown in previous simulations [11], confirming that the framework introduces negligible computational overhead for real-time decision-making.

### 7 CONCLUSIONS

In this work, we presented the first real-world deployment of an end-to-end causal decision-making framework for autonomous mobile robots. By leveraging the invariance of high-level causal structures, a robot trained in simulation can be adapted to complex, physical human-shared environments with only a rapid, light-data parameter fine-tuning process. Simulation and real-world experiments confirmed our research hypotheses: (i) Effectiveness—our causal framework yields safer paths and higher task success rates than non-causal baselines by reasoning about congestion causes; (ii) Adaptability—leveraging structural invariance bypasses the safety hazards and data overhead of physical causal discovery, bridging the sim-to-real gap; and (iii) Efficiency—rapid parameter calibration cuts deployment time to two minutes while maintaining sub-second inference onboard standard robotic hardware.

While our physical trials demonstrate the feasibility and real-time execution of the framework, an extensive multitrial evaluation across diverse real-world settings is left for future work. Future research will also extend the causal framework to handle more complex social dynamics and explore online structural adaptation under evolving causal mechanisms.

### Acknowledgements

This work has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 101017274 (DARKO). GB is also supported by PNRR MUR project PE0000013-FAIR.

### References

[1] Thomas Hellström. The relevance of causation in robotics: A review, categorization, and analysis. Paladyn, Journal of Behavioral Robotics, 12(1):238–255, 2021.

[2] Tabitha E. Lee, Jialiang Alan Zhao, Amrita S. Sawhney, Siddharth Girdhar, and Oliver Kroemer. Causal reasoning in simulation for structure and transfer learning of robot manipulation policies. In 2021 IEEE Int. Conf. on Robotics and Automation (ICRA), pages 4776–4782, 2021.

[3] Ricardo Cannizzaro, Michael Groom, Jonathan Routley, Robert Ness, and Lars Kunze. Cobra-ppm: a causal bayesian reasoning architecture using probabilistic programming for robot manipulation under uncertainty. In European Conf. on Mobile Robots (ECMR), pages 1–8. IEEE, 2025.

[4] Luca Castri, Sariah Mghames, Marc Hanheide, and Nicola Bellotto. Candoit: Causal discovery with observational and interventional data from time series. Advanced Intelligent Systems, 6(12):2400181, 2024.

[5] Maximilian Diehl and Karinne Ramirez-Amaro. Why did i fail? a causal-based method to find explanations for robot failures. Robotics and Automation Letters, 7(4):8925–8932, 2022.

[6] Tamlin Love, Antonio Andriella, and Guillem Alenyà. Towards explainable proactive robot interactions for groups of people in unstructured environments. In Companion of the ACM/IEEE Int. Conf. on Human-Robot Interaction, pages 697–701, 2024.

[7] Luca Castri, Gloria Beraldo, Sariah Mghames, Marc Hanheide, and Nicola Bellotto. Experimental evaluation of ros-causal in real-world human-robot spatial interaction scenarios. In Int. Conf. on Robot and Human Interactive Communication (ROMAN), pages 1603–1609. IEEE, 2024.

[8] Ricardo Cannizzaro and Lars Kunze. Car-despot: Causally-informed online pomdp planning for robots in confounded environments. In IEEE/RSJ Int. Conf. on Intelligent Robots & Systems (IROS), 2023.

[9] Filip Edström, Thomas Hellström, and Xavier De Luna. Robot causal discovery aided by human interaction. In Int. Conf. on Robot and Human Interactive Communication (RO-MAN), pages 1731–1736. IEEE, 2023.

[10] Wenshuai Zhao, Jorge Peña Queralta, and Tomi Westerlund. Sim-to-real transfer in deep reinforcement learning

for robotics: a survey. In IEEE Symp. series on computational intelligence (SSCI), pages 737–744, 2020.

[11] Luca Castri, Gloria Beraldo, and Nicola Bellotto. Causality-enhanced decision-making for autonomous mobile

robots in dynamic environments. Expert Systems with Applications, page 131246, 2026.

[12] Josh Tobin, Rachel Fong, Alex Ray, Jonas Schneider, Wojciech Zaremba, and Pieter Abbeel. Domain randomiza-

tion for transferring deep neural networks from simulation to the real world. In IEEE/RSJ Int. Conf. on Intelligent

Robots & Systems (IROS), pages 23–30, 2017.

[13] Eric Tzeng, Judy Hoffman, Kate Saenko, and Trevor Darrell. Adversarial discriminative domain adaptation. In

Proc. of the IEEE/CVF Conf. on Computer Vision and Pattern Recognition, pages 7167–7176, 2017.

[14] Bernhard Schölkopf, Francesco Locatello, Stefan Bauer, Nan Rosemary Ke, Nal Kalchbrenner, Anirudh Goyal,

and Yoshua Bengio. Toward causal representation learning. Proc. of the IEEE, 109(5):612–634, 2021.

[15] Ahmad Rahimi, Po-Chien Luan, Yuejiang Liu, Frano Rajiˇc, and Alexandre Alahi. Sim-to-real causal transfer:

A metric learning approach to causally-aware interaction representations. In Proc. of the IEEE/CVF Conf. on

Computer Vision and Pattern Recognition, pages 17271–17281, 2025.

[16] Martin Arjovsky, Léon Bottou, Ishaan Gulrajani, and David Lopez-Paz. Invariant risk minimization. arXiv

preprint arXiv:1907.02893, 2019.

[17] Biwei Huang, Fan Feng, Chaochao Lu, Sara Magliacane, and Kun Zhang. Adarl: What, where, and how to adapt

in transfer reinforcement learning. In Int. Conf. on Learning Representations (ICLR), 2022.

[18] Yuejiang Liu, Riccardo Cadei, Jonas Schweizer, Sherwin Bahmani, and Alexandre Alahi. Towards robust and

adaptive motion forecasting: A causal representation perspective. In Proc. of the IEEE/CVF Conf. on Computer

Vision and Pattern Recognition, pages 17081–17092, 2022.

[19] Yeping Hu, Xiaogang Jia, Masayoshi Tomizuka, and Wei Zhan. Causal-based time series domain generalization

for vehicle intention prediction. In Int. Conf. on Robotics and Automation (ICRA), pages 7806–7813. IEEE, 2022.

[20] L Castri, G Beraldo, S Mghames, M Hanheide, N Bellotto, et al. Ros-causal: A ros-based causal analysis framework for human-robot interaction applications. In Workshop on Causal Learning for Human-Robot Interaction (Causal-HRI), ACM/IEEE Int. Conf. on Human-Robot Interaction (HRI), 2024.

[21] Jakob Runge, Peer Nowack, Marlene Kretschmer, Seth Flaxman, and Dino Sejdinovic. Detecting and quantifying

causal associations in large nonlinear time series datasets. Science advances, 5(11):eaau4996, 2019.

[22] Luca Castri, Sariah Mghames, Marc Hanheide, and Nicola Bellotto. Enhancing causal discovery from robot

sensor data in dynamic scenarios. In 2nd Conf. on Causal Learning and Reasoning, 2023.

[23] Judea Pearl. Causality. Cambridge university press, 2009.

[24] David V Lu, Dave Hershberger, and William D Smart. Layered costmaps for context-sensitive navigation. In

2014 IEEE/RSJ Int. Conf. on Intelligent Robots and Systems, pages 709–715. IEEE, 2014.

[25] Wiebke Günther, Urmi Ninad, and Jakob Runge. Causal discovery for time series from multiple datasets with latent contexts. In Robin J. Evans and Ilya Shpitser, editors, Proc. of the 39th Conf. on Uncertainty in Artificial Intelligence, volume 216, pages 766–776. PMLR, 2023.

[26] Akinori Asahara, Kishiko Maruyama, Akiko Sato, and Kouichi Seto. Pedestrian-movement prediction based on mixed markov-chain model. In Proc. of the 19th ACM SIGSPATIAL Int. Conf. on advances in geographic information systems, pages 25–33, 2011.

[27] Edward T Hall, Ray L Birdwhistell, Bernhard Bock, Paul Bohannan, A Richard Diebold Jr, Marshall Durbin, Munro S Edmonson, JL Fischer, Dell Hymes, Solon T Kimball, et al. Proxemics [and comments and replies]. Current anthropology, 9(2/3):83–108, 1968.

[28] Z. Yan, S. Schreiberhuber, G. Halmetschlager, T. Duckett, M. Vincze, and N. Bellotto. Robot perception of static and dynamic objects with an autonomous floor scrubber. Intelligent Service Robotics, 13(3):403–417, 2020.
