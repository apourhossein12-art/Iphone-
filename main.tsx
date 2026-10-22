import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerServiceWorker} from './utils/device';

createRoot(document.getElementById('root')!).render(<App />);
registerServiceWorker();
