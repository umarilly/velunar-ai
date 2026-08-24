type IconProps = React.SVGProps<SVGSVGElement>

function Base({
  bg,
  children,
  ...props
}: IconProps & { bg: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 40 40" role="img" {...props}>
      <circle cx="20" cy="20" r="20" fill={bg} />
      {children}
    </svg>
  )
}

// Five preset avatars built from the app's own palette (terracotta primary +
// the warm neutral chart tones), each a simple mark inside a solid circle —
// no photos, no external assets.

function AvatarSpark(props: IconProps) {
  return (
    <Base bg="#bd5b39" {...props}>
      <path
        d="M20 9 L22.6 17.4 L31 20 L22.6 22.6 L20 31 L17.4 22.6 L9 20 L17.4 17.4 Z"
        fill="#ffffff"
      />
    </Base>
  )
}

function AvatarOrbit(props: IconProps) {
  return (
    <Base bg="#8b7355" {...props}>
      <circle
        cx="20"
        cy="20"
        r="9.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <circle cx="20" cy="10.5" r="3" fill="#ffffff" />
    </Base>
  )
}

function AvatarWave(props: IconProps) {
  return (
    <Base bg="#a8763e" {...props}>
      <path
        d="M7 23c2.8-4 5.8-4 8.6 0s5.8 4 8.6 0s5.8-4 8.6 0"
        stroke="#ffffff"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M7 16.5c2.8-4 5.8-4 8.6 0s5.8 4 8.6 0s5.8-4 8.6 0"
        stroke="#ffffff"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
    </Base>
  )
}

function AvatarPeak(props: IconProps) {
  return (
    <Base bg="#6b6560" {...props}>
      <path
        d="M8 28 L16.5 13.5 L21.5 21 L25.5 15 L32 28 Z"
        fill="#ffffff"
        opacity="0.92"
      />
    </Base>
  )
}

function AvatarDawn(props: IconProps) {
  return (
    <Base bg="#d4a373" {...props}>
      <circle cx="20" cy="23" r="7" fill="#ffffff" />
      <path
        d="M8 24.5 h24 M11.5 29.5 h17"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </Base>
  )
}

export const PRESET_AVATARS = [
  { id: "spark", label: "Spark", Icon: AvatarSpark },
  { id: "orbit", label: "Orbit", Icon: AvatarOrbit },
  { id: "wave", label: "Wave", Icon: AvatarWave },
  { id: "peak", label: "Peak", Icon: AvatarPeak },
  { id: "dawn", label: "Dawn", Icon: AvatarDawn },
] as const

export type PresetAvatarId = (typeof PRESET_AVATARS)[number]["id"]

export function PresetAvatarIcon({
  id,
  ...props
}: { id: string } & IconProps) {
  const preset = PRESET_AVATARS.find((a) => a.id === id)
  if (!preset) return null
  return <preset.Icon {...props} />
}
