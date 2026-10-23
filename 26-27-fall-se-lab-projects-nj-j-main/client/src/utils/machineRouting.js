// Centralized Machine Fleet Registry & Smart Allocation Engine

export const FLEET_MACHINE_OPTIONS = [
  {
    id: 'mac-4',
    name: 'Konica Minolta C4080 (Kalkere Plant)',
    shortName: 'Konica Minolta C4080',
    plant: 'Kalkere Plant',
    type: 'Digital Color',
    category: 'Digital',
    label: 'Konica Minolta C4080 (Kalkere Plant - Digital Color)'
  },
  {
    id: 'mac-6',
    name: 'KM2100 Black (Byrathi Plant)',
    shortName: 'KM2100 Mono',
    plant: 'Byrathi Plant',
    type: 'Digital Mono',
    category: 'Digital',
    label: 'KM2100 Black (Byrathi Plant - Digital Monochrome)'
  },
  {
    id: 'mac-1',
    name: 'Ryobi 32 (Ramamurthy Nagar Plant)',
    shortName: 'Ryobi 32',
    plant: 'Ramamurthy Nagar Plant',
    type: 'Offset 1/2-Color',
    category: 'Offset',
    label: 'Ryobi 32 (Ramamurthy Nagar Plant - 1/2-Color Offset)'
  },
  {
    id: 'mac-2',
    name: 'Ryobi 660 (Ramamurthy Nagar Plant)',
    shortName: 'Ryobi 660',
    plant: 'Ramamurthy Nagar Plant',
    type: 'Offset 4-Color',
    category: 'Offset',
    label: 'Ryobi 660 (Ramamurthy Nagar Plant - 4-Color Offset)'
  },
  {
    id: 'mac-3',
    name: 'Lithrone 26 (Ramamurthy Nagar Plant)',
    shortName: 'Lithrone 26',
    plant: 'Ramamurthy Nagar Plant',
    type: 'Komori Multi-Color Offset',
    category: 'Offset',
    label: 'Lithrone 26 (Ramamurthy Nagar Plant - Komori Multi-Color Offset)'
  }
];

/**
 * Resolves standard press machine and plant based on explicit assignment or job specifications
 */
export const resolveDefaultPressMachine = (spec = {}) => {
  if (!spec) return 'Ryobi 660 (Ramamurthy Nagar Plant)';

  // If already assigned an explicit machine string, normalize it
  const explicit = spec.assigned_press_machine || spec.target_machine || spec.targetMachine;
  if (explicit && typeof explicit === 'string') {
    const lower = explicit.toLowerCase();
    if (lower.includes('km2100') || lower.includes('2100') || lower.includes('mono')) {
      return 'KM2100 Black (Byrathi Plant)';
    }
    if (lower.includes('c4080') || lower.includes('4080') || lower.includes('accuriopress')) {
      return 'Konica Minolta C4080 (Kalkere Plant)';
    }
    if (lower.includes('lithrone') || lower.includes('komori') || lower.includes('speedmaster') || lower.includes('heidelberg')) {
      return 'Lithrone 26 (Ramamurthy Nagar Plant)';
    }
    if (lower.includes('660')) {
      return 'Ryobi 660 (Ramamurthy Nagar Plant)';
    }
    if (lower.includes('32') || lower.includes('ryobi')) {
      return 'Ryobi 32 (Ramamurthy Nagar Plant)';
    }
  }

  // Parse quantity
  let qty = Number(spec.quantity || spec.print_quantity || spec.order_quantity || 0);
  if (!qty && typeof spec.job_specification === 'string') {
    const match = spec.job_specification.match(/(\d+[\d,]*)\s*(nos|pcs|sheets|copies|qty)/i);
    if (match) {
      qty = parseInt(match[1].replace(/,/g, ''), 10) || 0;
    }
  }

  // Parse category / type / brief
  const typeText = `${spec.production_type || ''} ${spec.printing_type || ''} ${spec.job_types || ''} ${spec.job_specification || ''} ${spec.job_title || ''} ${spec.job_name || ''} ${spec.category || ''}`.toLowerCase();
  const colorText = `${spec.color || ''} ${spec.color_spec || ''} ${spec.colors || ''}`.toLowerCase();

  const isExplicitDigital = typeText.includes('digital') || (qty > 0 && qty <= 800);
  const isMono = colorText.includes('b/w') || colorText.includes('black') || colorText.includes('mono') || colorText.includes('1+0') || colorText.includes('1/0') || colorText.includes('1/1') || colorText.includes('1+1') || typeText.includes('black');

  // Digital Monochrome Rule (Byrathi Plant)
  if ((isExplicitDigital || qty <= 2000) && isMono && (typeText.includes('book') || typeText.includes('bill') || typeText.includes('cash') || typeText.includes('letter') || typeText.includes('manual') || typeText.includes('mono') || typeText.includes('pad'))) {
    return 'KM2100 Black (Byrathi Plant)';
  }

  // Digital Color Rule (Kalkere Plant)
  if (isExplicitDigital || (qty > 0 && qty <= 800) || typeText.includes('visiting card') || typeText.includes('vc ') || typeText.includes('tag') || typeText.includes('c4080')) {
    return 'Konica Minolta C4080 (Kalkere Plant)';
  }

  // Offset Single / 2-color Rule (Ryobi 32 - Ramamurthy Nagar Plant)
  if (isMono || colorText.includes('single color') || colorText.includes('2-color') || colorText.includes('2 color') || colorText.includes('1-color')) {
    return 'Ryobi 32 (Ramamurthy Nagar Plant)';
  }

  // High-volume Offset or Packaging Rule (Lithrone 26 - Ramamurthy Nagar Plant)
  if (qty >= 5000 || typeText.includes('carton') || typeText.includes('box') || typeText.includes('packaging')) {
    return 'Lithrone 26 (Ramamurthy Nagar Plant)';
  }

  // Default Mid-volume Offset (1,000 to 5,000 - Ryobi 660 Ramamurthy Nagar Plant)
  return 'Ryobi 660 (Ramamurthy Nagar Plant)';
};
