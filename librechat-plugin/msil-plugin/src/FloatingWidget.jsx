import React, { useState } from "react";

export default function FloatingWidget({ host, miniPath  }) {
  const [open, setOpen] = useState(false);

    // const handleNewChat = () => {
    //   // Force iframe to reload by changing its key
    //   // setIframeKey((prev) => prev + 1);
    // };
    console.log("miniPath", miniPath);

  return (
    <>
     {/* Floating Icon */}
           <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50">
             {/* <MessageCircle size={24} /> */}
             <img src="librechat-plugin/msil-plugin/src/assets/chat-bot.png" alt="Chatbot" style={{ height: '80px', width: '80px' }} />
           </button>
     
           {open && (
             <div className="shadow-1xl fixed bottom-[120px] right-0 z-[999] h-[600px] w-[350px] bg-white">
               {/* Header - Keep this gray header */}
               <div className="flex items-center justify-between border border-b-0 border-black bg-gray-50 p-2 px-0 py-2 pr-[10px]">
                 {/* <button
                   onClick={() => setOpen(false)}
                   className="hover:text-gray-600 dark:hover:text-gray-300"
                   title="Close"
                 >
                   <ChevronLeft size={26} />
                 </button> */}
     
                 {/* <div className="flex flex-1 items-center gap-1">
                   <div className="bg-white-800 flex h-6 w-8 items-center justify-center rounded dark:bg-white">
                     <img
                       src="/assets/Maruti Suzuki S(Black).png"
                       alt="Left"
                       style={{ height: '30px', width: '40px', marginRight: '12px', marginTop: '3px' }}
                     />
                   </div>
     
                   <div className="leading-tight" style={{ marginLeft: '-7px', fontSize: '15px' }}>
                     <div className="font-semibold text-gray-900 dark:text-white">MSIL ChatBot</div>
                     <span className="text-xs text-gray-600 dark:text-gray-400"> Smart Assistant for Data Queries </span>
                   </div>
                 </div> */}
                 {/* <button
                   onClick={() => window.open('/', '_blank')}
                   className="hover:text-gray-600 dark:hover:text-gray-300"
                   title="Open in new tab"
                 >
                   <Maximize2 size={18} />
                 </button> */}
                 {/* <button onClick={handleMax} className="hover:text-blue-600">
                   <Maximize2 size={18} />
                 </button> */}
                 {/* <button
                   onClick={handleNewChat}
                   className="ml-2 hover:text-gray-600 dark:hover:text-gray-300"
                   title="New Chat"
                 >
                   <NewChatIcon />
                 </button> */}
               </div>
               {/* <hr style={{ borderColor: 'lightgrey' }} /> */}
               {/* Use Landing Page inside the popup  src="/?popup=true" */}

          <iframe
            src={`${host}${miniPath}`}
            title="chat-mini"
            className="w-full h-full border-0"
            style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  zIndex: 2147483647,
                }}
          />
        </div>
      )}
    </>
  );
}