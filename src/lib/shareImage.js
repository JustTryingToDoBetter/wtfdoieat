function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || '')
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
    if (lines.length >= maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;

  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function toDataUrl(canvas) {
  return canvas.toDataURL('image/png');
}

export function buildShareImageDataUrl({
  restaurant,
  personality,
  moodLabel,
  budgetLabel,
  distanceLabel,
}) {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#2F1736');
  bg.addColorStop(0.45, '#20153A');
  bg.addColorStop(1, '#151228');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Accent glows
  ctx.fillStyle = 'rgba(255,120,70,0.28)';
  ctx.beginPath();
  ctx.arc(180, 180, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(121,96,255,0.2)';
  ctx.beginPath();
  ctx.arc(910, 1600, 280, 0, Math.PI * 2);
  ctx.fill();

  // Main card
  const cardX = 70;
  const cardY = 190;
  const cardW = width - 140;
  const cardH = 1410;
  roundedRect(ctx, cardX, cardY, cardW, cardH, 46);
  ctx.fillStyle = '#F7F2EE';
  ctx.fill();

  // Header
  ctx.fillStyle = '#7D768A';
  ctx.font = '700 34px "DM Sans", sans-serif';
  ctx.fillText('WTF DO I EAT', cardX + 58, cardY + 94);

  // Title
  ctx.fillStyle = '#201A30';
  ctx.font = '800 72px "Sora", sans-serif';
  drawWrappedText(
    ctx,
    restaurant?.name || 'Unknown Spot',
    cardX + 58,
    cardY + 190,
    cardW - 116,
    82,
    2
  );

  // Meta row
  ctx.fillStyle = '#6F6780';
  ctx.font = '600 36px "DM Sans", sans-serif';
  const meta = `${restaurant?.area || 'Cape Town'}   •   ⭐ ${restaurant?.rating || '-'}`;
  ctx.fillText(meta, cardX + 58, cardY + 355);

  // Vibe
  ctx.fillStyle = '#3B3449';
  ctx.font = '500 40px "DM Sans", sans-serif';
  drawWrappedText(
    ctx,
    `"${restaurant?.vibe || 'Local food spot'}"`,
    cardX + 58,
    cardY + 430,
    cardW - 116,
    54,
    3
  );

  // Chips
  const chips = [moodLabel, budgetLabel, distanceLabel].filter(Boolean);
  let chipX = cardX + 58;
  let chipY = cardY + 625;
  ctx.font = '700 28px "DM Sans", sans-serif';
  chips.forEach((chip) => {
    const textW = ctx.measureText(chip).width;
    const chipW = textW + 52;
    if (chipX + chipW > cardX + cardW - 58) {
      chipX = cardX + 58;
      chipY += 66;
    }
    roundedRect(ctx, chipX, chipY, chipW, 48, 22);
    ctx.fillStyle = '#FFE8DA';
    ctx.fill();
    ctx.fillStyle = '#D65A26';
    ctx.fillText(chip, chipX + 26, chipY + 33);
    chipX += chipW + 16;
  });

  // Known for block
  const blockX = cardX + 48;
  const blockY = cardY + 760;
  const blockW = cardW - 96;
  roundedRect(ctx, blockX, blockY, blockW, 250, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.fillStyle = '#7D768A';
  ctx.font = '700 24px "DM Sans", sans-serif';
  ctx.fillText('KNOWN FOR', blockX + 30, blockY + 52);
  ctx.fillStyle = '#2A233A';
  ctx.font = '600 34px "DM Sans", sans-serif';
  drawWrappedText(
    ctx,
    restaurant?.knownFor || 'Great local favourites',
    blockX + 30,
    blockY + 102,
    blockW - 60,
    44,
    3
  );

  // Personality block
  roundedRect(ctx, blockX, blockY + 280, blockW, 300, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.fillStyle = '#7D768A';
  ctx.font = '700 24px "DM Sans", sans-serif';
  ctx.fillText('YOUR EATING PERSONALITY', blockX + 30, blockY + 332);
  ctx.fillStyle = '#2A233A';
  ctx.font = '700 40px "Sora", sans-serif';
  ctx.fillText(
    `${personality?.emoji || '🍽️'} ${personality?.title || 'The Decider'}`,
    blockX + 30,
    blockY + 400
  );
  ctx.fillStyle = '#4A435A';
  ctx.font = '500 30px "DM Sans", sans-serif';
  drawWrappedText(
    ctx,
    personality?.desc || 'You know what you want and where to find it.',
    blockX + 30,
    blockY + 452,
    blockW - 60,
    40,
    3
  );

  // Footer
  ctx.fillStyle = '#FDFBFF';
  ctx.font = '700 34px "DM Sans", sans-serif';
  ctx.fillText('wtfdoieat.app', cardX + 58, cardY + cardH - 42);

  return toDataUrl(canvas);
}

export function downloadShareImage(filename, dataUrl) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename || 'wtfdoieat-story-card.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
