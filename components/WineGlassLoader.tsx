"use client";

import { useEffect, useRef } from "react";

// ============================================================
//  WineGlassLoader — physically-simulated wine liquid
//
//  Physics model:
//    Two wall anchors (leftH, rightH) modeled as independent
//    spring-mass oscillators. Each anchor tracks a "gravity
//    equilibrium target" derived from the current glass angle
//    (so the liquid appears to stay world-level). Lag + overshoot
//    from the spring creates realistic sloshing.
//
//    Surface shape: cubic Bezier (left → CP1 → CP2 → right)
//      + multi-point ripple layer on top.
//    Meniscus: edge pull-up proportional to stillness.
//    Center dip: bowl shaped when both sides differ.
// ============================================================

const GW = 56;   // SVG glass width
const GH = 82;   // SVG glass height
const DPR = typeof window !== "undefined" ? (window.devicePixelRatio || 2) : 2;

// Canvas is larger than glass to prevent clipping during rotation
// Worst case swing: sin(18°) * ~79px ≈ 24px horizontal
const PAD_X = 26;
const PAD_Y = 4;
const CW = GW + PAD_X * 2;  // 108
const CH = GH + PAD_Y * 2;  // 90

// Glass rotation pivot (SVG coords, transformOrigin: 50% 90%)
const PIVOT_X = GW * 0.5;   // 28
const PIVOT_Y = GH * 0.9;   // 73.8
// Pivot in canvas coords
const CPX = PIVOT_X + PAD_X; // 54
const CPY = PIVOT_Y + PAD_Y; // 77.8

// Liquid surface rest position (center of bowl, SVG coords)
const SURFACE_Y  = 33;
// Bowl inner x bounds at the surface level
const BOWL_LEFT  = 6;
const BOWL_RIGHT = 50;
const BOWL_W     = BOWL_RIGHT - BOWL_LEFT;  // 44

// Physics constants
const SPRING_K  = 7.0;   // stiffness  — higher = faster equilibrium
const DAMP      = 2.6;   // damping    — lower = more oscillation
// Scale: how many pixels the surface rises per radian of glass tilt
const TILT_SCALE = 16;   // tune this for amplitude of slosh

// ---- Glass animation (same keyframes as former CSS spin-bottle) ----------
function glassAngleAt(t: number): number {
  const P = 1.4;
  const p = ((t % P) + P) % P / P;
  const ease = (x: number) => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2;
  let deg: number;
  if      (p < 0.20) deg =  0 + ease((p - 0.00) / 0.20) *  18;
  else if (p < 0.50) deg = 18 + ease((p - 0.20) / 0.30) * -36;
  else if (p < 0.80) deg =-18 + ease((p - 0.50) / 0.30) *  32;
  else               deg = 14 + ease((p - 0.80) / 0.20) * -14;
  return (deg * Math.PI) / 180;
}

// ---- Cubic Bezier Y sample -----------------------------------------------
function bezierY(t: number, y0: number, y1: number, y2: number, y3: number) {
  const u = 1 - t;
  return u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3;
}

// ---- Bowl clip path -------------------------------------------------------
function bowlPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.bezierCurveTo(8, 4,  4, 18,  4, 28);
  ctx.bezierCurveTo(4, 42, 14, 52, 28, 52);
  ctx.bezierCurveTo(42, 52, 52, 42, 52, 28);
  ctx.bezierCurveTo(52, 18, 48, 4,  48,  4);
  ctx.closePath();
}

