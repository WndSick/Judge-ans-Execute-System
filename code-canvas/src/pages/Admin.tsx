import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { fetchProblems, fetchContests } from "@/lib/api";
import { Plus, Trash2, Calendar, FileText, LayoutDashboard, X, Code, ListChecks, Info, Save, Clock, Search, Check } from "lucide-react";
import { toast } from "sonner";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

const Admin = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [allProblems, setAllProblems] = useState<any[]>([]); // For contest selection
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"problems" | "contests">("problems");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"problem" | "contest">("problem");
  const [searchTerm, setSearchTerm] = useState("");

  // Multi-tab modal state
  const [modalTab, setModalTab] = useState<"general" | "details" | "code" | "tests">("general");

  // Problem Form State
  const [problemData, setProblemData] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    timeLimit: 1000,
    memoryLimit: 512,
    isPublic: true,
    tags: "",
    constraints: "",
    examples: [{ input: "", output: "", explanation: "" }],
    starterCode: { python: "", cpp: "" },
    testcases: [{ input: "", expectedOutput: "" }]
  });

  // Contest Form State
  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    selectedProblemIds: [] as string[]
  });

  useEffect(() => {
    document.title = "Forge — Admin Dashboard";
    if (localStorage.getItem("role") !== "admin") {
      window.location.href = "/";
      return;
    }
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchProblems(), fetchContests()]);
      setProblems(p);
      setContests(c);
      
      // Fetch ALL problems for the selector
      const res = await fetch(`${API_BASE}/admin/problems`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const ap = await res.json();
        setAllProblems(ap.map((item: any) => ({ ...item, id: item.id || item._id })));
      }
    } catch (e: any) {
      toast.error("Failed to load admin data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...problemData,
      tags: problemData.tags.split(",").map(t => t.trim()).filter(Boolean),
      constraints: problemData.constraints.split("\n").map(c => c.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(`${API_BASE}/admin/problems`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create problem");
      }
      refreshData();
      setIsModalOpen(false);
      toast.success("Problem created successfully");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contestData.selectedProblemIds.length === 0) {
      toast.error("Please select at least one problem");
      return;
    }

    const payload = {
      title: contestData.title,
      description: contestData.description,
      startTime: contestData.startTime,
      endTime: contestData.endTime,
      problemIds: contestData.selectedProblemIds
    };

    try {
      const res = await fetch(`${API_BASE}/admin/contests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to schedule contest");
      }
      refreshData();
      setIsModalOpen(false);
      toast.success("Contest scheduled successfully");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleProblemSelection = (id: string) => {
    setContestData(prev => ({
      ...prev,
      selectedProblemIds: prev.selectedProblemIds.includes(id)
        ? prev.selectedProblemIds.filter(pid => pid !== id)
        : [...prev.selectedProblemIds, id]
    }));
  };

  const filteredProblems = allProblems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-glow">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">System Admin</h1>
          </div>
          <button 
            onClick={() => { setModalType(activeTab === "problems" ? "problem" : "contest"); setModalTab("general"); setIsModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
          >
            <Plus className="h-4 w-4" /> 
            Create {activeTab === "problems" ? "Problem" : "Contest"}
          </button>
        </div>

        <div className="flex gap-1 p-1 w-fit rounded-xl border border-border/40 bg-card/30 mb-8 backdrop-blur-sm">
          <button onClick={() => setActiveTab("problems")} className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-all ${activeTab === "problems" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <FileText className="h-4 w-4" /> Problems
          </button>
          <button onClick={() => setActiveTab("contests")} className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-all ${activeTab === "contests" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Calendar className="h-4 w-4" /> Contests
          </button>
        </div>

        {loading ? (
          <div className="text-center py-32 text-muted-foreground animate-pulse">Synchronizing dashboard...</div>
        ) : activeTab === "problems" ? (
          <ProblemList problems={problems} onDelete={refreshData} />
        ) : (
          <ContestList contests={contests} onDelete={refreshData} />
        )}
      </main>

      {/* SHARED MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-3xl border border-border/60 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-8 border-b border-border/40 flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  {modalType === "problem" ? <Plus className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{modalType === "problem" ? "New Problem" : "Schedule Contest"}</h2>
                  <p className="text-xs text-muted-foreground">Fill in the required technical details</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full hover:bg-secondary/50 flex items-center justify-center transition-colors"><X className="h-5 w-5" /></button>
            </div>

            {modalType === "problem" ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex border-b border-border/40 bg-card/50">
                  <ModalTab active={modalTab === "general"} onClick={() => setModalTab("general")} icon={<Info className="h-3.5 w-3.5" />}>General</ModalTab>
                  <ModalTab active={modalTab === "details"} onClick={() => setModalTab("details")} icon={<LayoutDashboard className="h-3.5 w-3.5" />}>Details</ModalTab>
                  <ModalTab active={modalTab === "code"} onClick={() => setModalTab("code")} icon={<Code className="h-3.5 w-3.5" />}>Code</ModalTab>
                  <ModalTab active={modalTab === "tests"} onClick={() => setModalTab("tests")} icon={<ListChecks className="h-3.5 w-3.5" />}>Tests</ModalTab>
                </div>
                <form onSubmit={handleCreateProblem} className="flex-1 overflow-y-auto p-8 space-y-8">
                  {modalTab === "general" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Title</label>
                          <input required className="w-full h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 outline-none focus:border-primary" value={problemData.title} onChange={e => setProblemData({...problemData, title: e.target.value})} placeholder="Two Sum" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Difficulty</label>
                          <select className="w-full h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 outline-none" value={problemData.difficulty} onChange={e => setProblemData({...problemData, difficulty: e.target.value})}>
                            <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>
                      <textarea required rows={5} className="w-full rounded-xl bg-secondary/30 border border-border/60 p-4 outline-none" value={problemData.description} onChange={e => setProblemData({...problemData, description: e.target.value})} placeholder="Description..." />
                      <div className="grid grid-cols-2 gap-6">
                        <input type="number" className="h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 outline-none" value={problemData.timeLimit} onChange={e => setProblemData({...problemData, timeLimit: Number(e.target.value)})} placeholder="Time Limit (ms)" />
                        <input type="number" className="h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 outline-none" value={problemData.memoryLimit} onChange={e => setProblemData({...problemData, memoryLimit: Number(e.target.value)})} placeholder="Memory Limit (MB)" />
                      </div>
                    </div>
                  )}
                  {modalTab === "details" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <input className="w-full h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 outline-none" value={problemData.tags} onChange={e => setProblemData({...problemData, tags: e.target.value})} placeholder="Tags (Array, Math...)" />
                      <textarea rows={4} className="w-full rounded-xl bg-secondary/30 border border-border/60 p-4 outline-none" value={problemData.constraints} onChange={e => setProblemData({...problemData, constraints: e.target.value})} placeholder="Constraints (One per line)" />
                      <div className="grid grid-cols-2 gap-4">
                        <textarea placeholder="Example Input" className="h-24 rounded-xl bg-secondary/30 border border-border/60 p-3 text-xs font-mono outline-none" value={problemData.examples[0].input} onChange={e => { const ex = [...problemData.examples]; ex[0].input = e.target.value; setProblemData({...problemData, examples: ex})}} />
                        <textarea placeholder="Example Output" className="h-24 rounded-xl bg-secondary/30 border border-border/60 p-3 text-xs font-mono outline-none" value={problemData.examples[0].output} onChange={e => { const ex = [...problemData.examples]; ex[0].output = e.target.value; setProblemData({...problemData, examples: ex})}} />
                      </div>
                    </div>
                  )}
                  {modalTab === "code" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <textarea rows={6} className="w-full rounded-xl bg-secondary/30 border border-border/60 p-4 font-mono text-sm outline-none" value={problemData.starterCode.python} onChange={e => setProblemData({...problemData, starterCode: {...problemData.starterCode, python: e.target.value}})} placeholder="Python starter..." />
                      <textarea rows={6} className="w-full rounded-xl bg-secondary/30 border border-border/60 p-4 font-mono text-sm outline-none" value={problemData.starterCode.cpp} onChange={e => setProblemData({...problemData, starterCode: {...problemData.starterCode, cpp: e.target.value}})} placeholder="C++ starter..." />
                    </div>
                  )}
                  {modalTab === "tests" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      {problemData.testcases.map((tc, i) => (
                        <div key={i} className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/40 bg-secondary/10 relative">
                          <textarea placeholder="Input" className="h-20 rounded-lg bg-card p-3 text-xs font-mono outline-none" value={tc.input} onChange={e => { const tcs = [...problemData.testcases]; tcs[i].input = e.target.value; setProblemData({...problemData, testcases: tcs})}} />
                          <textarea placeholder="Expected Output" className="h-20 rounded-lg bg-card p-3 text-xs font-mono outline-none" value={tc.expectedOutput} onChange={e => { const tcs = [...problemData.testcases]; tcs[i].expectedOutput = e.target.value; setProblemData({...problemData, testcases: tcs})}} />
                          {i > 0 && <button type="button" onClick={() => setProblemData({...problemData, testcases: problemData.testcases.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"><X className="h-3 w-3"/></button>}
                        </div>
                      ))}
                      <button type="button" onClick={() => setProblemData({...problemData, testcases: [...problemData.testcases, {input: "", expectedOutput: ""}]})} className="w-full py-3 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">+ Add Testcase</button>
                    </div>
                  )}
                  <div className="pt-8 border-t border-border/40 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-muted-foreground">Cancel</button>
                    <button type="submit" className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:brightness-110 transition-all flex items-center gap-2"><Save className="h-4 w-4" /> Save Problem</button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleCreateContest} className="p-8 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Contest Title</label>
                    <input required className="w-full h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 outline-none focus:border-primary" value={contestData.title} onChange={e => setContestData({...contestData, title: e.target.value})} placeholder="Weekly Contest..." />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Start Time</label>
                      <input type="datetime-local" required className="w-full h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 focus:border-primary outline-none" value={contestData.startTime} onChange={e => setContestData({...contestData, startTime: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">End Time</label>
                      <input type="datetime-local" required className="w-full h-12 rounded-xl bg-secondary/30 border border-border/60 px-4 focus:border-primary outline-none" value={contestData.endTime} onChange={e => setContestData({...contestData, endTime: e.target.value})} />
                    </div>
                  </div>
                  
                  {/* SEARCHABLE PROBLEM SELECTOR */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Assign Problems ({contestData.selectedProblemIds.length} selected)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        className="w-full h-10 rounded-lg bg-secondary/30 border border-border/60 pl-10 pr-4 outline-none focus:border-primary text-sm" 
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1 rounded-xl border border-border/40 bg-secondary/5">
                      {filteredProblems.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => toggleProblemSelection(p.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                            contestData.selectedProblemIds.includes(p.id) 
                              ? "bg-primary/10 border-primary shadow-sm" 
                              : "bg-card border-border/60 hover:border-primary/40"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold truncate max-w-[200px]">{p.title}</p>
                            <p className={`text-[9px] uppercase font-bold ${
                              p.difficulty === 'Easy' ? 'text-green-500' : p.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                            }`}>{p.difficulty}</p>
                          </div>
                          {contestData.selectedProblemIds.includes(p.id) ? (
                            <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="h-3 w-3" /></div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-border/60 group-hover:border-primary/60" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/40 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-muted-foreground">Cancel</button>
                  <button type="submit" className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:brightness-110 flex items-center gap-2">
                    <Save className="h-4 w-4" /> Schedule Contest
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalTab = ({ active, onClick, icon, children }: any) => (
  <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${active ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/20"}`}>
    {icon}{children}
  </button>
);

const ProblemList = ({ problems, onDelete }: { problems: any[], onDelete: () => void }) => {
  const handleDelete = async (id: string) => {
    if (!confirm("Delete problem?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/problems/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) { toast.success("Problem deleted"); onDelete(); }
      else { const d = await res.json(); throw new Error(d.message); }
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 overflow-hidden shadow-xl">
      <table className="w-full text-left">
        <thead className="bg-secondary/20">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Difficulty</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {problems.map(p => (
            <tr key={p.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/10 transition-colors">
              <td className="px-6 py-5 font-semibold text-sm">{p.title}</td>
              <td className="px-6 py-5">
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                  p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>{p.difficulty}</span>
              </td>
              <td className="px-6 py-5 text-right">
                <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ContestList = ({ contests, onDelete }: { contests: any[], onDelete: () => void }) => {
  const handleDelete = async (id: string) => {
    if (!confirm("Delete contest?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/contests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) { toast.success("Contest deleted"); onDelete(); }
      else { const d = await res.json(); throw new Error(d.message); }
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 overflow-hidden shadow-xl">
      <table className="w-full text-left">
        <thead className="bg-secondary/20">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contest Title</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timeline</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contests.map(c => (
            <tr key={c.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/10 transition-colors">
              <td className="px-6 py-5 font-semibold text-sm">{c.title}</td>
              <td className="px-6 py-5 text-xs text-muted-foreground font-mono">
                {new Date(c.startTime).toLocaleString()} - {new Date(c.endTime).toLocaleString()}
              </td>
              <td className="px-6 py-5 text-right">
                <button onClick={() => handleDelete(c.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
