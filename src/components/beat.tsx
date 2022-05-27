import React, { useState } from "react";
import { Beat } from "../app";
import Avatar from "boring-avatars";
import styles from "../styles/Beat.module.css";
import { getTrackColor } from "../app/color";
import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import { Transition } from "@headlessui/react";
import { formatDate } from "../app/time";

interface BeatProps {
  beat: Beat;
  playing: boolean;
  play(): void;
  pause(): void;
  selected: boolean;
}

export function Beat(props: BeatProps) {
  const col = getTrackColor(props.beat.name);
  const [hover, setHover] = useState(false);

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Transition
        show={(props.selected && props.playing) || hover}
        enter={styles.enter}
        enterFrom={styles.enterFrom}
        enterTo={styles.enterTo}
        leave={styles.leave}
        leaveFrom={styles.leaveFrom}
        leaveTo={styles.leaveTo}
        onClick={props.playing ? props.pause : props.play}
      >
        <div className={styles.play}>
          {props.playing ? (
            <PauseIcon className={styles.playIcon} />
          ) : (
            <PlayIcon className={styles.playIcon} />
          )}
        </div>
      </Transition>

      <div className={styles.cover} style={{ backgroundColor: col }}>
        <Avatar
          size={"5em"}
          name={props.beat.name}
          variant="marble"
          colors={[col, "white"]}
        />
      </div>

      <p className={styles.title}>{props.beat.name}</p>
      <p className={styles.date}>{formatDate(props.beat.creationDate)}</p>
    </div>
  );
}
