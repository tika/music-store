import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useDownloadURL } from "react-firebase-hooks/storage";
import {
  getStorage,
  ref,
  listAll,
  StorageReference,
  getDownloadURL,
} from "@firebase/storage";
import { firebaseApp } from "../firebase";

const storage = getStorage(firebaseApp);

interface MusicItem {
  name: string;
  url: string;
  type: string;
}

const Home: NextPage = () => {
  const [value, lLoading, error] = useDownloadURL(
    ref(storage, "[instrumental] united demo.wav")
  );
  const [items, setItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAll(ref(storage, "")).then(async (res) => {
      const newItems = await Promise.all(
        res.items.map(async (item) => {
          const url = await getDownloadURL(ref(storage, item.fullPath));
          return {
            name: item.name,
            url,
            type: item.name.endsWith(".wav") ? "audio/wav" : "audio/mpeg",
          };
        })
      );

      setItems(newItems);

      setLoading(false);
    });
  }, []);

  return (
    <div>
      {!loading && !lLoading ? (
        <div>
          <h1>Hello World!</h1>
          <h2>Music:</h2>
          {items.map((item) => {
            return (
              <audio controls key={item.name}>
                <source src={item.url} type={item.type} />
              </audio>
            );
          })}
        </div>
      ) : (
        <div>
          <h1>loading...</h1>
        </div>
      )}
    </div>
  );
};

export default Home;
