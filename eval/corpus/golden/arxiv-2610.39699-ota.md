# Implementation and Validation of Mismatch-Tolerant High-Gain OTA with a Calibrated Negative Conductance Load

Mayank Aggarwal and Naveen Kadayinti

Department of Electrical, Electronics and Communication Engineering Indian Institute of Technology Dharwad, Karnataka - 580011, India

Email: {ee23ms003,naveen}@iitdh.ac.in

Abstract—This paper presents the circuit-level implementation of a mismatch-tolerant high-gain operational transconductance amplifier (OTA) using automatic negative-conductance calibration in 65-nm CMOS. The technique enhances OTA gain by compensating for its finite output conductance using a crosscoupled transistor pair, with an on-chip calibration loop that eliminates the need for a replica circuit or external tuning. The calibration routine increases the gain by driving the steady state error of the OTA in a unity gain feedback loop toward zero. The implementation addresses practical challenges involving comparator offset, DAC design, and subtractor gain and offset. A 6-bit capacitive DAC (CDAC)-based comparator offset calibration scheme enables reliable detection of the sub-millivolt steady state error required for high OTA gain. Post-layout Monte Carlo simulations show that the comparator offset standard deviation is reduced from 4.11 mV to 132 μV, with a maximum observed postcalibration offset of 625 μV. The complete calibration circuitry is implemented and evaluated through post-layout simulations.

Index Terms—Operational transconductance amplifier (OTA), negative conductance, comparator offset calibration, mismatch tolerance, capacitive digital-to-analog converter (CDAC).

## I. INTRODUCTION

Operational transconductance amplifiers (OTAs) are widely used as fundamental building blocks in analog and mixedsignal circuits such as Gm-C filters, integrators, amplifiers, and data converters. The analyses and design flow of circuits with OTA’s usually assume OTA’s as ideal transconductors with infinite output impedance. In practice, however, the output impedance of OTAs is finite. This finite output impedance introduces loading between circuit nodes, reduces effective gain, and invariably shifts the overall circuit’s poles and zeros from the design values, causing deviations from the desired transfer characteristics. This problem of low output impedance becomes worse with technology scaling, due to degrading analog performance of transistors [1], [2]. Therefore, novel OTA circuits that feature high-gain in scaled technologies are essential to minimize these effects.

Fig. 1. (a) Output impedance cancellation with the help of negative conductance (−gN ) connected at load of an OTA with a practical output conductance go [3] (b) Realization of negative conductance from cross-coupled MOS-pair GN [4] (Red) where OTA has transconductance Gm (Blue) with VE as input to the OTA comprised of M0 − M4 [3].

One of the classic ways of achieving high output impedance is by using cascode or folded cascode OTAs. These, however, come with constraints of headroom in low supply voltage designs. A technique which is more widely adopted in recent years is the use of negative impedance (realized using controlled positive feedback) to cancel the output impedance, thereby resulting in high output impedance [3]–[7]. The principle of negative impedance based high gain OTA is illustrated in Fig. 1. Since the gain is decreased due to the non-zero output conductance of the OTA, the gain can be increased by cancelling gO by connecting a negative conductance (−gN ) in parallel with it, as shown in Fig. 1(a). Positive feedback transconductor (GN ) is realized using a cross-coupled pair and shown in Fig. 1(b). The net output conductance after connecting the negative impedance becomes [3]:

gON = gO − gN . (1)

The DC gain will be [3]:

Gm

AON =

. (2)

gON

Driving gON to zero can in principle make the gain infinite. However, in practice mismatch and the time constant of the positive feedback loop limit the gain to finite values.

