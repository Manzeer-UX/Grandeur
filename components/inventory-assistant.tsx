'use client';

import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {ArrowLeft,ArrowUp,Boxes,Clock3,Database,FileText,Home,Mail,MessageSquare,Plus,Search,Settings,Share2,Sparkles,UserPlus,X} from 'lucide-react';
import './inventory-assistant.css';

type Message={id:string;role:'user'|'bot';text:string};

const examples=[
 {title:'Show Mango inventory in Region I',icon:Boxes,response:'Static preview: Mango inventory can be reviewed by SKU and region from the inventory workspace. This screen is a design-only chatbot preview, so no live data is queried.'},
 {title:'Which distributor has the highest stock?',icon:Database,response:'Static preview: Distributor stock ranking would appear here in the finished semantic report flow. No workspace data or AI service is called in this prototype screen.'},
 {title:'How much inventory was manufactured last month?',icon:Clock3,response:'Static preview: Manufacturing summaries would be answered from a report query. This version stays static and does not fetch records.'},
 {title:'Which SKUs are at risk of stock-out?',icon:MessageSquare,response:'Static preview: Stock-out risk answers would list SKUs, thresholds, and suggested review actions. This demo response is fixed text.'}
];

export default function InventoryAssistant(){
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState('');
 const [messages,setMessages]=useState<Message[]>([]);
 const launcher=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const text=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(open){dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';setTimeout(()=>text.current?.focus(),50);return()=>{document.body.style.overflow=previous};}dialog.current?.close();},[open]);
 function close(){setOpen(false);launcher.current?.focus()}
 function ask(value:string,response?:string){const question=value.trim();if(!question)return;setMessages(items=>[...items,{id:crypto.randomUUID(),role:'user',text:question},{id:crypto.randomUUID(),role:'bot',text:response||'Static preview: The Bonko reporting chatbot screen is ready for interaction. This response is fixed demo text and does not query data, call AI, or consume external tokens.'}]);setInput('')}
 return <>
  <button ref={launcher} className="gia-launcher mascot-launcher" onClick={()=>setOpen(true)} aria-label="Open Bonko reporting chatbot" aria-haspopup="dialog">
   <Image src="/bonko-chatbot-icon.png" alt="" width={86} height={86} priority/>
   <span className="gia-launcher-dot"/>
  </button>
  <dialog ref={dialog} className="gia-dialog bonko-chat-screen" aria-labelledby="gia-title" onCancel={e=>{e.preventDefault();close()}}>
   <div className="bonko-chat-app">
    <aside className="bonko-chat-rail" aria-label="Chat navigation">
     <div className="bonko-rail-logo"><Image src="/bonko-chatbot-icon.png" alt="" width={34} height={34}/></div>
     <button aria-label="Home"><Home size={19}/></button>
     <button aria-label="Messages"><MessageSquare size={19}/></button>
     <button aria-label="Recent reports"><Clock3 size={19}/></button>
     <button aria-label="Report files"><FileText size={19}/></button>
     <button aria-label="Connected data"><Database size={19}/></button>
     <div className="bonko-rail-bottom">
      <button aria-label="Settings"><Settings size={19}/></button>
      <span className="bonko-user">IM</span>
     </div>
    </aside>
    <main className="bonko-chat-main">
     <header className="bonko-chat-topbar">
      <button className="bonko-back" onClick={close}><ArrowLeft size={18}/>Back to workspace</button>
      <button className="bonko-model"><Sparkles size={15}/>Bonko Static 4o</button>
      <div className="bonko-top-actions">
       <label className="bonko-search"><Search size={16}/><input placeholder="Search thread" aria-label="Search thread"/></label>
       <button><UserPlus size={16}/>Invite</button>
       <button><Plus size={16}/>New Thread</button>
       <button className="bonko-icon-button" aria-label="Close chatbot" onClick={close}><X size={18}/></button>
      </div>
     </header>
     <section className="bonko-chat-content">
      {messages.length===0?<div className="bonko-chat-home">
       <div className="bonko-orb"><Image src="/bonko-chatbot-icon.png" alt="" width={86} height={86}/></div>
       <h1>Good Afternoon,<br/>Grandeur Team<br/><span>What report do you need?</span></h1>
       <form className="bonko-prompt" onSubmit={e=>{e.preventDefault();ask(input)}}>
        <div className="bonko-prompt-input"><Sparkles size={18}/><textarea ref={text} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Bonko a static reporting question..." rows={3} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input)}}}/></div>
        <div className="bonko-prompt-actions">
         <button type="button"><FileText size={15}/>Attach</button>
         <button type="button">Reporting Style</button>
         <span>Static demo</span>
         <button className="bonko-send" disabled={!input.trim()} aria-label="Send question"><ArrowUp size={18}/></button>
        </div>
       </form>
       <div className="bonko-example-label">GET STARTED WITH AN EXAMPLE BELOW</div>
       <div className="bonko-examples">{examples.map(item=><button key={item.title} onClick={()=>ask(item.title,item.response)}><span>{item.title}</span><item.icon size={19}/></button>)}</div>
      </div>:<div className="bonko-thread">
       <div className="bonko-thread-title"><Image src="/bonko-chatbot-icon.png" alt="" width={42} height={42}/><div><h1>Bonko Reporting Chat</h1><p>Static demo conversation. No live data, no AI API calls.</p></div></div>
       <div className="bonko-messages">{messages.map(m=><article key={m.id} className={'bonko-message '+m.role}><strong>{m.role==='user'?'You':'Bonko Static Bot'}</strong><p>{m.text}</p></article>)}</div>
       <form className="bonko-thread-composer" onSubmit={e=>{e.preventDefault();ask(input)}}>
        <textarea ref={text} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask another static report question..." rows={1} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input)}}}/>
        <button disabled={!input.trim()} aria-label="Send question"><ArrowUp size={18}/></button>
       </form>
      </div>}
     </section>
    </main>
   </div>
  </dialog>
 </>;
}
