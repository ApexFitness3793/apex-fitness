import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#080a0e", surface:"#0d1117", card:"#111820", border:"#1c2a38",
  accent:"#a3ff47", accentDim:"#6ab82e", cyan:"#00d4ff", red:"#ff4757",
  yellow:"#ffd32a", text:"#e8f0f7", muted:"#566878",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const weightData = [
  {w:"W1",v:185},{w:"W2",v:184.2},{w:"W3",v:183.1},{w:"W4",v:182.8},
  {w:"W5",v:181.5},{w:"W6",v:180.9},{w:"W7",v:180.1},{w:"W8",v:179.4},
];
const volumeData = [
  {d:"Mon",v:12400},{d:"Tue",v:0},{d:"Wed",v:15800},{d:"Thu",v:8200},
  {d:"Fri",v:18300},{d:"Sat",v:9100},{d:"Sun",v:0},
];
const strengthData = [
  {w:"W1",s:185,b:135,d:225},{w:"W2",s:190,b:137,d:230},{w:"W3",s:195,b:140,d:235},
  {w:"W4",s:195,b:140,d:240},{w:"W5",s:200,b:142,d:245},{w:"W6",s:205,b:145,d:250},
  {w:"W7",s:210,b:147,d:255},{w:"W8",s:215,b:150,d:265},
];

const EX = {
  push:[
    {name:"Barbell Bench Press",sets:4,reps:"5",rpe:8,rest:"3 min",muscle:"Chest",alt:"DB Press"},
    {name:"Overhead Press",sets:4,reps:"5",rpe:8,rest:"3 min",muscle:"Shoulders",alt:"DB Press"},
    {name:"Incline DB Press",sets:3,reps:"8-10",rpe:7.5,rest:"2 min",muscle:"Upper Chest",alt:"Incline BB"},
    {name:"Lateral Raises",sets:3,reps:"12-15",rpe:7,rest:"90s",muscle:"Side Delt",alt:"Cable Lateral"},
    {name:"Tricep Pushdown",sets:3,reps:"10-12",rpe:7,rest:"90s",muscle:"Triceps",alt:"Overhead Ext"},
  ],
  pull:[
    {name:"Weighted Pull-ups",sets:4,reps:"5",rpe:8,rest:"3 min",muscle:"Lats",alt:"Lat Pulldown"},
    {name:"Barbell Row",sets:4,reps:"5",rpe:8,rest:"3 min",muscle:"Mid Back",alt:"DB Row"},
    {name:"Cable Row",sets:3,reps:"10-12",rpe:7.5,rest:"2 min",muscle:"Back",alt:"Machine Row"},
    {name:"Face Pulls",sets:3,reps:"15-20",rpe:6.5,rest:"60s",muscle:"Rear Delt",alt:"Band Pull-Aparts"},
    {name:"Barbell Curl",sets:3,reps:"8-10",rpe:7,rest:"90s",muscle:"Biceps",alt:"DB Curl"},
  ],
  legs:[
    {name:"Barbell Squat",sets:4,reps:"5",rpe:8.5,rest:"3-4 min",muscle:"Quads",alt:"Leg Press"},
    {name:"Romanian Deadlift",sets:3,reps:"8",rpe:8,rest:"2-3 min",muscle:"Hamstrings",alt:"Leg Curl"},
    {name:"Leg Press",sets:3,reps:"10-12",rpe:7.5,rest:"2 min",muscle:"Quads",alt:"Hack Squat"},
    {name:"Walking Lunges",sets:3,reps:"10/leg",rpe:7,rest:"2 min",muscle:"Glutes",alt:"Split Squat"},
    {name:"Standing Calf Raise",sets:4,reps:"12-15",rpe:7,rest:"90s",muscle:"Calves",alt:"Seated Calf"},
  ],
  upper:[
    {name:"Bench Press",sets:4,reps:"6-8",rpe:8,rest:"2-3 min",muscle:"Chest",alt:"DB Press"},
    {name:"Pull-ups",sets:4,reps:"6-8",rpe:8,rest:"2-3 min",muscle:"Lats",alt:"Lat Pulldown"},
    {name:"Overhead Press",sets:3,reps:"8-10",rpe:7.5,rest:"2 min",muscle:"Shoulders",alt:"DB Press"},
    {name:"Barbell Row",sets:3,reps:"8-10",rpe:7.5,rest:"2 min",muscle:"Back",alt:"Cable Row"},
    {name:"EZ Bar Curl",sets:3,reps:"10-12",rpe:7,rest:"90s",muscle:"Biceps",alt:"DB Curl"},
  ],
  lower:[
    {name:"Squat",sets:4,reps:"6-8",rpe:8,rest:"2-3 min",muscle:"Quads",alt:"Leg Press"},
    {name:"Deadlift",sets:3,reps:"5",rpe:8.5,rest:"3-4 min",muscle:"Posterior Chain",alt:"RDL"},
    {name:"Bulgarian Split Squat",sets:3,reps:"8-10/leg",rpe:8,rest:"2 min",muscle:"Glutes",alt:"Lunge"},
    {name:"Leg Curl",sets:3,reps:"10-12",rpe:7,rest:"90s",muscle:"Hamstrings",alt:"Nordic Curl"},
    {name:"Hip Thrust",sets:3,reps:"10-12",rpe:7,rest:"90s",muscle:"Glutes",alt:"Glute Bridge"},
  ],
  cardio:[
    {name:"Zone 2 Cardio",duration:"35 min",intensity:"60-70% MHR",type:"Steady State",notes:"Conversational pace — nasal breathing"},
    {name:"HIIT Intervals",duration:"20 min",intensity:"85-95% MHR",type:"Interval",notes:"30s on / 30s off × 10 rounds"},
    {name:"Tempo Run",duration:"25 min",intensity:"75-80% MHR",type:"Tempo",notes:"Comfortably hard, sustained effort"},
  ]
};

