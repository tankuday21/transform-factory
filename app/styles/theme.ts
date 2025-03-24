// Theme configuration for the PDF management app
export type ThemeType = 'light' | 'dark';

// Define the theme interface
export interface Theme {
  name: ThemeType;
  colors: {
    background: {
      primary: string;
      secondary: string;
      gradient: string;
      card: string;
      hover: string;
    };
    text: {
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
    };
    category: {
      convert: string;
      edit: string;
      organize: string;
      optimize: string;
      secure: string;
      advanced: string;
    };
    button: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
      success: string;
      danger: string;
    };
    border: {
      light: string;
      medium: string;
      dark: string;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
    };
    status: {
      new: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  animation: {
    timing: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      bounce: string;
    };
  };
  border: {
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      pill: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  zIndex: {
    modal: number;
    dropdown: number;
    tooltip: number;
    header: number;
  };
}

// Light theme
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      gradient: 'linear-gradient(135deg, #f4f8fc 0%, #f1f5fe 100%)',
      card: '#ffffff',
      hover: '#f5f8ff',
    },
    text: {
      primary: '#1a2138',
      secondary: '#4a5568',
      accent: '#3182ce',
      muted: '#718096',
    },
    category: {
      convert: '#4299e1', // blue
      edit: '#9f7aea',    // purple
      organize: '#f56565', // red
      optimize: '#48bb78', // green
      secure: '#ed8936',   // orange
      advanced: '#38b2ac',  // teal
    },
    button: {
      primary: 'linear-gradient(135deg, #4299e1 0%, #667eea 100%)',
      primaryHover: 'linear-gradient(135deg, #3182ce 0%, #5a67d8 100%)',
      secondary: '#f7fafc',
      secondaryHover: '#edf2f7',
      success: '#48bb78',
      danger: '#f56565',
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e0',
      dark: '#a0aec0',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)',
    },
    status: {
      new: '#4c51bf', // indigo
      success: '#48bb78', // green
      warning: '#ed8936', // orange
      error: '#f56565',   // red
      info: '#4299e1',    // blue
    },
  },
  animation: {
    timing: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
  border: {
    radius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '1rem',
      pill: '9999px',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Poppins', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  zIndex: {
    modal: 1000,
    dropdown: 100,
    tooltip: 500,
    header: 50,
  },
};

// Dark theme
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: '#1a202c',
      secondary: '#2d3748',
      gradient: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      card: '#2d3748',
      hover: '#3a4a63',
    },
    text: {
      primary: '#f7fafc',
      secondary: '#e2e8f0',
      accent: '#63b3ed',
      muted: '#a0aec0',
    },
    category: {
      convert: '#63b3ed', // blue lighter
      edit: '#b794f4',    // purple lighter
      organize: '#fc8181', // red lighter
      optimize: '#68d391', // green lighter
      secure: '#f6ad55',   // orange lighter
      advanced: '#4fd1c5',  // teal lighter
    },
    button: {
      primary: 'linear-gradient(135deg, #63b3ed 0%, #7f9cf5 100%)',
      primaryHover: 'linear-gradient(135deg, #4299e1 0%, #667eea 100%)',
      secondary: '#4a5568',
      secondaryHover: '#718096',
      success: '#68d391',
      danger: '#fc8181',
    },
    border: {
      light: '#4a5568',
      medium: '#718096',
      dark: '#a0aec0',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 25px rgba(0, 0, 0, 0.3), 0 5px 10px rgba(0, 0, 0, 0.2)',
    },
    status: {
      new: '#7f9cf5', // indigo lighter
      success: '#68d391', // green lighter
      warning: '#f6ad55', // orange lighter
      error: '#fc8181',   // red lighter
      info: '#63b3ed',    // blue lighter
    },
  },
  animation: {
    timing: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
  border: {
    radius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '1rem',
      pill: '9999px',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Poppins', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  zIndex: {
    modal: 1000,
    dropdown: 100,
    tooltip: 500,
    header: 50,
  },
}; 