import React, { useState } from "react";
import { Beat } from "../app";
import Avatar from "boring-avatars";
import styles from "../styles/Beat.module.css";
import { getTrackColor } from "../app/color";
import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import { Transition } from "@headlessui/react";
import { formatDate } from "../app/time";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface BeatProps {
    beat: Beat;
    playing: boolean;
    play(): void;
    pause(): void;
    selected: boolean;
    percentPlayed: number;
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
                <div
                    className={styles.play}
                    style={{
                        backdropFilter: props.playing
                            ? "blur(3px) opacity(1)"
                            : "",
                    }}
                >
                    {props.playing ? (
                        <CircularProgressbarWithChildren
                            value={props.percentPlayed}
                            strokeWidth={5}
                            className={styles.wtf}
                            styles={{
                                root: {
                                    width: "7em",
                                    height: "7em",
                                },
                                path: {
                                    stroke: "white",
                                },
                                trail: {
                                    display: "none",
                                },
                            }}
                        >
                            <PauseIcon className={styles.playIcon} />
                        </CircularProgressbarWithChildren>
                    ) : (
                        <PlayIcon className={styles.playIcon} />
                    )}
                </div>
            </Transition>

            <div className={styles.cover} style={{ backgroundColor: col }}>
                <Avatar
                    size={"5em"}
                    name={props.beat.name}
                    variant="bauhaus"
                    colors={[col, "black"]}
                />
            </div>

            <p className={styles.title}>{props.beat.name}</p>
            <p className={styles.date}>{formatDate(props.beat.creationDate)}</p>
        </div>
    );
}
