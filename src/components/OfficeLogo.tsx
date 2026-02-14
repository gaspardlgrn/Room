/**
 * Logos Microsoft Office (Word, PowerPoint, Excel) - couleurs officielles
 */
type Format = 'docx' | 'pptx' | 'xlsx'

const config: Record<Format, { bg: string; letter: string; label: string }> = {
  docx: { bg: '#2B579A', letter: 'W', label: 'Word' },
  pptx: { bg: '#D24726', letter: 'P', label: 'PowerPoint' },
  xlsx: { bg: '#217346', letter: 'X', label: 'Excel' },
}

type Props = {
  format?: string
  className?: string
  size?: number
}

export default function OfficeLogo({ format = 'docx', className = '', size = 40 }: Props) {
  const fmt = (format === 'xlsx' ? 'xlsx' : format === 'pptx' ? 'pptx' : 'docx') as Format
  const { bg, letter, label } = config[fmt]

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
      }}
      title={label}
    >
      <span
        className="font-bold text-white"
        style={{ fontSize: size * 0.5, lineHeight: 1 }}
      >
        {letter}
      </span>
    </div>
  )
}
