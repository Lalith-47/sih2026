import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { getProjects } from '@/data/mockProjects';
import ProjectCard from '@/components/public/ProjectCard';
import SearchBar from '@/components/public/SearchBar';
import { Project } from '@/types/project';
import { BarChart3, Layers, Compass, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.wbsCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  return (
    <>
      <Head>
        <title>National Infrastructure Projects Portal | InfraTrack 2026</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header Title Section */}
        <div className="border-b border-gray-800 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Public Infrastructure Observatory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time public dashboard tracking physical execution, S-Curves, and financial utilization across major national projects.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
        />

        {/* Results Counter / Active Filters */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Showing{' '}
            <span className="font-mono font-bold text-white">{filteredProjects.length}</span> of{' '}
            <span className="font-mono font-bold text-white">{projects.length}</span> capital projects
          </div>

          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No projects found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No active infrastructure projects match your current search query or filter parameters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

