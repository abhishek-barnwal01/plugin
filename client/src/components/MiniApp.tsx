import { useEffect } from 'react';
import { Spinner } from '@librechat/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Constants, EModelEndpoint } from 'librechat-data-provider';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import type { TPreset } from 'librechat-data-provider';
import { useGetConvoIdQuery, useGetStartupConfig, useGetEndpointsQuery } from '~/data-provider';
import { useNewConvo, useAppStartup, useAssistantListMap, useIdChangeEffect } from '~/hooks';
import { getDefaultModelSpec, getModelSpecPreset, logger } from '~/utils';
import { ToolCallsMapProvider } from '~/Providers';
import ChatMiniView from '~/components/Chat/ChatMiniView';
import useAuthRedirect from '~/routes/useAuthRedirect';
import temporaryStore from '~/store/temporary';
import { useRecoilCallback } from 'recoil';
import store from '~/store';

export default function MiniApp() {
  const navigate = useNavigate();
  const { data: startupConfig } = useGetStartupConfig();
  const { isAuthenticated, user } = useAuthRedirect();

  const setIsTemporary = useRecoilCallback(
    ({ set }) =>
      (value: boolean) => {
        set(temporaryStore.isTemporary, value);
      },
    [],
  );
  useAppStartup({ startupConfig, user });

  const index = 0;
  const { conversationId } = useParams();
  const effectiveConversationId = conversationId || Constants.NEW_CONVO;
  useIdChangeEffect(effectiveConversationId);
  const { hasSetConversation, conversation } = store.useCreateConversationAtom(index);
  const { newConversation } = useNewConvo();

  const modelsQuery = useGetModelsQuery({
    enabled: isAuthenticated,
    refetchOnMount: 'always',
  });
  const initialConvoQuery = useGetConvoIdQuery(effectiveConversationId, {
    enabled:
      isAuthenticated && effectiveConversationId !== Constants.NEW_CONVO && !hasSetConversation.current,
  });
  const endpointsQuery = useGetEndpointsQuery({ enabled: isAuthenticated });
  const assistantListMap = useAssistantListMap();

  const isTemporaryChat = conversation && conversation.expiredAt ? true : false;

  console.log('miniapploaded', {
    conversationId,
    effectiveConversationId,
    isAuthenticated,
    isAuthenticatedType: typeof isAuthenticated,
    conversation
  });

  // Always keep returnTo in sessionStorage for mini mode to survive token refresh issues
  useEffect(() => {
    const currentPath = effectiveConversationId ? `/mini/${effectiveConversationId}` : '/mini/new';
    const stored = sessionStorage.getItem('mini_returnTo');
    if (stored !== currentPath) {
      sessionStorage.setItem('mini_returnTo', currentPath);
      console.log('[MiniApp] Updated mini_returnTo in sessionStorage:', currentPath);
    }
  }, [effectiveConversationId]);

  // Ensure LiteLLM endpoint is used in mini mode if available
  useEffect(() => {
    if (isAuthenticated && endpointsQuery.data) {
      // Check if custom endpoint exists and is configured
      const customConfig = endpointsQuery.data.custom;

      if (customConfig && customConfig.name === 'LiteLLM') {
        const storedSetup = localStorage.getItem('lastConversationSetup');
        const setup = storedSetup ? JSON.parse(storedSetup) : {};

        // If no endpoint is set or it's not custom, set it to custom (LiteLLM)
        if (!setup.endpoint || setup.endpoint !== 'custom') {
          const newSetup = {
            ...setup,
            endpoint: 'custom',
            endpointType: 'custom',
            model: 'gpt-4o'
          };
          localStorage.setItem('lastConversationSetup', JSON.stringify(newSetup));
          console.log('[MiniApp] Set default endpoint to LiteLLM for mini mode');
        }
      }
    }
  }, [isAuthenticated, endpointsQuery.data]);

  // Auto-redirect /mini to /mini/new if no conversationId in URL
  useEffect(() => {
    if (!conversationId) {
      console.log('No conversationId in URL, redirecting to /mini/new');
      navigate('/mini/new', { replace: true });
    }
  }, [conversationId, navigate]);

  useEffect(() => {
    if (effectiveConversationId !== Constants.NEW_CONVO && !isTemporaryChat) {
      setIsTemporary(false);
    } else if (isTemporaryChat) {
      setIsTemporary(isTemporaryChat);
    }
  }, [effectiveConversationId, isTemporaryChat, setIsTemporary]);

  /** This effect is mainly for the first conversation state change on first load of the page.
   *  Adjusting this may have unintended consequences on the conversation state.
   */
  useEffect(() => {
    const shouldSetConvo =
      (startupConfig && !hasSetConversation.current && !modelsQuery.data?.initial) ?? false;
    /* Early exit if startupConfig is not loaded and conversation is already set */
    if (!shouldSetConvo) {
      return;
    }

    if (effectiveConversationId === Constants.NEW_CONVO && endpointsQuery.data && modelsQuery.data) {
      const result = getDefaultModelSpec(startupConfig);
      const spec = result?.default ?? result?.last;
      logger.log('conversation', 'ChatRoute, new convo effect', conversation);
      newConversation({
        modelsData: modelsQuery.data,
        template: conversation ? conversation : undefined,
        ...(spec ? { preset: getModelSpecPreset(spec) } : {}),
      });

      hasSetConversation.current = true;
    } else if (initialConvoQuery.data && endpointsQuery.data && modelsQuery.data) {
      logger.log('conversation', 'ChatRoute initialConvoQuery', initialConvoQuery.data);
      newConversation({
        template: initialConvoQuery.data,
        /* this is necessary to load all existing settings */
        preset: initialConvoQuery.data as TPreset,
        modelsData: modelsQuery.data,
        keepLatestMessage: true,
      });
      hasSetConversation.current = true;
    } else if (
      effectiveConversationId === Constants.NEW_CONVO &&
      assistantListMap[EModelEndpoint.assistants] &&
      assistantListMap[EModelEndpoint.azureAssistants]
    ) {
      const result = getDefaultModelSpec(startupConfig);
      const spec = result?.default ?? result?.last;
      logger.log('conversation', 'ChatRoute new convo, assistants effect', conversation);
      newConversation({
        modelsData: modelsQuery.data,
        template: conversation ? conversation : undefined,
        ...(spec ? { preset: getModelSpecPreset(spec) } : {}),
      });
      hasSetConversation.current = true;
    } else if (
      assistantListMap[EModelEndpoint.assistants] &&
      assistantListMap[EModelEndpoint.azureAssistants]
    ) {
      logger.log('conversation', 'ChatRoute convo, assistants effect', initialConvoQuery.data);
      newConversation({
        template: initialConvoQuery.data,
        preset: initialConvoQuery.data as TPreset,
        modelsData: modelsQuery.data,
        keepLatestMessage: true,
      });
      hasSetConversation.current = true;
    }
    /* Creates infinite render if all dependencies included due to newConversation invocations exceeding call stack before hasSetConversation.current becomes truthy */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startupConfig,
    initialConvoQuery.data,
    endpointsQuery.data,
    modelsQuery.data,
    assistantListMap,
  ]);

  if (endpointsQuery.isLoading || modelsQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" aria-live="polite" role="status">
        <Spinner className="text-text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated, with return path
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log('[MiniApp] Auth check effect running:', {
      isAuthenticated,
      isAuthenticatedType: typeof isAuthenticated,
      isAuthenticatedNotUndefined: isAuthenticated !== undefined,
      willRedirect: !isAuthenticated && isAuthenticated !== undefined
    });

    if (!isAuthenticated && isAuthenticated !== undefined) {
      console.log('Not authenticated, redirecting to login with return path');
      // Store the current path or default to /mini/new
      const returnPath = effectiveConversationId ? `/mini/${effectiveConversationId}` : '/mini/new';

      // Store returnTo in sessionStorage as backup for iframe context where query params may be lost
      sessionStorage.setItem('mini_returnTo', returnPath);
      console.log('[MiniApp] Stored returnTo in sessionStorage:', returnPath);
      console.log('[MiniApp] Verifying storage:', sessionStorage.getItem('mini_returnTo'));

      navigate(`/login?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
    }
  }, [isAuthenticated, navigate, effectiveConversationId]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center" aria-live="polite" role="status">
        <Spinner className="text-text-primary" />
      </div>
    );
  }

  // Wait for conversation to be initialized before rendering
  if (!conversation || !conversation.endpoint) {
    return (
      <div className="flex h-screen items-center justify-center" aria-live="polite" role="status">
        <Spinner className="text-text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <ToolCallsMapProvider conversationId={conversation.conversationId ?? ''}>
        <ChatMiniView index={index} />
      </ToolCallsMapProvider>
    </div>
  );
}
