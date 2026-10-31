import { useNavigate } from 'react-router-dom';

// navigate(-1) silently does nothing when there's no history entry
// (e.g. the user arrived via a direct link from an email).
// This hook falls back to a sensible route in that case.
export function useGoBack(fallback = '/') {
  const navigate = useNavigate();
  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}