Many reported architectures have increased the gain of the OTA by using this method. In [4], the authors have achieved a gain of 46 dB using two inverters in a back-toback configuration. As a comparison to this, [5] used a similar topology and achieved a gain of 80 dB. Both [4] and [5] were early demonstrations of this concept, which used separate external supply voltage for the positive feedback circuit that was tuned manually for calibrating its conductance. A similar approach is used in [6], achieving a gain of 83 dB with a cross-drain-coupled differential amplifier. Even though [4], [5], and [6] report the cancellation of output conductance, none of them have investigated a way to implement the cancellation across PVT without any external intervention. One of the major challenges in such a technique is to generate and fix the bias voltage, VN , for the positive feedback conductance (or resistance) used for the impedance cancellation (refer to Figure 1). One of the methods for generating this bias is to incorporate a replica of the OTA, which will track the output conductance, gds [7]. Here, any mismatch between the OTA in the circuit in question and the replica will result in imperfect cancellation. The authors of [7] report a minimum gain of 42 dB across all corners. A similar technique is reported in [3], which is based on the same principle of impedance cancellation, but with the calibration is done in the foreground without requiring any replica. Here the error voltage is sensed with the OTA in a unity-gain feedback, and the gain is increased by adjusting the negative impedance to reduce the error voltage to zero. This in-line high-gain calibration technique does not require a replica, making it mismatch-tolerant. This technique reported a minimum gain of 50 dB across PVT in [3]. In this technique, the achievable gain of the OTA is limited by the accuracy of the circuit that senses the steady state error of the OTA in unity gain feedback.

### A. OTA Calibration Principle

The basic principle of the technique for determining VN , as shown in Fig. 2, is to reduce the steady state error (= ve) of the OTA configured in unity gain feedback to zero. Ideally, this increases the DC gain of the OTA to infinity.

Fig. 2. VN detection by reducing the steady state error voltage of OTA ve

[3].

Consider Fig. 2, where the input is an incremental voltage ∆vi. The error voltage can then be written as:

gON

ve = ∆vi

, (3)

Gm + gON

It is clear that the steady-state error ve becomes zero if the net conductance connected at the OTA load, i.e., gON , becomes zero. As shown in equation (1), this implies go = gN , meaning the output conductance is cancelled. However, this condition requires very high gain error amplifiers (EA), which are practically challenging [3]. In this technique, digital circuitry is used to obtain the value of VN . The block-level diagram and the corresponding timing diagram are shown in Fig. 3 and Fig. 4, respectively [3].

Fig. 3. Internal architecture of VN detection block [3].

Fig. 4. Timing diagram showing various signal transitions with DAC settling to VN [3].

Fig. 5 shows the overall block-level representation of the OTA implemented with this technique, where the OTA is configured in different operating modes.

Fig. 5. Block-level representation of high-gain OTA operating in different modes of operation: Calibration mode (when switch S1 is OFF) and Normal mode (when switch S1 is ON). [3]

The OTA gain calibration is performed using the feedbackbased technique described above, in which the DAC control code is iteratively adjusted until the error voltage approaches zero, after which the calibrated OTA is used in normal operation.

The practical implementation challenges associated with this technique, including comparator design and its motivation for and implementation of offset calibration, DAC implementation, and the effects of subtractor gain and offset introduction, are discussed in Section II, followed by the corresponding simulation results in Section III, followed by the conclusions in Section IV.

A. Motivation and Implementation of Comparator Calibration

For an OTA with a DC gain of 20 dB, the steady-state error voltage ve is approximately 18 mV for a 200 mV incremental input. To achieve a DC gain of 50 dB, this error must be reduced to approximately 0.63 mV. In the VN detection block, the first stage is a clocked comparator; hence, the comparator must reliably detect input differences below 0.63 mV. However, the intrinsic offset of a clocked comparator is typically on the order of tens of millivolts making it unsuitable for the required calibration accuracy. Therefore, the comparator offset must be calibrated before OTA calibration.

A strong-arm latch-based Sense Amplifier (SA) [8], [9], with the improved slave latch reported in [10]. is used as the comparator, with a clock frequency of 1 MHz and a power supply voltage Vdd of 1.2 Volts, and the design is optimized for minimum offset.

