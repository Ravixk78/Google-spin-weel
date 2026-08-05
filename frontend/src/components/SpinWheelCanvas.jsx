import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Trophy, Gift, Award, Crown, Flame, Package } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const prizeTranslations = {
  'Exclusive Oud Perfume 50ml': 'عطر عود فاخر 50مل',
  'Luxury Oud Wood Chip 25g': 'رقائق عود فاخر 25غ',
  'Royal Bakhoor Incense Box': 'صندوق بخور ملكي',
  '15% Store Discount Voucher': 'قسيمة خصم 15%',
  'Majlis Fragrance Sample Set': 'مجموعة عينات عطور',
  'Golden Oud Oil Concentrated': 'دهن عود ذهبي مركز',
  'Better Luck Next Time': 'حظاً أوفر المرة القادمة',
  'Free Oud Incense': 'بخور عود مجاني'
};

const SpinWheelCanvas = ({ prizes, winningIndex, isSpinning, onSpinComplete }) => {
  const canvasRef = useRef(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const { lang } = useLanguage();

  // Load prize segment images
  useEffect(() => {
    if (!prizes || prizes.length === 0) return;
    let isMounted = true;

    prizes.forEach((prize) => {
      if (prize.image_url && prize.image_url.trim()) {
        const url = prize.image_url.trim();
        if (!loadedImages[prize.id]) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = url;
          img.onload = () => {
            if (isMounted) {
              setLoadedImages(prev => ({ ...prev, [prize.id]: img }));
            }
          };
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [prizes]);

  useEffect(() => {
    drawWheel(currentAngle);
  }, [prizes, currentAngle, lang, loadedImages]);

  useEffect(() => {
    if (isSpinning && winningIndex !== null && winningIndex !== undefined) {
      animateSpin(winningIndex);
    }
  }, [isSpinning, winningIndex]);

  const drawWheel = (angleOffset) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = width / 2 - 15;

    ctx.clearRect(0, 0, width, height);

    if (!prizes || prizes.length === 0) return;

    const numSegments = prizes.length;
    const arcSize = (2 * Math.PI) / numSegments;

    // Outer Luxury Gold Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI);
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, '#FFF0B8');
    goldGrad.addColorStop(0.5, '#D4AF37');
    goldGrad.addColorStop(1, '#AA7C11');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 12;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Draw Segments
    prizes.forEach((prize, i) => {
      const startAngle = angleOffset + i * arcSize;
      const endAngle = startAngle + arcSize;

      // Fill Slice
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.closePath();

      // Segment Colors
      ctx.fillStyle = prize.color_code || (i % 2 === 0 ? '#123530' : '#1E4D45');
      ctx.fill();

      // Gold Segment Border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Text & Segment Prize Image
      ctx.save();
      ctx.translate(centerX, centerY);
      const textAngle = startAngle + arcSize / 2;
      ctx.rotate(textAngle);

      const prizeImg = loadedImages[prize.id];
      
      // Draw Prize Image inside segment slice if available (fits inside boundary without crop)
      if (prizeImg) {
        ctx.save();
        const imgSize = 26;
        const imgRadius = outerRadius - 58;
        ctx.drawImage(prizeImg, imgRadius - imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
      }

      // Prize Label Text
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 11px Outfit, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;

      let label = lang === 'ar' && prizeTranslations[prize.name] ? prizeTranslations[prize.name] : prize.name;
      if (label.length > 20) {
        label = label.substring(0, 18) + '...';
      }

      const textRadius = prizeImg ? outerRadius - 18 : outerRadius - 30;
      ctx.fillText(label, textRadius, 4);

      ctx.restore();
    });

    // Draw Center Cap (Majlis Al Oud Logo Hub)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 45);
    centerGrad.addColorStop(0, '#0A1F1C');
    centerGrad.addColorStop(1, '#050E0C');
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center Gold Text
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 11px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'ar' ? 'مجلس' : 'MAJLIS', centerX, centerY - 6);
    ctx.fillText(lang === 'ar' ? 'العود' : 'AL OUD', centerX, centerY + 8);
    ctx.restore();
  };

  const animateSpin = (targetIndex) => {
    if (!prizes || prizes.length === 0) return;

    const numSegments = prizes.length;
    const arcSize = (2 * Math.PI) / numSegments;

    // Target angle calculation: Pointer is at 12 o'clock (-Math.PI/2)
    const targetSegmentAngle = -(targetIndex * arcSize + arcSize / 2) - Math.PI / 2;

    // Add 12 full 360-degree rotations for high-suspense 10-second spin
    const extraRotations = 12 * 2 * Math.PI;
    const finalAngle = targetSegmentAngle - extraRotations;

    const duration = 10000; // 10 full seconds spin
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
      {/* Top Gold Pointer Arrow */}
      <div className="absolute top-0 z-20 transform -translate-y-2 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-gold-400 filter drop-shadow-[0_4px_10px_rgba(212,175,55,0.8)]" />
        <div className="w-4 h-4 bg-gold-200 rounded-full border-2 border-black -mt-2 shadow-md" />
      </div>

      {/* Outer Glow Wrapper */}
      <div className="relative rounded-full p-2 bg-gradient-to-r from-gold-400/20 via-gold-200/10 to-gold-600/20 shadow-gold-lg">
        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="max-w-full h-auto drop-shadow-2xl rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SpinWheelCanvas;
