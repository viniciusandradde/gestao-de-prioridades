import React, { useState } from 'react';
import { Subject } from '../types';

interface SidebarProps {
  subjects: Subject[];
  currentSubjectId: string | null;
  onSelectSubject: (id: string) => void;
  onAddSubject: (name: string) => void;
  onDeleteSubject: (id: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  subjects,
  currentSubjectId,
  onSelectSubject,
  onAddSubject,
  onDeleteSubject,
  isOpen
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName('');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-[--color-foreground] shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex flex-col h-full">
        <header className="p-4 border-b border-[--color-border] flex items-center gap-4">
          <div className="text-xl font-bold text-[--color-header]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[--color-primary]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[--color-header]">Projetos</h2>
        </header>

        <div className="p-2 border-b border-[--color-border]">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar projetos..."
            className="w-full px-3 py-1.5 border border-[--color-border] rounded-lg text-sm focus:ring-1 focus:ring-[--color-primary] bg-transparent"
            aria-label="Pesquisar projetos"
          />
        </div>
        
        <nav className="flex-grow overflow-y-auto p-2">
          <ul className="space-y-1">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(subject => (
                <li key={subject.id} className="group flex items-center">
                  <button
                    onClick={() => onSelectSubject(subject.id)}
                    className={`flex-grow text-left p-2.5 rounded-md text-sm transition-colors w-full ${
                      subject.id === currentSubjectId
                        ? 'bg-[--color-primary] text-[--color-primary-text] font-semibold'
                        : 'text-[--color-text-primary] hover:bg-[--color-background]'
                    }`}
                  >
                    {subject.name}
                  </button>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => onDeleteSubject(subject.id)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                      aria-label={`Excluir projeto ${subject.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </li>
              ))
            ) : (
                <li className="p-2.5 text-sm text-center text-[--color-text-secondary]">
                    Nenhum projeto encontrado.
                </li>
            )}
          </ul>
        </nav>

        <footer className="p-2 border-t border-[--color-border]">
          <form onSubmit={handleAddSubject} className="flex gap-2">
            <input
              type="text"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              placeholder="Novo projeto..."
              className="flex-grow px-3 py-1.5 border border-[--color-border] rounded-lg text-sm focus:ring-1 focus:ring-[--color-primary] bg-transparent"
            />
            <button
              type="submit"
              className="bg-[--color-accent] text-white font-bold p-2 rounded-lg hover:opacity-90 transition-opacity"
              aria-label="Adicionar novo projeto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default Sidebar;