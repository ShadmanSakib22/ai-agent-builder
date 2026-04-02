import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/BuilderLayout';
import { useModelStore } from '@/store/modelStore';
import { useAgentBuilderStore } from '@/store/agentBuilderStore';
import { useAgentData } from '@/hooks/useAgentData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2, Calendar, Code2 } from 'lucide-react';

const Models = () => {
  const navigate = useNavigate();
  const { models, deleteModel } = useModelStore();
  const { loadFromModel } = useAgentBuilderStore();
  const { data } = useAgentData();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'profile'>('recent');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.agentProfiles.find((p) => p.id === model.profileId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'recent') {
      filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'profile') {
      filtered.sort((a, b) => {
        const profileA = data.agentProfiles.find((p) => p.id === a.profileId)?.name || '';
        const profileB = data.agentProfiles.find((p) => p.id === b.profileId)?.name || '';
        return profileA.localeCompare(profileB);
      });
    }

    return filtered;
  }, [models, searchTerm, sortBy, data]);

  const handleLoad = (model: typeof models[0]) => {
    loadFromModel(model);
    navigate('/builder/base-profiles');
  };

  const handleDelete = (modelId: string) => {
    deleteModel(modelId);
    setDeleteConfirm(null);
  };

  const getProfileName = (profileId: string) => {
    return data.agentProfiles.find((p) => p.id === profileId)?.name || 'Unknown';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <BuilderLayout title="All Models" description="View and manage all your deployed agents">
      <div className="flex flex-col gap-6">
        {/* Search and Filter Section */}
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-semibold mb-2">
                Search Agents
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or profile..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-semibold mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'profile')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="profile">Profile Type</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Models List */}
        {filteredAndSortedModels.length === 0 ? (
          <Card className="p-12 text-center">
            <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-6">
              {models.length === 0
                ? "You haven't created any agents yet. Start building by navigating to the Builder."
                : 'No agents match your search criteria.'}
            </p>
            {models.length === 0 && (
              <Button onClick={() => navigate('/builder/base-profiles')}>
                Create Your First Agent
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedModels.map((model) => (
              <Card
                key={model.id}
                className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{model.name}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Profile</p>
                        <p className="text-sm font-medium">{getProfileName(model.profileId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Skills</p>
                        <p className="text-sm font-medium">{model.skillIds.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Layers</p>
                        <p className="text-sm font-medium">{model.layerIds.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Provider</p>
                        <p className="text-sm font-medium capitalize">{model.providerId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(model.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Updated: {formatDate(model.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleLoad(model)}
                      className="whitespace-nowrap"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(model.id)}
                      className="whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>

                    {/* Delete Confirmation */}
                    {deleteConfirm === model.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="p-6 max-w-sm">
                          <h3 className="text-lg font-semibold mb-2">Delete Agent?</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to delete "{model.name}"? This action cannot be undone.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(model.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button onClick={() => navigate('/builder/base-profiles')}>
            Create New Agent
          </Button>
        </div>
      </div>
    </BuilderLayout>
  );
};

export default Models;
