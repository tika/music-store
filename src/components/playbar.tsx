import { Beat } from "../app";
import styles from "../styles/Playbar.module.css";
import { formatDate, getTime } from "../app/time";
import { DownloadIcon, PauseIcon, PlayIcon } from "@heroicons/react/outline";
import React, { useRef } from "react";
import { TailSpin } from "react-loader-spinner";

interface PlaybarProps {
  playing: boolean;

  beat: Beat | undefined;

  currentTime: number;
  duration: number;
  currentColor: string;
  buffering: boolean;

  play(): void;
  pause(): void;
  setCurrentTime(val: number): void;
}

export function Playbar(props: PlaybarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);

  function getProgressGradient(
    currentTime: number,
    duration: number,
    currentColor: string
  ) {
    return `linear-gradient(to right, ${currentColor} ${
      (currentTime / duration) * 100
    }%, white 0)`;
  }

  function calcClickedTime(event: MouseEvent) {
    const clickPositionInPage = event.pageX;
    const bar = barRef.current;

    if (!bar) return -1;

    const barStart = bar.getBoundingClientRect().left + window.scrollX;
    const barWidth = bar.offsetWidth;
    const clickPositionInBar = clickPositionInPage - barStart;
    const timePerPixel = props.duration / barWidth;
    const time = timePerPixel * clickPositionInBar;

    if (time > props.duration) return props.duration;
    if (time < 0) return 0;
    return time;
  }

  function timeUpdate(newTime: number) {
    props.setCurrentTime(newTime);
  }

  function handleTimeDrag(event: MouseEvent) {
    timeUpdate(calcClickedTime(event));

    function updateTimeOnMove(eMove: MouseEvent) {
      timeUpdate(calcClickedTime(eMove));
    }

    document.addEventListener("mousemove", updateTimeOnMove);

    document.addEventListener("mouseup", () => {
      if (!props.playing) {
        props.play();
      }

      document.removeEventListener("mousemove", updateTimeOnMove);
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerBackground} />

      <div className={styles.trackInfo}>
        <h1
          className={styles.name}
          style={{ color: props.beat ? "white" : "#727272" }}
        >
          {props.beat ? props.beat.name : "No beat playing"}
        </h1>
        {props.beat && (
          <h2 className={styles.date}>{formatDate(props.beat.creationDate)}</h2>
        )}
      </div>
      <div className={styles.progressContainer}>
        <div
          className={styles.progress}
          ref={barRef}
          onMouseDown={(e) => handleTimeDrag(e as any)}
          style={{
            background: props.beat
              ? getProgressGradient(
                  props.currentTime,
                  props.duration,
                  props.currentColor
                )
              : "#727272",
          }}
        />
        <div className={styles.time}>
          <p>{getTime(props.currentTime)}</p>
          <p>{getTime(props.duration)}</p>
        </div>
      </div>
      <div className={styles.buttons}>
        {props.buffering ? (
          <TailSpin color={props.currentColor} width={"100%"} height={"100%"} />
        ) : (
          <>
            {props.playing ? (
              <PauseIcon
                style={{ cursor: "pointer" }}
                onClick={() => props.pause()}
              />
            ) : (
              <PlayIcon
                style={{ cursor: "pointer" }}
                onClick={() => props.play()}
              />
            )}
          </>
        )}

        {props.beat && (
          <a
            href={props.beat ? props.beat.url : ""}
            download
            className={styles.download}
          >
            <DownloadIcon width={"100%"} height={"100%"} />
          </a>
        )}
      </div>
    </div>
  );
}
