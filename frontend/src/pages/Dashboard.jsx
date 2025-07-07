// FILE: src/pages/Dashboard.jsx
// Purpose: Defines the main dashboard page, which is the default landing page
//          for users after they log in.

import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GuideViewer from '../components/docs/GuideViewer';

/**
 * The Dashboard component.
 * It serves as the documentation hub for users, with an interactive guide
 * and access to various README files.
 */
const Dashboard = () => {
  return (
    <PageWrapper title="Dashboard">
      <GuideViewer />
    </PageWrapper>
  );
};

export default Dashboard;
