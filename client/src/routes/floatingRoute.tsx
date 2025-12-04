// import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
// import { ApiErrorWatcher } from '~/components/Auth';
// import MiniApp from '~/components/MiniApp';
// import { AuthContextProvider } from '~/hooks/AuthContext';
// import {
//   PromptGroupsProvider,
//   AssistantsMapContext,
//   AgentsMapContext,
//   SetConvoProvider,
//   FileMapContext,
// } from '~/Providers';
// import { useAssistantsMap, useAgentsMap, useFileMap, useAuthContext } from '~/hooks';

// const AuthLayout = () => {
//   const { isAuthenticated } = useAuthContext();
//   const assistantsMap = useAssistantsMap({ isAuthenticated });
//   const agentsMap = useAgentsMap({ isAuthenticated });
//   const fileMap = useFileMap({ isAuthenticated });

//   return (
//     <SetConvoProvider>
//       <FileMapContext.Provider value={fileMap}>
//         <AssistantsMapContext.Provider value={assistantsMap}>
//           <AgentsMapContext.Provider value={agentsMap}>
//             <PromptGroupsProvider>
//               <Outlet />
//               <ApiErrorWatcher />
//             </PromptGroupsProvider>
//           </AgentsMapContext.Provider>
//         </AssistantsMapContext.Provider>
//       </FileMapContext.Provider>
//     </SetConvoProvider>
//   );
// };

// const AuthLayoutWrapper = () => (
//   <AuthContextProvider>
//     <AuthLayout />
//   </AuthContextProvider>
// );

// const baseEl = document.querySelector('base');
// const baseHref = baseEl?.getAttribute('href') || '/';

// export const floatingRoute = createBrowserRouter(
//   [
//     {
//       path: '/',
//       element: <AuthLayoutWrapper />,
//       children: [
//         {
//           path: 'mini',
//           // element: <Navigate to="/mini/new" replace />,
//           element: <MiniApp />,
//         },
//         {
//           path: 'mini/:conversationId',
//           element: <MiniApp />,
//         },
//         {
//           path: 'minipopup',
//           element: <span>Main page</span>,
//         },
//         // Catch any redirects back to /mini
//         {
//           path: 'c/new',
//           element: <Navigate to="/mini/new" replace />,
//         },
//         {
//           path: 'c/:conversationId',
//           element: <Navigate to="/mini/new" replace />,
//         },
//         // Catch-all redirect
//         {
//           path: '*',
//           element: <Navigate to="/mini" replace />,
//         },
//       ],
//     },
//   ],
//   { basename: baseHref },
// );

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ApiErrorWatcher } from '~/components/Auth';
import MiniApp from '~/components/MiniApp';
import LoginWrapper from '~/components/LoginWrapper'; // Add this import
import { AuthContextProvider } from '~/hooks/AuthContext';
import {
  PromptGroupsProvider,
  AssistantsMapContext,
  AgentsMapContext,
  SetConvoProvider,
  FileMapContext,
} from '~/Providers';
import { useAssistantsMap, useAgentsMap, useFileMap, useAuthContext } from '~/hooks';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthContext();
  const assistantsMap = useAssistantsMap({ isAuthenticated });
  const agentsMap = useAgentsMap({ isAuthenticated });
  const fileMap = useFileMap({ isAuthenticated });

  return (
    <SetConvoProvider>
      <FileMapContext.Provider value={fileMap}>
        <AssistantsMapContext.Provider value={assistantsMap}>
          <AgentsMapContext.Provider value={agentsMap}>
            <PromptGroupsProvider>
              <Outlet />
              <ApiErrorWatcher />
            </PromptGroupsProvider>
          </AgentsMapContext.Provider>
        </AssistantsMapContext.Provider>
      </FileMapContext.Provider>
    </SetConvoProvider>
  );
};

const AuthLayoutWrapper = () => (
  <AuthContextProvider>
    <AuthLayout />
  </AuthContextProvider>
);

const baseEl = document.querySelector('base');
const baseHref = baseEl?.getAttribute('href') || '/';

export const floatingRoute = createBrowserRouter(
  [
    {
      path: '/',
      element: <AuthLayoutWrapper />,
      children: [
        {
          // When accessing /mini without conversationId, redirect to /mini/new
          path: 'mini',
          element: <Navigate to="/mini/new" replace />,
        },
        {
          // This handles both /mini/new and /mini/:conversationId
          path: 'mini/:conversationId',
          element: <MiniApp />,
        },
        {
          path: 'minipopup',
          element: <span>Main page</span>,
        },
        {
          // Login route with return path handling
          path: 'login',
          element: <LoginWrapper />,
        },
        // Catch any redirects back to /mini
        {
          path: 'c/new',
          element: <Navigate to="/mini/new" replace />,
        },
        {
          path: 'c/:conversationId',
          element: <Navigate to="/mini/:conversationId" replace />,
        },
        // Catch-all redirect
        {
          path: '*',
          element: <Navigate to="/mini/new" replace />,
        },
      ],
    },
  ],
  { basename: baseHref },
);
