import type { Vector3 } from 'three';

/** x, y, z 成分を持つ3次元ベクトル相当のプレーンオブジェクト。 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 決定論的な疑似乱数生成器（mulberry32アルゴリズム）を生成する。
 * 同じシード値を渡せば常に同じ乱数列が得られるため、惑星地形の再現などに利用できる。
 * @param seed - 乱数シード値
 * @returns 呼び出すたびに [0, 1) の乱数を返す関数
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function (): number {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 球面座標（半径・極角・方位角）を直交座標に変換する。
 * カメラの視点位置（注視点からの相対座標）を求めるのに使う。
 * @param radius - 原点からの距離
 * @param phi - 極角（Y軸からの角度、ラジアン）
 * @param theta - 方位角（XZ平面上の角度、ラジアン）
 * @returns 直交座標 {x, y, z}
 */
export function sphericalToCartesian(radius: number, phi: number, theta: number): Vec3 {
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

/**
 * 直交座標を球面座標（半径・極角・方位角）に変換する。
 * カメラ位置から `sphericalToCartesian` への入力値を逆算するのに使う。
 * @param position - 直交座標 {x, y, z}
 * @returns 球面座標 {radius, phi, theta}
 */
export function cartesianToSpherical(position: Pick<Vector3, 'x' | 'y' | 'z'>): {
  radius: number;
  phi: number;
  theta: number;
} {
  const radius = Math.hypot(position.x, position.y, position.z);
  return {
    radius,
    phi: Math.acos(position.y / radius),
    theta: Math.atan2(position.z, position.x),
  };
}

/**
 * 太陽赤緯（季節）から惑星の北極方向の単位ベクトルを求める。
 * 地軸は常にYZ平面内で傾くものとして扱う。
 * @param decDeg - 太陽赤緯（度）
 * @returns 北極方向を指す単位ベクトル {x, y, z}
 */
export function northPoleDirection(decDeg: number): Vec3 {
  const d = (decDeg * Math.PI) / 180;
  return { x: -Math.sin(d), y: Math.cos(d), z: 0 };
}
