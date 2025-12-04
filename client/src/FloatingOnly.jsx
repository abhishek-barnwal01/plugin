import FloatingWidget from '~/components/FloatingWidget';
import { floatingRoute } from './routes/floatingRoute';
import { router } from './routes';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { RouterProvider } from 'react-router-dom';
import * as RadixToast from '@radix-ui/react-toast';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toast, ThemeProvider, ToastProvider } from '@librechat/client';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ScreenshotProvider, useApiErrorBoundary } from './hooks';
// import { getThemeFromEnv } from './utils/getThemeFromEnv';
import { initializeFontSize } from '~/store/fontSize';
import { LiveAnnouncer } from '~/a11y';

export default function FloatingOnly() {
  const { setError } = useApiErrorBoundary();
  // If URL starts with /mini or /minipopup, load floating app instead of main app
  const isFloatingApp =
    window.location.pathname.startsWith('/minipopup') ||
    window.location.pathname.startsWith('/mini');
  // Only show floating widget on /minipopup page
  const showFloatingWidget = window.location.pathname.startsWith('/minipopup');

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error?.response?.status === 401) {
          setError(error);
        }
      },
    }),
  });

  useEffect(() => {
    initializeFontSize();
  }, []);

  // Load theme from environment variables if available
  //const envTheme = getThemeFromEnv();
  return (
    <div className="w-full" style={{ minHeight: '99%' }}>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <LiveAnnouncer>
            <RadixToast.Provider>
              <ToastProvider>
                <DndProvider backend={HTML5Backend}>
                  <RouterProvider router={isFloatingApp ? floatingRoute : router} />
                  {/* {showFloatingWidget && <FloatingWidget />} */}
                  {/* <ReactQueryDevtools initialIsOpen={false} position="top-right" /> */}
                  <Toast />
                  <RadixToast.Viewport className="pointer-events-none fixed inset-0 z-[1000] mx-auto my-2 flex max-w-[560px] flex-col items-stretch justify-start md:pb-5" />
                </DndProvider>
              </ToastProvider>
            </RadixToast.Provider>
          </LiveAnnouncer>
        </RecoilRoot>
      </QueryClientProvider>
    </div>
  );
}
