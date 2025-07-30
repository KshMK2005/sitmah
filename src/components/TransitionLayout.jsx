import { TransitionProvider } from './TransitionContext';
import Layout from '../Layout';

export default function TransitionLayout(props) {
  return (
    <TransitionProvider>
      <Layout {...props} />
    </TransitionProvider>
  );
} 