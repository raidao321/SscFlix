"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import {
  ActivityRecord,
  calculateStudySummary,
  getRecordsForExam,
  getResumeRecord,
  getSubjectSnapshot,
  TREND_ATTEMPT_THRESHOLD,
  ExamName,
} from "@/data/dashboardFixtures";

const exams = ["SSC CGL","SSC CHSL","SSC CPO","SSC MTS","SSC GD","SSC Stenographer"];
const primary = [
  {href:"/dashboard",label:"Dashboard",icon:"grid" as const},
  {href:"/mock-tests",label:"Mock Tests",icon:"test" as const},
  {href:"/pyqs",label:"PYQs",icon:"pyq" as const},
  {href:"/chapter-tests",label:"Chapter Tests",icon:"chapter" as const},
];
const secondary = [
  {href:"/my-tests",label:"My Tests",icon:"test" as const},
  {href:"/bookmarks",label:"Bookmarks",icon:"bookmark" as const},
  {href:"/preferences",label:"Preferences",icon:"settings" as const},
];

function readStored(key:string, fallback:string) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function Overlay({title,children,onClose,centered=false}: {title:string;children:React.ReactNode;onClose:()=>void;centered?:boolean}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('button,a[href],input,[tabindex]:not([tabindex="-1"])') || []).filter(el => !el.hasAttribute("disabled"));
    focusable()[0]?.focus();
    function keydown(event:KeyboardEvent) {
      if(event.key==="Escape"){event.preventDefault();onClose();}
      if(event.key==="Tab"){
        const items=focusable(); if(!items.length)return;
        const first=items[0], last=items[items.length-1];
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
      }
    }
    document.addEventListener("keydown",keydown);
    const old=document.body.style.overflow; document.body.style.overflow="hidden";
    return () => {document.removeEventListener("keydown",keydown);document.body.style.overflow=old;before?.focus();};
  },[onClose]);
  return <div className="overlay-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div ref={panelRef} className={`overlay-panel${centered?" centered":""}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="overlay-heading"><h2>{title}</h2><button className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><Icon name="close"/></button></div>
      {children}
    </div>
  </div>;
}

function Brand() {
  return <div className="brand-slot" aria-label="SSC Flix"><span className="brand-mark">SF</span><span className="brand-name">SSC Flix</span></div>;
}

