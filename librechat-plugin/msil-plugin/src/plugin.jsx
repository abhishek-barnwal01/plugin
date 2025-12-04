// import React from "react";
// import ReactDOM from "react-dom/client";
// import FloatingWidget from "./FloatingWidget";

// function createContainer() {
//   const div = document.createElement("div");
//   div.id = "librechat-plugin-container";
//   document.body.appendChild(div);
//   return div;
// }

// window.LibreChatWidget = {
//   init(config = {}) {
//     const container =
//       document.getElementById("librechat-plugin-container") ||
//       createContainer();

//     const root = ReactDOM.createRoot(container);

//     root.render(
//       <FloatingWidget
//         host={config.host}
//         miniPath={"/minipopup"}
//       />
//     );
//   },
// };

import React from "react";
import ReactDOM from "react-dom/client";
import FloatingWidget from "./FloatingWidget";

function createContainer() {
  const div = document.createElement("div");
  div.id = "librechat-plugin-container";
  document.body.appendChild(div);
  div.style.float = "right";
  return div;
}

window.LibreChatWidget = {
  init(config = {}) {
    const container =
      document.getElementById("librechat-plugin-container") ||
      createContainer();

    const root = ReactDOM.createRoot(container);

    // Use /mini as the initial path
    // The /mini route should handle redirecting to /mini/new internally
    root.render(
      <FloatingWidget
        host={config.host || "http://localhost:3081"}
        miniPath={config.miniPath || "/mini/new"}
      />
    );
  },
};