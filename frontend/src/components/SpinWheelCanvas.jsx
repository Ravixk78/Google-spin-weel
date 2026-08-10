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
  '#FCE1E4', // Romantic Perfume (Soft Pink)
  '#FEF08A', // Makhalat Barakah (Soft Yellow)
  '#BAE6FD', // Oud Powder (Soft Sky Blue)
  '#FECDD3', // Exclusive Oud Incense (Soft Rose)
  '#A7F3D0', // Musk Lavender (Soft Mint)
  '#C6F6D5', // Pearl Ajmal (Soft Lime)
  '#E0F2FE', // Musk Al Gharam (Pastel Blue)
  '#E8DFF5'  // Kalemat Oud (Soft Lilac)
];

const fallbackPrizesList = [
  { id: 1, name: 'Romantic Perfume', color_code: '#FCE1E4', image_url: '/assets/prizes/prize_1.png' },
  { id: 2, name: 'مخلط بركة', color_code: '#FEF08A', image_url: '/assets/prizes/prize_2.png' },
  { id: 3, name: 'Oud Powder', color_code: '#BAE6FD', image_url: '/assets/prizes/prize_3.png' },
  { id: 4, name: 'Exclusive Oud Incense', color_code: '#FECDD3', image_url: '/assets/prizes/prize_4.png' },
  { id: 5, name: 'Musk Lavender', color_code: '#A7F3D0', image_url: '/assets/prizes/prize_5.png' },
  { id: 6, name: 'Pearl Ajmal', color_code: '#C6F6D5', image_url: '/assets/prizes/prize_6.png' },
  { id: 7, name: 'Musk Al Gharam', color_code: '#E0F2FE', image_url: '/assets/prizes/prize_7.png' },
  { id: 8, name: 'Kalemat Oud', color_code: '#E8DFF5', image_url: '/assets/prizes/prize_8.png' }
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
      const pKey = prize.id || prize.name;
      if (prize && prize.image_url && typeof prize.image_url === 'string' && prize.image_url.trim()) {
        const url = prize.image_url.trim();
        const img = new Image();
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
          img.crossOrigin = 'Anonymous';
        }

        img.onload = () => {
          if (isMounted) {
            setLoadedImages(prev => ({ ...prev, [pKey]: img }));
          }
        };

        img.onerror = () => {
          // Fallback image path
          const fallbackUrl = `/assets/prizes/prize_${prize.display_order || prize.id || 1}.png`;
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            if (isMounted) {
              setLoadedImages(prev => ({ ...prev, [pKey]: fallbackImg }));
            }
          };
          fallbackImg.src = fallbackUrl;
        };

        img.src = url;
      } else {
        const fallbackUrl = `/assets/prizes/prize_${prize.display_order || prize.id || 1}.png`;
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          if (isMounted) {
            setLoadedImages(prev => ({ ...prev, [pKey]: fallbackImg }));
          }
        };
        fallbackImg.src = fallbackUrl;
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

      // 3. Draw Pastel Segments with Perfect Wedge Clipping & Non-overlapping Text Badges
      activePrizes.forEach((prize, i) => {
        if (!prize) return;
        const startAngle = angleOffset + i * arcSize;
        const endAngle = startAngle + arcSize;
        const textAngle = startAngle + arcSize / 2;

        // Clip to exact triangle slice wedge path
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.closePath();

        // Fill Pastel Segment Background
        const segmentColor = prize.color_code || defaultPastelColors[i % defaultPastelColors.length];
        ctx.fillStyle = segmentColor;
        ctx.fill();

        // Clean White Slice Divider Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Clip context to exact triangle wedge so image fills slice without white square borders
        ctx.clip();

        // Draw Prize Slice Wedge Image
        const pKey = prize.id || prize.name;
        const prizeImg = loadedImages[pKey];
        
        if (prizeImg) {
          try {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(textAngle);

            const imgSize = outerRadius * 2;
            ctx.drawImage(prizeImg, -outerRadius, -outerRadius, imgSize, imgSize);
            ctx.restore();
          } catch (e) {
            console.warn('Image draw warning:', e);
          }
        }

        ctx.restore(); // Restore wedge clip context

        // Draw Prize Label Text Badge (Outside Clip to ensure 100% crisp, unclipped text)
        try {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(textAngle);

          const pName = prize.name || '';
          let label = pName;
          if (lang === 'ar') {
            label = prizeTranslations[pName] || pName;
          } else {
            label = prizeTranslations[pName] && !/[a-zA-Z]/.test(pName) ? prizeTranslations[pName] : pName;
          }

          const textRadius = outerRadius - 36;
          ctx.translate(textRadius, 0);

          ctx.font = "bold 11px 'Outfit', 'Inter', system-ui, -apple-system, sans-serif";
          const textWidth = ctx.measureText(label).width;
          const paddingX = 9;
          const pillW = textWidth + paddingX * 2;
          const pillH = 22;

          // Sleek dark charcoal pill badge with subtle gold border & shadow
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 6;

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 11);
            ctx.fill();
          } else {
            ctx.fillRect(-pillW / 2, -pillH / 2, pillW, pillH);
          }

          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, 0, 1);

          ctx.restore();
        } catch (textErr) {
          console.warn('Text draw warning:', textErr);
        }
      });

      // 4. Draw Inner Gold Ring around Center Cap
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 56, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 5. Draw Center Cap (Pure White Disc with Dual Gold Border)
      const centerRadius = 50;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 12;
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

      // 6. Draw Center Logo
      if (centerLogo) {
        try {
          const logoSize = 72;
          ctx.drawImage(centerLogo, centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
        } catch (e) {
          console.warn('Logo draw warning:', e);
        }
      } else {
        // Fallback Gold Text
        ctx.fillStyle = '#996515';
        ctx.font = "bold 13px 'Outfit', 'Inter', sans-serif";
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

    const targetSegmentAngle = -(targetIndex * arcSize + arcSize / 2) - Math.PI / 2;
    const extraRotations = 12 * 2 * Math.PI;
    const finalAngle = targetSegmentAngle - extraRotations;

    const duration = 10000;
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
    <div className="relative flex flex-col items-center justify-center p-2 md:p-4 my-2">
      {/* Top Gold Pointer Arrow with Ring Loop Ornament */}
      <div className="absolute top-0 z-20 transform -translate-y-1 flex flex-col items-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 bg-amber-100 shadow-md flex items-center justify-center -mb-2 z-10">
          <div className="w-2.5 h-2.5 rounded-full border border-amber-600 bg-amber-300" />
        </div>
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[26px] border-t-amber-500 filter drop-shadow-[0_4px_8px_rgba(212,175,55,0.6)]" />
      </div>

      {/* Outer Wheel Container - Enlarged Size */}
      <div className="relative rounded-full p-2 md:p-3 bg-gradient-to-b from-amber-200/50 via-amber-100/30 to-amber-300/40 shadow-2xl max-w-[500px] w-full">
        <canvas
          ref={canvasRef}
          width={540}
          height={540}
          className="w-full h-auto rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SpinWheelCanvas;