export default function AppExperience() {
  const pathname=usePathname();
  const [theme,setTheme]=useState<"light"|"dark">("light");
  const [exam,setExam]=useState("SSC CGL");
  const [overlay,setOverlay]=useState<"exam"|"search"|"notifications"|"more"|"profile"|null>(null);
  const [railExpanded,setRailExpanded]=useState(false);
  const [search,setSearch]=useState("");
  const [answer,setAnswer]=useState("");

  useEffect(()=>{
    const savedTheme=readStored("sscflix-theme","light")==="dark"?"dark":"light";
    const savedExam=readStored("sscflix-exam","SSC CGL");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme); setExam(exams.includes(savedExam)?savedExam:"SSC CGL");
  },[]);

  useEffect(()=>{
    document.documentElement.classList.toggle("dark",theme==="dark");
  },[theme]);

  const slug=pathname.split("/").filter(Boolean)[0]||"dashboard";
  const titles:Record<string,string>={dashboard:"Dashboard","mock-tests":"Mock Tests",pyqs:"PYQs","chapter-tests":"Chapter Tests","my-tests":"My Tests",bookmarks:"Bookmarks",preferences:"Preferences",profile:"Profile",help:"Help"};
  const title=titles[slug]||slug.split("-").map(w=>w[0]?.toUpperCase?.()+w.slice(1)).join(" ");
  useEffect(()=>{document.title=`${title} | SSC Flix`;},[title]);

  if(pathname=== "/assessment") return <Assessment answer={answer} setAnswer={setAnswer} />;
  if(pathname==="/" || pathname.startsWith("/public") || ["/sign-in","/get-started","/about","/contact","/faqs","/privacy","/terms","/disclaimer"].includes(pathname)) return <PublicShell pathname={pathname}/>;

  function toggleTheme(){
    const next=theme==="light"?"dark":"light";
    setTheme(next); try{localStorage.setItem("sscflix-theme",next);}catch{}
  }
  function selectExam(value:string){
    setExam(value); try{localStorage.setItem("sscflix-exam",value);}catch{}; setOverlay(null);
  }
  const closeOverlay=()=>setOverlay(null);

  const searchIndex=[
    ...primary.map(x=>({...x,keywords:""})),...secondary.map(x=>({...x,keywords:""})),
    {href:"/profile",label:"Profile",icon:"user" as const,keywords:"account"},
    {href:"/help",label:"Help",icon:"help" as const,keywords:"support"},
  ];
  const matches=searchIndex.filter(item=>item.label.toLowerCase().includes(search.toLowerCase())||item.keywords.includes(search.toLowerCase()));

  return <div className="workspace-shell">
    <aside className={`workspace-sidebar${railExpanded?" expanded":""}`} aria-label="Primary navigation">
      <Brand/>
      <button className="icon-button rail-expand" aria-label={railExpanded?"Collapse navigation":"Expand navigation"} aria-expanded={railExpanded} onClick={()=>setRailExpanded(v=>!v)}><Icon name={railExpanded?"close":"menu"}/></button>
      <nav className="nav-groups">
        <div className="nav-group"><span className="nav-label">Study</span>{primary.map(item=><Link key={item.href} className="nav-item" href={item.href} aria-current={pathname===item.href?"page":undefined}><Icon name={item.icon}/><span>{item.label}</span></Link>)}</div>
        <div className="nav-group"><span className="nav-label">Library</span>{secondary.map(item=><Link key={item.href} className="nav-item" href={item.href} aria-current={pathname===item.href?"page":undefined}><Icon name={item.icon}/><span>{item.label}</span></Link>)}</div>
      </nav>
    </aside>

    <header className="workspace-header">
      <button className="exam-button" onClick={()=>setOverlay("exam")} aria-haspopup="dialog" aria-label={`Target exam: ${exam}`}><span>{exam}</span><Icon name="chevron" size={16}/></button>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" onClick={()=>setOverlay("search")}><Icon name="search"/></button>
        <button className="icon-button" aria-label={`Switch to ${theme==="light"?"dark":"light"} theme`} onClick={toggleTheme}><Icon name={theme==="light"?"moon":"sun"}/></button>
        <button className="icon-button" aria-label="Notifications" onClick={()=>setOverlay("notifications")}><Icon name="bell"/></button>
        <button className="icon-button" aria-label="Open profile menu" aria-haspopup="menu" onClick={()=>setOverlay("profile")}><Icon name="user"/></button>
      </div>
    </header>

    <header className="phone-header">
      <Brand/>
      <button className="exam-button" onClick={()=>setOverlay("exam")} aria-label={`Target exam: ${exam}`}><span>{exam.replace("SSC ","")}</span><Icon name="chevron" size={16}/></button>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" onClick={()=>setOverlay("search")}><Icon name="search"/></button>
        <button className="icon-button" aria-label={`Switch to ${theme==="light"?"dark":"light"} theme`} onClick={toggleTheme}><Icon name={theme==="light"?"moon":"sun"}/></button>
        <button className="icon-button notifications-button" aria-label="Notifications" onClick={()=>setOverlay("notifications")}><Icon name="bell"/></button>
      </div>
    </header>

    <main id="main-content" className="workspace-main" tabIndex={-1}>
      <div className="content-container">
        <h1 className="page-title">{title}</h1>
        {pathname==="/dashboard"?<Dashboard exam={exam}/>:<MinimalRoute title={title} exam={exam}/>}
      </div>
    </main>

    <nav className="bottom-nav" aria-label="Phone navigation">
      {primary.map(item=><Link key={item.href} href={item.href} aria-current={pathname===item.href?"page":undefined}><Icon name={item.icon}/><span>{item.label==="Mock Tests"?"Mocks":item.label==="Chapter Tests"?"Chapter":item.label}</span></Link>)}
      <button onClick={()=>setOverlay("more")} aria-haspopup="dialog"><Icon name="menu"/><span>More</span></button>
    </nav>

    {overlay==="exam"&&<Overlay title="Choose target exam" onClose={closeOverlay}>
      <div className="exam-grid" role="radiogroup" aria-label="Target exam">{exams.map(value=><button key={value} className="exam-option" role="radio" aria-checked={exam===value} onClick={()=>selectExam(value)}>{value}</button>)}</div>
    </Overlay>}
    {overlay==="search"&&<Overlay title="Search" onClose={closeOverlay} centered>
      <label><span className="nav-label" style={{padding:0}}>Search destinations</span><input className="search-input" autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try Mock Tests or Preferences"/></label>
      {matches.length?<ul className="search-results">{matches.map(item=><li key={item.href}><Link href={item.href} onClick={closeOverlay}>{item.label}</Link></li>)}</ul>:<div className="empty-state">No destinations match “{search}”.</div>}
    </Overlay>}
    {overlay==="notifications"&&<Overlay title="Notifications" onClose={closeOverlay}>
      <div className="empty-state">You have no notifications.</div>
    </Overlay>}
    {overlay==="profile"&&<Overlay title="Profile menu" onClose={closeOverlay}>
      <div className="menu-list"><Link href="/profile" onClick={closeOverlay}>Profile</Link><Link href="/preferences" onClick={closeOverlay}>Preferences</Link><Link href="/help" onClick={closeOverlay}>Help</Link></div>
    </Overlay>}
    {overlay==="more"&&<Overlay title="More" onClose={closeOverlay}>
      <div className="menu-list">
        {[...secondary,{href:"/profile",label:"Profile",icon:"user" as const},{href:"/help",label:"Help",icon:"help" as const}].map(item=><Link key={item.href} href={item.href} onClick={closeOverlay}><span style={{display:"inline-flex",alignItems:"center",gap:12}}><Icon name={item.icon}/>{item.label}</span></Link>)}
      </div>
    </Overlay>}
  </div>;
}

