import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import useWindowScroll from '@react-hook/window-scroll';
import { ChevronDoubleUp } from './Icons';

const THRESHOLD = 300;

/**
 * Hook which returns a `boolean` value, representing
 * whether the button should be visible or not.
 */
function useJumpToTop(): boolean {
  const [visible, setVisible] = useState<boolean>(false);
  const y = useWindowScroll();

  useEffect(() => {
    if (!visible && y >= THRESHOLD) {
      setVisible(true);
    }

    if (visible && y < THRESHOLD) {
      setVisible(false);
    }
  }, [visible, y]);

  return visible;
}

/**
 * Adds a Floating Action Button to the page whenever the `y` scroll
 * position exceeds that of the threshold. 
 */
export function JumpToTop() {
  const visible = useJumpToTop();

  function goToTop() {
    if (typeof window === 'undefined') {
      console.warn('JumpToTop: no window available');
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <div
      className={cx(
        'hidden desktop:block fixed w-12 h-12 rounded-full right-0 bottom-0 mr-4 mb-4 cursor-pointer bg-theme-color shadow hover:shadow-xl transition-opacity',
        {
          'opacity-0 pointer-events-none': !visible,
          'opacity-100 pointer-events-auto': visible,
        },
      )}
    >
      <div
        role="button"
        onClick={goToTop}
        className="z-20 absolute inset-0 flex items-center justify-center"
      >
        <ChevronDoubleUp size={24} className="text-white" />
      </div>
    </div>
  );
}
