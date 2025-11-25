const fs = require('fs');
const path = require('path');

const ICON_DIR = path.resolve(__dirname, '../assets/Icons/gym-icons');

function sanitizeSvg(svg) {
  // 0) Remove the rounded rectangle border that appears in all icons
  // Pattern: any path starting with M12 0.5 (rounded rect border covering most of 100x100 viewBox)
  let out = svg.replace(
    /<path[^>]*d="M12\s+0\.5[^"]*"[^>]*\/?>/gi,
    ''
  );
  
  // 1) Remove any top-level fills that produce solid backgrounds
  out = out
    .replace(/fill="#000000"/gi, 'fill="none"')
    .replace(/fill="#000"/gi, 'fill="none"')
    .replace(/fill="#111111"/gi, 'fill="none"')
    .replace(/fill="#101010"/gi, 'fill="none"')
    .replace(/fill="#0{3,6}"/gi, 'fill="none"')
    .replace(/fill="black"/gi, 'fill="none"')
    .replace(/fill="currentColor"/gi, 'fill="none"')
    .replace(/fill-opacity="[0-9.]+"/gi, '');

  // 1b) Also sanitize inline style attributes with fill: ...
  out = out.replace(/style="([^"]*)"/gi, (m, styles) => {
    const cleaned = styles
      .replace(/fill:\s*#[0-9a-fA-F]{3,6}\s*;?/g, 'fill:none;')
      .replace(/fill:\s*black\s*;?/gi, 'fill:none;')
      .replace(/fill:\s*currentColor\s*;?/gi, 'fill:none;')
      .replace(/background:\s*#[0-9a-fA-F]{3,6}\s*;?/g, '')
      .replace(/background-color:\s*#[0-9a-fA-F]{3,6}\s*;?/g, '');
    return `style="${cleaned}"`;
  });

  // 2) Remove large rect backgrounds (rect covering most of the viewbox)
  // Make every rect transparent (no fills)
  out = out.replace(/<rect([^>]*)fill="[^"]+"([^>]*)\/>/gi, '<rect$1fill="none"$2/>');
  out = out.replace(/<rect([^>]*)>/gi, (m) => {
    if (/fill=/.test(m)) return m; // handled above
    return m.replace('<rect', '<rect fill="none"');
  });

  // Ensure paths don't bring their own solid fills
  out = out.replace(/<path([^>]*)fill="(?!none)[^"]+"([^>]*)\/>/gi, '<path$1fill="none"$2/>');
  out = out.replace(/<circle([^>]*)fill="(?!none)[^"]+"([^>]*)\/>/gi, '<circle$1fill="none"$2/>');
  out = out.replace(/<ellipse([^>]*)fill="(?!none)[^"]+"([^>]*)\/>/gi, '<ellipse$1fill="none"$2/>');

  // CRITICAL: Force fill="none" on ALL paths/circles/ellipses that don't already have fill attribute
  out = out.replace(/<path([^>]*)(?<!fill=)([^>]*)\/>/gi, (match, before, after) => {
    if (!match.includes('fill=')) {
      return `<path${before} fill="none"${after}/>`;
    }
    return match;
  });
  out = out.replace(/<path([^>]*)>/gi, (match) => {
    if (!match.includes('fill=')) {
      return match.replace('<path', '<path fill="none"');
    }
    return match;
  });

  // 3) Force currentColor so we can drive stroke via props
  out = out
    .replace(/stroke="#?[A-Fa-f0-9]{3,6}"/g, 'stroke="currentColor"')
    .replace(/fill="#?[A-Fa-f0-9]{3,6}"/g, 'fill="none"');

  return out;
}

function run() {
  const files = fs.readdirSync(ICON_DIR).filter((f) => f.endsWith('.svg'));
  files.forEach((file) => {
    const p = path.join(ICON_DIR, file);
    const svg = fs.readFileSync(p, 'utf8');
    const out = sanitizeSvg(svg);
    fs.writeFileSync(p, out, 'utf8');
    console.log('sanitized', file);
  });
}

run();


