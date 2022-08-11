import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import {
    getStorage,
    ref,
    listAll,
    getDownloadURL,
    getMetadata,
    FullMetadata,
} from "@firebase/storage";
import { firebaseApp } from "../firebase";
import { InfinitySpin } from "react-loader-spinner";
import Image from "next/image";
import { Beat as BeatComponent } from "../components/beat";
import { Beat } from "../app";
import { Playbar } from "../components/playbar";
import { getTrackColor } from "../app/color";
import Link from "next/link";

const storage = getStorage(firebaseApp);

function getBeatName(fileName: string) {
    return fileName.substring(0, fileName.length - 4);
}

function isSame(beatOne: Beat | undefined, beatTwo: Beat | undefined) {
    if (!beatOne || !beatTwo) return false;
    return beatOne.path === beatTwo.path;
}

export function getProducedDate(metadata: FullMetadata) {
    return metadata.customMetadata &&
        Object.keys(metadata.customMetadata).includes("producedOn")
        ? metadata.customMetadata.producedOn
        : metadata.timeCreated;
}

export default function Home() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [beats, setBeats] = useState<Beat[]>([]);
    const [selectedBeat, setSelectedBeat] = useState<Beat | undefined>(
        undefined
    );

    const [buffering, setBuffering] = useState(false);
    const [loading, setLoading] = useState(true);

    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        listAll(ref(storage, "")).then(async (res) => {
            const fullBeats: typeof beats = await Promise.all(
                res.items.map(async (beat) => {
                    const metadata = await getMetadata(
                        ref(storage, beat.fullPath)
                    );
                    return {
                        name: getBeatName(beat.name),
                        path: beat.fullPath,
                        creationDate: new Date(getProducedDate(metadata)),
                    };
                })
            );

            setBeats(fullBeats);

            setLoading(false);
        });
    }, []);

    // audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        function setAudioData() {
            const audio = audioRef.current;

            if (audio) {
                setDuration(audio.duration);
                setCurrentTime(audio.currentTime);
            }
        }

        function setAudioTime() {
            const audio = audioRef.current;

            if (audio) {
                setCurrentTime(audio.currentTime);

                if (audio.ended) {
                    setPlaying(false);
                }
            }
        }

        audio.addEventListener("loadeddata", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);
        audio.addEventListener("pause", pause);
        audio.addEventListener("play", resume);

        return () => {
            audio.removeEventListener("loadeddata", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
            audio.removeEventListener("pause", pause);
            audio.removeEventListener("play", resume);
        };
    });

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === " " && audioRef.current) {
                playing ? pause() : resume();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    });

    async function play(beat: Beat) {
        console.log("play");
        clear();
        setBuffering(true);

        getDownloadURL(ref(storage, beat.path)).then((url) => {
            setSelectedBeat({ ...beat, url });

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }

            setPlaying(true);
            setBuffering(false);
        });
    }

    function clear() {
        console.log("clear");
        if (audioRef.current) audioRef.current.pause();
        setPlaying(false);
        setSelectedBeat(undefined);
    }

    function pause() {
        console.log("pause");
        if (!playing) return;

        setPlaying(false);
        if (audioRef.current) audioRef.current.pause();
    }

    async function resume() {
        console.log("resume");
        if (!selectedBeat) return;
        if (playing) return;

        setPlaying(true);
        if (audioRef.current) audioRef.current.play();
    }

    return (
        <div className={styles.container}>
            {!loading ? (
                <div className={styles.innerContainer}>
                    <div className={styles.header}>
                        <div className={styles.pfp}>
                            <Image
                                className={styles.pfpImage}
                                alt={"Insta pfp"}
                                layout={"fill"}
                                src={
                                    "https://instagram.flhr10-1.fna.fbcdn.net/v/t51.2885-19/292782546_1195470934618074_8011048219825522157_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.flhr10-1.fna.fbcdn.net&_nc_cat=106&_nc_ohc=G2VdjszB4AAAX8CO3Oy&edm=ALQROFkBAAAA&ccb=7-5&oh=00_AT_ZLnWjNKv5CBNdK2tSesKPVSVZODYDR0n3QhUmdBwtBA&oe=62FAEAC2&_nc_sid=30a2ef"
                                }
                            />
                        </div>
                        <div className={styles.headerText}>
                            <Link href="https://www.instagram.com/tikacookedthis/">
                                <a className={styles.name}>
                                    <h1>tikacookedthis</h1>
                                </a>
                            </Link>
                            <h2>beats produced by me</h2>
                        </div>
                    </div>

                    <div className={styles.beats}>
                        {beats.map((beat, i) => {
                            return (
                                <BeatComponent
                                    playing={
                                        isSame(selectedBeat, beat) && playing
                                    }
                                    key={i}
                                    beat={beat}
                                    play={() =>
                                        isSame(selectedBeat, beat) && !playing
                                            ? resume()
                                            : play(beat)
                                    }
                                    selected={isSame(selectedBeat, beat)}
                                    pause={pause}
                                    percentPlayed={
                                        (currentTime / duration) * 100
                                    }
                                />
                            );
                        })}
                    </div>

                    <Playbar
                        playing={playing}
                        beat={selectedBeat}
                        currentTime={currentTime}
                        duration={duration}
                        currentColor={getTrackColor(
                            selectedBeat ? selectedBeat.name : ""
                        )}
                        buffering={buffering}
                        play={resume}
                        pause={pause}
                        setCurrentTime={(val) => {
                            setCurrentTime(val);
                            const audio = audioRef.current;

                            if (!audio) return;
                            audio.currentTime = val;
                        }}
                    />

                    <audio ref={audioRef}>
                        <source src={selectedBeat?.url} />
                        Your browser does not support the <code>
                            audio
                        </code>{" "}
                        element.
                    </audio>
                </div>
            ) : (
                <div className={styles.loader}>
                    <InfinitySpin width={"500"} color={"#64C6CA"} />
                </div>
            )}
        </div>
    );
}
