"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroDetails from "../HeroDetails";
import HeroPicture from "../HeroPicture";

import styles from "./carousel.module.scss";

import { IHeroData } from "@/interfaces/heroes";

interface IProps {
  heroes: IHeroData[];
  activeId: string;
}

enum enPosition {
  FRONT = 0,
  MIDDLE = 1,
  BACK = 2,
}

export default function Carousel({ heroes, activeId }: IProps) {
  // Controla os itens visíveis do carrossel
  const [visibleItems, setVisibleItems] = useState<IHeroData[] | null>(null);

  // Armazena o item ativo do carrossel
  const [activeIndex, setActiveIndex] = useState(
    heroes.findIndex((hero) => hero.id === activeId)
  );

  // Armazenar a posicao inicial, no eixo x, da interacao com o carrossel
  const [startInteractionPosition, setStartInteractionPosition] =
    useState<number>(0);

  // Som de transicao
  const transitionAudio = useMemo(() => new Audio("/songs/transition.mp3"), []);

  // Som de cada personagem
  const voicesAudio: Record<string, HTMLAudioElement> = useMemo(
    () => ({
      "spider-man-616": new Audio("/songs/spider-man-616.mp3"),
      "mulher-aranha-65": new Audio("/songs/mulher-aranha-65.mp3"),
      "spider-man-1610": new Audio("/songs/spider-man-1610.mp3"),
      "sp-dr-14512": new Audio("/songs/sp-dr-14512.mp3"),
      "spider-ham-8311": new Audio("/songs/spider-ham-8311.mp3"),
      "spider-man-90214": new Audio("/songs/spider-man-90214.mp3"),
      "spider-man-928": new Audio("/songs/spider-man-928.mp3"),
    }),
    []
  );

  // Altera o visibleItems sempre que o activeIndex é alterado
  useEffect(() => {
    const size = heroes.length;
    const prev = (activeIndex - 1 + size) % size;
    const next = (activeIndex + 1) % size;

    const visibleItems = [heroes[prev], heroes[activeIndex], heroes[next]];
    console.log("visibleItems: ", visibleItems);
    setVisibleItems(visibleItems);
  }, [heroes, activeIndex]);

  useEffect(() => {
    const htmlEl = document.querySelector("html");

    if (!htmlEl || !visibleItems) {
      return;
    }

    const currentHeroId = visibleItems[enPosition.MIDDLE].id;
    htmlEl.style.backgroundImage = `url("/spiders/${currentHeroId}-background.png")`;
    htmlEl.classList.add("hero-page");

    return () => {
      htmlEl.classList.remove("hero-page");
    };
  }, [visibleItems]);

  useEffect(() => {
    if (!visibleItems) return;

    transitionAudio.play();
    const voiceAudio = voicesAudio[visibleItems[enPosition.MIDDLE].id];

    if (!voiceAudio) return;

    voiceAudio.volume = 0.2;
    voiceAudio.play();
  }, [visibleItems, transitionAudio, voicesAudio]);

  // Altera herói ativo no carrossel
  // +1 rotaciona no sentido horário
  // -1 rotaciona no sentido anti-horário
  const handleChangeActiveIndex = (newDirection: number) => {
    const size = heroes.length;
    setActiveIndex(
      (prevActiveIndex) => (prevActiveIndex + newDirection + size) % size
    );
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setStartInteractionPosition(e.clientX);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const endInteractionPosition = e.clientX;
    const diff = endInteractionPosition - startInteractionPosition;

    const direction = diff <= 0 ? 1 : -1;
    handleChangeActiveIndex(direction);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartInteractionPosition(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const endInteractionPosition = e.changedTouches[0].clientX;
    const diff = endInteractionPosition - startInteractionPosition;

    const direction = diff <= 0 ? 1 : -1;
    handleChangeActiveIndex(direction);
  };

  if (!visibleItems) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.carousel}>
        <div
          className={styles.wrapper}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="popLayout">
            {visibleItems?.map((item, index) => (
              <motion.div
                key={item.id}
                className={styles.hero}
                transition={{ duration: 0.8 }}
                initial={{ x: -1500, scale: 0.8 }}
                animate={{ x: 0, ...getItemStyles(index) }}
                exit={{ x: 0, left: "-20%", opacity: 0, scale: 1 }}
              >
                <HeroPicture hero={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <motion.div
        className={styles.details}
        transition={{ delay: 1, duration: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <HeroDetails data={visibleItems[enPosition.MIDDLE]} />
      </motion.div>
    </div>
  );
}

const getItemStyles = (position: enPosition) => {
  if (position === enPosition.FRONT) {
    return {
      zIndex: 3,
      scale: 1.2,
      filter: "blur(10px)",
    };
  }

  if (position === enPosition.MIDDLE) {
    return {
      zIndex: 2,
      top: "-10%",
      left: 300,
      scale: 0.8,
    };
  }

  return {
    zIndex: 1,
    top: "-20%",
    left: 160,
    scale: 0.6,
    filter: "blur(10px)",
    opacity: 0.8,
  };
};
