import React from 'react';
import { AppType } from 'next/app';
import {
  default as NextDocument,
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { Props as AppProps } from '~/pages/_app';
import { createEmotionCache } from '~/util/styles/cache';

type Props = DocumentProps & DocumentInitialProps;

const Document = ({ styles }: Props) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="UpFrom Admin Panel" />
        <link rel="icon" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Inter:regular,500,600,700,800"
          media="all"
        />
        {styles}
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

Document.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
  const originalRenderPage = ctx.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () => {
    return originalRenderPage({
      enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType> & AppProps>) => {
        return props => <App emotionCache={cache} {...props} />;
      },
    });
  };

  const initialProps = await NextDocument.getInitialProps(ctx);
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const styles = emotionStyles.styles.map(style => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return { ...initialProps, styles };
};

export default Document;
