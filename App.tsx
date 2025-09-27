


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, QuadrantType, TaskStatus, Subject, Subtask } from './types';
import AddTaskForm from './components/AddTaskForm';
import Quadrant from './components/Quadrant';
import Sidebar from './components/Sidebar';
import ThemeSwitcher from './components/ThemeSwitcher';

declare const jspdf: any;
declare const html2canvas: any;

const App: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialSubjects: Subject[] = [];
    let activeSubjectId: string | null = null;
    try {
      const savedSubjects = localStorage.getItem('eisenhower_subjects');
      if (savedSubjects) {
        initialSubjects = JSON.parse(savedSubjects);
      } else {
        const savedTasksV2 = localStorage.getItem('eisenhower_tasks_v2');
        if (savedTasksV2) {
          const tasks: Task[] = JSON.parse(savedTasksV2).map((task: any) => {
            const { isMyDay, ...rest } = task;
            return rest;
          });

          if (tasks.length > 0) {
            const migratedSubject: Subject = {
              id: crypto.randomUUID(),
              name: 'Tarefas Gerais',
              tasks,
              createdAt: Date.now(),
            };
            initialSubjects = [migratedSubject];
          }
          localStorage.removeItem('eisenhower_tasks_v2');
          localStorage.removeItem('eisenhower_tasks');
          localStorage.removeItem('eisenhower_subtitle');
        }
      }
    } catch (error) {
      console.error("Failed to load or migrate data from localStorage", error);
    }
    
    if (initialSubjects.length === 0) {
      const defaultSubject: Subject = {
        id: crypto.randomUUID(),
        name: "Meu Projeto",
        tasks: [],
        createdAt: Date.now()
      };
      initialSubjects = [defaultSubject];
    }
    
    setSubjects(initialSubjects);
    activeSubjectId = initialSubjects[0]?.id || null;
    
    const lastSelectedId = localStorage.getItem('eisenhower_currentSubjectId');
    if (lastSelectedId && initialSubjects.some(s => s.id === lastSelectedId)) {
        activeSubjectId = lastSelectedId;
    }
    
    setCurrentSubjectId(activeSubjectId);
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      try {
        localStorage.setItem('eisenhower_subjects', JSON.stringify(subjects));
      } catch (error) {
        console.error("Failed to save subjects to localStorage", error);
      }
    }
  }, [subjects]);

  useEffect(() => {
    if (currentSubjectId) {
      try {
        localStorage.setItem('eisenhower_currentSubjectId', currentSubjectId);
      } catch (error) {
        console.error("Failed to save current subject ID to localStorage", error);
      }
    }
  }, [currentSubjectId]);

  const handleAddSubject = useCallback((name: string) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      tasks: [],
      createdAt: Date.now()
    };
    setSubjects(prev => [...prev, newSubject]);
    setCurrentSubjectId(newSubject.id);
  }, []);

  const handleDeleteSubject = useCallback((id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este projeto e todas as suas tarefas?")) {
      return;
    }
    setSubjects(prev => {
      const newSubjects = prev.filter(s => s.id !== id);
      if (currentSubjectId === id) {
        setCurrentSubjectId(newSubjects[0]?.id || null);
      }
      return newSubjects;
    });
  }, [currentSubjectId]);

  const updateTasksForCurrentSubject = (updateFn: (tasks: Task[]) => Task[]) => {
    if (!currentSubjectId) return;
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.id === currentSubjectId
          ? { ...subject, tasks: updateFn(subject.tasks) }
          : subject
      )
    );
  };

  const handleAddTask = useCallback((text: string, quadrant: QuadrantType, dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(), text, quadrant, status: TaskStatus.PENDING, createdAt: Date.now(), dueDate: dueDate || undefined, subtasks: []
    };
    updateTasksForCurrentSubject(prevTasks => [...prevTasks, newTask]);
  }, [currentSubjectId]);

  const handleDeleteTask = useCallback((id: string) => {
    updateTasksForCurrentSubject(prevTasks => prevTasks.filter(t => t.id !== id));
  }, [currentSubjectId]);

  const handleUpdateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    updateTasksForCurrentSubject(prevTasks => prevTasks.map(t => t.id === id ? { ...t, status } : t));
  }, [currentSubjectId]);

  const handleMoveTask = useCallback((id: string, newQuadrant: QuadrantType) => {
    updateTasksForCurrentSubject(prevTasks =>
      prevTasks.map(t => (t.id === id ? { ...t, quadrant: newQuadrant } : t))
    );
  }, [currentSubjectId]);

  const handleAddSubtask = useCallback((taskId: string, text: string) => {
    const newSubtask: Subtask = { id: crypto.randomUUID(), text, completed: false };
    updateTasksForCurrentSubject(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const subtasks = task.subtasks ? [...task.subtasks, newSubtask] : [newSubtask];
        return { ...task, subtasks };
      }
      return task;
    }));
  }, [currentSubjectId]);

  const handleDeleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    updateTasksForCurrentSubject(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const subtasks = task.subtasks?.filter(st => st.id !== subtaskId);
        return { ...task, subtasks };
      }
      return task;
    }));
  }, [currentSubjectId]);

  const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    updateTasksForCurrentSubject(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const subtasks = task.subtasks?.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...task, subtasks };
      }
      return task;
    }));
  }, [currentSubjectId]);

  const currentSubject = subjects.find(s => s.id === currentSubjectId);

  const handleExportPDF = useCallback(async () => {
    if (!matrixRef.current || !currentSubject) return;
    setIsLoading(true);

    try {
      const { jsPDF } = jspdf;
      const computedStyle = getComputedStyle(document.body);
      const backgroundColor = computedStyle.getPropertyValue('--color-foreground').trim();

      const canvas = await html2canvas(matrixRef.current, {
        scale: 2,
        backgroundColor: backgroundColor || '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const safeSubjectName = currentSubject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`gestao_prioridades_${safeSubjectName}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Ocorreu um erro ao exportar para PDF. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [currentSubject]);

  const getProcessedTasks = (quadrant: QuadrantType) => {
    const currentTasks = currentSubject?.tasks || [];
    let quadrantTasks = currentTasks.filter(task => task.quadrant === quadrant);
    if (filterStatus !== 'ALL') {
      quadrantTasks = quadrantTasks.filter(task => task.status === filterStatus);
    }
    quadrantTasks.sort((a, b) => sortOrder === 'ASC' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
    return quadrantTasks;
  };

  const appTitle = "Gestão de Prioridades";
  const projectTitle = currentSubject?.name || "Nenhum projeto selecionado";

  return (
    <div className="flex min-h-screen bg-[--color-background] font-sans text-[--color-text-primary]">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        subjects={subjects}
        currentSubjectId={currentSubjectId}
        onSelectSubject={setCurrentSubjectId}
        onAddSubject={handleAddSubject}
        onDeleteSubject={handleDeleteSubject}
      />
      <div className={`flex-grow p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-[--color-foreground]"
                aria-label={isSidebarOpen ? "Fechar menu de projetos" : "Abrir menu de projetos"}
                aria-expanded={isSidebarOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[--color-text-secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-[--color-header]">{appTitle}</h1>
            </div>
            <ThemeSwitcher />
          </header>

          <main className="bg-[--color-foreground] rounded-xl shadow-lg p-6 mb-8">
            <AddTaskForm onAddTask={handleAddTask} />
          </main>

          <div className="bg-[--color-foreground] rounded-xl shadow-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="filterStatus" className="text-sm font-medium text-[--color-text-secondary]">Filtrar por Status:</label>
              <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'ALL' | TaskStatus)} className="px-3 py-1.5 border border-[--color-border] rounded-lg focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary] transition bg-[--color-foreground] text-sm text-[--color-text-primary]">
                <option value="ALL">Todas</option>
                <option value={TaskStatus.PENDING}>Pendentes</option>
                <option value={TaskStatus.IN_PROGRESS}>Em Andamento</option>
                <option value={TaskStatus.COMPLETED}>Concluídas</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sortOrder" className="text-sm font-medium text-[--color-text-secondary]">Ordenar por Data:</label>
              <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')} className="px-3 py-1.5 border border-[--color-border] rounded-lg focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary] transition bg-[--color-foreground] text-sm text-[--color-text-primary]">
                <option value="DESC">Mais Recentes</option>
                <option value="ASC">Mais Antigas</option>
              </select>
            </div>
            <button onClick={handleExportPDF} disabled={isLoading || !currentSubject} className="flex justify-center items-center bg-[--color-primary] text-[--color-primary-text] font-bold py-1.5 px-4 rounded-lg hover:bg-[--color-primary-hover] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {isLoading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Exportando...</>
              ) : 'Exportar para PDF'}
            </button>
          </div>

          {currentSubject ? (
            <div ref={matrixRef} className="p-8 bg-[--color-foreground] rounded-lg">
              <h2 className="text-2xl font-bold text-center text-[--color-text-secondary] mb-6">{projectTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <Quadrant title="Urgente e Importante" quadrantType={QuadrantType.DO} tasks={getProcessedTasks(QuadrantType.DO)} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} onMoveTask={handleMoveTask} onAddSubtask={handleAddSubtask} onDeleteSubtask={handleDeleteSubtask} onToggleSubtask={handleToggleSubtask} />
                <Quadrant title="Não Urgente e Importante" quadrantType={QuadrantType.SCHEDULE} tasks={getProcessedTasks(QuadrantType.SCHEDULE)} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} onMoveTask={handleMoveTask} onAddSubtask={handleAddSubtask} onDeleteSubtask={handleDeleteSubtask} onToggleSubtask={handleToggleSubtask} />
                <Quadrant title="Urgente e Não Importante" quadrantType={QuadrantType.DELEGATE} tasks={getProcessedTasks(QuadrantType.DELEGATE)} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} onMoveTask={handleMoveTask} onAddSubtask={handleAddSubtask} onDeleteSubtask={handleDeleteSubtask} onToggleSubtask={handleToggleSubtask} />
                <Quadrant title="Não Urgente e Não Importante" quadrantType={QuadrantType.ELIMINATE} tasks={getProcessedTasks(QuadrantType.ELIMINATE)} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} onMoveTask={handleMoveTask} onAddSubtask={handleAddSubtask} onDeleteSubtask={handleDeleteSubtask} onToggleSubtask={handleToggleSubtask} />
              </div>
            </div>
          ) : (
            <div className="text-center p-10 bg-[--color-foreground] rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-[--color-text-secondary]">Nenhum projeto selecionado</h2>
                <p className="mt-2 text-[--color-text-secondary]">Crie ou selecione um projeto na barra lateral para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;