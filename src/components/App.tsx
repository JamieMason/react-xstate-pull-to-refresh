import React from 'react';
import { AppComponent } from '../providers/AppProvider';
import './App.css';
import { Feed } from './Feed';
import { OxfordComma } from './OxfordComma';
import { PullToRefresh } from './PullToRefresh';

interface Url {
  href: string;
  label: string;
}

const builtWith: Url[] = [
  { href: 'https://reactjs.org/', label: 'React' },
  { href: 'https://xstate.js.org', label: 'XState' },
  { href: 'https://tailwindcss.com', label: 'Tailwind' },
];

const BoldLink: React.FunctionComponent<Url> = ({ href, label }) => (
  <a className="font-bold text-gray-900" href={href}>
    {label}
  </a>
);

const PlainLink: React.FunctionComponent<Url> = ({ href, label }) => (
  <a className="footer__link" href={href} key={href}>
    {label}
  </a>
);

export const App: AppComponent = ({
  doRefresh,
  fakeRows,
  msExpectedRefreshDuration,
  msStatusDisplay,
  pxDistanceRequired,
}) => (
  <div className="flex flex-col h-screen bg-indigo-100">
    <header className="banner flex-none py-4 px-4">
      <h1 className="leading-tight text-blue-900 font-bold text-3xl">
        Pull to Refresh
      </h1>
      <p className="leading-normal text-gray-500">
        The Feed will update or simulate an Error
      </p>
    </header>
    <PullToRefresh
      doRefresh={doRefresh}
      msExpectedRefreshDuration={msExpectedRefreshDuration}
      msStatusDisplay={msStatusDisplay}
      pxDistanceRequired={pxDistanceRequired}
    >
      <Feed items={fakeRows} />
    </PullToRefresh>
    <footer className="flex-none shadow-inner bg-white p-4 text-center text-blue-900">
      Built by{' '}
      <BoldLink href="https://twitter.com/fold_left" label="@fold_left" /> in{' '}
      <OxfordComma>{builtWith.map(PlainLink)}</OxfordComma>.
    </footer>
  </div>
);