function Dashboard({exam}:{exam:string}) {
  const records=getRecordsForExam(exam as ExamName);
  const resume=getResumeRecord(records);
  const summary=calculateStudySummary(records);
  const recent=[...records].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3);
  const completedScored=records.filter(record=>record.status==="completed"&&record.scored);

  return <>
    <section className="dashboard-greeting" aria-label="Exam context">
      <h2>Ready for {exam}?</h2>
      <p>Current target exam: <strong>{exam}</strong></p>
    </section>

    {resume && <section className="continue-card" aria-labelledby="continue-title">
      <div>
        <span className="section-label">Continue Learning</span>
        <h2 id="continue-title">{resume.title}</h2>
        <p>{resume.mode} Mode · {resume.mode==="Practice"
          ? `${resume.checkedPracticeAnswers ?? 0} of ${resume.totalQuestions} answers checked`
          : `${resume.answeredQuestions} of ${resume.totalQuestions} questions answered`}</p>
      </div>
      <Link className="primary-button" href={`/assessment?attempt=${encodeURIComponent(resume.id)}&mode=${resume.mode.toLowerCase()}&question=${resume.mode==="Practice"?"4":"9"}`}>
        <Icon name={resume.mode==="Practice"?"chapter":"test"} size={18}/>
        {resume.mode==="Practice"?"Resume practice":"Resume mock"}
      </Link>
    </section>}

    <section className="dashboard-section" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title">Quick Actions</h2>
      <div className="quick-actions">
        <Link className={resume?"secondary-button":"primary-button"} href="/mock-tests"><Icon name="test"/>Start Mock Test</Link>
        <Link className="secondary-button" href="/pyqs"><Icon name="pyq"/>Practise PYQs</Link>
        <Link className="secondary-button" href="/chapter-tests"><Icon name="chapter"/>Start Chapter Test</Link>
      </div>
    </section>

    <section className="dashboard-section" aria-labelledby="overview-title">
      <h2 id="overview-title">Study Overview</h2>
      <dl className="metrics">
        <div><dt>Tests Completed</dt><dd>{summary.testsCompleted}</dd></div>
        <div><dt>Questions Attempted</dt><dd>{summary.questionsAttempted}</dd></div>
        <div><dt>Average Accuracy</dt><dd aria-label={summary.accuracy===null?"Average accuracy unavailable":`${Math.round(summary.accuracy)} percent`}>
          {summary.accuracy===null?"—":`${Math.round(summary.accuracy)}%`}
        </dd></div>
        {summary.averageScore!==null&&<div><dt>Average Score</dt><dd>{Math.round(summary.averageScore)}%</dd></div>}
      </dl>
    </section>

    <div className="dashboard-columns">
      <section className="dashboard-section" aria-labelledby="activity-title">
        <div className="section-heading">
          <h2 id="activity-title">Recent Activity</h2>
          <Link className="text-link" href="/my-tests">View all</Link>
        </div>
        {recent.length===0?<p className="muted-copy">No activity yet for {exam}. A mock test is a clear place to begin.</p>:<ul className="activity-list">
          {recent.map(record=><li key={record.id}>
            <div><strong>{record.title}</strong><span>{record.mode} · {record.status==="completed"?"Completed":"In progress"}</span></div>
            {record.status==="completed"&&record.score!==undefined&&record.maxMarks!==undefined
              ?<span className="activity-score" aria-label={`Score ${record.score} out of ${record.maxMarks}`}>{record.score}/{record.maxMarks}</span>
              :record.status==="in-progress"&&<Link className="text-link" href={`/assessment?attempt=${record.id}&mode=${record.mode.toLowerCase()}&question=${record.mode==="Practice"?"4":"9"`}>Resume</Link>}
          </li>)}
        </ul>}
      </section>

      <section className="dashboard-section" aria-labelledby="snapshot-title">
        <h2 id="snapshot-title">Performance Snapshot</h2>
        {completedScored.length<TREND_ATTEMPT_THRESHOLD?<>
          <p className="muted-copy">
            {completedScored.length===0
              ? "No completed scored tests are available for a trend."
              : <>{completedScored.length} of {TREND_ATTEMPT_THRESHOLD} comparable attempts used for a trend; {TREND_ATTEMPT_THRESHOLD-completedScored.length} more needed.</>}
          </p>
          {summary.accuracy!==null&&<p className="snapshot-detail">Current checked accuracy: <strong>{Math.round(summary.accuracy)}%</strong></p>}
        </>:<>
          <ScoreTrend records={completedScored}/>
          <SubjectSnapshot records={records}/>
        </>}
        <p className="next-action"><strong>Recommended next action:</strong>{" "}
          {resume
            ? `Finish ${resume.mode==="Practice"?"the practice set":"the mock"} before starting another activity.`
            : completedScored.length>=TREND_ATTEMPT_THRESHOLD
              ? "Review your English responses in Chapter Tests."
              : "Start a mock test to establish a study baseline."}
        </p>
      </section>
    </div>
  </>;
}

