'use client'; // ← Required for Swiper + Framer Motion (client-side animations)

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css/bundle';

type Testimonial = {
  quote: string;
  author: string;
  location: string;
};

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
  title?: string; // Optional: CMS-driven section title
};

export default function TestimonialCarousel({
  testimonials,
  title = 'What Our Community Says', // Fallback title
}: TestimonialCarouselProps) {
  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-center mb-12 text-primary">
          {title}
        </h2>
        
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          modules={[Pagination, Autoplay]}
          className="testimonial-swiper pb-12"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="text-center px-4 py-8">
                <svg
                  className="w-12 h-12 mx-auto mb-6 text-accent opacity-50"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                
                <blockquote className="text-xl md:text-2xl font-serif text-textDark mb-6 italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                <cite className="not-italic">
                  <p className="font-semibold text-primary text-lg">
                    {testimonial.author}
                  </p>
                  <p className="text-textLight">{testimonial.location}</p>
                </cite>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .testimonial-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #c9975b;
          opacity: 0.3;
          transition: all 0.3s ease;
        }

        .testimonial-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.3);
        }
      `}</style>
    </section>
  );
}
