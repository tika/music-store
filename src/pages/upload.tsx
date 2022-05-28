import React, { useEffect, useState } from "react";
import { useUploadFile } from "react-firebase-hooks/storage";
import {
  deleteObject,
  getMetadata,
  getStorage,
  listAll,
  ref,
  updateMetadata,
} from "@firebase/storage";
import { firebaseApp } from "../firebase";
import { Beat } from "../app";
import styles from "../styles/Upload.module.css";
import { InfinitySpin } from "react-loader-spinner";
import { formatDate } from "../app/time";
import { getProducedDate } from "./index";

const storage = getStorage(firebaseApp);

function getBeatName(fileName: string) {
  return fileName.substring(0, fileName.length - 4);
}

export default function Upload() {
  const [selectedMusic, setSelectedMusic] = useState<File>();
  const [uploadFile, uploading, snapshot, error] = useUploadFile();
  const [verified, setVerified] = useState<boolean>(false);
  const [code, setCode] = useState("");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAll(ref(storage, "")).then(async (res) => {
      const fullBeats: typeof beats = await Promise.all(
        res.items.map(async (beat) => {
          const metadata = await getMetadata(ref(storage, beat.fullPath));
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

    setDates(Array(beats.length).fill(""));
  }, []);

  async function uploadToStorage() {
    if (!selectedMusic) return;

    const result = await uploadFile(
      ref(storage, selectedMusic.name),
      selectedMusic
    );
    alert(`${result && result.ref.name}`);
  }

  return (
    <div>
      {!loading ? (
        <div>
          {verified ? (
            <div className={styles.container}>
              {error && <strong>Error: {error.message}</strong>}
              {uploading && <span>Uploading file...</span>}
              {snapshot && (
                <span>
                  {JSON.stringify(
                    Math.round(snapshot.bytesTransferred / 1000 / 1000)
                  )}
                  MB /
                  {JSON.stringify(
                    Math.round(snapshot.totalBytes / 1000 / 1000)
                  )}
                  MB
                </span>
              )}
              {selectedMusic && (
                <span>Selected music: {selectedMusic.name}</span>
              )}
              <h1>Upload to catalogue ({beats.length} beats)</h1>
              <table>
                <tr>
                  <th>Name</th>
                  <th>Date Created</th>
                  <th></th>
                  <th></th>
                </tr>
                {beats.map((beat, i) => (
                  <>
                    <tr>
                      <td>{beat.name}</td>
                      <td>{formatDate(beat.creationDate)}</td>
                      <td className={styles.edit}>
                        New Date:
                        <input
                          type={"date"}
                          value={dates[i]}
                          onChange={(e) => {
                            setDates(
                              dates.map((d, j) =>
                                j === i ? e.target.value : d
                              )
                            );

                            updateMetadata(ref(storage, beat.path), {
                              customMetadata: {
                                producedOn: e.target.value,
                              },
                            }).then(() =>
                              setBeats(
                                beats.map((b, j) =>
                                  j === i
                                    ? {
                                        ...b,
                                        creationDate: new Date(e.target.value),
                                      }
                                    : b
                                )
                              )
                            );
                          }}
                        />
                      </td>
                      <td>
                        <p
                          className={styles.delete}
                          onClick={() => {
                            if (confirm("Do you want to delete this?")) {
                              deleteObject(ref(storage, beat.path)).then(() =>
                                setBeats(beats.filter((b, j) => j !== i))
                              );
                            }
                          }}
                        >
                          X
                        </p>
                      </td>
                    </tr>
                  </>
                ))}
              </table>
              <div>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : undefined;
                    setSelectedMusic(file);
                  }}
                />
                <button onClick={uploadToStorage}>Upload file</button>
              </div>
            </div>
          ) : (
            <div>
              <h1>Code:</h1>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                type={"password"}
                placeholder={"XXXXXXXXX"}
              />
              <button
                onClick={() => {
                  if (code === process.env.NEXT_PUBLIC_Code) {
                    setVerified(true);
                  }
                }}
              >
                Verify
              </button>
            </div>
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