A binary-weighted capacitive DAC (CDAC), shown in Fig. 7, is implemented in this work to calibrate the comparator offset. The in-line calibration technique also requires the comparator to provide a SET functionality, which forces its output to a known logic-high state independent of the input signals. Conventional masking achieves this by forcing the internal nodes r and s to logic low and high, respectively. However, the asymmetric circuits used to drive these nodes introduce unequal capacitive loading, which can result in additional offset. To minimize this effect, the proposed sense amplifier (SA) employs a balanced push-pull SET mechanism. Dedicated transistors Mset s, Mset r , Mset P , and Mset Q, referred to as output-setting MOSFETs, force nodes P , Q, and r to ground and s to VDD, as shown in Fig. 7. The widths of these transistors are appropriately sized to balance the loading of the internal nodes and minimize the resulting offset. When SET = 1, the comparator output is forced to logic high; when SET transitions to logic low, the forced state is released, and the comparator resumes normal operation. The resulting SET operation and subsequent comparator operation during calibration are shown in Fig. 6.

Fig. 6. Timing diagram showing the SET signal to initialize the output to logic high and calibration for offset starts when the SET signal switches to low.

Fig. 7. Proposed set scheme for sense-amplifier based comparator by setting the s node and resetting the r, P, and Q nodes connected to its capacitor array (red- unit capacitance: 1.04 fF) realized by a MOSCAP (blue- unit MOSCAP dimensions: 2μm/60nm).

In the implemented comparator’s offset calibration method, the offset generated by the binary CDAC is initially steered entirely to one side, and a linear search is done to find the correct calibration code. During initialization, the entire binary-weighted CDAC is connected to the drain of the input NMOS of the comparator while the CDAC at the opposite input transistor’s drain is left disconnected. With the first clock edge, the comparator output is forced into a known deterministic state, assuming the CDAC-induced offset is larger than the intrinsic comparator offset. In the next cycle, the smallest unit capacitor of the CDAC is connected to the previously disconnected input, thereby reducing the net differential offset applied to the comparator. Subsequent clock edges alternately remove one unit of capacitance from the initially driven side and add one unit to the opposite side, effectively performing a linear search toward zero offset. After each adjustment, the comparator output is monitored; when it switches state, the applied CDAC offset is taken to be the compensation value for the intrinsic offset. The calibration loop is then immediately terminated, and the corresponding CDAC control code is latched. The incremental and decremental switching of CDAC elements required for this procedure is managed by digital counters, which hold the calibration code. Fig. 8 shows the layout of the comparator, including the offset calibration technique, highlighting SA, latch, CDAC, offset feedback control unit, and counters in different colours.

The comparator is evaluated using 1000 Monte Carlo mismatch samples. Before calibration, the measured standard deviation is σ = 4.11 mV, corresponding to a 4σ worst-case offset of 16.44 mV, as shown in Fig. 9(a). Since the comparator offset must be below 1.19 mV to achieve the required minimum OTA gain of 60 dB, offset calibration is necessary. The post-calibration results are shown in Fig. 9(b). Unlike the pre-calibration distribution, the calibrated samples are no longer randomly distributed around the nominal offset and therefore do not follow a Gaussian distribution. Consequently, the mean and 4σ values are not directly representative of the post-calibration distribution. Instead, the post-calibration offset is evaluated directly from the simulated samples. The resulting mean offset is 307 μV, with a standard deviation of 132 μV and a worst-case offset of 625 μV, all of which are below the required 1.19 mV limit. With the comparator offset sufficiently reduced, the gain-calibration loop can subsequently be activated to calibrate the OTA gain.

Fig. 8. Complete comparator with calibration circuitry layout highlighting the up and down counters in green, comparator offset calibration detection circuitry in purple, decaps in red, comparator in yellow, and the binary capacitor arrays in blue.

Fig. 9. Post-Layout Monte-Carlo simulation results before (a) and after (b) offset calibration of the comparator, indicating that all the samples have an offset less than 0.9 mV.

### B. DAC

