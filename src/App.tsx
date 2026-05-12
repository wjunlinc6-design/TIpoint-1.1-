/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Onboarding from './views/Onboarding';
import Navigation from './components/Navigation';
import Indoor from './views/Indoor';
import Tree from './views/Tree';
import Daily from './views/Daily';
import { StorageService } from './lib/storage';
import { UserConfig } from './types';

export default function App() {
  const [userConfig, setUserConfig] = React.useState<UserConfig | null>(null);
  const [activeTab, setActiveTab] = React.useState<'indoor' | 'tree' | 'daily'>('tree');

  // Initialize state
  React.useEffect(() => {
    setUserConfig(StorageService.getUserConfig());
  }, []);

  if (!userConfig) return null;
  
  const content = !userConfig.isOnboarded ? (
    <Onboarding onComplete={(config) => setUserConfig(config)} />
  ) : (
    <>
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'tree' && (
            <motion.div
              key="tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Tree config={userConfig} onUpdateConfig={(cfg) => setUserConfig(cfg)} />
            </motion.div>
          )}
          {activeTab === 'indoor' && (
            <motion.div
              key="indoor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0"
            >
              <Indoor />
            </motion.div>
          )}
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0"
            >
              <Daily />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center overflow-auto bg-black/5">
      <div className="flex flex-col w-[1200px] h-[984px] shrink-0 relative bg-brand-bg shadow-2xl overflow-hidden rounded-[32px]">
        {content}
      </div>
    </div>
  );
}
