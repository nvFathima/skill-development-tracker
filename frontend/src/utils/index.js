export const formatDate = (date) => {
    // Get the month, day, and year
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
  
    const formattedDate = `${day}-${month}-${year}`;
  
    return formattedDate;
  };
  
  export function dateFormatter(dateString) {
    const inputDate = new Date(dateString);
  
    if (isNaN(inputDate)) {
      return "Invalid Date";
    }
  
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, "0");
    const day = String(inputDate.getDate()).padStart(2, "0");
  
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  
  export function getInitials(fullName) {
    const names = fullName.split(" ");
  
    const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());
  
    const initialsStr = initials.join("");
  
    return initialsStr;
  }
  
  export const PRIOTITYSTYELS = {
    high: "text-red-600",
    medium: "text-yellow-600",
    low: "text-blue-600",
  };
  
  export const TASK_TYPE = {
    todo: "bg-blue-600",
    "in progress": "bg-yellow-600",
    completed: "bg-green-600",
  };
  
  export const BGS = [
    "bg-blue-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-green-600",
  ];

  export const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';
    
    const hours = (match[1] || '0').slice(0, -1);
    const minutes = (match[2] || '0').slice(0, -1);
    const seconds = (match[3] || '0').slice(0, -1);
    
    if (hours !== '0') return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };
  
  export const formatViews = (views) => {
    if (!views) return '0';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(views);
  };