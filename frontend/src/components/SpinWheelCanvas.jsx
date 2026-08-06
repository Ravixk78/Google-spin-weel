import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import wheelLogoAsset from '../assets/wheel-logo.png';

const prizeTranslations = {
  'Luxury Travel Set': 'مجموعة السفر الفاخرة',
  'Special Edition Kit': 'مجموعة الإصدار الخاص',
  'Majlis Al Oud Branch': 'فرع مجلس العود',
  'Luxury Royal Oud Oil': 'دهن العود الملكي الفاخر',
  'Majlis Signature Set': 'مجموعة توقيع مجلس العود',
  'Amber & Oud Bukhoor': 'بخور العنبر والعود',
  'Majlis Al Oud Perfume': 'عطر مجلس العود',
  'Dehn El Oud Car Oil': 'دهن عود للسيارة',
  'Exclusive Oud Incense': 'بخور العود الحصري',
  'Majlis Gift Card': 'بطاقة هدايا مجلس العود',

  // Reverse mapping for Arabic -> English
  'مجموعة السفر الفاخرة': 'Luxury Travel Set',
  'مجموعة الإصدار الخاص': 'Special Edition Kit',
  'فرع مجلس العود': 'Majlis Al Oud Branch',
  'دهن العود الملكي الفاخر': 'Luxury Royal Oud Oil',
  'مجموعة توقيع مجلس العود': 'Majlis Signature Set',
  'بخور العنبر والعود': 'Amber & Oud Bukhoor',
  'عطر مجلس العود': 'Majlis Al Oud Perfume',
  'دهن عود للسيارة': 'Dehn El Oud Car Oil',
  'بخور العود الحصري': 'Exclusive Oud Incense',
  'بطاقة هدايا مجلس العود': 'Majlis Gift Card',
};

const defaultPastelColors = [
  '#FAD0C4', // Soft Pastel Pink
  '#FBE7C6', // Soft Peach / Cream
  '#B5EAD7', // Soft Pastel Mint
  '#E2F0CB', // Soft Pastel Lime/Yellow
  '#C7CEEA', // Soft Pastel Lavender Blue
  '#FFDAC1', // Soft Pastel Apricot
  '#E8DFF5', // Soft Pastel Lilac
  '#FCE1E4', // Soft Pastel Blush
  '#FCF6BD', // Soft Pastel Lemon
  '#D0F4DE'  // Soft Pastel Seafoam
];

const fallbackPrizesList = [
  { id: 1, name: 'Luxury Travel Set', color_code: '#FAD0C4' },
  { id: 2, name: 'Special Edition Kit', color_code: '#FBE7C6' },
  { id: 3, name: 'Majlis Al Oud Branch', color_code: '#B5EAD7' },
  { id: 4, name: 'Luxury Royal Oud Oil', color_code: '#E2F0CB' },
  { id: 5, name: 'Majlis Signature Set', color_code: '#C7CEEA' },
  { id: 6, name: 'Amber & Oud Bukhoor', color_code: '#FFDAC1' },
  { id: 7, name: 'Majlis Al Oud Perfume', color_code: '#E8DFF5' },
  { id: 8, name: 'Dehn El Oud Car Oil', color_code: '#FCE1E4' },
  { id: 9, name: 'Exclusive Oud Incense', color_code: '#FCF6BD' },
  { id: 10, name: 'Majlis Gift Card', color_code: '#D0F4DE' }
];

// Word wrap helper for canvas text without truncation
const wrapTextLines = (text, maxCharsPerLine = 13) => {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 2); // Max 2 clean lines
};

