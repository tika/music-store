import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
} from "@firebase/storage";
import { firebaseApp } from "../firebase";
import { InfinitySpin } from "react-loader-spinner";
import Image from "next/image";
import { Beat as BeatComponent } from "../components/beat";
import { Beat } from "../app";
import { Playbar } from "../components/playbar";
import { getTrackColor } from "../app/color";

const storage = getStorage(firebaseApp);

function getBeatName(fileName: string) {
  return fileName.substring(0, fileName.length - 4);
}

function isSame(beatOne: Beat | undefined, beatTwo: Beat | undefined) {
  if (!beatOne || !beatTwo) return false;
  return beatOne.path === beatTwo.path;
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [beats, setBeats] = useState<Beat[]>([]);
  const [selectedBeat, setSelectedBeat] = useState<Beat | undefined>(undefined);

  const [buffering, setBuffering] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    listAll(ref(storage, "")).then(async (res) => {
      const fullBeats: typeof beats = await Promise.all(
        res.items.map(async (beat) => {
          const metadata = await getMetadata(ref(storage, beat.fullPath));
          return {
            name: getBeatName(beat.name),
            path: beat.fullPath,
            creationDate: new Date(metadata.timeCreated), // todo: have custom timecreated
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
      }
    }

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
    };
  });

  async function play(beat: Beat) {
    clear();
    setBuffering(true);

    getDownloadURL(ref(storage, beat.path)).then((url) => {
      setSelectedBeat({ ...beat, url });
      if (audioRef.current) audioRef.current.play();

      setPlaying(true);
      setBuffering(false);
    });
  }

  function clear() {
    if (audioRef.current) audioRef.current.pause();
    setPlaying(false);
    setSelectedBeat(undefined);
  }

  function pause() {
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }

  async function resume() {
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
                  "https://scontent-lhr8-1.cdninstagram.com/v/t51.2885-19/240620311_203244768496134_1421356717336519585_n.jpg?stp=dst-jpg_s320x320&_nc_ht=scontent-lhr8-1.cdninstagram.com&_nc_cat=106&_nc_ohc=5xJpn6wqIecAX8svpVA&edm=ABfd0MgBAAAA&ccb=7-5&oh=00_AT_WoTwMAlYCxODM2hDBktPNFP_wGXBMJ4amTBUIKqtNRg&oe=62968674&_nc_sid=7bff83.png"
                }
              />
            </div>
            <div className={styles.headerText}>
              <h1>prodbytika</h1>
              <h2>beats produced by me</h2>
            </div>
          </div>

          <div className={styles.beats}>
            {beats.map((beat, i) => {
              return (
                <BeatComponent
                  playing={isSame(selectedBeat, beat) && playing}
                  key={i}
                  beat={beat}
                  play={() =>
                    isSame(selectedBeat, beat) && !playing
                      ? resume()
                      : play(beat)
                  }
                  selected={isSame(selectedBeat, beat)}
                  pause={pause}
                />
              );
            })}
          </div>

          <Playbar
            playing={playing}
            beat={selectedBeat}
            currentTime={currentTime}
            duration={duration}
            currentColor={getTrackColor(selectedBeat ? selectedBeat.name : "")}
            buffering={buffering}
            play={resume}
            pause={pause}
          />

          {selectedBeat && (
            <audio ref={audioRef}>
              <source src={selectedBeat.url} />
              Your browser does not support the <code>audio</code> element.
            </audio>
          )}
        </div>
      ) : (
        <div className={styles.loader}>
          <InfinitySpin width={"10em"} color={"#64C6CA"} />
        </div>
      )}
    </div>
  );
}