function ScoreTrend({records}:{records:ActivityRecord[]}) {
  const scores=[...records].sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt)).map(record=>record.score ?? 0);
  return <p className="snapshot-detail">Score trend: <strong>{scores.join(" → ")}</strong><span className="sr-only">, out of 100 for each comparable attempt</span></p>;
}

function SubjectSnapshot({records}:{records:ActivityRecord[]}) {
  const subjects=getSubjectSnapshot(records);
  const entries=Object.entries(subjects).filter(([,value])=>value && value.evaluated>0) as [string,{evaluated:number;correct:number}][];
  if(entries.length===0)return null;
  entries.sort((a,b)=>((b[1].correct/b[1].evaluated)-(a[1].correct/a[1].evaluated)));
  const weakest=entries[entries.length-1];
  return <>
    <ul className="subject-list" aria-label="Subject accuracy">
      {entries.map(([subject,value])=><li key={subject}><span>{subject}</span><strong>{Math.round(value.correct/value.evaluated*100)}%</strong></li>)}
    </ul>
    <p className="snapshot-detail">Potential weaker area: <strong>{weakest[0]}</strong>, with {weakest[1].correct} of {weakest[1].evaluated} evaluated responses correct.</p>
  </>;
}

function MinimalRoute({title,exam}:{title:string;exam:string}) {
  const router=useRouter();
  if(title==="My Tests"){
    const records=getRecordsForExam(exam as ExamName).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
    return <section className="card">
      <h2>My Tests</h2>
      {records.length===0?<p style={{marginBottom:24}}>No tests or practice activity are saved for {exam}.</p>:<ul className="activity-list minimal-activity">
        {records.map(record=><li key={record.id}><div><strong>{record.title}</strong><span>{record.mode} · {record.status==="completed"?"Completed":"In progress"}</span></div>
          {record.status==="in-progress"?<Link className="text-link" href={`/assessment?attempt=${record.id}&mode=${record.mode.toLowerCase()}&question=${record.mode==="Practice"?"4":"9"}`}>Resume</Link>:record.score!==undefined&&record.maxMarks!==undefined?<span className="activity-score">{record.score}/{record.maxMarks}</span>:null}
        </li>)}
      </ul>}
      <button className="secondary-button" style={{marginTop:24}} onClick={()=>router.push("/dashboard")}><Icon name="grid"/>Return to Dashboard</button>
    </section>;
  }
  const known=title==="Preferences"?`Set ${exam} preferences and study choices here.`:`This ${title} destination is ready for its feature page. It is using the shared student workspace for ${exam}.`;
  return <section className="card"><h2>{title}</h2><p style={{marginBottom:24}}>{known}</p><button className="secondary-button" onClick={()=>router.push("/dashboard")}><Icon name="grid"/>Return to Dashboard</button></section>;
}