const SPLITS = {
  push_pull_legs:["Push","Pull","Legs","Rest","Push","Pull","Legs"],
  upper_lower:   ["Upper","Lower","Rest","Upper","Lower","Rest","Rest"],
  full_body:     ["Full Body","Rest","Full Body","Rest","Full Body","Rest","Rest"],
  hybrid:        ["Push","Pull","Legs","Upper","Lower","Rest","Rest"],
};

function buildProgram(cfg) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const plan = SPLITS[cfg.split] || SPLITS.push_pull_legs;
  const cardioSlots = plan.map((s,i)=>s==="Rest"?i:-1).filter(i=>i>=0).slice(0,Math.min(parseInt(cfg.cardioSessions)||2,3));
  const keyMap = {Push:"push",Pull:"pull",Legs:"legs",Upper:"upper",Lower:"lower","Full Body":"upper"};
  return days.map((day,i)=>{
    const type = plan[i];
    const isCardio = cardioSlots.includes(i);
    if(type==="Rest"&&!isCardio) return {day,type:"Rest",exercises:[]};
    if(type==="Rest"&&isCardio) return {day,type:"Cardio",exercises:[EX.cardio[0]]};
    const key = keyMap[type]||"upper";
    return {day, type, exercises:EX[key]||EX.upper, cardio:isCardio?EX.cardio[1]:null};
  });
}

