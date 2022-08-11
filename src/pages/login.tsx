import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { useRouter } from "next/router";
import { useAuthState, useSignInWithGithub } from "react-firebase-hooks/auth";
import { firebaseApp } from "../firebase";

const auth = getAuth(firebaseApp);

export default function Login() {
    const [user, userLoading, userError] = useAuthState(auth);
    const [signInWithGithub, gUser, loading, error] = useSignInWithGithub(auth);
    const router = useRouter();

    if (error) {
        return (
            <div>
                <p>Error: {error.message}</p>
            </div>
        );
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {user && <h1>Current user: {user.displayName}</h1>}
            <button
                onClick={() => {
                    setPersistence(auth, browserLocalPersistence)
                        .then(() => {
                            signInWithGithub().then(() =>
                                router.push("/upload")
                            );
                        })
                        .catch((error) => {
                            // Handle Errors here.
                            const errorCode = error.code;
                            const errorMessage = error.message;
                            alert("Something went wrong");
                            console.error(errorCode, errorMessage);
                        });
                }}
            >
                Sign in with GitHub
            </button>
        </div>
    );
}
