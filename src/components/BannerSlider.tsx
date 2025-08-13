'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';
import { IBanner } from '@/models/Banner';
import '@/css/banner-slider.css';

const BannerSlider = ({ location, className }: { location: string, className?: string }) => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchBannersForLocation = async () => {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          const allBanners = await res.json();
          const filteredBanners = allBanners.filter(
            (b: IBanner) => b.isActive && (b.displayLocation === location || b.displayLocation === 'all')
          );
          setBanners(filteredBanners);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBannersForLocation();
  }, [location]);

  if (banners.length === 0) return null;

  const baseUrl = 'https://todaylivescores.com';

  return (
    <div className={`embla relative rounded-lg overflow-hidden ${className}`} ref={emblaRef}>
      <div className="embla__container h-full">
        {banners.map(banner => (
          <div className="embla__slide relative h-full" key={banner._id.toString()}>
            <Link href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
             <div className="relative w-full h-120 rounded-xl overflow-hidden">
                <Image
                  src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `${baseUrl}${banner.imageUrl}`}
                  alt="Promotional Banner"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        className="embla__prev absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-black/60 transition-colors z-10"
        onClick={scrollPrev}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
      </button>
      <button
        className="embla__next absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-black/60 transition-colors z-10"
        onClick={scrollNext}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
};

export default BannerSlider;