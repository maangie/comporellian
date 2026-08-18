import { describe, expect, it } from 'vitest';
import {
  cartesianToSpherical,
  mulberry32,
  northPoleDirection,
  sphericalToCartesian,
} from '../src/geometry.js';

describe('mulberry32', () => {
  it('同じシードなら同じ乱数列を返す', () => {
    const a = mulberry32(20240817);
    const b = mulberry32(20240817);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('シードが異なれば異なる乱数列を返す', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it('返す値は常に [0, 1) の範囲に収まる', () => {
    const rnd = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rnd();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('sphericalToCartesian / cartesianToSpherical', () => {
  it('往復変換すると元の球面座標に戻る', () => {
    const radius = 4.4, phi = 1.1, theta = -0.7;
    const p = sphericalToCartesian(radius, phi, theta);
    const back = cartesianToSpherical(p);
    expect(back.radius).toBeCloseTo(radius, 10);
    expect(back.phi).toBeCloseTo(phi, 10);
    expect(back.theta).toBeCloseTo(theta, 10);
  });

  it('phi=0 のとき+Y軸上の点になる（北極方向）', () => {
    const p = sphericalToCartesian(2, 0, 0);
    expect(p.x).toBeCloseTo(0, 10);
    expect(p.y).toBeCloseTo(2, 10);
    expect(p.z).toBeCloseTo(0, 10);
  });

  it('phi=PI/2, theta=0 のとき+X軸上の点になる', () => {
    const p = sphericalToCartesian(3, Math.PI / 2, 0);
    expect(p.x).toBeCloseTo(3, 10);
    expect(p.y).toBeCloseTo(0, 10);
    expect(p.z).toBeCloseTo(0, 10);
  });

  it('原点からの距離を正しく半径として復元する', () => {
    const back = cartesianToSpherical({ x: 3, y: 4, z: 0 });
    expect(back.radius).toBeCloseTo(5, 10);
  });
});

describe('northPoleDirection', () => {
  it('赤緯0度のとき北極方向は+Y軸と一致する', () => {
    const n = northPoleDirection(0);
    expect(n.x).toBeCloseTo(0, 10);
    expect(n.y).toBeCloseTo(1, 10);
    expect(n.z).toBeCloseTo(0, 10);
  });

  it('常にYZ平面ではなくXY平面上の単位ベクトルを返す（z成分は常に0）', () => {
    for (const deg of [0, 5, 15, 21, -10]) {
      const n = northPoleDirection(deg);
      expect(n.z).toBeCloseTo(0, 10);
      expect(Math.hypot(n.x, n.y, n.z)).toBeCloseTo(1, 10);
    }
  });

  it('+Y軸からの角度が太陽赤緯（度）と一致する', () => {
    for (const deg of [0, 7.5, 15, 21]) {
      const n = northPoleDirection(deg);
      const angleFromY = Math.acos(n.y) * (180 / Math.PI);
      expect(angleFromY).toBeCloseTo(deg, 6);
    }
  });
});
