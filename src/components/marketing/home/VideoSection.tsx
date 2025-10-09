"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  mute: () => void;
  destroy: () => void;
  getIframe?: () => HTMLIFrameElement;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (event: { target: YouTubePlayer }) => void;
        onStateChange?: (event: {
          data: number;
          target: YouTubePlayer;
        }) => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type VideoConfig = {
  id: string;
  videoId: string;
  title: string;
  start?: number;
};

const videos: VideoConfig[] = [
  {
    id: "ganga-aarti",
    videoId: "mo71k6k5E-k",
    title: "Divine Ganga Aarti – Rishikesh Dham",
    start: 86,
  },
  {
    id: "ashram-tour",
    videoId: "V2CrSWlqkgA",
    title: "Ashram Visual Tour",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

function VideoCard({
  video,
  apiReady,
}: {
  video: VideoConfig;
  apiReady: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  useEffect(() => {
    if (!apiReady || !window.YT || playerRef.current || !mountRef.current) {
      return;
    }

    const { Player, PlayerState } = window.YT;

    const player = new Player(mountRef.current, {
      host: "https://www.youtube-nocookie.com",
      videoId: video.videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        loop: 1,
        playlist: video.videoId,
        playsinline: 1,
        disablekb: 1,
        start: video.start ?? 0,
      },
      events: {
        onReady: (event) => {
          event.target.mute();
          event.target.playVideo();

          const iframe = event.target.getIframe?.();
          if (iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.left = "0";
            iframe.style.top = "0";
            iframe.style.position = "absolute";
            iframe.style.pointerEvents = "none";
            iframe.style.objectFit = "cover";
          }
        },
        onStateChange: (event) => {
          if (event.data === PlayerState.PLAYING) {
            setIsPlaying(true);
            setShowPoster(false);
          } else if (event.data === PlayerState.PAUSED) {
            setIsPlaying(false);
            setShowPoster(true);
          } else if (event.data === PlayerState.ENDED) {
            event.target.seekTo(video.start ?? 0, true);
            setShowPoster(false);
            event.target.playVideo();
          }
        },
      },
    });

    playerRef.current = player;

    return () => {
      player.destroy();
      playerRef.current = null;
      setIsPlaying(false);
      setShowPoster(true);
    };
  }, [apiReady, video.videoId, video.start]);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
      setShowPoster(true);
    } else {
      player.playVideo();
      setShowPoster(false);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="flex w-full flex-col items-center"
    >
      <div className="group relative w-full overflow-hidden rounded-2xl bg-black shadow-lg shadow-primary/5">
        <div className="relative aspect-video">
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
              showPoster ? "opacity-0" : "opacity-100"
            }`}
          >
            <div
              ref={mountRef}
              className="h-full w-full"
              aria-label={video.title}
            />
          </div>
          {showPoster && (
            <Image
              src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
              alt={video.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="absolute inset-0 object-cover"
            />
          )}
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute inset-0 flex items-center justify-center focus-visible:outline-none"
          aria-label={`${isPlaying ? "Pause" : "Play"} ${video.title}`}
          aria-pressed={isPlaying}
        >
          <span
            className={`flex size-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-opacity duration-200 ${
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
          >
            {isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6" />
            )}
          </span>
        </button>
      </div>
      <div className="w-full -mt-4 px-5">
        <div className="mx-auto rounded-2xl border border-border/40 bg-primary/15 px-6 lg:py-3 py-2 text-center">
          <h4 className="text-sm lg:text-xl mt-3 font-semibold text-primary">
            {video.title}
          </h4>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders the "Visual Journey" section with a centered header and an animated responsive grid of videos.
 *
 * The grid contains two embedded YouTube videos that play muted and loop by default, each displaying a bottom title overlay.
 *
 * @returns The JSX section element containing the header and the animated video grid
 */
export function VideoSection() {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    const readyCallback = () => {
      previousCallback?.();
      setApiReady(true);
    };

    window.onYouTubeIframeAPIReady = readyCallback;

    const existingScript = document.getElementById("youtube-iframe-api");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      if (window.onYouTubeIframeAPIReady === readyCallback) {
        window.onYouTubeIframeAPIReady = previousCallback;
      }
    };
  }, []);

  return (
    <section className="to-secondary/20 py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center justify-center">
            <h3 className="mr-4 text-4xl font-bold text-foreground md:text-5xl">
              Visual Journey
            </h3>
            <Image
              src="/swami-img-removebg-preview.png"
              alt="Meditation symbol"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Immerse yourself in the sights and sounds of Sahajanand Wellness,
            from the tranquil banks of the Ganga to the vibrant evening Aarti.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} apiReady={apiReady} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
