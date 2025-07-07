// FILE: src/pages/ProjectWorkspace.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import PageWrapper from '../components/layout/PageWrapper';
import TopNavMenu from '../components/projects/TopNavMenu';
import ProjectSettingsPanel from '../components/projects/ProjectSettingsPanel';
import ProjectAgentsTab from '../components/projects/ProjectAgentsTab';
import ProjectSystemTab from '../components/projects/ProjectSystemTab';
import ProjectLogsTab from '../components/projects/ProjectLogsTab';

import { useProject } from '../hooks/projects/useProject';
import { usePauseProject } from '../hooks/projects/usePauseProject';
import { useSetMessageLimit } from '../hooks/projects/useSetMessageLimit';
import { useSwitchProjectToken } from '../hooks/projects/useSwitchProjectToken';
import { useTokens } from '../hooks/tokens/useTokens';
import { useSocket } from '../context/SocketContext';
import { useDeleteLogs } from '../hooks/logs/useDeleteLogs';

import { showToast } from '../utils/toastUtils';
import '../styles/projectworkspace.css';
import { DEMO_PROJECT_IDS, SNAPSHOT_PROJECT_ID } from '../config/demoIds';


/**
 * The main component for viewing and interacting with a single project.
 */
const ProjectWorkspace = () => {
  const { id: projectId } = useParams();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('agents');  
  const isSnapshot = Number(projectId) === SNAPSHOT_PROJECT_ID;
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { data: allTokens = [], isLoading: tokensLoading } = useTokens();
  const pauseMutation = usePauseProject(projectId);
  const limitMutation = useSetMessageLimit(projectId);
  const tokenMutation = useSwitchProjectToken(projectId);
  const deleteLogsMutation = useDeleteLogs(projectId);

  const activeTokens = useMemo(() => {
    return allTokens.filter(token => token.isActive);
  }, [allTokens]);

  // Centralized WebSocket Event Handler
  useEffect(() => {
    if (!socket || !projectId) return;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.payload?.projectId && data.payload.projectId !== Number(projectId)) {
              return;
            }
            switch (data.type) {
                case 'new_message': {
                    const newMessage = data.payload;
                    queryClient.invalidateQueries({ queryKey: ['messages', newMessage.conversationId] });
                    break;
                }
                case 'message_updated': {
                    const { conversationId } = data.payload;
                    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                    break;
                }
                case 'project_updated': {
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                  queryClient.invalidateQueries({ queryKey: ['projects'] });
                  break;
                } 
                default:
                    break;
            }
        } catch (error) {
            console.error('[WebSocket] Error processing message:', error);
        }
    };
    
    const handleOpen = () => {
        const joinMsg = JSON.stringify({ type: 'join', projectId: Number(projectId) });
        socket.send(joinMsg);
    };

    socket.addEventListener('message', handleMessage);
    if (socket.readyState === WebSocket.OPEN) {
        handleOpen();
    } else {
        socket.addEventListener('open', handleOpen);
    }

    return () => {
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('open', handleOpen);
    };
  }, [socket, projectId, queryClient]);

  const handleSwitchToken = (id) => {
    if (DEMO_PROJECT_IDS.includes(Number(projectId))) {
      return showToast('Tokens cannot be switched on demo projects.', 'warn');
    }
    tokenMutation.mutate(id);
  };

  const handleSetLimit = (val) => {
    if (isSnapshot) {
      return showToast("Action blocked: A snapshot project's message limit cannot be changed.", 'warn');
    }
    limitMutation.mutate(val);
  };
  
  const handleTogglePause = () => {
    if (isSnapshot) {
      return showToast("Action blocked: A snapshot project's status cannot be changed.", 'warn');
    }
    pauseMutation.mutate(!project?.isPaused);
  };

  const handleClearLogs = () => {
    if (isSnapshot) {
      return showToast("Action blocked: Logs for a snapshot project cannot be cleared.", 'warn');
    }
    deleteLogsMutation.mutate();
  };

  const currentToken = allTokens.find(t => t.id === project?.tokenId);

  if (loadingProject || tokensLoading) {
    return <PageWrapper title="Loading Project..." />;
  }

  return (
    <PageWrapper title={`Project: ${project?.title || 'Untitled'}`}>
      <TopNavMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="workspace-tab-area">
        <div className="workspace-tab-content">
          {activeTab === 'agents' && <ProjectAgentsTab projectId={projectId} readOnly={isSnapshot} />}
          {activeTab === 'system' && <ProjectSystemTab projectId={projectId} />}
          {activeTab === 'logs' && (
            <ProjectLogsTab 
              projectId={projectId} 
              onClearLogs={handleClearLogs}
              isClearing={deleteLogsMutation.isPending}
              readOnly={isSnapshot}
            />
          )}
        </div>
        <ProjectSettingsPanel
          project={project}
          onTogglePause={handleTogglePause}
          onSetLimit={handleSetLimit}
          currentToken={currentToken}
          onSwitchToken={handleSwitchToken}
          isUpdating={pauseMutation.isPending || limitMutation.isPending || tokenMutation.isPending}
          tokens={activeTokens}
          isSnapshot={isSnapshot}
        />
      </div>
    </PageWrapper>
  );
};

export default ProjectWorkspace;