A 4-bit thermometer-coded current-steering DAC, shown in Fig. 10, converts the binary counter output into the analog control voltage VN for the tail MOSFET of the cross-coupled pair (X-CP). The counter output is first converted to thermometer code to ensure monotonicity, which then controls an array of 2n − 1 identical p-type MOS current sources. Each branch uses two NMOS switches to steer its current either to the diode-connected MOSFET or to ground. The selected branch currents are summed at the diode-connected MOSFET to generate VN , which also serves as the reference device for the X-CP tail-current mirror.

Fig. 10. Unary I-DAC for biasing of positive-feedback transconductor GN . The binary to thermometer-converted counter outputs Di are the input for DAC switches, enabling the current(s) I to pass to either ground(Red) or contribute to VN (Blue).

### C. Subtractor gain and offset generation

Let us revisit the system-level architecture shown in Figs. 2 and 5. The subtractor generates the error voltage ∆ve by subtracting the output voltage ∆vo from the applied offset ∆vi, where the forward-path relation is given by

∆vo = AON · ASU B · ve, (4)

where AON · ASU B is the overall forward-path gain.

Thus, the subtractor gain must be accounted for when specifying the required OTA gain. For example, a subtractor with a gain of 10 dB contributes directly to the 60 dB overall gain, leaving 50 dB for the OTA. Likewise, with a 10 dB subtractor, if we were to target an OTA gain of 60 dB OTA, it results in a 70 dB forward-path gain, requiring ve < 316 μV rather than 1.19 mV for the same calibration accuracy. This directly tightens the required comparator offset and, consequently, the comparator calibration range and resolution. In this work, a unity gain subtractor is used.

A systematic offset, ∆vi, is required for OTA gain calibration and is generated in the subtractor by intentionally introducing an imbalance between the currents IVout+ and IVout− flowing through the resistors R, as shown in Fig. 11. In the fully differential implementation, this imbalance is achieved by introducing a mismatch in the geometry of the subtractor’s input transistors. The resulting effective incremental input voltage, ∆vi, is approximately 180 mV. Assuming a maximum allowable residual error of 625 μV, the calibration relationship estimates an effective OTA gain of approximately 51 dB.

## III. POST-LAYOUT SIMULATION RESULTS

As discussed in the previous section, the calibration routine includes offset calibration followed by gain calibration. During offset calibration, both the inputs of the comparator will be tied to some common voltage VCM . As soon as calibration is done, the comparator gets connected to the digital loop, and its

TABLE I

COMPARISON OF THE OTA USED IN THIS WORK WITH PREVIOUSLY REPORTED ARCHITECTURES.

OTA without impedance

Parameters

|  | cancellation | This work | [7] | [6] | [4] | [5] |
| --- | --- | --- | --- | --- | --- | --- |
| Technology node (nm) | 65 | 65 | 130 | 350 | 300 | 1000 |
| Supply Voltage (V) | 1.2 | 1.2 | 1.2 | 3 | 10 | 2 |
| DC Gain (dB) | 18 | 60 | 48 | 83 | 46 | 60 |
| Power (mW) | 0.16 | 0.45 | 9 | 2.4 | 670 | 102 |
| UGB (GHz) | 10 | 10 | 20 | 0.13 (CL = 2 pF) | 10 | 0.84 |
| Immune to PVT | No | Yes | Yes | No | No | No |
| Immune to mismatch | No | Yes | No | No | No | No |

input will be connected to the error voltage ve. Hence, a few clock cycles will be required first for comparator calibration, and then in the next few cycles, the main OTA will be calibrated. Fig. 12 depicts the layout of the comparator offset calibration circuit integrated with the gain calibration circuit. The complete layout is 142 μm × 47 μm.

Manual / Automatic calibration Not Applicable Automatic Automatic Manual (Off-chip) Manual (Off-chip) Manual (Off-chip)

Fig. 11. Subtractor implementation with intentionally sized NMOS input pairs for systematic offset generation during OTA gain calibration.

Fig. 12. Layout of the comparator calibration circuit integrated with the gain calibration circuit, highlighting the Control unit as well as DAC.

