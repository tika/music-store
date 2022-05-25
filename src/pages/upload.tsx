import { useEffect, useRef, useState } from "react";
import { useUploadFile } from "react-firebase-hooks/storage";
import { getStorage, ref } from "@firebase/storage";
import { firebaseApp } from "../firebase";

const storage = getStorage(firebaseApp);

export default function Upload() {
  const [selectedMusic, setSelectedMusic] = useState<File>();
  const [uploadFile, uploading, snapshot, error] = useUploadFile();
  const [verified, setVerified] = useState<boolean>(false);
  const [code, setCode] = useState("");

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
      {verified ? (
        <div>
          {error && <strong>Error: {error.message}</strong>}
          {uploading && <span>Uploading file...</span>}
          {snapshot && (
            <span>
              {JSON.stringify(
                Math.round(snapshot.bytesTransferred / 1000 / 1000)
              )}
              MB /
              {JSON.stringify(Math.round(snapshot.totalBytes / 1000 / 1000))}MB
            </span>
          )}
          {selectedMusic && <span>Selected music: {selectedMusic.name}</span>}
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : undefined;
              setSelectedMusic(file);
            }}
          />
          <button onClick={uploadToStorage}>Upload file</button>
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
  );
}
