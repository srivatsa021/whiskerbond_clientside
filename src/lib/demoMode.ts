// Utility to detect and manage demo mode
export const isDemoMode = () => {
  // Check if we're in a deployed environment without backend
  const isDeployed =
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1");

  // Check if API is available (we'll determine this through failed requests)
  const hasFailedApiRequests = localStorage.getItem("api_failed") === "true";

  return isDeployed || hasFailedApiRequests;
};

export const markApiAsFailed = () => {
  localStorage.setItem("api_failed", "true");
};

export const markApiAsWorking = () => {
  localStorage.removeItem("api_failed");
};

export const showDemoModeNotification = () => {
  // Only show once per session
  if (!sessionStorage.getItem("demo_mode_shown")) {
    sessionStorage.setItem("demo_mode_shown", "true");

    // Create a subtle notification
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        color: #0c4a6e;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      ">
        <strong>Demo Mode</strong><br>
        Running in offline demo mode with local storage
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
};
