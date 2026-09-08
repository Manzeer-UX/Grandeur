'use client';

import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {ArrowLeft,ArrowUp,Boxes,Clock3,Database,MessageSquare,Plus,X} from 'lucide-react';
import './inventory-assistant.css';

type Message={id:string;role:'user'|'bot';text:string};

const examples=[
 {title:'Show Mango inventory in Region I',icon:Boxes},
 {title:'Which distributor has the highest stock?',icon:Database},
 {title:'How much inventory was manufactured last month?',icon:Clock3},
 {title:'Which SKUs are at risk of stock-out?',icon:MessageSquare}
];

export default function InventoryAssistant(){
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState<Message[]>([]);
 const [loading,setLoading]=useState(false);
 const launcher=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const text=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(open){dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';setTimeout(()=>text.current?.focus(),50);return()=>{document.body.style.overflow=previous};}dialog.current?.close();},[open]);
 function close(){setOpen(false);launcher.current?.focus()}
 async function ask(value:string){const question=value.trim();if(!question)return;const userId=crypto.randomUUID();setMessages(items=>[...items,{id:userId,role:'user',text:question}]);setInput('');setLoading(true);try{const res=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});const data=await res.json();const answer=data.answer||data.error||'No answer returned.';setMessages(items=>[...items,{id:crypto.randomUUID(),role:'bot',text:answer}]);}catch{setMessages(items=>[...items,{id:crypto.randomUUID(),role:'bot',text:'Sorry, I could not reach the reporting service. Please try again.'}]);}finally{setLoading(false);}}
 return <>
  <button ref={launcher} className="gia-launcher mascot-launcher" onClick={()=>setOpen(true)} aria-label="Open Bonko reporting chatbot" aria-haspopup="dialog">
   <Image src="/bonko-chatbot-icon-new.png" alt="" width={86} height={86} priority/>
   <span className="gia-launcher-dot"/>
  </button>
  <dialog ref={dialog} className="gia-dialog bonko-chat-screen" aria-labelledby="gia-title" onCancel={e=>{e.preventDefault();close()}}>
   <div className="bonko-chat-app">
    <main className="bonko-chat-main">
     <header className="bonko-chat-topbar">
      <button className="bonko-back" onClick={close}><ArrowLeft size={18}/>Back to workspace</button>
      <div className="bonko-brand"><Image src="/bonko-chatbot-icon-new.png" alt="" width={32} height={32}/><div><strong id="gia-title">Bonko</strong><span>Grandeur workspace</span></div></div>
      <div className="bonko-top-actions">
       <button disabled={loading || messages.length===0} onClick={()=>{setMessages([]);setInput('')}}><Plus size={16}/>New chat</button>
       <button className="bonko-icon-button" title="Close chatbot" aria-label="Close chatbot" onClick={close}><X size={18}/></button>
      </div>
     </header>
     <section className="bonko-chat-content">
      {messages.length===0?<div className="bonko-chat-home">
       <p className="bonko-eyebrow">Grandeur Team</p>
       <h1>Inventory reporting</h1>
       <form className="bonko-prompt" onSubmit={e=>{e.preventDefault();ask(input)}}>
        <div className="bonko-prompt-input"><textarea aria-label="Reporting question" ref={text} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about inventory, distributors, or stock levels..." rows={3} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input)}}}/></div>
        <div className="bonko-prompt-actions">
         <span><i/>Workspace data</span>
         <button className="bonko-send" disabled={!input.trim()||loading} aria-label="Send question"><ArrowUp size={18}/></button>
        </div>
       </form>
       <div className="bonko-example-label">Suggested questions</div>
       <div className="bonko-examples">{examples.map(item=><button key={item.title} onClick={()=>ask(item.title)}><span>{item.title}</span><item.icon size={19}/></button>)}</div>
      </div>:<div className="bonko-thread">
       <div className="bonko-thread-title"><Image src="/bonko-chatbot-icon-new.png" alt="" width={42} height={42}/><div><h1>Bonko Reporting Chat</h1><p>Answers from live workspace data.</p></div></div>
       <div className="bonko-messages" role="log" aria-live="polite">{messages.map(m=><article key={m.id} className={'bonko-message '+m.role}><strong>{m.role==='user'?'You':'Bonko'}</strong><p>{m.text}</p></article>)}{loading&&<article className="bonko-message bot"><strong>Bonko</strong><p>Checking workspace data...</p></article>}</div>
       <form className="bonko-thread-composer" onSubmit={e=>{e.preventDefault();ask(input)}}>
        <textarea ref={text} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask another workspace report question..." rows={1} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input)}}}/>
        <button disabled={!input.trim()||loading} aria-label="Send question"><ArrowUp size={18}/></button>
       </form>
      </div>}
     </section>
    </main>
   </div>
  </dialog>
 </>;
}