The timing diagram is depicted in Figure 13. For illustration only, comparator calibration is shown as being done in 2 clock cycles. Once the comparator is calibrated, the signal Comp Cal switches from 0 to 1, and the gated clock, Gain CLK, is supplied to the main digital circuitry of the VN - detection block; which then calibrates the main OTA for its gain. Similarly, once the gain is calibrated, the signal Gain cal switches to 1. During gain calibration, the OTA needs to be in calibration mode [3], meaning the incremental input voltage ∆vi needs to be active during this time. Once the gain is calibrated, ∆vi gets disconnected, and the subtractor will be configured as a buffer.

Fig. 13. Timing diagram showing the calibration signal of the comparator (Red) as well as the OTA (Blue).

## IV. CONCLUSION

This work presented a practical transistor-level implementation of a high-gain OTA calibration technique, with emphasis on the circuit-level challenges. A comparator offset calibration scheme based on a 6-bit capacitive DAC was implemented in 65-nm CMOS to enable reliable detection of the sub-millivolt error required for high OTA gain. Post-layout Monte Carlo simulations demonstrated a standard deviation of 132 μV and a maximum observed offset of 625 μV after calibration, compared with a pre-calibration standard deviation of 4.11 mV and a 4σ offset of 16.44 mV. The complete calibration circuitry, including the comparator calibration, digital control logic, DAC, and OTA gain-calibration circuitry, was implemented and evaluated using post-layout simulations. The results demonstrate the feasibility of integrating the calibration technique at the circuit level while addressing practical constraints such as comparator offset, DAC implementation, signal-path loading, and layout-related parasitics. The resulting calibrated highgain OTA provides the foundation for its integration into larger analog systems requiring accurate and robust transconductance and gain characteristics.

The authors would like to thank Mayur S. Marinaik, for valuable discussions and constructive feedback that contributed to this work.

## REFERENCES

[1] B. Razavi, “Design of Analog CMOS Integrated Circuits”, 2nd ed.

McGraw-Hill Education, 2005, indian student version.

[2] Y. Taur and T. H. Ning, Fundamentals of modern VLSI devices.

Cambridge University Press, 2021.

[3] M. S. Marinaik and N. Kadayinti, “Mismatch tolerant negative conductance load tuning for high gain OTAs,” in IEEE Asia Pacific Conference On Circuits and Systems (APCCAS), 2023, pp. 363–366.

[4] B. Nauta, “A CMOS transconductance-C filter technique for very high frequencies,” IEEE Journal of Solid-State Circuits, vol. 27, no. 2, pp. 142–153, Feb. 1992.

[5] S. Xiao and C. Salama, “Voltage gain enhancement by conductance cancellation in GaAs MESFET op-amps,” in 1993 IEEE International Symposium on Circuits and Systems (ISCAS), 1993, pp. 1073–1076 vol.2.

[6] J. Yan and R. Geiger, “A negative conductance voltage gain enhancement technique for low voltage high speed CMOS op amp design,” in Proceedings of the 43rd IEEE Midwest Symposium on Circuits and Systems (Cat.No.CH37144), vol. 1, 2000, pp. 502–505 vol.1.

[7] I. Mondal and N. Krishnapura, “Gain enhanced high frequency ota with on-chip tuned negative conductance load,” in IEEE International Symposium on Circuits and Systems (ISCAS), 2015, pp. 2085–2088.

[8] B. Razavi, “The strongarm latch [a circuit for all seasons],” IEEE Solid-

State Circuits Magazine, vol. 7, no. 2, pp. 12–17, 2015.

[9] B. Razavi, “Design of comparator [the analog mind],” IEEE Solid-State

Circuits Magazine, vol. 12, no. 4, pp. 8–14, 2020.

[10] B. Nikolic, V. G. Oklobdzija, V. Stojanovic, W. Jia, J. K.-S. Chiu, and M. M.-T. Leung, “Improved sense-amplifier-based flip-flop: Design and measurements,” IEEE Journal of Solid-State Circuits, vol. 35, no. 6, pp. 876–884, Jun. 2000.