// ─── TINY PRIMITIVES ─────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Barlow:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#080a0e;font-family:'Barlow',sans-serif;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:#080a0e;}
  ::-webkit-scrollbar-thumb{background:#1c2a38;border-radius:2px;}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:#1c2a38;border-radius:2px;outline:none;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#a3ff47;cursor:pointer;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
  .fadeUp{animation:fadeUp 0.4s ease forwards;}
  .fadeIn{animation:fadeIn 0.3s ease forwards;}
  .slideRight{animation:slideRight 0.3s ease forwards;}
`;

const Pill = ({ch, color=C.accent, bg}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:999,
    background:bg||`${color}18`,border:`1px solid ${color}35`,color,
    fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
    {ch}
  </span>
);

const Chip = ({label,on,onClick}) => (
  <button onClick={onClick} style={{padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:500,
    cursor:"pointer",border:`1px solid ${on?C.accent:C.border}`,outline:"none",transition:"all 0.15s",
    background:on?`${C.accent}18`:C.surface,color:on?C.accent:C.text,fontFamily:"'Barlow',sans-serif"}}>
    {label}
  </button>
);

const Field = ({label,type="text",value,onChange,ph,min,max,step=1}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}</label>}
    {type==="range"?(
      <div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(e.target.value)}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
          <span style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace"}}>{min}</span>
          <span style={{fontSize:13,color:C.accent,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{value}</span>
          <span style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace"}}>{max}</span>
        </div>
      </div>
    ):(
      <input type={type} value={value} placeholder={ph} onChange={e=>onChange(e.target.value)} style={{
        background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",
        color:C.text,fontSize:14,fontFamily:"'Barlow',sans-serif",outline:"none",transition:"border-color 0.15s"
      }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
    )}
  </div>
);

const Card = ({children,style,onClick,glow}) => (
  <div onClick={onClick} style={{background:C.card,border:`1px solid ${glow?C.accent:C.border}`,
    borderRadius:12,padding:20,position:"relative",overflow:"hidden",
    ...(glow&&{boxShadow:`0 0 24px ${C.accent}18`}),
    ...(onClick&&{cursor:"pointer"}),
    transition:"border-color 0.2s,transform 0.15s",...style}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor=C.accentDim;e.currentTarget.style.transform="translateY(-1px)";}}}
    onMouseLeave={e=>{if(onClick){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}}
  >{children}</div>
);

const Row = ({label,value,color=C.text,sub}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
    <span style={{fontSize:13,color:C.muted}}>{label}</span>
    <div style={{textAlign:"right"}}>
      <div style={{fontSize:15,fontWeight:600,color,fontFamily:"'Barlow',sans-serif",textTransform:"capitalize"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace"}}>{sub}</div>}
    </div>
  </div>
);

const Tip = ({content,color=C.accent}) => (
  <div style={{padding:"12px 14px",background:`${color}0d`,border:`1px solid ${color}28`,borderRadius:8}}>
    <span style={{fontSize:13,color,lineHeight:1.5}}>{content}</span>
  </div>
);

const RPEBar = ({rpe}) => {
  const color = rpe>=9?C.red:rpe>=7.5?C.yellow:C.accent;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
        <div style={{width:`${rpe*10}%`,height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:11,color,fontFamily:"'DM Mono',monospace",minWidth:40}}>RPE {rpe}</span>
    </div>
  );
};

const Tooltip2 = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px"}}>
      <div style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",marginBottom:4}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{fontSize:13,fontWeight:600,color:p.color||p.stroke||C.accent}}>{p.name||p.dataKey}: {p.value}</div>
      ))}
    </div>
  );
};

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const EQUIP_OPTS = ["Full Commercial Gym","Home Gym","Barbell","Dumbbells","Power Rack","Cable Machine","Pull-up Bar","Resistance Bands","Bench","Cardio Machines","Treadmill","Bike","Rowing Machine","Kettlebells","Bodyweight Only","Swimming"];
const STEPS = ["Profile","Goals","Lifestyle","Equipment","Schedule","Baseline","Review"];

function Onboarding({onComplete}) {
  const [step,setStep] = useState(0);
  const [d,setD] = useState({
    age:"28",gender:"Male",height:"178",weight:"82",fitnessLevel:"intermediate",bodyComp:"average",
    experience:"",injuries:"",primaryGoal:"muscle_gain",secondaryGoals:[],
    occupation:"sedentary",sleep:"7",stress:"4",duration:"60",trainingTime:"Morning",cardioPreference:"mixed",
    equipment:["Barbell","Dumbbells","Power Rack","Bench","Pull-up Bar"],
    daysPerWeek:"4",cardioSessions:"2",split:"push_pull_legs",
    pushups:"",pullups:"",squat5rm:"",bench5rm:"",dead5rm:"",fiveKTime:"",restingHR:"",
  });
  const s=(k,v)=>setD(p=>({...p,[k]:v}));
  const tog=(k,v)=>setD(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));

  const steps = [
    // 0 — Profile
    <div key="profile" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>YOUR PROFILE</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>Build your baseline — this shapes your entire program.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Age" type="number" value={d.age} onChange={v=>s("age",v)} ph="28"/>
        <div>
          <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:6}}>Gender</label>
          <div style={{display:"flex",gap:6}}>
            {["Male","Female","Other","—"].map(g=>(
              <button key={g} onClick={()=>s("gender",g)} style={{
                flex:1,padding:"9px 4px",borderRadius:8,fontSize:12,cursor:"pointer",outline:"none",
                background:d.gender===g?`${C.accent}18`:C.surface,
                border:`1px solid ${d.gender===g?C.accent:C.border}`,
                color:d.gender===g?C.accent:C.muted,fontWeight:d.gender===g?600:400,
                fontFamily:"'Barlow',sans-serif",transition:"all 0.15s"}}>{g}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Height (cm)" type="number" value={d.height} onChange={v=>s("height",v)} ph="178"/>
        <Field label="Weight (kg)" type="number" value={d.weight} onChange={v=>s("weight",v)} ph="80"/>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Fitness Level</label>
        <div style={{display:"flex",gap:8}}>
          {["beginner","intermediate","advanced"].map(l=>(
            <Chip key={l} label={l.charAt(0).toUpperCase()+l.slice(1)} on={d.fitnessLevel===l} onClick={()=>s("fitnessLevel",l)}/>
          ))}
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Body Composition</label>
        <div style={{display:"flex",gap:8}}>
          {[{k:"lean",l:"Lean / Athletic"},{k:"average",l:"Average"},{k:"high",l:"High Body Fat"}].map(({k,l})=>(
            <Chip key={k} label={l} on={d.bodyComp===k} onClick={()=>s("bodyComp",k)}/>
          ))}
        </div>
      </div>
      <Field label="Training Background" value={d.experience} onChange={v=>s("experience",v)} ph="e.g. 2 years lifting, recreational sports…"/>
      <Field label="Injuries / Limitations (optional)" value={d.injuries} onChange={v=>s("injuries",v)} ph="e.g. Lower back pain, shoulder impingement…"/>
    </div>,

    // 1 — Goals
    <div key="goals" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>YOUR GOALS</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>What are you training for? Pick one primary focus.</p>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Primary Goal</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {[{k:"fat_loss",l:"🔥 Fat Loss"},{k:"muscle_gain",l:"💪 Muscle Gain"},{k:"strength",l:"🏋️ Strength"},
            {k:"endurance",l:"🏃 Endurance"},{k:"athletic",l:"⚡ Athletic Performance"},{k:"general",l:"✅ General Fitness"},{k:"hybrid",l:"🎯 Hybrid"}].map(({k,l})=>(
            <Chip key={k} label={l} on={d.primaryGoal===k} onClick={()=>s("primaryGoal",k)}/>
          ))}
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Secondary Goals</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {["Improve posture","Reduce injury risk","Better sleep","Sport performance","Mental health","Flexibility","Cardiovascular health","Bone density"].map(g=>(
            <Chip key={g} label={g} on={d.secondaryGoals.includes(g)} onClick={()=>tog("secondaryGoals",g)}/>
          ))}
        </div>
      </div>
    </div>,

    // 2 — Lifestyle
    <div key="life" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>LIFESTYLE</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>Recovery is half the program. Be honest here.</p>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Day Job Activity</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Sedentary","Light","Moderate","Very Active"].map(a=>(
            <Chip key={a} label={a} on={d.occupation===a.toLowerCase()} onClick={()=>s("occupation",a.toLowerCase())}/>
          ))}
        </div>
      </div>
      <Field label={`Sleep / Night: ${d.sleep}h`} type="range" min={4} max={12} step={0.5} value={d.sleep} onChange={v=>s("sleep",v)}/>
      <Field label={`Stress Level: ${d.stress} / 10`} type="range" min={1} max={10} value={d.stress} onChange={v=>s("stress",v)}/>
      <Field label={`Session Duration: ${d.duration} min`} type="range" min={20} max={120} step={5} value={d.duration} onChange={v=>s("duration",v)}/>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Preferred Training Time</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Early Morning","Morning","Afternoon","Evening","Late Night","Flexible"].map(t=>(
            <Chip key={t} label={t} on={d.trainingTime===t} onClick={()=>s("trainingTime",t)}/>
          ))}
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Cardio Preference</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["None","Steady State","HIIT","Mixed","Outdoors"].map(t=>(
            <Chip key={t} label={t} on={d.cardioPreference===t.toLowerCase().replace(" ","_")} onClick={()=>s("cardioPreference",t.toLowerCase().replace(" ","_"))}/>
          ))}
        </div>
      </div>
    </div>,

    // 3 — Equipment
    <div key="equip" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>EQUIPMENT</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>Select everything available to you — exercises adapt accordingly.</p>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {EQUIP_OPTS.map(e=><Chip key={e} label={e} on={d.equipment.includes(e)} onClick={()=>tog("equipment",e)}/>)}
      </div>
      {d.equipment.length>0&&(
        <Tip content={`✓ ${d.equipment.length} item${d.equipment.length!==1?"s":""} selected — program will prioritize available equipment`}/>
      )}
    </div>,

    // 4 — Schedule
    <div key="sched" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>SCHEDULE</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>Consistency beats perfection. Choose what you'll actually stick to.</p>
      </div>
      <Field label={`Training Days / Week: ${d.daysPerWeek}`} type="range" min={2} max={6} value={d.daysPerWeek} onChange={v=>s("daysPerWeek",v)}/>
      <Field label={`Cardio Sessions / Week: ${d.cardioSessions}`} type="range" min={0} max={5} value={d.cardioSessions} onChange={v=>s("cardioSessions",v)}/>
      <div>
        <label style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Training Split</label>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {k:"push_pull_legs",l:"Push / Pull / Legs",desc:"3-way split — classic, proven, great muscle frequency"},
            {k:"upper_lower",l:"Upper / Lower",desc:"2-way split — solid for intermediate lifters, 4 days/week"},
            {k:"full_body",l:"Full Body",desc:"Compound-focused 3×/week — ideal for beginners"},
            {k:"hybrid",l:"Hybrid",desc:"Best of PPL and UL combined — versatile and effective"},
          ].map(({k,l,desc})=>(
            <div key={k} onClick={()=>s("split",k)} style={{
              padding:"14px 16px",borderRadius:8,cursor:"pointer",
              background:d.split===k?`${C.accent}12`:C.surface,
              border:`1px solid ${d.split===k?C.accent:C.border}`,transition:"all 0.15s"}}>
              <div style={{fontSize:14,fontWeight:600,color:d.split===k?C.accent:C.text}}>{l}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // 5 — Baseline
    <div key="base" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>BASELINE</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>Optional performance metrics. Skip anything unknown.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Max Push-ups" type="number" value={d.pushups} onChange={v=>s("pushups",v)} ph="e.g. 25"/>
        <Field label="Max Pull-ups" type="number" value={d.pullups} onChange={v=>s("pullups",v)} ph="e.g. 8"/>
        <Field label="Squat 5RM (kg)" type="number" value={d.squat5rm} onChange={v=>s("squat5rm",v)} ph="e.g. 100"/>
        <Field label="Bench 5RM (kg)" type="number" value={d.bench5rm} onChange={v=>s("bench5rm",v)} ph="e.g. 70"/>
        <Field label="Deadlift 5RM (kg)" type="number" value={d.dead5rm} onChange={v=>s("dead5rm",v)} ph="e.g. 130"/>
        <Field label="5km Time (mm:ss)" value={d.fiveKTime} onChange={v=>s("fiveKTime",v)} ph="e.g. 28:00"/>
        <Field label="Resting HR (bpm)" type="number" value={d.restingHR} onChange={v=>s("restingHR",v)} ph="e.g. 65"/>
        <Field label="VO₂ Max (optional)" value={d.vo2max||""} onChange={v=>s("vo2max",v)} ph="e.g. 45"/>
      </div>
      <Tip content="📊 These metrics calibrate your starting loads and help track progress over time. Leave blank if unsure."/>
    </div>,

    // 6 — Review
    <div key="review" style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h2 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.01em",lineHeight:1}}>READY TO BUILD</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:5}}>Review your profile — then generate your program.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Age",`${d.age} yrs`],["Weight",`${d.weight} kg`],["Level",d.fitnessLevel],["Body Comp",d.bodyComp],
          ["Goal",d.primaryGoal?.replace(/_/g," ")],["Split",d.split?.replace(/_/g," ")],
          ["Days/Week",d.daysPerWeek],["Duration",`${d.duration} min`]].map(([k,v])=>(
          <div key={k} style={{padding:"10px 12px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{k}</div>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginTop:2,textTransform:"capitalize"}}>{v||"—"}</div>
          </div>
        ))}
      </div>
      <Tip content={`⚡ Generating a personalized ${d.daysPerWeek}-day ${d.split?.replace(/_/g," ")} program optimized for ${d.primaryGoal?.replace(/_/g," ")} with progressive overload and deload scheduling.`}/>
    </div>,
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:600}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          <div style={{width:30,height:30,borderRadius:7,background:`${C.accent}18`,border:`1px solid ${C.accent}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⚡</div>
          <span style={{fontSize:18,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>APEX FITNESS</span>
        </div>
        {/* Progress bar */}
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          {STEPS.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?C.accent:C.border,transition:"background 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <span style={{fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>Step {step+1} / {STEPS.length}</span>
          <span style={{fontSize:11,color:C.accent,fontFamily:"'DM Mono',monospace"}}>{STEPS[step]}</span>
        </div>
        {/* Card */}
        <div key={step} className="fadeUp">
          <Card style={{padding:28}}>
            {steps[step]}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:24,gap:10}}>
              <button onClick={()=>setStep(p=>Math.max(0,p-1))} disabled={step===0} style={{
                padding:"11px 22px",borderRadius:8,background:"transparent",
                border:`1px solid ${step===0?C.border+"50":C.border}`,
                color:step===0?C.muted:C.text,fontSize:14,fontWeight:600,
                cursor:step===0?"not-allowed":"pointer",fontFamily:"'Barlow',sans-serif"}}>← Back</button>
              {step<STEPS.length-1?(
                <button onClick={()=>setStep(p=>p+1)} style={{
                  padding:"11px 28px",borderRadius:8,background:C.accent,border:"none",
                  color:C.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>
                  Continue →
                </button>
              ):(
                <button onClick={()=>onComplete(d)} style={{
                  padding:"11px 28px",borderRadius:8,background:C.accent,border:"none",
                  color:C.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif",
                  boxShadow:`0 0 24px ${C.accent}40`}}>
                  ⚡ Generate Program
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── EXERCISE CARD ────────────────────────────────────────────────────────────
function ExCard({ex,idx,checked,onCheck}) {
  const [open,setOpen] = useState(false);
  const isC = !!ex.duration;
  return (
    <div style={{marginBottom:8,opacity:checked?0.45:1,transition:"opacity 0.3s"}}>
      <Card style={{padding:"13px 15px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:7,background:`${C.accent}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.accent,fontFamily:"'DM Mono',monospace",flexShrink:0}}>{idx+1}</div>
          <div style={{flex:1,minWidth:0}} onClick={()=>setOpen(p=>!p)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
            <div style={{fontSize:14,fontWeight:600,color:C.text,lineHeight:1.2}}>{ex.name}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>
              {isC?`${ex.duration} · ${ex.intensity}`:`${ex.sets}×${ex.reps} · Rest: ${ex.rest} · ${ex.muscle}`}
            </div>
          </div>
          {!isC&&<Pill ch={`RPE ${ex.rpe}`}/>}
          <button onClick={()=>onCheck&&onCheck()} style={{width:26,height:26,borderRadius:6,cursor:"pointer",border:`1px solid ${checked?C.accent:C.border}`,background:checked?`${C.accent}18`:"transparent",color:checked?C.accent:C.muted,fontSize:12,flexShrink:0}}>✓</button>
          <span onClick={()=>setOpen(p=>!p)} style={{color:C.muted,fontSize:11,cursor:"pointer",flexShrink:0}}>{open?"▲":"▼"}</span>
        </div>
        {open&&(
          <div className="fadeIn" style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            {!isC?(
              <>
                <RPEBar rpe={ex.rpe}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                  {[["Sets × Reps",`${ex.sets} × ${ex.reps}`,C.accent],["Rest",ex.rest,C.cyan],["Target",ex.muscle,C.text]].map(([lbl,val,col])=>(
                    <div key={lbl} style={{padding:"8px 10px",background:C.surface,borderRadius:6}}>
                      <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{lbl}</div>
                      <div style={{fontSize:14,fontWeight:700,color:col,fontFamily:"'Barlow Condensed',sans-serif",marginTop:2}}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:8,padding:"8px 10px",background:C.surface,borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Alternative</div>
                    <div style={{fontSize:13,color:C.text,marginTop:1}}>{ex.alt}</div>
                  </div>
                  <span style={{fontSize:16}}>🔄</span>
                </div>
              </>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Duration",ex.duration,C.accent],["Intensity",ex.intensity,C.cyan]].map(([lbl,val,col])=>(
                  <div key={lbl} style={{padding:"8px 10px",background:C.surface,borderRadius:6}}>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{lbl}</div>
                    <div style={{fontSize:14,fontWeight:700,color:col,marginTop:2}}>{val}</div>
                  </div>
                ))}
                <div style={{gridColumn:"1/-1",padding:"8px 10px",background:`${C.accent}0a`,border:`1px solid ${C.accent}25`,borderRadius:6}}>
                  <span style={{fontSize:12,color:C.accent}}>📝 {ex.notes}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── WEEKLY CALENDAR ──────────────────────────────────────────────────────────
const TYPE_COLOR = {Push:C.accent,Pull:C.cyan,Legs:C.yellow,Upper:"#b47dff",Lower:"#ff6b47","Full Body":C.accent,Cardio:"#ff6b8a",Rest:C.muted};

function WeekCal({program,activeDay,onSelect}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
      {program.map((w,i)=>{
        const col = TYPE_COLOR[w.type]||C.muted;
        const active = i===activeDay;
        return (
          <div key={i} onClick={()=>w.type!=="Rest"&&onSelect(i)} style={{
            padding:"10px 4px",borderRadius:8,textAlign:"center",
            cursor:w.type!=="Rest"?"pointer":"default",
            background:active?`${col}18`:C.surface,
            border:`1px solid ${active?col:C.border}`,transition:"all 0.15s"}}>
            <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",marginBottom:3}}>
              {["M","T","W","T","F","S","S"][i]}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:active?col:w.type==="Rest"?C.muted:C.text,letterSpacing:"0.02em",lineHeight:1.2}}>
              {w.type==="Rest"?"—":w.type.length>5?w.type.substring(0,3).toUpperCase():w.type.toUpperCase()}
            </div>
            {active&&<div style={{width:4,height:4,borderRadius:2,background:col,margin:"3px auto 0"}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  {id:"dash",ic:"⚡",lb:"Dashboard"},
  {id:"today",ic:"🏋️",lb:"Today"},
  {id:"program",ic:"📅",lb:"Program"},
  {id:"progress",ic:"📈",lb:"Progress"},
  {id:"settings",ic:"⚙",lb:"Settings"},
];

function MainApp({cfg}) {
  const [nav,setNav] = useState("dash");
  const [program] = useState(()=>buildProgram(cfg));
  const [activeDay,setActiveDay] = useState(0);
  const [done,setDone] = useState([]);        // completed exercise indices for today
  const [sessions,setSessions] = useState(3); // completed sessions count
  const [timerOn,setTimerOn] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const [weightLog,setWeightLog] = useState(weightData);
  const [newW,setNewW] = useState("");
  const iRef = useRef(null);

  const startTimer = ()=>{
    setTimerOn(true);
    iRef.current = setInterval(()=>setElapsed(e=>e+1),1000);
  };
  const stopTimer = ()=>{
    clearInterval(iRef.current);
    setTimerOn(false);
    setSessions(s=>s+1);
    setDone([]);
    setElapsed(0);
    setNav("dash");
  };
  useEffect(()=>()=>clearInterval(iRef.current),[]);

  const todayIdx = (new Date().getDay()+6)%7;
  const todaySess = program[todayIdx]||program[0];
  const mm = String(Math.floor(elapsed/60)).padStart(2,"0");
  const ss2 = String(elapsed%60).padStart(2,"0");
  const totalSess = program.filter(p=>p.type!=="Rest").length;
  const weekPct = Math.min(100,Math.round((sessions/totalSess)*100));
  const donePct = todaySess.exercises.length?Math.round((done.length/todaySess.exercises.length)*100):0;
  const goalLabel = (cfg.primaryGoal||"General Fitness").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());

  const sideW = 190;

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden"}}>
      <style>{css}</style>

      {/* Sidebar */}
      <div style={{width:sideW,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"18px 10px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:28,paddingLeft:4}}>
          <div style={{width:28,height:28,borderRadius:7,background:`${C.accent}18`,border:`1px solid ${C.accent}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
          <span style={{fontSize:17,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>APEX</span>
        </div>
        {NAV.map(({id,ic,lb})=>(
          <button key={id} onClick={()=>setNav(id)} style={{
            display:"flex",alignItems:"center",gap:9,padding:"10px 10px",borderRadius:8,
            border:"none",cursor:"pointer",marginBottom:2,textAlign:"left",transition:"all 0.15s",
            background:nav===id?`${C.accent}15`:"transparent",
            color:nav===id?C.accent:C.muted,fontSize:13,fontWeight:nav===id?600:400,
            fontFamily:"'Barlow',sans-serif"}}>
            <span>{ic}</span>{lb}
          </button>
        ))}
        <div style={{marginTop:"auto",padding:"12px 10px",background:C.card,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>Current Goal</div>
          <div style={{fontSize:12,fontWeight:600,color:C.text,marginTop:3}}>{goalLabel}</div>
          <div style={{marginTop:8,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
            <div style={{width:"34%",height:"100%",background:C.accent,borderRadius:2}}/>
          </div>
          <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",marginTop:3}}>Week 3 of 12</div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"24px"}}>

        {/* ── DASHBOARD ── */}
        {nav==="dash"&&(
          <div className="fadeUp">
            <div style={{marginBottom:22}}>
              <h1 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.02em",lineHeight:1}}>GOOD MORNING, ATHLETE</h1>
              <p style={{color:C.muted,fontSize:13,marginTop:4}}>Week 3 · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
            </div>

            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
              {[{lb:"Streak",val:"5 days",ic:"🔥",col:C.yellow},{lb:"Week",val:`${weekPct}%`,ic:"📊",col:C.accent},{lb:"Recovery",val:"87/100",ic:"💚",col:"#4ade80"},{lb:"Volume",val:"46.2k kg",ic:"⚖️",col:C.cyan}].map(({lb,val,ic,col})=>(
                <Card key={lb} style={{padding:"14px 16px"}}>
                  <div style={{fontSize:18,marginBottom:6}}>{ic}</div>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{lb}</div>
                  <div style={{fontSize:20,fontWeight:800,color:col,fontFamily:"'Barlow Condensed',sans-serif",marginTop:2}}>{val}</div>
                </Card>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
              {/* Next session */}
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>Next Session</div>
                    <div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",marginTop:2}}>{todaySess.type.toUpperCase()} DAY</div>
                  </div>
                  <Pill ch={`${todaySess.exercises.length} exercises`}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
                  {todaySess.exercises.slice(0,4).map((ex,i)=>(
                    <div key={i} style={{padding:"7px 8px",background:C.surface,borderRadius:6,overflow:"hidden"}}>
                      <div style={{fontSize:11,color:C.accent,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{ex.sets}×{ex.reps}</div>
                      <div style={{fontSize:11,color:C.text,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setNav("today")} style={{width:"100%",padding:"11px",borderRadius:8,background:C.accent,border:"none",color:C.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>▶ START WORKOUT</button>
              </Card>

              {/* Weekly targets */}
              <Card>
                <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:14}}>Weekly Targets</div>
                {[{lb:"Strength",pct:weekPct+20,col:C.accent},{lb:"Cardio",pct:50,col:C.cyan},{lb:"Recovery",pct:87,col:"#4ade80"}].map(({lb,pct,col})=>(
                  <div key={lb} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:C.muted}}>{lb}</span>
                      <span style={{fontSize:12,color:col,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{Math.min(100,pct)}%</span>
                    </div>
                    <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:`${Math.min(100,pct)}%`,height:"100%",background:col,borderRadius:3}}/>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Weight chart */}
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>Bodyweight Trend</div>
                  <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",marginTop:2}}>
                    {weightLog[weightLog.length-1]?.v} kg
                    <span style={{fontSize:13,color:"#4ade80",marginLeft:8,fontWeight:600}}>↓ {(weightLog[0].v-weightLog[weightLog.length-1].v).toFixed(1)} kg</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {newW!==""&&<button onClick={()=>{setWeightLog(p=>[...p,{w:`W${p.length+1}`,v:parseFloat(newW)||p[p.length-1].v}]);setNewW("");}} style={{padding:"7px 14px",borderRadius:8,background:C.accent,border:"none",color:C.bg,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'Barlow',sans-serif"}}>Log</button>}
                  <input value={newW} onChange={e=>setNewW(e.target.value)} placeholder="+ kg" style={{width:80,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",color:C.text,fontSize:13,outline:"none",fontFamily:"'Barlow',sans-serif"}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={weightLog}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.accent} stopOpacity={0.25}/>
                      <stop offset="100%" stopColor={C.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="w" tick={{fill:C.muted,fontSize:10,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.muted,fontSize:10,fontFamily:"DM Mono"}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                  <Tooltip content={<Tooltip2/>}/>
                  <Area type="monotone" dataKey="v" name="Weight" stroke={C.accent} strokeWidth={2} fill="url(#wg)" dot={{fill:C.accent,r:3,strokeWidth:0}}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ── TODAY ── */}
        {nav==="today"&&(
          <div className="fadeUp">
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>Today's Session</div>
              <h1 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.02em",lineHeight:1}}>{todaySess.type.toUpperCase()} DAY</h1>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Pill ch={`${todaySess.exercises.length} exercises`}/>
                <Pill ch={`${cfg.duration} min`} color={C.cyan}/>
                <Pill ch={cfg.fitnessLevel} color={C.yellow}/>
              </div>
            </div>

            {/* Timer */}
            <Card style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>Session Timer</div>
                  <div style={{fontSize:38,fontWeight:900,color:timerOn?C.accent:C.muted,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1.1,letterSpacing:"-0.02em"}}>{mm}:{ss2}</div>
                </div>
                <div>
                  {!timerOn?(
                    <button onClick={startTimer} style={{padding:"10px 22px",borderRadius:8,background:C.accent,border:"none",color:C.bg,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>▶ START</button>
                  ):(
                    <button onClick={stopTimer} style={{padding:"10px 22px",borderRadius:8,background:`${C.red}18`,border:`1px solid ${C.red}`,color:C.red,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>✓ FINISH</button>
                  )}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Progress</div>
                  <div style={{fontSize:28,fontWeight:800,color:C.cyan,fontFamily:"'Barlow Condensed',sans-serif"}}>{donePct}%</div>
                </div>
              </div>
              <div style={{height:4,background:C.border,borderRadius:2,marginTop:12,overflow:"hidden"}}>
                <div style={{width:`${donePct}%`,height:"100%",background:C.accent,borderRadius:2,transition:"width 0.4s"}}/>
              </div>
            </Card>

            {todaySess.exercises.map((ex,i)=>(
              <ExCard key={i} ex={ex} idx={i} checked={done.includes(i)}
                onCheck={()=>setDone(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])}/>
            ))}
            <Tip content="💡 Progressive Overload: Add 2.5 kg to main lifts when all sets are completed at or below target RPE. Log it to track your progress."/>
          </div>
        )}

        {/* ── PROGRAM ── */}
        {nav==="program"&&(
          <div className="fadeUp">
            <div style={{marginBottom:20}}>
              <h1 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.02em",lineHeight:1}}>WEEKLY PROGRAM</h1>
              <p style={{color:C.muted,fontSize:13,marginTop:4}}>{cfg.split?.replace(/_/g," ")} · {cfg.daysPerWeek} training days/week</p>
            </div>
            <Card style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Select Day</div>
              <WeekCal program={program} activeDay={activeDay} onSelect={setActiveDay}/>
            </Card>
            {program[activeDay]?.type!=="Rest"?(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <h2 style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:"'Barlow Condensed',sans-serif"}}>{program[activeDay].day} — {program[activeDay].type}</h2>
                    <p style={{color:C.muted,fontSize:12,marginTop:2}}>{program[activeDay].exercises.length} exercises · ~{cfg.duration} min</p>
                  </div>
                  <Pill ch={program[activeDay].type} color={TYPE_COLOR[program[activeDay].type]||C.accent}/>
                </div>
                {program[activeDay].exercises.map((ex,i)=><ExCard key={i} ex={ex} idx={i}/>)}
                {program[activeDay].cardio&&(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 8px"}}>
                      <div style={{flex:1,height:1,background:C.border}}/>
                      <span style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",whiteSpace:"nowrap"}}>+ Cardio Finisher</span>
                      <div style={{flex:1,height:1,background:C.border}}/>
                    </div>
                    <ExCard ex={program[activeDay].cardio} idx={program[activeDay].exercises.length}/>
                  </>
                )}
                <Card style={{marginTop:14,background:`${C.accent}08`,borderColor:`${C.accent}25`}}>
                  <div style={{fontSize:10,color:C.accent,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Progressive Overload Protocol</div>
                  <p style={{fontSize:13,color:C.text,lineHeight:1.55}}>Add <strong style={{color:C.accent}}>2.5 kg</strong> to main compound lifts when you complete all sets within target RPE. Deload every <strong style={{color:C.accent}}>4th week</strong> — reduce volume 40%, keep intensity. This allows sustained adaptation without accumulating fatigue.</p>
                </Card>
              </div>
            ):(
              <Card style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:44,marginBottom:10}}>🔋</div>
                <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Barlow Condensed',sans-serif"}}>REST DAY</div>
                <p style={{color:C.muted,fontSize:13,marginTop:8,maxWidth:340,margin:"10px auto 0",lineHeight:1.6}}>Recovery is where adaptation happens. Aim for 8h sleep, stay hydrated, and consider a light walk or mobility work.</p>
              </Card>
            )}
          </div>
        )}

        {/* ── PROGRESS ── */}
        {nav==="progress"&&(
          <div className="fadeUp">
            <div style={{marginBottom:20}}>
              <h1 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.02em",lineHeight:1}}>PROGRESS</h1>
              <p style={{color:C.muted,fontSize:13,marginTop:4}}>8 weeks tracked · Week 3 current</p>
            </div>
            {/* PRs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[{lb:"Squat",val:"215 kg",gain:"+30 kg",col:C.accent},{lb:"Bench",val:"150 kg",gain:"+15 kg",col:C.cyan},{lb:"Deadlift",val:"265 kg",gain:"+40 kg",col:C.yellow}].map(({lb,val,gain,col})=>(
                <Card key={lb} glow={col===C.accent} style={{padding:"14px 16px"}}>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{lb} Est. 1RM</div>
                  <div style={{fontSize:26,fontWeight:900,color:col,fontFamily:"'Barlow Condensed',sans-serif",marginTop:3}}>{val}</div>
                  <div style={{fontSize:12,color:"#4ade80",marginTop:1,fontWeight:600}}>{gain} total</div>
                </Card>
              ))}
            </div>

            {/* Strength chart */}
            <Card style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:14}}>Strength Progression (kg)</div>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={strengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="w" tick={{fill:C.muted,fontSize:10,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.muted,fontSize:10,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tooltip2/>}/>
                  <Line type="monotone" dataKey="s" name="Squat" stroke={C.accent} strokeWidth={2} dot={{fill:C.accent,r:3,strokeWidth:0}}/>
                  <Line type="monotone" dataKey="b" name="Bench" stroke={C.cyan} strokeWidth={2} dot={{fill:C.cyan,r:3,strokeWidth:0}}/>
                  <Line type="monotone" dataKey="d" name="Deadlift" stroke={C.yellow} strokeWidth={2} dot={{fill:C.yellow,r:3,strokeWidth:0}}/>
                </LineChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:16,marginTop:8}}>
                {[["Squat",C.accent],["Bench",C.cyan],["Deadlift",C.yellow]].map(([n,c])=>(
                  <div key={n} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:10,height:2,background:c,borderRadius:1}}/>
                    <span style={{fontSize:11,color:C.muted}}>{n}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <Card>
                <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:14}}>Weekly Volume (kg)</div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                    <XAxis dataKey="d" tick={{fill:C.muted,fontSize:10,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:C.muted,fontSize:10,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<Tooltip2/>}/>
                    <Bar dataKey="v" name="Volume" fill={C.accent} fillOpacity={0.7} radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Session Stats</div>
                <Row label="Completed" value={`${sessions+19} sessions`} color={C.accent}/>
                <Row label="Adherence" value="79%" color={C.accent}/>
                <Row label="Avg Duration" value="58 min" color={C.cyan}/>
                <Row label="8-Week Volume" value="184,600 kg"/>
                <Row label="Current Streak" value="5 days" color={C.yellow}/>
              </Card>
            </div>

            {/* Heatmap */}
            <Card>
              <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Training Heatmap — Last 4 Weeks</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(28,1fr)",gap:3}}>
                {Array.from({length:28},(_,i)=>{
                  const trained = [0,1,3,4,7,8,10,11,14,15,17,18,19,21,22,24,25,26].includes(i);
                  return <div key={i} style={{aspectRatio:"1",borderRadius:3,background:trained?C.accent:C.border,opacity:trained?0.85:0.35}}/>;
                })}
              </div>
              <div style={{display:"flex",gap:14,marginTop:10}}>
                {[["Trained",C.accent],["Rest / Missed",C.border]].map(([l,c])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:10,height:10,borderRadius:2,background:c}}/>
                    <span style={{fontSize:11,color:C.muted}}>{l}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {nav==="settings"&&(
          <div className="fadeUp">
            <div style={{marginBottom:20}}>
              <h1 style={{fontSize:30,fontWeight:900,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-0.02em",lineHeight:1}}>SETTINGS</h1>
              <p style={{color:C.muted,fontSize:13,marginTop:4}}>Your program configuration</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <Card>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Profile</div>
                <Row label="Age" value={`${cfg.age} years`}/>
                <Row label="Weight" value={`${cfg.weight} kg`}/>
                <Row label="Height" value={`${cfg.height} cm`}/>
                <Row label="Fitness Level" value={cfg.fitnessLevel} color={C.accent}/>
                <Row label="Body Comp" value={cfg.bodyComp}/>
              </Card>
              <Card>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Program</div>
                <Row label="Primary Goal" value={cfg.primaryGoal?.replace(/_/g," ")} color={C.accent}/>
                <Row label="Split" value={cfg.split?.replace(/_/g," ")}/>
                <Row label="Training Days" value={`${cfg.daysPerWeek}/week`}/>
                <Row label="Session Length" value={`${cfg.duration} min`}/>
                <Row label="Cardio Sessions" value={`${cfg.cardioSessions}/week`}/>
              </Card>
            </div>
            <Card style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Equipment</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {cfg.equipment.map(e=><Pill key={e} ch={e}/>)}
                {cfg.equipment.length===0&&<span style={{color:C.muted,fontSize:13}}>No equipment selected</span>}
              </div>
            </Card>
            <Card>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>Deload Schedule</div>
              <p style={{color:C.muted,fontSize:13,lineHeight:1.55,marginBottom:12}}>Deload every 4th week. Reduce volume by 40%, maintain intensity. This week is Week 3 — deload in 1 week.</p>
              <div style={{display:"flex",gap:8}}>
                {[{lb:"W1",i:0},{lb:"W2",i:1},{lb:"W3 ←",i:2},{lb:"DELOAD",i:3}].map(({lb,i})=>(
                  <div key={lb} style={{flex:1,padding:"8px 4px",textAlign:"center",borderRadius:6,
                    background:i===2?`${C.accent}18`:i===3?`${C.red}18`:C.surface,
                    border:`1px solid ${i===2?C.accent:i===3?C.red:C.border}`}}>
                    <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:i===2?C.accent:i===3?C.red:C.muted,fontWeight:i===2||i===3?700:400}}>{lb}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,setPhase] = useState("onboarding");
  const [cfg,setCfg] = useState(null);
  useEffect(()=>{
    try{const s=localStorage.getItem("apex_v2");if(s){setCfg(JSON.parse(s));setPhase("app");}}catch(e){}
  },[]);
  const done = useCallback(d=>{
    setCfg(d); setPhase("app");
    try{localStorage.setItem("apex_v2",JSON.stringify(d));}catch(e){}
  },[]);
  if(phase==="onboarding") return <Onboarding onComplete={done}/>;
  return <MainApp cfg={cfg}/>;
}