const SpinWheelCanvas = ({ prizes, winningIndex, isSpinning, onSpinComplete }) => {
  const canvasRef = useRef(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [centerLogo, setCenterLogo] = useState(null);
  const { lang } = useLanguage();

  // Active prizes array with fallback
  const activePrizes = prizes && prizes.length > 0 ? prizes : fallbackPrizesList;

  // Load center logo using bundled asset
  useEffect(() => {
    const img = new Image();
    img.src = wheelLogoAsset;
    img.onload = () => setCenterLogo(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.src = '/wheel-logo.png';
      img2.onload = () => setCenterLogo(img2);
    };
  }, []);

  // Load prize segment images
  useEffect(() => {
    if (!activePrizes || activePrizes.length === 0) return;
    let isMounted = true;

    activePrizes.forEach((prize) => {
      if (prize && prize.image_url && typeof prize.image_url === 'string' && prize.image_url.trim()) {
        const url = prize.image_url.trim();
        const img = new Image();
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
          img.crossOrigin = 'Anonymous';
        }

        img.onload = () => {
          if (isMounted) {
            setLoadedImages(prev => ({ ...prev, [prize.id]: img }));
          }
        };

        img.onerror = (e) => {
          console.warn(`Failed to load prize image for prize ID ${prize.id}`, e);
        };

        img.src = url;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activePrizes]);

  useEffect(() => {
    drawWheel(currentAngle);
  }, [activePrizes, currentAngle, lang, loadedImages, centerLogo]);

  useEffect(() => {
    if (isSpinning && winningIndex !== null && winningIndex !== undefined) {
      animateSpin(winningIndex);
    }
  }, [isSpinning, winningIndex]);

  const drawWheel = (angleOffset) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const outerRadius = width / 2 - 22;

      ctx.clearRect(0, 0, width, height);

      if (!activePrizes || activePrizes.length === 0) return;

      const numSegments = activePrizes.length;
      const arcSize = (2 * Math.PI) / numSegments;

      // 1. Outer Outer Light Ring & Shadow
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 10, 0, 2 * Math.PI);
      const goldOuterGrad = ctx.createLinearGradient(0, 0, width, height);
      goldOuterGrad.addColorStop(0, '#F5E5B8');
      goldOuterGrad.addColorStop(0.5, '#D4AF37');
      goldOuterGrad.addColorStop(1, '#B38728');
      ctx.strokeStyle = goldOuterGrad;
      ctx.lineWidth = 6;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.35)';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();

      // 2. Inner Thin Gold Concentric Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#E8C86B';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 3. Draw Pastel Segments
      activePrizes.forEach((prize, i) => {
        if (!prize) return;
        const startAngle = angleOffset + i * arcSize;
        const endAngle = startAngle + arcSize;

        // Fill Pastel Segment - ALWAYS use sample light pastel colors
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = defaultPastelColors[i % defaultPastelColors.length];
        ctx.fill();

        // Clean White Slice Divider Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Text & Segment Prize Image Drawing
        ctx.save();
        ctx.translate(centerX, centerY);
        const textAngle = startAngle + arcSize / 2;
        ctx.rotate(textAngle);

        const prizeImg = loadedImages[prize.id];
        
        // Draw Prize Image on outer slice radius inside clean rounded mask (no ugly white border box)
        if (prizeImg) {
          try {
            ctx.save();
            const imgSize = 32;
            const imgRadius = outerRadius - 38;
            
            ctx.beginPath();
            ctx.arc(imgRadius, 0, imgSize / 2, 0, 2 * Math.PI);
            ctx.clip();

            ctx.drawImage(prizeImg, imgRadius - imgSize / 2, -imgSize / 2, imgSize, imgSize);
            ctx.restore();
          } catch (e) {
            console.warn('Image draw warning:', e);
          }
        }

        // Multi-line Prize Label Text - Crisp, readable, no truncation
        try {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#1E293B'; // Dark Charcoal for pastel contrast
          ctx.font = lang === 'ar' ? 'bold 11px serif' : 'bold 11px sans-serif';

          const pName = prize.name || '';
          let label = pName;
          if (lang === 'ar') {
            label = prizeTranslations[pName] || pName;
          } else {
            label = prizeTranslations[pName] && !/[a-zA-Z]/.test(pName) ? prizeTranslations[pName] : pName;
          }

          const lines = wrapTextLines(String(label), prizeImg ? 12 : 14);
          const textRadius = prizeImg ? outerRadius - 88 : outerRadius - 62;
          
          ctx.save();
          ctx.translate(textRadius, 0);

          if (lines.length === 1) {
            ctx.fillText(lines[0], 0, 4);
          } else if (lines.length >= 2) {
            ctx.fillText(lines[0], 0, -3);
            ctx.fillText(lines[1], 0, 9);
          }

          ctx.restore();
        } catch (textErr) {
          console.warn('Text draw warning:', textErr);
        }

        ctx.restore();
      });

      // 4. Draw Inner Gold Ring around Center Cap
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 5. Draw Center Cap (Pure White Disc with Dual Gold Border)
      const centerRadius = 46;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Dual Gold Border on Center Circle
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius - 4, 0, 2 * Math.PI);
      ctx.strokeStyle = '#F3E5AB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 6. Draw Center Logo (from Image 2)
      if (centerLogo) {
        try {
          const logoSize = 64;
          ctx.drawImage(centerLogo, centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
        } catch (e) {
          console.warn('Logo draw warning:', e);
        }
      } else {
        // Fallback Gold Text
        ctx.fillStyle = '#996515';
        ctx.font = 'bold 12px serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ar' ? 'مجلس' : 'MAJLIS', centerX, centerY - 6);
        ctx.fillText(lang === 'ar' ? 'العود' : 'AL OUD', centerX, centerY + 10);
      }

      ctx.restore();
    } catch (err) {
      console.error('Canvas Draw Error:', err);
    }
  };

  const animateSpin = (targetIndex) => {
    if (!activePrizes || activePrizes.length === 0) return;

    const numSegments = activePrizes.length;
    const arcSize = (2 * Math.PI) / numSegments;

    // Pointer is at 12 o'clock (-Math.PI/2)
    const targetSegmentAngle = -(targetIndex * arcSize + arcSize / 2) - Math.PI / 2;

    const extraRotations = 12 * 2 * Math.PI;
    const finalAngle = targetSegmentAngle - extraRotations;

    const duration = 10000; // 10 seconds spin
    const startTime = performance.now();
    const startAngle = currentAngle;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const angle = startAngle + (finalAngle - startAngle) * easedProgress;
      setCurrentAngle(angle);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (onSpinComplete) onSpinComplete();
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Top Gold Pointer Arrow with Ring Loop Ornament (Matching Image 1) */}
      <div className="absolute top-0 z-20 transform -translate-y-1 flex flex-col items-center">
        {/* Ring Loop at Top */}
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 bg-amber-100 shadow-md flex items-center justify-center -mb-2 z-10">
          <div className="w-2.5 h-2.5 rounded-full border border-amber-600 bg-amber-300" />
        </div>
        {/* Downward Pointer Triangle */}
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-500 filter drop-shadow-[0_4px_8px_rgba(212,175,55,0.6)]" />
      </div>

      {/* Outer Subtle Shadow Ring */}
      <div className="relative rounded-full p-2 bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-amber-300/30 shadow-xl">
        <canvas
          ref={canvasRef}
          width={460}
          height={460}
          className="max-w-full h-auto rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SpinWheelCanvas;