// ---- Draw liquid ----------------------------------------------------------
// leftH / rightH : surface height offset at each wall
//   positive = higher on screen (smaller SVG y)
// meniscus       : extra edge height from surface tension (≥ 0)
// wave1/2Phase   : ripple phase accumulators
// rippleAmp      : current ripple amplitude
function drawLiquid(
  ctx: CanvasRenderingContext2D,
  leftH: number,
  rightH: number,
  meniscus: number,
  wave1Phase: number,
  wave2Phase: number,
  rippleAmp: number,
) {
  // ── Bezier control-point calculation ────────────────────────────────────
  // Screen Y at each wall (smaller y = higher on screen)
  const leftY  = SURFACE_Y - (leftH  + meniscus);
  const rightY = SURFACE_Y - (rightH + meniscus);

  // Center height: average of left/right, with an extra dip when they differ
  // This creates the characteristic bowl (U/J) shape during sloshing.
  const avgH   = (leftH + rightH) / 2;
  const diffH  = Math.abs(leftH - rightH);
  const bowDip = diffH * 0.20;   // center sinks when sides differ
  const cpY    = SURFACE_Y - avgH + bowDip;

  // Horizontal positions of control points (pulled inward for smooth tangents)
  const cp1X = BOWL_LEFT  + BOWL_W * 0.30;
  const cp2X = BOWL_RIGHT - BOWL_W * 0.30;

  ctx.save();

  // Clip everything to the bowl interior
  bowlPath(ctx);
  ctx.clip();

  // ── Build multi-point surface with Bezier baseline + ripple ─────────────
  const STEPS = 48;
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;                           // 0→1 along surface
    const x = BOWL_LEFT + t * BOWL_W;

    // Bezier baseline Y
    const base = bezierY(t, leftY, cpY, cpY, rightY);

    // Ripple: two sine components with different spatial frequencies
    // Amplitude is small — the Bezier already handles the big shape.
    const ripple =
      Math.sin(wave1Phase + t * 8.0) * rippleAmp +
      Math.sin(wave2Phase + t * 5.5) * rippleAmp * 0.45;

    const y = base + ripple;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  // Close path: right wall → bottom → left wall
  ctx.lineTo(BOWL_RIGHT, 60);
  ctx.lineTo(BOWL_LEFT,  60);
  ctx.closePath();

  // ── Fill: ruby-red radial gradient ──────────────────────────────────────
  const grad = ctx.createLinearGradient(BOWL_LEFT, SURFACE_Y - 6, BOWL_RIGHT, 56);
  grad.addColorStop(0.0, "rgba(155, 18, 38, 0.80)");
  grad.addColorStop(0.4, "rgba(112, 10, 22, 0.90)");
  grad.addColorStop(1.0, "rgba(65,  4,  12, 0.97)");
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Surface highlight (light refraction on liquid surface) ───────────────
  const hlX = (BOWL_LEFT + BOWL_RIGHT) / 2 - (leftH - rightH) * 0.2;
  const hlY = (leftY + rightY) / 2 - 1;
  const hl  = ctx.createRadialGradient(hlX - 4, hlY - 1, 0, hlX, hlY, 14);
  hl.addColorStop(0, "rgba(255, 210, 210, 0.20)");
  hl.addColorStop(1, "rgba(255, 120, 120, 0.00)");
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.ellipse(hlX, hlY, 14, 2.5, Math.atan2(rightY - leftY, BOWL_W) * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // ── Inner-glass sheen (transparency depth effect) ────────────────────────
  const sheen = ctx.createLinearGradient(8, SURFACE_Y - 6, 28, 52);
  sheen.addColorStop(0, "rgba(255,255,255,0.07)");
  sheen.addColorStop(1, "rgba(255,255,255,0.00)");
  ctx.fillStyle = sheen;
  bowlPath(ctx);
  ctx.fill();

  ctx.restore();
}

// ---- Draw glass outline ---------------------------------------------------
function drawGlassOutline(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#7A4F2A";
  ctx.lineWidth   = 3.5;
  ctx.lineJoin    = "round";
  ctx.lineCap     = "round";
  bowlPath(ctx);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(28, 52); ctx.lineTo(28, 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, 76); ctx.quadraticCurveTo(28, 72, 44, 76);
  ctx.stroke();
}

// ============================================================
//  React component
// ============================================================
export default function WineGlassLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    canvas.width  = CW * DPR;
    canvas.height = CH * DPR;
    context.scale(DPR, DPR);

    // ── Physics state ────────────────────────────────────────────────────
    // Two independent spring-mass anchors, one per wall.
    // leftH / rightH : current surface height offset at each wall
    // leftVel / rightVel : velocities
    let leftH   = 0, leftVel  = 0;
    let rightH  = 0, rightVel = 0;

    // ── Wave phase accumulators ──────────────────────────────────────────
    let wave1Phase = 0;
    let wave2Phase = 0;

    let prevGlassAngle = 0;
    let t      = 0;
    let lastTs: number | null = null;
    let raf:    number;

    function frame(ts: number) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      t += dt;

      // ── glass.angle — swap this for any external glass.angle variable ──
      const glassAngle = glassAngleAt(t);
      prevGlassAngle = glassAngle;    // stored for reference; not used in targets below
      void prevGlassAngle;

      // ── Gravity equilibrium targets ───────────────────────────────────
      // When glass tilts right (+angle), gravity pulls liquid to the right
      // side of the bowl. In SVG/glass coords:
      //   left wall surface rises (leftTarget > 0)
      //   right wall surface drops (rightTarget < 0)
      // The spring chases this target; lag + overshoot = sloshing.
      const sinA = Math.sin(glassAngle);
      const leftTarget  = +TILT_SCALE * sinA;
      const rightTarget = -TILT_SCALE * sinA;

      // Spring-mass ODE:  a = -K*(H - target) - D*v
      leftVel  += (-SPRING_K * (leftH  - leftTarget)  - DAMP * leftVel)  * dt;
      leftH    += leftVel  * dt;

      rightVel += (-SPRING_K * (rightH - rightTarget) - DAMP * rightVel) * dt;
      rightH   += rightVel * dt;

      // ── Meniscus (surface-tension pull-up at walls) ───────────────────
      // Strongest when the liquid is still; fades with sloshing speed.
      const totalSpeed = Math.abs(leftVel) + Math.abs(rightVel);
      const meniscus   = 1.6 * Math.exp(-totalSpeed * 0.35);

      // ── Ripple amplitude ─────────────────────────────────────────────
      const rippleAmp = Math.min(0.5 + totalSpeed * 0.35, 2.0);

      // ── Wave phase (speed up when sloshing) ──────────────────────────
      const speedFactor = 1 + totalSpeed * 0.5;
      wave1Phase += dt * 3.0 * speedFactor;
      wave2Phase += dt * 4.6 * speedFactor;

      // ── Render ───────────────────────────────────────────────────────
      context.clearRect(0, 0, CW, CH);

      context.save();
      // Rotate around glass pivot in canvas space,
      // then offset so SVG (0,0) lands at the right position.
      context.translate(CPX, CPY);
      context.rotate(glassAngle);
      context.translate(-PIVOT_X, -PIVOT_Y);

      drawLiquid(context, leftH, rightH, meniscus, wave1Phase, wave2Phase, rippleAmp);
      drawGlassOutline(context);

      context.restore();

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: CW, height: CH, display: "block" }}
    />
  );
}