function Assessment({answer,setAnswer}:{answer:string;setAnswer:(v:string)=>void}) {
  const router=useRouter();
  const params=useSearchParams();
  const attempt=params.get("attempt")||"";
  const mode=params.get("mode")==="practice"?"Practice":"Exam";
  const question=params.get("question")==="4"?"4":"9";
  const isChsl=attempt==="chsl-practice-2026-01";
  const storageKey=`sscflix-answer-${attempt||"default"}`;
  const options=["A logical fallacy occurs only in spoken arguments.","The conclusion follows without sufficient evidence from the premises.","A statement is false unless it is supported by an official source.","The argument uses technical vocabulary to create confusion."];
  useEffect(()=>{
    try{
      const stored=localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswer(stored||(isChsl?"C":"B"));
    }catch{
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswer(isChsl?"C":"B");
    }
  },[storageKey,isChsl,setAnswer]);
  function saveAnswer(value:string){
    setAnswer(value);
    try{localStorage.setItem(storageKey,value);}catch{}
  }
  return <div className="assessment-shell">
    <header className="assessment-header"><div className="assessment-title"><strong>{isChsl?"Percentage - Guided Practice":"SSC CGL Tier I - Full Mock 1"}</strong><span>{mode} Mode · Question {question} of {isChsl?"10":"25"}</span></div><button className="secondary-button" onClick={()=>router.push("/dashboard")}><Icon name="close" size={18}/>Exit</button></header>
    <main className="assessment-main" id="main-content" tabIndex={-1}>
      <div className="question-meta">{isChsl?"Quantitative Aptitude · SSC CHSL":"Analytical Reasoning · SSC CGL"}</div>
      <h1 className="question-text">{isChsl?"A candidate scores 40 marks in a test and reaches 20% of the total marks. What is the maximum mark of the test?":"Read the statement carefully: “All available records indicate that several passenger trains arrived late this week. Therefore, the railway network is unreliable.” Which of the following most accurately identifies the weakness in this conclusion?"}</h1>
      <fieldset className="answer-options" aria-label="Answer options">
        {(isChsl?["160 marks","180 marks","200 marks","220 marks"]:options).map((option,index)=><label className="answer-label" key={option}><input type="radio" name="answer" value={String.fromCharCode(65+index)} checked={answer===String.fromCharCode(65+index)} onChange={()=>saveAnswer(String.fromCharCode(65+index))}/><span>{String.fromCharCode(65+index)}. {option}</span></label>)}
      </fieldset>
    </main>
  </div>;
}

function PublicShell({pathname}:{pathname:string}) {
  const name=pathname=== "/"?"Welcome":pathname.split("/").filter(Boolean)[0].split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
  return <div className="public-shell">
    <header className="public-header"><div className="public-header-inner"><Brand/><div className="public-actions"><Link className="secondary-button" href="/sign-in">Sign In</Link><Link className="primary-button" href="/get-started">Get Started</Link></div></div></header>
    <main id="main-content" className="public-main" tabIndex={-1}><div className="public-container">
      {pathname==="/"?<section className="public-hero"><h1>Prepare clearly. Practise consistently.</h1><p>SSC Flix brings focused mock tests, previous-year questions and chapter practice into one readable student workspace.</p><div style={{display:"flex",gap:8,marginTop:24}}><Link className="primary-button" href="/dashboard">Open Workspace</Link><Link className="secondary-button" href="/assessment">View Assessment</Link></div></section>:<section className="public-hero"><h1>{name}</h1><p>This sample route presents the public shell. It can be replaced with the complete page without changing the shared header or footer.</p><Link className="secondary-button" href="/" style={{marginTop:24}}>Return to welcome</Link></section>}
    </div></main>
    <footer className="public-footer"><div className="public-container"><nav className="footer-links" aria-label="Footer">{["About","Contact","FAQs","Privacy","Terms","Disclaimer"].map(label=><Link key={label} href={`/${label==="About"?"about":label==="Contact"?"contact":label==="FAQs"?"faqs":label.toLowerCase().replaceAll(" ","-")}`}>{label==="Privacy"?"Privacy Policy":label==="Terms"?"Terms & Conditions":label==="FAQs"?"FAQs":label==="Contact"?"Contact / Support":label==="About"?"About SSC Flix":label}</Link>)}</nav></div></footer>
  </div>;
}
