import { motion } from 'framer-motion';
import React from 'react';
import Slider from 'react-slick';
import { projects } from '../Constants/constants';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export const staggerContainer = (staggerChildren, delayChildren) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren: delayChildren || 0,
    },
  },
});

export const textVariant = (delay) => ({
  hidden: {
    y: -50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 1.25,
      delay,
    },
  },
});

export const fadeIn = (direction, type, delay, duration) => ({
  hidden: {
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

export const zoomIn = (delay, duration) => ({
  hidden: {
    scale: 0,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'tween',
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

export const slideIn = (direction, type, delay, duration) => ({
  hidden: {
    x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
    y: direction === 'up' ? '100%' : direction === 'down' ? '100%' : 0,
  },
  show: {
    x: 0,
    y: 0,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

const SectionWrapper = (Component, idName) => function HOC() {
  return (
    <motion.section
      variants={staggerContainer()}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.25,
      }}
      className=""
    >
      <span className="hash-span" id={idName}>
        &nbsp;
      </span>
      <Component />
    </motion.section>
  );
};

function ProjectCard({
  index,
  name,
  description,
  images,
  icon,
  store_data,
}) {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: 'slider-container',
  };

  return (
    <motion.div
      variants={fadeIn('up', 'spring', index * 0.5, 0.75)}
      className="p-5 rounded-lg w-full bg-dark-backdrop"
    >
      <div className="flex flex-row items-start">
        <div className="flex flex-col items-center mr-4">
          <img
            src={icon}
            alt={`${name} icon`}
            className="w-32 h-32 object-cover"
          />
          {store_data && store_data.length > 0 && (
            <div className="flex mt-2">
              {store_data.map((store, idx) => (
                <a key={idx} href={store.link} target="_blank" rel="noreferrer" className="m-1">
                  <img src={store.icon} alt={store.name} className="w-8 h-8 object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex-grow">
          <h3
            className="text-xl font-bold"
            style={{ color: '#FFFFFF' }}
          >
            {name}
          </h3>
          <p
            className="mt-2"
            style={{ color: '#FFFFFF' }}
          >
            {description}
          </p>
        </div>
      </div>

      {images && images.length > 0 && (
        <div className="mt-4 w-full">
          <Slider {...sliderSettings}>
            {images.map((img, idx) => (
              <div key={idx} className="slider-image-container">
                <img
                  src={img}
                  alt={`Screenshot ${idx + 1}`}
                  className="object-cover w-full h-auto rounded-md"
                />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </motion.div>
  );
}

function Works() {
  return (
    <div className="mt-5 w-full text-grayscale-50">
      {projects.map((project, index) => (
        <ProjectCard key={`project-${index}`} index={index} {...project} />
      ))}
    </div>
  );
}

export default SectionWrapper(Works, '');
