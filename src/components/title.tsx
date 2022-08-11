import Head from "next/head";

export function Title({ text }: { text: string }) {
    return (
        <Head>
            <title>{text}</title>
            <meta property="og:title" content={text} key="title" />
        </Head>
    );
}
