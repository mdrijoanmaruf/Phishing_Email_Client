import Swal, { SweetAlertOptions } from 'sweetalert2';

/**
 * Common theme styling for PhishGuard SweetAlerts to match the dashboard design.
 */
const themeDefaults = {
  customClass: {
    popup: 'rounded-xl border border-gray-200 shadow-2xl p-6 font-sans',
    title: 'text-gray-900 font-bold text-lg',
    htmlContainer: 'text-gray-600 text-sm',
    confirmButton:
      'px-4 py-2 rounded-lg text-sm font-semibold shadow-md focus:outline-none transition-all mx-1 cursor-pointer',
    cancelButton:
      'px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none transition-all mx-1 cursor-pointer',
  },
  buttonsStyling: false,
};

/**
 * Toast / notification alert
 */
export const showSuccessToast = (title: string, text?: string) => {
  return Swal.fire({
    ...themeDefaults,
    icon: 'success',
    iconColor: '#10b981',
    title,
    text,
    timer: 2500,
    showConfirmButton: false,
    timerProgressBar: true,
  });
};

/**
 * Error alert
 */
export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    ...themeDefaults,
    icon: 'error',
    iconColor: '#ef4444',
    title,
    text,
    confirmButtonText: 'OK',
    customClass: {
      ...themeDefaults.customClass,
      confirmButton:
        'px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-700 hover:bg-indigo-800 text-white shadow-md shadow-indigo-900/20 cursor-pointer',
    },
  });
};

/**
 * Confirmation dialog for destructive actions (e.g. deletion)
 */
export const showConfirmDelete = (title: string, text: string) => {
  return Swal.fire({
    ...themeDefaults,
    icon: 'warning',
    iconColor: '#f59e0b',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    customClass: {
      ...themeDefaults.customClass,
      confirmButton:
        'px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-700/20 cursor-pointer',
    },
  });
};

/**
 * Confirmation dialog for blacklisting a domain
 */
export const showConfirmBlacklist = (domain: string) => {
  return Swal.fire({
    ...themeDefaults,
    icon: 'warning',
    iconColor: '#ef4444',
    title: `Blacklist '${domain}'?`,
    text: `Add '${domain}' to the blocked domains blacklist? This will be saved directly to data/blacklist.json.`,
    showCancelButton: true,
    confirmButtonText: 'Yes, Block Domain',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    customClass: {
      ...themeDefaults.customClass,
      confirmButton:
        'px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-700/20 cursor-pointer',
    },
  });
};

export default Swal;

