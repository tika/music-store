import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { getStorage, ref, listAll, getDownloadURL } from "@firebase/storage";
import { firebaseApp } from "../firebase";
import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import { DownloadIcon } from "@heroicons/react/outline";

const storage = getStorage(firebaseApp);

interface MusicItem {
  name: string;
  path: string;
}

function getBeatName(fileName: string) {
  return fileName.substring(0, fileName.length - 4);
}

function getTime(time: number) {
  return `${Math.floor(time / 60)}:${padZero(Math.floor(time % 60))}`;
}

function padZero(z: number) {
  return z.toString().length == 1 ? `0${z}` : z;
}

export default function Home() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<
    [number, string] | undefined
  >(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(-1);
  const [duration, setDuration] = useState<number>(-1);

  useEffect(() => {
    listAll(ref(storage, "")).then(async (res) => {
      const newItems = await Promise.all(
        res.items.map(async (item) => {
          return {
            name: getBeatName(item.name),
            path: item.fullPath,
          };
        })
      );

      setItems(newItems);

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const c = musicRef.current;
    if (!c) return;

    function setAudioData() {
      if (musicRef.current) {
        const c = musicRef.current;
        setDuration(c.duration);
        setCurrentTime(c.currentTime);
      }
    }

    function setAudioTime() {
      if (musicRef.current) {
        const c = musicRef.current;
        setCurrentTime(c?.currentTime);
      }
    }

    c.addEventListener("loadeddata", setAudioData);
    c.addEventListener("timeupdate", setAudioTime);

    return () => {
      c.removeEventListener("loadeddata", setAudioData);
      c.removeEventListener("timeupdate", setAudioTime);
    };
  });

  async function play(index: number) {
    setLoading(true);
    getDownloadURL(ref(storage, items[index].path)).then((url) => {
      setPlayingIndex([index, url]);
      setIsPlaying(true);

      setLoading(false);

      if (musicRef.current) {
        musicRef.current.play();
      }
    });
  }

  function clear() {
    if (musicRef.current) {
      musicRef.current.pause();
    }

    setPlayingIndex(undefined);
    setIsPlaying(false);
  }

  function calcClickedTime(event: MouseEvent) {
    const clickPositionInPage = event.pageX;
    const bar = barRef.current;

    if (!bar) return -1;

    const barStart = bar.getBoundingClientRect().left + window.scrollX;
    const barWidth = bar.offsetWidth;
    const clickPositionInBar = clickPositionInPage - barStart;
    const timePerPixel = duration / barWidth;
    const time = timePerPixel * clickPositionInBar;

    if (time > duration) return duration;
    if (time < 0) return 0;
    return time;
  }

  function timeUpdate(newTime: number) {
    setCurrentTime(newTime);
    if (musicRef.current) {
      musicRef.current.currentTime = newTime;

      if (musicRef.current.ended) {
        musicRef.current.play();
      }
    }
  }

  function handleTimeDrag(event: MouseEvent) {
    timeUpdate(calcClickedTime(event));

    function updateTimeOnMove(eMove: MouseEvent) {
      timeUpdate(calcClickedTime(eMove));
    }

    document.addEventListener("mousemove", updateTimeOnMove);

    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", updateTimeOnMove);
    });
  }

  return (
    <div>
      {!loading ? (
        <div>
          <h1>prodbytika</h1>
          <h2>beats produced by me</h2>
          {items.map((item, i) => {
            return (
              <div>
                <p>{item.name}</p>
                {playingIndex && playingIndex[0] === i && isPlaying ? (
                  <PauseIcon width={"2em"} onClick={() => clear()} />
                ) : (
                  <PlayIcon width={"2em"} onClick={() => play(i)} />
                )}
              </div>
            );
          })}
          {playingIndex && (
            <div>
              <audio ref={musicRef}>
                <source src={playingIndex && playingIndex[1]} />
                Your browser does not support the <code>audio</code> element.
              </audio>
              <div
                className={styles.progressContainer}
                style={{
                  background: `linear-gradient(to right, blue ${
                    (currentTime / duration) * 100
                  }%, white 0)`,
                }}
                onMouseDown={(e) => handleTimeDrag(e as any)}
                ref={barRef}
              />
              <h1>
                {getTime(currentTime)}/{getTime(duration)}
              </h1>

              {items[playingIndex[0]].name}
              {isPlaying ? (
                <PauseIcon
                  width={"2em"}
                  onClick={() => {
                    if (playingIndex) {
                      if (musicRef.current) {
                        musicRef.current.pause();
                      }

                      setIsPlaying(false);
                    }
                  }}
                />
              ) : (
                <PlayIcon
                  width={"2em"}
                  onClick={() => {
                    if (playingIndex) {
                      if (musicRef.current) {
                        musicRef.current.play();
                      }

                      setIsPlaying(true);
                    }
                  }}
                />
              )}
              <a href={playingIndex && playingIndex[1]} download>
                <DownloadIcon width={"2em"} />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1>loading...</h1>
        </div>
      )}
    </div>
  );
}
