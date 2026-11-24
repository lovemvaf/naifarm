"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface HotspotInfo {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
}

const POMELO_HOTSPOTS: HotspotInfo[] = [
  {
    id: "vo",
    label: "1. Vỏ xanh tinh dầu",
    description:
      "Vỏ bưởi Tân Triều mỏng, bóng mịn giàu tinh dầu tự nhiên — tận dụng làm mứt vỏ bưởi sấy dẻo tăng giá trị cho nhà vườn.",
    position: [0.95, 0.25, 0.4],
  },
  {
    id: "cui",
    label: "2. Cùi trắng xốp",
    description:
      "Lớp cùi trắng mềm giúp bảo vệ múi bưởi khỏi dập nát khi đóng thùng rơm vận chuyển từ cù lao Tân Triều đi TP.HCM.",
    position: [-0.75, 0.1, 0.72],
  },
  {
    id: "mui",
    label: "3. Tép bưởi mọng nước",
    description:
      "Tép hồng hoặc vàng ráo nước, độ ngọt tham khảo 11.8–12.2° Brix nhờ phù sa sông Đồng Nai.",
    position: [0.25, -0.35, 0.95],
  },
  {
    id: "cuong",
    label: "4. Cuống lá cam tươi",
    description:
      "Dấu hiệu nhận biết bưởi mới cắt tại liếp trong 24 giờ qua khi kết hợp đối chiếu nhật ký mã lô QR.",
    position: [0.05, 1.12, 0.05],
  },
];

function PomeloModel({
  sliced,
  rotationOffset,
  selectedHotspot,
  onSelectHotspot,
}: {
  sliced: boolean;
  rotationOffset: number;
  selectedHotspot: string;
  onSelectHotspot: (id: string) => void;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetY = rotationOffset;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * Math.min(1, delta * 5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main pomelo fruit body */}
      <mesh position={[0, -0.05, 0]} scale={[1.06, 0.96, 1.06]} castShadow receiveShadow>
        <sphereGeometry args={[1, 40, 32]} />
        <meshStandardMaterial color="#4C7B3E" roughness={0.42} metalness={0.05} />
      </mesh>

      {/* Top tapered neck characteristic of Tan Trieu pomelo */}
      <mesh position={[0, 0.68, 0]} scale={[0.54, 0.48, 0.54]} castShadow>
        <sphereGeometry args={[0.85, 32, 24]} />
        <meshStandardMaterial color="#588A47" roughness={0.44} metalness={0.04} />
      </mesh>

      {/* Cutaway slice highlight when toggled */}
      {sliced ? (
        <group position={[0.42, -0.05, 0.55]} rotation={[0, 0.65, 0]}>
          <mesh>
            <cylinderGeometry args={[0.72, 0.72, 0.14, 24]} />
            <meshStandardMaterial color="#F7F1DA" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.56, 0.56, 0.15, 16]} />
            <meshStandardMaterial color="#E06D68" roughness={0.35} />
          </mesh>
        </group>
      ) : null}

      {/* Stem & leaves */}
      <mesh position={[0, 1.08, 0]} rotation={[0.1, 0, -0.08]}>
        <cylinderGeometry args={[0.045, 0.06, 0.28, 12]} />
        <meshStandardMaterial color="#5C4428" roughness={0.8} />
      </mesh>
      <mesh position={[0.26, 1.12, 0.08]} rotation={[0.3, 0.4, -0.4]} scale={[0.45, 0.06, 0.22]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#245B3D" roughness={0.45} />
      </mesh>
      <mesh position={[-0.22, 1.09, -0.06]} rotation={[-0.2, -0.3, 0.45]} scale={[0.38, 0.05, 0.18]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#3A7A4E" roughness={0.45} />
      </mesh>

      {/* Interactive educational hotspots */}
      {POMELO_HOTSPOTS.map((spot) => {
        const active = spot.id === selectedHotspot;
        return (
          <Html key={spot.id} position={spot.position} center distanceFactor={6}>
            <button
              type="button"
              onClick={() => onSelectHotspot(spot.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md transition-transform cursor-pointer whitespace-nowrap ${
                active
                  ? "bg-[#D7A34D] text-[#25352B] ring-2 ring-[#245B3D] scale-105"
                  : "bg-[#245B3D] text-white hover:bg-[#19472E]"
              }`}
            >
              {spot.label}
            </button>
          </Html>
        );
      })}
    </group>
  );
}

export default function PomeloViewer3D() {
  const [sliced, setSliced] = useState(false);
  const [rotY, setRotY] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedHotspot, setSelectedHotspot] = useState<string>("vo");

  const activeSpot = POMELO_HOTSPOTS.find((h) => h.id === selectedHotspot) ?? POMELO_HOTSPOTS[0];

  return (
    <div className="space-y-4">
      <div className="relative h-[340px] w-full overflow-hidden rounded-[16px] border border-[#D6DED2] bg-gradient-to-b from-[#EAF0E5] to-[#F5F3E9] sm:h-[400px]">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.5, 3.6 / zoomScale], fov: 42 }}
          shadows
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[4, 6, 4]} intensity={1.3} castShadow />
          <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#FFF2D8" />
          <PomeloModel
            sliced={sliced}
            rotationOffset={rotY}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
          />
          <OrbitControls enablePan={false} minDistance={2.2} maxDistance={5.2} />
        </Canvas>

        <div className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#245B3D] shadow-sm">
          Mô hình 3D minh họa · Bưởi Tân Triều (Kéo để xoay)
        </div>

        <div className="absolute bottom-3 right-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSliced((s) => !s)}
            className="min-h-[38px] rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            {sliced ? "Xem trái nguyên" : "Mở lát cắt múi"}
          </button>
          <button
            type="button"
            onClick={() => setRotY((r) => r + Math.PI / 3)}
            aria-label="Xoay mô hình 60 độ"
            className="min-h-[38px] rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-semibold text-[#25352B] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            Xoay
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(1.4, +(z + 0.15).toFixed(2)))}
            aria-label="Phóng to"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
            aria-label="Thu nhỏ"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setRotY(0);
              setZoomScale(1);
              setSliced(false);
            }}
            aria-label="Đặt lại góc nhìn"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#D6DED2] bg-white text-[#25352B] shadow-sm hover:bg-[#EAF0E5] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Accessible text & keyboard hotspot selector fallback */}
      <div className="rounded-[14px] border border-[#D6DED2] bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {POMELO_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => setSelectedHotspot(spot.id)}
              className={`min-h-[36px] rounded-full px-3 text-xs font-semibold cursor-pointer ${
                spot.id === selectedHotspot
                  ? "bg-[#245B3D] text-white"
                  : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B]"
              }`}
            >
              {spot.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-[#25352B]">
          <span className="font-bold text-[#245B3D]">{activeSpot.label}: </span>
          {activeSpot.description}
        </p>
      </div>
    </div>
  );
}
